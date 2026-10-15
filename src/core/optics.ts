// Wave Dude 2D web - optical elements: lenses, a ball lens, a prism, mirrors, a beam splitter and a graded-index lens.
// They are objects (position, rotation, glass, shape) drawn into the scene's cells on top of a base layer, so they can
// be moved and edited. Local coordinates: u along the optical axis (the way light travels through it at angle 0),
// v across it.
// GPL-3.0-or-later.

import { type Scene, type Material, drawGlassCell } from "./scene";

export type OpticKind =
  | "convex" | "concave" | "planoConvex" | "planoConcave" | "meniscus"
  | "ball" | "prism" | "mirror" | "parabolic" | "splitter" | "grin";

export interface OpticSpec {
  id: number;
  kind: OpticKind;
  name: string;
  x: number;
  y: number;
  /** Rotation in degrees (0 = optical axis pointing right). */
  angleDeg: number;
  /** Refractive index (centre index for the GRIN lens; mirrors use 10). */
  n: number;
  /** Aperture (lenses, mirrors, splitter, GRIN), diameter (ball) or height (prism), in cells. */
  size: number;
  /** Radius of curvature of the lens faces; focal length of the parabolic mirror; apex angle (°) of the prism. */
  radius: number;
  /** Centre thickness (lenses, GRIN, mirrors, splitter), in cells. */
  thickness: number;
}

export const OPTIC_KINDS: { kind: OpticKind; label: string; icon: string; help: string }[] = [
  { kind: "convex", label: "Convex lens", icon: "( )", help: "Thicker in the middle: brings a parallel beam to a focus (converging)." },
  { kind: "concave", label: "Concave lens", icon: ") (", help: "Thinner in the middle: spreads a beam out (diverging)." },
  { kind: "planoConvex", label: "Plano-convex", icon: "| )", help: "One flat face, one curved: a converging lens, as in magnifiers and condensers." },
  { kind: "planoConcave", label: "Plano-concave", icon: "| (", help: "One flat face, one hollow: a diverging lens." },
  { kind: "meniscus", label: "Meniscus", icon: "( (", help: "Both faces curve the same way, like spectacle lenses (this one converges)." },
  { kind: "ball", label: "Ball lens", icon: "○", help: "A glass disc (a sphere in 3D): a very strong lens, used to couple light into fibres." },
  { kind: "prism", label: "Prism", icon: "△", help: "A wedge of glass: bends a beam by a fixed angle." },
  { kind: "mirror", label: "Flat mirror", icon: "▌", help: "Reflects every wave completely, with angle in = angle out." },
  { kind: "parabolic", label: "Parabolic mirror", icon: "⊃", help: "Focuses a parallel beam to one point, like a satellite dish or telescope mirror." },
  { kind: "splitter", label: "Beam splitter", icon: "⟋", help: "A thin glass plate at 45°: lets part of the beam through and reflects part of it." },
  { kind: "grin", label: "GRIN lens", icon: "▥", help: "A flat slab of glass whose refractive index is highest in the middle and falls towards the rim: it focuses light without curved faces." },
];

let nextId = 1;

export function newOptic(kind: OpticKind, over: Partial<OpticSpec> = {}): OpticSpec {
  const id = nextId++;
  const label = OPTIC_KINDS.find(k => k.kind === kind)?.label ?? kind;
  const base: OpticSpec = { id, kind, name: `${label} ${id}`, x: 0, y: 0, angleDeg: 0, n: 1.5, size: 220, radius: 260, thickness: 24 };
  const defaults: Partial<OpticSpec> =
    kind === "ball" ? { size: 120 } :
    kind === "prism" ? { size: 160, radius: 60 } :
    kind === "mirror" ? { n: 10, size: 240, thickness: 8 } :
    kind === "parabolic" ? { n: 10, size: 260, radius: 160, thickness: 8 } :
    kind === "splitter" ? { n: 2.5, size: 180, thickness: 3, angleDeg: 45 } :
    kind === "grin" ? { n: 1.6, size: 200, thickness: 60 } :
    kind === "concave" || kind === "planoConcave" ? { thickness: 8 } : {};
  return { ...base, ...defaults, ...over, id };
}

const sag = (R: number, v: number) => (Math.abs(v) >= R ? R : R - Math.sqrt(R * R - v * v));

/** Centre thickness actually used, so that converging lenses keep at least 2 cells at their rim. */
export function effectiveThickness(o: OpticSpec): number {
  const h = o.size / 2, R = Math.max(o.radius, h + 1);
  switch (o.kind) {
    case "convex": return Math.max(o.thickness, 2 * sag(R, h) + 2);
    case "planoConvex": return Math.max(o.thickness, sag(R, h) + 2);
    case "meniscus": return Math.max(o.thickness, sag(R, h) - sag(1.6 * R, h) + 2);
    default: return Math.max(2, o.thickness);
  }
}

/** Material at local coordinates (u, v), or null outside the element. */
function materialAt(o: OpticSpec, u: number, v: number): Material | null {
  const h = o.size / 2, R = Math.max(o.radius, h + 1), t = effectiveThickness(o);
  const glassN = { n: o.n };
  switch (o.kind) {
    case "convex": case "concave": case "planoConvex": case "planoConcave": case "meniscus": {
      if (Math.abs(v) > h) return null;
      const s = sag(R, v);
      const [uL, uR] =
        o.kind === "convex" ? [-t / 2 + s, t / 2 - s] :
        o.kind === "concave" ? [-t / 2 - s, t / 2 + s] :
        o.kind === "planoConvex" ? [-t / 2, t / 2 - s] :
        o.kind === "planoConcave" ? [-t / 2, t / 2 + s] :
        [-t / 2 - sag(1.6 * R, v), t / 2 - s];
      return u >= uL && u <= uR ? glassN : null;
    }
    case "ball":
      return u * u + v * v <= h * h ? glassN : null;
    case "prism": {
      // apex towards -v (up at angle 0), base at +v; apex angle = radius (degrees)
      const halfBase = h * 2 * Math.tan((Math.min(170, Math.max(10, o.radius)) * Math.PI) / 360);
      if (v < -h || v > h) return null;
      const w = ((v + h) / (2 * h)) * halfBase;
      return Math.abs(u) <= w ? glassN : null;
    }
    // mirrors are walls: the engine holds the field at zero there, so they reflect everything at every frequency
    case "mirror":
      return Math.abs(v) <= h && Math.abs(u) <= t / 2 ? { n: 1, absorb: 1 } : null;
    case "splitter":
      return Math.abs(v) <= h && Math.abs(u) <= t / 2 ? { n: o.n, absorb: 0 } : null;
    case "parabolic": {
      if (Math.abs(v) > h) return null;
      const us = -(v * v) / (4 * Math.max(1, o.radius));       // opens towards -u, focus at u = -f
      return u >= us && u <= us + t ? { n: 1, absorb: 1 } : null;
    }
    case "grin": {
      if (Math.abs(v) > h || Math.abs(u) > t / 2) return null;
      // parabolic profile from o.n in the middle to a lower glass index at the rim (as real GRIN rods)
      const nEdge = 1 + 0.3 * (o.n - 1);
      return { n: nEdge + (o.n - nEdge) * (1 - (v / h) ** 2) };
    }
  }
}

/** A box that surely contains the element. */
export function opticBounds(o: OpticSpec): { x0: number; y0: number; x1: number; y1: number } {
  const t = effectiveThickness(o), h = o.size / 2, R = Math.max(o.radius, h + 1);
  const reachU = o.kind === "parabolic" ? (h * h) / (4 * Math.max(1, o.radius)) + t
    : o.kind === "prism" ? h * 2 * Math.tan((Math.min(170, Math.max(10, o.radius)) * Math.PI) / 360)
    : o.kind === "concave" || o.kind === "planoConcave" || o.kind === "meniscus" ? t / 2 + sag(1.6 * R, h) + 2
    : o.kind === "ball" ? h : t / 2;
  const r = Math.hypot(reachU, h) + 2;
  return { x0: Math.floor(o.x - r), y0: Math.floor(o.y - r), x1: Math.ceil(o.x + r), y1: Math.ceil(o.y + r) };
}

/** Draws the element into the scene, only inside the clip rectangle (inclusive). */
export function drawOptic(scene: Scene, o: OpticSpec, clip: { x0: number; y0: number; x1: number; y1: number }): void {
  const b = opticBounds(o);
  const x0 = Math.max(0, b.x0, clip.x0), y0 = Math.max(0, b.y0, clip.y0);
  const x1 = Math.min(scene.width - 1, b.x1, clip.x1), y1 = Math.min(scene.height - 1, b.y1, clip.y1);
  const a = (o.angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const at = (px: number, py: number) => { const dx = px - o.x, dy = py - o.y; return materialAt(o, dx * ca + dy * sa, -dx * sa + dy * ca); };
  // mirrors are walls: a cell is wall or not, by its centre; glass gets smooth edges
  const wall = o.kind === "mirror" || o.kind === "parabolic";
  const nAt = (px: number, py: number) => at(px, py)?.n ?? null;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      if (wall) { const m = at(x + 0.5, y + 0.5); if (m) scene.setCell(y * scene.width + x, m); continue; }
      drawGlassCell(scene, x, y, nAt);
      // the beam splitter also clears any wall under it (as before)
      if (o.kind === "splitter" && at(x + 0.5, y + 0.5)) scene.setCell(y * scene.width + x, { absorb: 0 });
    }
}

/** Is the cell on (or very near) the element? */
export function opticHit(o: OpticSpec, x: number, y: number, slack = 4): boolean {
  const a = (o.angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  for (const [ox, oy] of [[0, 0], [slack, 0], [-slack, 0], [0, slack], [0, -slack]]) {
    const dx = x + ox - o.x, dy = y + oy - o.y;
    if (materialAt(o, dx * ca + dy * sa, -dx * sa + dy * ca)) return true;
  }
  return false;
}

/** A one-line description with the textbook estimate (focal length, deviation). */
export function opticInfo(o: OpticSpec): string {
  const n = o.n, R = Math.max(o.radius, o.size / 2 + 1), t = effectiveThickness(o);
  const lens = (R1: number, R2: number) => {
    // thick-lens lensmaker: 1/f = (n - 1) [1/R1 - 1/R2 + (n - 1) t / (n R1 R2)]
    const inv = (n - 1) * (1 / R1 - 1 / R2 + ((n - 1) * t) / (n * R1 * R2));
    if (Math.abs(inv) < 1e-9) return "no focusing";
    const f = Math.round(1 / inv);
    // a small lens focuses a little closer than f: the diffraction focal shift (and spherical aberration)
    return f > 0 ? `f ≈ ${f} cells (thin-ray estimate; the brightest spot appears 10–20% closer for a small lens)` : `f ≈ ${f} cells (diverging: the beam spreads as if from a point ${-f} cells in front)`;
  };
  switch (o.kind) {
    case "convex": return lens(R, -R);
    case "concave": return lens(-R, R);
    case "planoConvex": return lens(Infinity, -R);
    case "planoConcave": return lens(Infinity, R);
    case "meniscus": return lens(-1.6 * R, -R);
    case "ball": return `f ≈ ${Math.round((n * o.size) / (4 * (n - 1)))} cells from its centre`;
    case "prism": {
      const A = (Math.min(170, Math.max(10, o.radius)) * Math.PI) / 180, s = n * Math.sin(A / 2);
      return s >= 1 ? "light cannot get through at minimum deviation (total internal reflection)" : `minimum deviation ≈ ${((2 * Math.asin(s) - A) * 180 / Math.PI).toFixed(1)}°`;
    }
    case "parabolic": return `focus ${Math.round(o.radius)} cells in front of the mirror`;
    case "mirror": return "angle in = angle out";
    case "splitter": return "part reflected, part transmitted";
    case "grin": return `index ${n.toFixed(2)} in the middle falling to ${(1 + 0.3 * (n - 1)).toFixed(2)} at the rim`;
  }
}

// ------------------------------------------------------------------------------------------ laser housing

/** The laser's housing: a block behind the emitter whose damping rises gradually, so the backward wave dies out. */
export interface Housing { x: number; y: number; angleDeg: number; halfWidth: number }

const HOUSING_GAP = 6, HOUSING_DEPTH = 60;

export function housingBounds(l: Housing): { x0: number; y0: number; x1: number; y1: number } {
  const r = Math.hypot(HOUSING_GAP + HOUSING_DEPTH, l.halfWidth + 8) + 2;
  return { x0: Math.floor(l.x - r), y0: Math.floor(l.y - r), x1: Math.ceil(l.x + r), y1: Math.ceil(l.y + r) };
}

export function drawHousing(scene: Scene, l: Housing, clip: { x0: number; y0: number; x1: number; y1: number }): void {
  const b = housingBounds(l);
  const x0 = Math.max(0, b.x0, clip.x0), y0 = Math.max(0, b.y0, clip.y0);
  const x1 = Math.min(scene.width - 1, b.x1, clip.x1), y1 = Math.min(scene.height - 1, b.y1, clip.y1);
  const a = (l.angleDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - l.x, dy = y + 0.5 - l.y;
      const u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      const depth = -u - HOUSING_GAP;
      if (depth < 0 || depth > HOUSING_DEPTH || Math.abs(v) > l.halfWidth + 8) continue;
      // a smooth rise (like the damping edge) reflects far less than a sudden wall
      const i = y * scene.width + x;
      const absorb = Math.min(1, (depth / HOUSING_DEPTH) ** 2 * 1.2);
      scene.dBase[i] = Math.min(scene.dBase[i], 1 - absorb);
    }
}
