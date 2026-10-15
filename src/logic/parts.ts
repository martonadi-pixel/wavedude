// Wave Dude 2D web - the parts of the wave computer: light guides, emitters, absorbing detector ends, the
// two-input combiner (XOR / AND / OR / NOT) and the set-reset latch made of two wave transistors.
// GPL-3.0-or-later.
//
// Everything was measured in the engine (3x3 stencil, level 60: wavelength 14.9 cells in empty space):
//  - Walls (absorb = 1) do not make light guides: a channel 8-16 cells wide between them loses nearly everything
//    within 400 cells, because a fully damped cell absorbs instead of reflecting. Glass guides work: a core of
//    n = 1.5 in empty space keeps the wave by total internal reflection (about 60-70% after 400 cells, most of the
//    loss near the source; a 90° bend of radius 30-90 cells passes about 60%).
//  - The core must carry one mode only, or the two inputs of a combiner do not cancel: with a core 8 cells wide the
//    anti-phase output was still 1.5x one input; 6 cells wide (single mode at level 60) brings it down to 0.02-0.05.
//  - Combiner (two guides meeting at about 11°), read 150 cells behind the junction:
//      one input = 1 (A and B within 3-15% of each other), both in phase = 4.0-4.4, both in anti-phase = 0.01-0.05.
//    Amplitudes add: 1 + 1 = 2, so the intensity is 4 times one input, and 1 - 1 = 0.
//  - A change at an input reaches the detector about 800 steps later; the reading then settles within ~150 steps.

import { type Scene, type Material } from "../engine/scene";
import { newSource, type SourceSpec } from "../engine/sources";
import type { Area } from "./circuit";

/** Frequency level of every wave in the computer (wavelength 14.9 cells in empty space, about 10 in the glass). */
export const LEVEL = 60;
/** Core of the light guides: glass n = 1.5, 6 cells wide (one mode only at this wavelength). */
export const CORE: Material = { n: 1.5, absorb: 0 };
export const CORE_W = 6;
/** The engine's damping edge is this wide; emitters sit just inside the scene beyond it. */
export const EDGE = 64;

/** A light guide (glass core) along straight pieces through these points. */
export function guide(scene: Scene, pts: [number, number][], w = CORE_W): void {
  for (let i = 0; i + 1 < pts.length; i++) scene.segment(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, CORE);
}

/**
 * The end of a guide that soaks up the light instead of reflecting it or shining it into the room (like a
 * photodiode at the end of a fibre): from x the glass gets more and more absorbing over `len` cells, in direction dir.
 */
export function absorbingEnd(scene: Scene, x: number, y: number, dir: 1 | -1, len = 40, w = CORE_W): void {
  for (let k = 0; k < len; k++) {
    const a = 0.25 * ((k + 1) / len) ** 2;
    scene.rect(x + dir * k - (dir < 0 ? 1 : 0), y - (w + 4) / 2, 1, w + 4, { n: 1.5, absorb: a });
  }
}

/** A source across a horizontal guide at (x, y): it fills the guide's core with light of the computer's frequency. */
export function emitter(name: string, x: number, y: number, over: Partial<SourceSpec> = {}): SourceSpec {
  const half = Math.floor((CORE_W - 2) / 2);
  return newSource({ name, kind: "line", x: Math.round(x), y: Math.round(y - half), x2: Math.round(x), y2: Math.round(y + half), level: LEVEL, ...over });
}

/** A small detector area across a horizontal guide at (x, y). */
export function across(x: number, y: number, len = 4): Area {
  const half = Math.floor((CORE_W - 2) / 2);
  return { x: Math.round(x), y: Math.round(y - half), w: len, h: 2 * half + 1 };
}

// ------------------------------------------------------------------------------------------ combiner

/** Measured intensity of one input at the combiner's detector (level 60, unit amplitude). See the notes above. */
export const COMBINER_UNIT = 0.018;

export interface Combiner {
  /** Emitter positions of input A (top) and B (bottom). */
  a: { x: number; y: number };
  b: { x: number; y: number };
  out: Area;
  /** Where the output guide is (for the LED label). */
  outAt: { x: number; y: number };
  junction: { x: number; y: number };
}

/**
 * Two guides that meet in one (a Y-junction, mirrored): inputs from x0 at cy - 50 and cy + 50, straight to
 * x0 + 80, then at about 11° to the junction at x0 + 340, and on to the right. The detector is 150 cells behind the
 * junction, where the light that does not fit into the output guide (the anti-phase part) has left it.
 * x0 = 0: the inputs start in the damping edge. Otherwise they start in absorbing ends (so a combiner can sit
 * behind another one). end: the output guide ends there in an absorbing end; omitted, it runs into the edge.
 */
export function combiner(scene: Scene, x0: number, cy: number, end?: number): Combiner {
  const yA = cy - 50, yB = cy + 50, jx = x0 + 340;
  for (const y of [yA, yB]) {
    guide(scene, [[x0, y], [x0 + 80, y], [jx, cy]]);
    if (x0 > 0) absorbingEnd(scene, x0, y, -1);
  }
  guide(scene, [[jx, cy], [end ?? scene.width, cy]]);
  if (end !== undefined) absorbingEnd(scene, end, cy, 1);
  const ex = x0 > 0 ? x0 + 70 : EDGE + 6;
  return { a: { x: ex, y: yA }, b: { x: ex, y: yB }, out: across(jx + 150, cy), outAt: { x: jx + 150, y: cy - 14 }, junction: { x: jx, y: cy } };
}

// ------------------------------------------------------------------------------------------ latch

/** Rows of a latch, from its top: S, Q, Q̄ (Q-bar), R. */
export const LATCH_ROWS = [0, 24, 48, 72];
/** Where the guides end in detectors (x), the transistors' emitters (x) and the output LEDs (x). */
export const LATCH_XD = 160, LATCH_XE = 260, LATCH_XO = 360;
/** Measured intensity of one emitter's light at a latch detector: 0.061-0.063 (0.058 at the LEDs); light from the other guides there: below 0.3% of it. */
export const LATCH_UNIT = 0.06;

export interface LatchGeom {
  s: { x: number; y: number };
  r: { x: number; y: number };
  q: { x: number; y: number };
  qb: { x: number; y: number };
  /** Detector of the transistor that makes Q̄ (light from S and from Q) and of the one that makes Q (from Q̄ and R). */
  dQb: Area[];
  dQ: Area[];
  outQ: Area;
  outQb: Area;
  top: number;
}

/**
 * A set-reset latch: two wave transistors, each switched OFF by light (a NOR), whose outputs feed each other.
 *   row S:  input guide from the left edge, ends in an absorbing detector at XD (part of the Q̄ transistor's detector)
 *   row Q:  the Q transistor's emitter at XE shines both ways: left to the Q̄ transistor's detector, right to the Q LED
 *   row Q̄: the same for Q̄: left to the Q transistor's detector, right to the Q̄ LED
 *   row R:  input guide that ends in the Q transistor's detector
 */
export function latch(scene: Scene, top: number): LatchGeom {
  const [yS, yQ, yQb, yR] = LATCH_ROWS.map(r => top + r);
  for (const y of [yS, yR]) {
    guide(scene, [[0, y], [LATCH_XD, y]]);
    absorbingEnd(scene, LATCH_XD, y, 1);
  }
  for (const y of [yQ, yQb]) {
    guide(scene, [[LATCH_XD, y], [scene.width, y]]);
    absorbingEnd(scene, LATCH_XD, y, -1);
  }
  return {
    s: { x: EDGE + 6, y: yS }, r: { x: EDGE + 6, y: yR },
    q: { x: LATCH_XE, y: yQ }, qb: { x: LATCH_XE, y: yQb },
    dQb: [across(LATCH_XD - 6, yS), across(LATCH_XD + 2, yQ)],
    dQ: [across(LATCH_XD + 2, yQb), across(LATCH_XD - 6, yR)],
    outQ: across(LATCH_XO, yQ), outQb: across(LATCH_XO, yQb),
    top,
  };
}
