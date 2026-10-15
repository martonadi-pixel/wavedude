// Wave Dude 2D web - particles on a screen, and a which-way detector.
//
// The simulator computes waves only. Quantum physics adds one rule (Born's): a single particle - a photon, an
// electron - lands at one spot, picked at random with a chance proportional to the wave's intensity there. The
// particle screen draws such landings as dots, one at a time, from the intensity along a line probe; after many,
// the dots show the wave's pattern.
//
// The which-way detector is a thin piece of glass in front of one slit whose thickness (here: refractive index)
// jumps at random: it shifts the phase of the wave through that slit by an unpredictable amount, many times a second.
// Any way of finding out which slit a particle took disturbs it at least this much (Feynman's argument with the light
// microscope); the stripes then move about at random and the screen, adding up many particles, shows none.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { type ShapeSpec, newShape, shapeBounds } from "../../core/shapes";

export interface ParticleScreenOptions {
  /** Which line probe's intensity the particles follow (index among the line probes). */
  probe: number;
  /** Cell coordinates of the probe's first cell and its direction (the dots go along it). */
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** How wide a band the dots are spread over beside the line (cells), and on which side (+1 right of it). */
  band: number;
  color: string;
  /** Particles per simulation step once it is going (it starts slowly: one by one). */
  rate?: number;
  /** At most this many dots are kept. */
  max?: number;
}

/** The contrast of the stripes a which-way detector of this strength leaves on the screen (ensemble average). */
export const visibilityAfter = (strength: number): number => (strength <= 0 ? 1 : Math.abs(Math.sin(Math.PI * strength) / (Math.PI * strength)));

export class ParticleScreen {
  /** Where each particle landed: its cell along the probe line. */
  readonly hits: number[] = [];
  on = false;
  private batch: { pts: { x: number; y: number }[]; color: string };
  private lastTime = -1;
  private carry = 0;

  constructor(private sim: Sim, private o: ParticleScreenOptions) {
    this.batch = { pts: [], color: o.color };
  }

  clear(): void {
    this.hits.length = 0;
    this.batch.pts.length = 0;
    this.carry = 0;
  }

  /** Call every frame: lands as many particles as the steps run since the last frame bring. */
  frame(): void {
    const sim = this.sim, o = this.o;
    // a reload clears the annotations: draw the dots again
    if (!sim.annotations.dots.includes(this.batch)) sim.annotations.dots.push(this.batch);
    const t = sim.time, steps = this.lastTime < 0 || t < this.lastTime ? 0 : t - this.lastTime;
    this.lastTime = t;
    const prof = sim.profiles[o.probe];
    if (!this.on || !steps || !prof || !prof.length) return;
    const max = o.max ?? 20000;
    if (this.hits.length >= max) return;
    // the first ones come one at a time, then faster
    const rate = (o.rate ?? 1) * Math.min(1, 0.05 + this.hits.length / 300);
    this.carry += steps * rate;
    let n = Math.min(Math.floor(this.carry), 80, max - this.hits.length);
    this.carry -= Math.floor(this.carry);
    if (n <= 0) return;
    // the chance of each cell: its intensity (cumulative, then a binary search per particle)
    const cdf = new Float64Array(prof.length);
    let sum = 0;
    for (let i = 0; i < prof.length; i++) { sum += Math.max(0, prof[i]); cdf[i] = sum; }
    if (sum <= 0) return;
    const len = Math.hypot(o.dx, o.dy) || 1, nx = -o.dy / len, ny = o.dx / len;
    while (n-- > 0) {
      const r = Math.random() * sum;
      let lo = 0, hi = prof.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < r) lo = mid + 1; else hi = mid; }
      const along = lo + Math.random(), side = 4 + Math.random() * o.band;
      this.hits.push(along);
      this.batch.pts.push({ x: o.x + (o.dx / len) * along - nx * side, y: o.y + (o.dy / len) * along - ny * side });
    }
  }

  /**
   * How clear the stripes are among the dots, from 0 (none) to 1: for dots spread as 1 + V cos(2π x / spacing), V. It
   * is the share of the stripes' own frequency in the dots within ± `stripes` stripes of the centre (a whole number of
   * stripes), so the screen's slow brightening towards the middle does not count. NaN while there are too few dots.
   */
  contrast(centre: number, spacing: number, stripes = 1.5): number {
    let re = 0, im = 0, n = 0;
    for (const a of this.hits) {
      const x = a - centre;
      if (Math.abs(x) > stripes * spacing) continue;
      const ph = (2 * Math.PI * x) / spacing;
      re += Math.cos(ph); im += Math.sin(ph); n++;
    }
    return n < 400 ? NaN : Math.min(1, (2 * Math.hypot(re, im)) / n);
  }
}

/**
 * A which-way detector in front of a slit: glass `length` wavelengths along the beam and `width` cells across it whose
 * index jumps at random between 1 and 1 + strength · λ / length, so the phase of the wave that passes it is shifted by
 * a random amount between 0 and `strength` whole cycles. It jumps once every `every` steps while the simulation runs.
 * Spread evenly over Φ = strength · 2π, the shifts leave stripes of contrast |sin(Φ/2) / (Φ/2)| on a screen that adds
 * up many particles: none at strength 1.
 */
export class WhichWay {
  readonly shape: ShapeSpec;
  /** How hard it looks: the spread of its phase kicks, in whole cycles (0 to 1). */
  strength = 1;
  private last = -1;

  constructor(private sim: Sim, at: { x: number; y: number }, private lam: number, private every: number, size = { length: 2, width: 50 }) {
    this.shape = newShape("box", { name: "Which-way detector", material: "glass", n: 1, filled: true, x: at.x, y: at.y,
      length: Math.round(size.length * lam), width: size.width });
  }

  get on(): boolean { return this.sim.shapes.includes(this.shape); }

  set on(v: boolean) {
    const sim = this.sim;
    if (v === this.on) return;
    if (v) { sim.shapes.push(this.shape); this.kick(); }
    else { sim.shapes = sim.shapes.filter(s => s !== this.shape); sim.updateShape(this.shape); }
    sim.notify();
  }

  /** Call every frame. */
  frame(): void {
    const t = this.sim.time;
    if (!this.on || (this.last >= 0 && t >= this.last && t - this.last < this.every)) return;
    this.kick();
  }

  private kick(): void {
    const before = shapeBounds(this.shape);
    this.shape.n = 1 + (Math.random() * this.strength * this.lam) / this.shape.length;
    this.sim.updateShape(this.shape, before);
    this.last = this.sim.time;
  }
}
