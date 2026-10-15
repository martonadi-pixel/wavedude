// Wave Dude 2D web - shapes: walls, glass and absorbers as objects (a line, a box, an ellipse, a wall with slits)
// that can be selected, moved, turned, resized and deleted. They are drawn on top of the painted base layer, like the
// optical elements, so moving one leaves nothing behind.
// GPL-3.0-or-later.

import type { Material, Scene } from "./scene";
import { ABSORBER_RAMP, ABSORBER_STRENGTH } from "./paint";

export type ShapeKind = "line" | "box" | "ellipse" | "slits";
export type ShapeMaterial = "wall" | "glass" | "absorber";

/**
 * A shape, centred on (x, y) and turned by angleDeg (0 = its length runs to the right).
 *   line:    length × thickness (a thick straight line, round ends)
 *   box:     length × width, filled or an outline `thickness` thick
 *   ellipse: length × width (diameters)
 *   slits:   a wall `length` long and `thickness` thick with `count` openings `width` wide, `spacing` apart (centre to
 *            centre); at angle 90 the wall stands upright and the openings let waves through from left to right
 */
export interface ShapeSpec {
  id: number;
  name: string;
  kind: ShapeKind;
  material: ShapeMaterial;
  /** Refractive index of glass. */
  n: number;
  x: number;
  y: number;
  angleDeg: number;
  length: number;
  width: number;
  thickness: number;
  filled: boolean;
  count: number;
  spacing: number;
}

export const SHAPE_KINDS: { kind: ShapeKind; label: string; icon: string }[] = [
  { kind: "line", label: "Line", icon: "╱" },
  { kind: "box", label: "Box", icon: "▭" },
  { kind: "ellipse", label: "Ellipse", icon: "⬭" },
  { kind: "slits", label: "Slits", icon: "┆" },
];

export const MATERIAL_LABEL: Record<ShapeMaterial, string> = { wall: "Wall", glass: "Glass", absorber: "Absorber" };

let nextId = 1;

export function newShape(kind: ShapeKind, over: Partial<ShapeSpec> = {}): ShapeSpec {
  const id = nextId++;
  const defaults: Partial<ShapeSpec> =
    kind === "slits" ? { angleDeg: 90, length: 300, thickness: 8, width: 12, count: 2, spacing: 60 } :
    kind === "ellipse" ? { length: 120, width: 80, filled: true } :
    kind === "box" ? { length: 160, width: 100, filled: false } : {};
  const s: ShapeSpec = {
    id, name: "", kind, material: "wall", n: 1.5, x: 0, y: 0, angleDeg: 0, length: 200, width: 100, thickness: 8, filled: false,
    count: 2, spacing: 60, ...defaults, ...over,
  };
  s.id = id;
  if (!s.name) s.name = `${MATERIAL_LABEL[s.material]} ${SHAPE_KINDS.find(k => k.kind === kind)!.label.toLowerCase()} ${id}`;
  return s;
}

/** A copy with a new id (for duplicating), moved by (dx, dy). */
export function copyShape(s: ShapeSpec, dx = 0, dy = 0): ShapeSpec {
  const { id: _id, name, ...rest } = s;
  return newShape(s.kind, { ...rest, name: `${name} copy`, x: s.x + dx, y: s.y + dy });
}

/** The shape's own coordinates of a point: u along its length, v across it. */
function local(s: ShapeSpec, x: number, y: number): { u: number; v: number } {
  const a = (s.angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), dx = x - s.x, dy = y - s.y;
  return { u: dx * ca + dy * sa, v: -dx * sa + dy * ca };
}

/** Distance from (u, v) to the segment from (-h, 0) to (h, 0). */
const segDist = (u: number, v: number, h: number) => Math.hypot(Math.max(0, Math.abs(u) - h), v);

/** Centres of the openings of a slit wall, along its length. */
export function slitCentres(s: ShapeSpec): number[] {
  return Array.from({ length: Math.max(0, Math.round(s.count)) }, (_, k) => (k - (s.count - 1) / 2) * s.spacing);
}

/**
 * How far the point lies inside the shape (negative: outside), and the deepest any point can be: what the absorber
 * grades its strength by.
 */
export function shapeDepth(s: ShapeSpec, x: number, y: number): { depth: number; max: number } {
  const { u, v } = local(s, x, y), L = s.length / 2, W = s.width / 2, t = s.thickness / 2;
  switch (s.kind) {
    case "line": return { depth: t - segDist(u, v, L), max: t };
    case "box": {
      const inside = Math.min(L - Math.abs(u), W - Math.abs(v));
      if (s.filled) return { depth: inside, max: Math.min(L, W) };
      // distance to the outline: inside the box, to the nearest side; outside, to the box
      const d = inside >= 0 ? inside : Math.hypot(Math.max(0, Math.abs(u) - L), Math.max(0, Math.abs(v) - W));
      return { depth: t - d, max: t };
    }
    case "ellipse": {
      const r = Math.hypot(u / Math.max(L, 0.5), v / Math.max(W, 0.5));
      return { depth: (1 - r) * Math.min(L, W), max: Math.min(L, W) };
    }
    case "slits": {
      if (Math.abs(u) > L || Math.abs(v) > t) return { depth: -Math.max(Math.abs(u) - L, Math.abs(v) - t), max: t };
      // half-open, so an opening `width` wide frees exactly `width` cells whether the width is even or odd
      for (const c of slitCentres(s)) if (u - c >= -s.width / 2 && u - c < s.width / 2) return { depth: -(s.width / 2 - Math.abs(u - c)), max: t };
      return { depth: Math.min(t - Math.abs(v), L - Math.abs(u)), max: t };
    }
  }
}

/** A box that surely contains the shape. */
export function shapeBounds(s: ShapeSpec): { x0: number; y0: number; x1: number; y1: number } {
  const halfL = s.length / 2 + (s.kind === "line" || (s.kind === "box" && !s.filled) ? s.thickness / 2 : 0);
  const halfW = s.kind === "line" || s.kind === "slits" ? s.thickness / 2 : s.width / 2 + (s.kind === "box" && !s.filled ? s.thickness / 2 : 0);
  const a = (s.angleDeg * Math.PI) / 180, ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a));
  const ex = halfL * ca + halfW * sa + 1, ey = halfL * sa + halfW * ca + 1;
  return { x0: Math.floor(s.x - ex), y0: Math.floor(s.y - ey), x1: Math.ceil(s.x + ex), y1: Math.ceil(s.y + ey) };
}

function materialOf(s: ShapeSpec): Material {
  return s.material === "wall" ? { n: 1, absorb: 1 } : { n: s.n, absorb: 0 };
}

/**
 * Draws the shape into the scene, only inside the clip rectangle (inclusive). Walls and glass are set wherever the
 * shape covers a cell's centre; an absorber grows from nothing at its border to full strength ABSORBER_RAMP cells
 * inside (or at its middle), and only ever adds absorption.
 */
export function drawShape(scene: Scene, s: ShapeSpec, clip: { x0: number; y0: number; x1: number; y1: number }): void {
  const b = shapeBounds(s), W = scene.width, m = materialOf(s);
  const x0 = Math.max(0, b.x0, clip.x0), y0 = Math.max(0, b.y0, clip.y0);
  const x1 = Math.min(W - 1, b.x1, clip.x1), y1 = Math.min(scene.height - 1, b.y1, clip.y1);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const { depth, max } = shapeDepth(s, x + 0.5, y + 0.5);
      if (depth < 0) continue;
      const i = y * W + x;
      if (s.material !== "absorber") { scene.setCell(i, m); continue; }
      const a = ABSORBER_STRENGTH * Math.min(1, depth / Math.max(1, Math.min(ABSORBER_RAMP, max))) ** 2;
      if (1 - scene.dBase[i] < a) scene.setCell(i, { absorb: a });
    }
}

/** Is the point on the shape (or within `slack` cells of it)? */
export function shapeHit(s: ShapeSpec, x: number, y: number, slack: number): boolean {
  const { depth } = shapeDepth(s, x, y);
  // a slit's openings count as part of it (they are what you would click on)
  if (s.kind === "slits") {
    const { u, v } = local(s, x, y);
    return Math.abs(u) <= s.length / 2 + slack && Math.abs(v) <= s.thickness / 2 + slack;
  }
  return depth >= -slack;
}

/** The two ends of a line (or of a slit wall), in scene cells. */
export function shapeEnds(s: ShapeSpec): [{ x: number; y: number }, { x: number; y: number }] {
  const a = (s.angleDeg * Math.PI) / 180, dx = (Math.cos(a) * s.length) / 2, dy = (Math.sin(a) * s.length) / 2;
  return [{ x: s.x - dx, y: s.y - dy }, { x: s.x + dx, y: s.y + dy }];
}

/** Sets a line's (or slit wall's) ends: its centre, length and angle follow. */
export function setShapeEnds(s: ShapeSpec, a: { x: number; y: number }, b: { x: number; y: number }): void {
  s.x = (a.x + b.x) / 2;
  s.y = (a.y + b.y) / 2;
  s.length = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
  s.angleDeg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** The outline of the shape for the overlay (a polygon in scene cells). */
export function shapeOutline(s: ShapeSpec): { x: number; y: number }[] {
  const a = (s.angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const P = (u: number, v: number) => ({ x: s.x + u * ca - v * sa, y: s.y + u * sa + v * ca });
  const L = s.length / 2, W = s.kind === "line" || s.kind === "slits" ? s.thickness / 2 : s.width / 2;
  if (s.kind === "ellipse") return Array.from({ length: 48 }, (_, k) => P(L * Math.cos((k / 48) * 2 * Math.PI), W * Math.sin((k / 48) * 2 * Math.PI)));
  return [P(-L, -W), P(L, -W), P(L, W), P(-L, W)];
}

/** One line about the shape, for lists and the inspector. */
export function shapeInfo(s: ShapeSpec): string {
  const mat = s.material === "glass" ? `glass n ${s.n.toFixed(2)}` : s.material;
  const size = s.kind === "line" ? `${Math.round(s.length)} × ${Math.round(s.thickness)}`
    : s.kind === "slits" ? `${s.count} slit${s.count === 1 ? "" : "s"} ${Math.round(s.width)} wide, ${Math.round(s.spacing)} apart`
    : `${Math.round(s.length)} × ${Math.round(s.width)}${s.kind === "box" && !s.filled ? " outline" : ""}`;
  return `${mat} · ${size}`;
}

/** The shape as saved in a project (web only: configuration.json key "web_shapes"). */
export function shapeFromJSON(d: Record<string, unknown>): ShapeSpec | null {
  const kind = d.kind as ShapeKind;
  if (!SHAPE_KINDS.some(k => k.kind === kind)) return null;
  const num = (k: string, def: number) => (typeof d[k] === "number" && Number.isFinite(d[k] as number) ? (d[k] as number) : def);
  const material = (["wall", "glass", "absorber"] as const).includes(d.material as ShapeMaterial) ? (d.material as ShapeMaterial) : "wall";
  return newShape(kind, {
    name: typeof d.name === "string" ? d.name : "", material, n: num("n", 1.5), x: num("x", 0), y: num("y", 0), angleDeg: num("angleDeg", 0),
    length: num("length", 200), width: num("width", 100), thickness: num("thickness", 8), filled: d.filled === true,
    count: Math.max(0, Math.round(num("count", 2))), spacing: num("spacing", 60),
  });
}
