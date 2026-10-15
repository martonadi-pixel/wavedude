// Wave Dude 2D web - a moving source: the Doppler effect, the cone of a source faster than its own waves, and a
// source going round in circles.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { newMotion } from "../../../core/sources";
import { omegaOfLevel } from "../../../core/physics";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { f2, lam, need, period, pointSource, within } from "../helpers";

const DW = 1600, DH = 800, CY = 400;
/** Frequency level: a wavelength of about 30 cells, so even squeezed to a quarter (at 0.75x) a wave still spans 7.5. */
const LEVEL = 30;
/**
 * Fastest speed below the wave speed: ahead of the source the wavelength shrinks to λ (1 − v/c), and the grid cannot
 * carry waves much shorter than 7 cells (measured: at 0.8x, 4.5 cells, the ear ahead heard nonsense).
 */
const MAX_SUB = 0.75;
/** The two ears: ahead of the source (right) and behind it (left). */
const AHEAD = { x: 1450, y: CY }, BEHIND = { x: 150, y: CY };
/** Where the source starts, and how far it travels (it stops 150 cells before the ear ahead). */
const START_X = 450, TRAVEL = AHEAD.x - START_X - 150;
/** Faster than its own waves: it starts further left, and the picture stops when the cone is clear. */
const SUPER_START = 220;
/** Going round: the circle's centre and radius. */
const CIRCLE = { x: 800, y: CY, r: 90 };

type Mode = "still" | "moving" | "faster" | "circle";
let mode: Mode = "still";

/** Speed for the step on show: still = 0; faster = at least 1.5 times the wave speed. */
function machOf(p: Values): number {
  if (mode === "still") return 0;
  if (mode === "faster") return Math.max(1.5, p.mach);
  if (mode === "circle") return Math.max(0.2, Math.min(MAX_SUB, p.mach));
  return Math.min(MAX_SUB, p.mach);
}

const omega = omegaOfLevel(LEVEL);

function build(sim: Sim, p: Values): void {
  const s = new Scene(DW, DH), M = machOf(p), c = sim.waveSpeed;
  const src = mode === "circle"
    ? pointSource(CIRCLE.x, CIRCLE.y, LEVEL, { name: "Source", motion: newMotion({ kind: "circle", mach: M, radius: CIRCLE.r, angleDeg: 90 }) })
    : pointSource(mode === "faster" ? SUPER_START : START_X, CY, LEVEL, { name: "Source", motion: newMotion({ kind: "line", mach: M, distance: mode === "faster" ? 0 : TRAVEL }) });
  sim.load(s, [src], [AHEAD, BEHIND].map(q => ({ kind: "point" as const, x: q.x, y: q.y, x2: q.x, y2: q.y, measurement: "amplitude" as const })));
  sim.annotations.labels.push(
    { x: AHEAD.x, y: AHEAD.y, mark: "👂", text: mode === "circle" ? "listener" : "ahead", color: "#ffd84a" },
    ...(mode === "circle" ? [] : [{ x: BEHIND.x, y: BEHIND.y, mark: "👂", text: "behind", color: "#4ade80" }]));
  sim.viewMode = "field";
  // measured: a still point source at this level shows its rings at about 0.8 of full colour at the default 30%
  sim.brightness.field = 160;
  sim.brightness.intensity = 160;
  sim.prepareSpeed = 24;
  if (mode === "faster") {
    // stop when the source has crossed most of the picture: the cone is then clear to measure
    sim.runUntil(Math.round(900 / (M * c)));
  } else sim.runUntil(runEnd(sim, p));
}

/** Where the moving source is at step t, along its line. */
const xAt = (t: number, M: number, c: number) => START_X + Math.min(M * c * t, TRAVEL);

/**
 * When the waves sent out between a few periods after the start and a few periods before the source stops are
 * passing an ear (on the line of motion): the steps in which that ear hears the steady Doppler-shifted note.
 */
function listenWindow(ear: { x: number }, M: number, c: number): { from: number; to: number } {
  const T = period(LEVEL), stop = M > 0 ? TRAVEL / (M * c) : 4000;
  const arrive = (tau: number) => tau + Math.abs(ear.x - xAt(tau, M, c)) / c;
  return { from: Math.ceil(arrive(4 * T)), to: Math.floor(arrive(Math.max(4 * T, stop - 3 * T))) };
}

function runEnd(sim: Sim, p: Values): number {
  const M = machOf(p), c = sim.waveSpeed;
  if (mode === "circle") return Math.ceil((AHEAD.x - CIRCLE.x) / c + (2 * Math.PI * CIRCLE.r) / (M * c) + 4 * period(LEVEL));
  return Math.max(listenWindow(AHEAD, M, c).to, listenWindow(BEHIND, M, c).to) + 20;
}

/** The strongest angular frequency in a stretch of a probe's record (a fine search of its spectrum). */
function peakOmega(h: number[], from: number, to: number, lo: number, hi: number): number {
  if (to - from < 16) return NaN;
  const power = (w: number) => {
    let re = 0, im = 0;
    for (let j = from; j < to; j++) { re += h[j] * Math.cos(w * j); im -= h[j] * Math.sin(w * j); }
    return re * re + im * im;
  };
  let best = lo, bestP = -1;
  for (let w = lo; w <= hi; w += 0.004 * omega) { const pw = power(w); if (pw > bestP) { bestP = pw; best = w; } }
  for (let d = 0.002 * omega; d > 1e-6 * omega; d /= 2) {
    const l = power(best - d), r = power(best + d);
    if (l > bestP && l >= r) { best -= d; bestP = l; } else if (r > bestP) { best += d; bestP = r; }
  }
  return best;
}

/** The pitch an ear hears (as a multiple of the source's own), once the steady part has passed it; null before. */
function heard(sim: Sim, i: number, ear: { x: number }, M: number): number | null {
  const w = listenWindow(ear, M, sim.waveSpeed), h = sim.history[i];
  if (!h || sim.time < w.to) return null;
  const a = w.from - sim.historyStart, b = w.to - sim.historyStart;
  if (a < 0 || b > h.length) return null;
  return peakOmega(h, a, b, 0.2 * omega, 6 * omega) / omega;
}

/**
 * Highest and lowest pitch over the last stretch of a probe's record: the strongest frequency in sliding windows.
 * (Zero crossings are fooled by the faint fast ripple a source makes as it crosses from cell to cell.) Each extreme is
 * looked for with windows a few of its own cycles long: long enough to tell the frequency, short enough not to blur it.
 */
function pitchRange(sim: Sim, i: number, steps: number, M: number): { hi: number; lo: number } | null {
  const h = sim.history[i], T = period(LEVEL);
  if (!h || h.length < steps) return null;
  const lo = (0.6 / (1 + M)) * omega, hi = (1.4 / (1 - M)) * omega;
  const scan = (W: number) => {
    const f: number[] = [];
    for (let a = h.length - steps; a + W <= h.length; a += Math.max(4, Math.round(W / 8))) f.push(peakOmega(h, a, a + W, lo, hi) / omega);
    return f;
  };
  const fHi = scan(Math.round((6 * T) * (1 - M))), fLo = scan(Math.round((3 * T) * (1 + M)));
  if (!fHi.length || !fLo.length) return null;
  return { hi: Math.max(...fHi), lo: Math.min(...fLo) };
}

const pct = (v: number) => `${v >= 1 ? "+" : "−"}${Math.abs((v - 1) * 100).toFixed(0)}%`;

function pitchTable(sim: Sim, p: Values): string {
  const M = machOf(p);
  const rows = [
    { name: "ahead 👂", i: 0, ear: AHEAD, theory: 1 / (1 - M), cls: "p-1" },
    { name: "behind 👂", i: 1, ear: BEHIND, theory: 1 / (1 + M), cls: "p-2" },
  ].map(r => {
    const got = heard(sim, r.i, r.ear, M);
    return `<tr><td class="${r.cls}">${r.name}</td><td><b>${got === null ? "…" : `${f2(got)}×`}</b>${got === null ? "" : ` (${pct(got)})`}</td><td>${f2(r.theory)}×</td></tr>`;
  });
  const lamAhead = lam(LEVEL) * (1 - M), lamBehind = lam(LEVEL) * (1 + M);
  const capped = mode === "moving" && p.mach > MAX_SUB ? ` (the slider says ${f2(p.mach)}×: this step stops at ${f2(MAX_SUB)}×, where the squeezed waves are still long enough for the grid)` : "";
  return `<div class="muted small">Source speed: <b>${f2(M)}×</b> the wave speed${capped} · its own wavelength ${lam(LEVEL).toFixed(1)} cells` +
    (M > 0 ? ` · squeezed to ${lamAhead.toFixed(1)} ahead, stretched to ${lamBehind.toFixed(1)} behind` : "") + `</div>` +
    `<table class="ro-table"><tr><th>ear</th><th>pitch heard (measured)</th><th>theory f′ = f / (1 ∓ v/c)</th></tr>${rows.join("")}</table>` +
    (heard(sim, 0, AHEAD, M) === null ? `<div class="muted small">⏳ the waves are on their way to the ears…</div>` : "") +
    (M > 0.6 ? `<div class="muted small">Squeezed this much, the waves ahead are only a few cells long, and on the grid of cells such short waves travel a little slower than long ones: the pitch ahead comes out a few percent higher than the formula.</div>` : "");
}

export const doppler: Experiment = {
  id: "doppler",
  title: "A moving source: the Doppler effect",
  level: "school",
  minutes: 15,
  summary: "Make a source move: its waves bunch up in front and spread out behind, so the pitch changes. Go faster than the waves for a shock cone, then go round in circles.",
  goals: [
    "A moving source squeezes its waves together ahead and stretches them behind",
    "The pitch heard ahead is f / (1 − v/c), behind f / (1 + v/c)",
    "Faster than its own waves, a source drags a cone behind it: sin θ = c / v",
    "For light the squeeze is a colour change: blueshift and redshift, and each photon's momentum changes with it",
  ],
  params: [{ id: "mach", label: "Speed of the source", min: 0, max: 2, step: 0.05, value: 0.5, format: v => `${v.toFixed(2)}× the wave speed`,
    help: "As a multiple of the speed of the waves. Steps 2 and 4 go up to 0.75× (faster, the squeezed waves ahead get too short for the grid of cells), step 3 at least 1.5×. Each change is a fresh run." }],
  setup(sim, p) { build(sim, p); },
  steps: [
    {
      title: "A source standing still",
      html: `<p>A source (◯) sends out rings of waves. Two ears 👂 listen: one to the right, one to the left.</p>
             <p>When the source stands still, every ring is centred on the same spot, so the rings are equally far apart in
             every direction and both ears hear the <b>same pitch</b>.</p>`,
      enter(sim, p) { if (mode !== "still") { mode = "still"; build(sim, p); } },
      readout: pitchTable,
    },
    {
      title: "Now it moves",
      html: `<p>Now the source moves to the right while it keeps sending out rings. Each new ring starts a little further right
             than the one before.</p>
             <p>Listen: an ambulance siren sounds <b>higher</b> while it comes towards you and <b>lower</b> once it has passed.
             That is the <b>Doppler effect</b>. Change the speed with the slider.</p>`,
      enter(sim, p) { mode = "moving"; build(sim, p); },
      predict: {
        question: "Where are the rings closest together?",
        options: ["In front of the source", "Behind the source", "The same everywhere"],
        answer: 0,
        explain: "In front: the source chases its own waves, so it squeezes them together. Behind, it runs away from them and they spread out. More waves per second reach the ear ahead: a higher pitch.",
      },
      readout: pitchTable,
      task: {
        prompt: "With the speed at 0.50×, what pitch does the ear ahead hear (as a multiple of the source's own)? Use the formula, then compare with the table.",
        input: { label: "pitch ahead (×)", placeholder: "e.g. 2" },
        check(m) {
          if (m.input === null) return need("Type the pitch as a number, e.g. 1.5.");
          return within(m.input, 2, 0.05, "pitch ahead at v = c/2", "×");
        },
      },
    },
    {
      title: "Faster than its own waves",
      html: `<p>Now the source is <b>faster than its waves</b> (at least 1.5×, or the speed you set if that is more). No wave
             gets ahead of it: the ear in front hears nothing until the source has passed.</p>
             <p>All the rings pile up along two straight lines behind it: a <b>cone</b> (a V in this flat world). A jet faster
             than sound drags such a cone behind it, and you hear it as a <b>sonic boom</b> when it sweeps over you.</p>
             <p>The picture stops when the cone is clear. Measure the angle between the cone's edge and the source's path
             with the <b>📐 protractor</b> (corner on the source).</p>`,
      enter(sim, p) { mode = "faster"; build(sim, p); },
      tools: ["protractor"],
      readout: (sim, p) => {
        const M = machOf(p);
        return `<div class="muted small">Source speed: <b>${f2(M)}×</b> the wave speed. In one step the source moves ${f2(M * sim.waveSpeed)} cells, its waves ${f2(sim.waveSpeed)}.</div>`;
      },
      task: {
        prompt: "Measure the half-angle of the cone (between the source's path and one edge of the V).",
        check(m, p) {
          if (m.angle === null) return need("Use the protractor: corner on the source, one arm back along its path, the other along the edge of the cone.");
          const M = machOf(p), expect = (Math.asin(1 / M) * 180) / Math.PI;
          const r = within(m.angle, expect, 4, "cone half-angle", "°");
          return { ...r, message: `${r.message} (sin θ = c / v = 1 / ${f2(M)}, so θ = ${expect.toFixed(1)}°.)` };
        },
      },
    },
    {
      title: "Going round in circles",
      html: `<p>Now the source runs round a circle (the dashed line) and the ear listens from the right. Look at the graph of
             what the ear hears: the waves come <b>faster</b> while the source moves towards the ear and <b>slower</b> while
             it moves away, again and again.</p>
             <p>The rings are no longer circles around one centre: they wind into a <b>spiral</b>, like water from a spinning
             garden sprinkler. A rotating loudspeaker (the “Leslie” speaker of an organ) makes its wobbling sound this way.</p>`,
      enter(sim, p) { mode = "circle"; build(sim, p); },
      readout: (sim, p) => {
        const M = machOf(p), rev = Math.round((2 * Math.PI * CIRCLE.r) / (M * sim.waveSpeed));
        const r = sim.time > runEnd(sim, p) - 4 * period(LEVEL) ? pitchRange(sim, 0, rev, M) : null;
        return `<div class="muted small">Source speed: <b>${f2(M)}×</b> the wave speed · one round takes ${rev.toLocaleString()} steps.</div>` +
          `<table class="ro-table"><tr><th></th><th>measured over the last round</th><th>theory</th></tr>` +
          `<tr><td>highest pitch (coming towards the ear)</td><td><b>${r ? `${f2(r.hi)}×` : "…"}</b></td><td>${f2(1 / (1 - M))}×</td></tr>` +
          `<tr><td>lowest pitch (going away)</td><td><b>${r ? `${f2(r.lo)}×` : "…"}</b></td><td>${f2(1 / (1 + M))}×</td></tr></table>` +
          (r ? "" : `<div class="muted small">⏳ listening to a whole round…</div>`);
      },
    },
    {
      title: "Light: colour and momentum",
      html: `<p>Light does the same. Light from something coming towards you is squeezed to a shorter wavelength: it shifts
             towards <b>blue</b>. Light from something moving away is stretched towards <b>red</b>. Astronomers see almost every
             distant galaxy <b>redshifted</b>: the universe is expanding. Police radar and weather radar measure speeds with
             the Doppler shift of radio waves, and doctors measure blood flow with the Doppler shift of ultrasound.</p>
             <p>Light also carries <b>momentum</b>: each photon has p = h / λ (and energy E = h c / λ). So the squeezed light in
             front of a moving lamp carries more momentum and energy per photon than the stretched light behind it.
             This is the same kick-and-recoil bookkeeping as in the Compton experiment.</p>
             <p>Nothing outruns light in empty space, so there is no cone of light there. But light is slower in water or
             glass, and a particle that moves faster than light <i>in that material</i> drags a cone of light behind it:
             the blue <b>Cherenkov glow</b> in the water around a nuclear reactor.</p>
             <details class="goals"><summary>University note: what this model leaves out</summary>
             <p>The simulation is classical: the waves travel through a medium, like sound in air, and the source's clock
             runs at the normal rate however fast it moves. For light, special relativity adds time dilation: along the line
             of motion f′ = f √((1 + β)/(1 − β)) with β = v / c, which agrees with f / (1 − β) to first order in β and differs
             at second order. A lamp that sends out the same light in every direction in its own frame feels no braking force:
             the extra momentum carried forward is balanced by the energy, and so the mass, it loses (Δp = (E / c²) v).</p>
             </details>`,
      enter(sim, p) { if (mode === "still") { mode = "moving"; build(sim, p); } },
    },
  ],
};

