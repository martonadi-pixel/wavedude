// Wave Dude 2D web - what a Sandbox scene can start from: an empty scene, small demos (built from objects, so every
// lens, wall and slit can be moved), or a ready-made wave circuit.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { Scene, glass } from "../../core/scene";
import { type SourceSpec, newSource } from "../../core/sources";
import { type OpticSpec, newOptic } from "../../core/optics";
import { newShape } from "../../core/shapes";
import { buildGate, buildHalfAdder, buildFullAdder, buildTransistor, buildLatch, buildRegister } from "../../circuits/builds";

export interface Demo { id: string; label: string; build: (w: number, h: number, background: number) => { scene: Scene; sources: SourceSpec[]; optics?: OpticSpec[] } }

export const DEMOS: Demo[] = [
  { id: "empty", label: "Empty", build: (w, hh, bg) => ({ scene: new Scene(w, hh, bg), sources: [] }) },
  {
    id: "lens", label: "Lens", build: (w, hh) => {
      // a fat lens left of centre, so its focus (about 0.78 H behind it) is well inside a wide window
      const s = new Scene(w, hh).add(newShape("ellipse", { name: "Lens", material: "glass", n: 1.5, x: w * 0.32, y: hh / 2, length: 2 * Math.max(20, hh * 0.14), width: 2 * hh * 0.36, angleDeg: 0 }));
      return { scene: s, sources: [newSource({ name: "Wave maker", kind: "line", x: Math.round(w * 0.12), y: Math.round(hh * 0.15), x2: Math.round(w * 0.12), y2: Math.round(hh * 0.85), level: 60 })] };
    },
  },
  {
    id: "slit", label: "Double slit", build: (w, hh) => {
      const s = new Scene(w, hh).add(newShape("slits", { name: "Double slit", x: Math.round(w * 0.35) + 4, y: hh / 2, length: hh + 2, thickness: 8, width: 14, count: 2, spacing: 60, angleDeg: 90 }));
      return { scene: s, sources: [newSource({ name: "Wave maker", kind: "line", x: Math.round(w * 0.12), y: 0, x2: Math.round(w * 0.12), y2: hh - 1, level: 60 })] };
    },
  },
  {
    id: "fiber", label: "Light guide (total internal reflection)", build: (w, hh) => {
      const s = new Scene(w, hh), cy = hh / 2;
      const mid = (x: number) => cy + Math.sin((x / w) * Math.PI * 1.5) * hh * 0.18;
      s.fill(0, 0, w, hh, (x, y) => Math.abs(y - mid(x)) < 18 && x > w * 0.08, glass(1.6));
      // the source sits inside the guide, on its centre line
      const sx = Math.round(w * 0.1);
      return { scene: s, sources: [newSource({ name: "Source", kind: "point", x: sx, y: Math.round(mid(sx)), level: 70 })] };
    },
  },
  {
    id: "bench", label: "Optics bench: laser and lens", build: (w, hh) => {
      const s = new Scene(w, hh), cy = Math.round(hh / 2);
      return {
        scene: s,
        // a wide beam and a strong lens: a tight focus in the middle of the picture, then the beam spreads again
        sources: [newSource({ name: "Laser", kind: "laser", x: Math.round(w * 0.12), y: cy, level: 60, beamWidth: Math.max(20, Math.round(hh * 0.15)) })],
        optics: [newOptic("convex", { x: Math.round(w * 0.38), y: cy, size: Math.round(hh * 0.62), radius: Math.round(hh * 0.36) })],
      };
    },
  },
  {
    id: "corner", label: "Corner reflector", build: (w, hh) => {
      const s = new Scene(w, hh);
      const wall = (x0: number, y0: number, x1: number, y1: number, name: string) => {
        const l = newShape("line", { name, thickness: 8 });
        l.x = (x0 + x1) / 2; l.y = (y0 + y1) / 2; l.length = Math.hypot(x1 - x0, y1 - y0); l.angleDeg = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
        return l;
      };
      s.add(wall(w * 0.75, hh * 0.15, w * 0.95, hh * 0.5, "Mirror 1"), wall(w * 0.95, hh * 0.5, w * 0.75, hh * 0.85, "Mirror 2"));
      return { scene: s, sources: [newSource({ name: "Pulse", kind: "point", x: Math.round(w * 0.3), y: Math.round(hh * 0.4), level: 60, mode: "pulsed", onCycles: 3, offCycles: 60 })] };
    },
  },
];

/** Ready-made wave circuits (they bring their own scene and size). */
export const CIRCUITS: { id: string; label: string; build: (sim: Sim) => void }[] = [
  { id: "c-andor", label: "OR and AND gate", build: sim => buildGate(sim, "andor") },
  { id: "c-xor", label: "XOR gate", build: sim => buildGate(sim, "xor") },
  { id: "c-not", label: "NOT gate", build: sim => buildGate(sim, "not") },
  { id: "c-half", label: "Half adder (1 + 1 = 10)", build: sim => buildHalfAdder(sim) },
  { id: "c-full", label: "Full adder (with transistors)", build: sim => buildFullAdder(sim) },
  { id: "c-tr", label: "Wave transistor", build: sim => buildTransistor(sim, 100, false) },
  { id: "c-inv", label: "Inverting transistor (NOT)", build: sim => buildTransistor(sim, 100, true) },
  { id: "c-latch", label: "One bit of memory (SR latch)", build: sim => buildLatch(sim) },
  { id: "c-reg", label: "4-bit register", build: sim => buildRegister(sim, 4) },
];
