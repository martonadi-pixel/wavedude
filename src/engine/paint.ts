// Wave Dude 2D web - painting material into a scene: brush dabs, straight strokes and boxes, and absorbers with a
// graded edge.
// GPL-3.0-or-later.
//
// Measured (plane wave, level 60, wavelength ~15 cells, reflection = standing-wave ratio just in front of the layer):
//   absorb 0.25 everywhere in the layer (the old brush):  reflects ~27% of the amplitude, about half of a wall's;
//   growing from 0 to 0.25 over 30 cells:                  reflects no more than the empty-space baseline (~7%).
// A sudden change of damping reflects like a change of material, so absorbers here grow from nothing at their border
// to full strength at their middle.

import type { Material, Scene } from "./scene";

/** What a paint tool lays down in one go. r: half the thickness of a dab, a stroke or a box's outline. */
export type Stamp =
  | { kind: "disc"; x: number; y: number; r: number }
  | { kind: "segment"; x0: number; y0: number; x1: number; y1: number; r: number }
  | { kind: "box"; x0: number; y0: number; x1: number; y1: number; r: number }
  | { kind: "filledBox"; x0: number; y0: number; x1: number; y1: number };

/** How the paint tools draw: freehand dabs, a straight line, a box outline or a filled box. */
export type PaintShape = "free" | "line" | "box" | "filledBox";

/** Full strength of the absorber tool (fraction of the wave removed per step at its middle). */
export const ABSORBER_STRENGTH = 0.25;
/** An absorber reaches full strength this many cells inside its border (or at its middle, if it is thinner). */
export const ABSORBER_RAMP = 30;

function distToSegment(x: number, y: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l2)) : 0;
  return Math.hypot(x - x0 - t * dx, y - y0 - t * dy);
}

/** How far the point lies inside the stamp (negative: outside), and the deepest any point of it can be. */
export function stampDepth(s: Stamp, x: number, y: number): { depth: number; max: number } {
  switch (s.kind) {
    case "disc": return { depth: s.r - Math.hypot(x - s.x, y - s.y), max: s.r };
    case "segment": return { depth: s.r - distToSegment(x, y, s.x0, s.y0, s.x1, s.y1), max: s.r };
    case "box": {
      const { x0, y0, x1, y1 } = normBox(s);
      const d = Math.min(distToSegment(x, y, x0, y0, x1, y0), distToSegment(x, y, x1, y0, x1, y1),
        distToSegment(x, y, x1, y1, x0, y1), distToSegment(x, y, x0, y1, x0, y0));
      return { depth: s.r - d, max: s.r };
    }
    case "filledBox": {
      const { x0, y0, x1, y1 } = normBox(s);
      return { depth: Math.min(x - x0, x1 - x, y - y0, y1 - y), max: Math.min(x1 - x0, y1 - y0) / 2 };
    }
  }
}

function normBox(s: { x0: number; y0: number; x1: number; y1: number }) {
  return { x0: Math.min(s.x0, s.x1), y0: Math.min(s.y0, s.y1), x1: Math.max(s.x0, s.x1), y1: Math.max(s.y0, s.y1) };
}

/** The cells a stamp can touch. */
export function stampBounds(s: Stamp): { x0: number; y0: number; x1: number; y1: number } {
  const r = s.kind === "filledBox" ? 0 : s.r;
  if (s.kind === "disc") return { x0: s.x - r, y0: s.y - r, x1: s.x + r, y1: s.y + r };
  const b = normBox(s);
  return { x0: b.x0 - r, y0: b.y0 - r, x1: b.x1 + r, y1: b.y1 + r };
}

/**
 * Paints a stamp. A material is set wherever the stamp covers a cell's centre. "absorber" grows from nothing at the
 * stamp's border to `strength` ABSORBER_RAMP cells inside (or at its middle), and only ever adds absorption.
 */
export function paintStamp(scene: Scene, s: Stamp, m: Material | "absorber", strength = ABSORBER_STRENGTH): void {
  const b = stampBounds(s), W = scene.width;
  const x0 = Math.max(0, Math.floor(b.x0)), y0 = Math.max(0, Math.floor(b.y0));
  const x1 = Math.min(W - 1, Math.ceil(b.x1)), y1 = Math.min(scene.height - 1, Math.ceil(b.y1));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const { depth, max } = stampDepth(s, x + 0.5, y + 0.5);
      if (depth < 0) continue;
      const i = y * W + x;
      if (m !== "absorber") { scene.setCell(i, m); continue; }
      const ramp = Math.max(1, Math.min(ABSORBER_RAMP, max));
      const a = strength * Math.min(1, depth / ramp) ** 2;
      if (1 - scene.dBase[i] < a) scene.setCell(i, { absorb: a });
    }
}

/** Snaps the end of a line to 0°, 45°, 90°… when it is within `deg` degrees of one (straight walls and guides). */
export function snapAngle(a: { x: number; y: number }, b: { x: number; y: number }, deg = 4): { x: number; y: number } {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
  if (L < 1) return b;
  const ang = Math.atan2(dy, dx), step = Math.PI / 4, s = Math.round(ang / step) * step;
  if (Math.abs(ang - s) > (deg * Math.PI) / 180) return b;
  return { x: a.x + L * Math.cos(s), y: a.y + L * Math.sin(s) };
}
