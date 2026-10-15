// Wave Dude 2D web - small helpers for writing experiments.
// GPL-3.0-or-later.

import { c2OfIndex, omegaOfLevel, wavelength } from "../../core/physics";
import { newSource, type SourceSpec } from "../../core/sources";
import { newShape, setShapeEnds, type ShapeMaterial, type ShapeSpec } from "../../core/shapes";
import type { CheckResult } from "./types";

/** Wavelength in cells of a source with this level in a medium of index n (the grid's own dispersion relation). */
export function lam(level: number, n = 1): number {
  return wavelength(omegaOfLevel(level), c2OfIndex(n));
}

/** Steps per oscillation of a source with this level. */
export function period(level: number): number {
  return (2 * Math.PI) / omegaOfLevel(level);
}

/** A straight line of sources from (x0, y0) to (x1, y1): a flat (plane) wavefront. */
export function lineSource(x0: number, y0: number, x1: number, y1: number, level: number, over: Partial<SourceSpec> = {}): SourceSpec {
  return newSource({ kind: "line", x: Math.round(x0), y: Math.round(y0), x2: Math.round(x1), y2: Math.round(y1), level, name: "Wave maker", ...over });
}

export function pointSource(x: number, y: number, level: number, over: Partial<SourceSpec> = {}): SourceSpec {
  return newSource({ kind: "point", x: Math.round(x), y: Math.round(y), level, ...over });
}

export const f1 = (v: number) => v.toFixed(1);
export const f2 = (v: number) => v.toFixed(2);
export const f3 = (v: number) => v.toFixed(3);

/** Compares a measured value with the expected one. */
export function within(measured: number, expected: number, tolerance: number, what: string, unit: string, relative = false): CheckResult {
  const err = relative ? Math.abs(measured / expected - 1) : Math.abs(measured - expected);
  const ok = err <= tolerance;
  const diff = relative ? `${(err * 100).toFixed(0)}% off` : `${err.toFixed(1)}${unit} off`;
  return {
    ok,
    message: ok
      ? `✓ Your ${what}: ${f1(measured)}${unit}. Expected ${f1(expected)}${unit} (${diff}). Nicely measured!`
      : `Your ${what}: ${f1(measured)}${unit}, but the model predicts ${f1(expected)}${unit} (${diff}). Try measuring again more carefully.`,
  };
}

export const need = (message: string): CheckResult => ({ ok: false, message });

// ------------------------------------------------------------------------------------------ objects of a scene
// Walls, glass and slits as objects (scene.add(...)): the reader can select and move them, and the experiment can
// build them again in their original place. They cover exactly the cells the old drawing calls did.

/** A filled box from its top-left corner and size (like Scene.rect). */
export function box(x: number, y: number, w: number, h: number, material: ShapeMaterial, o: { n?: number; name?: string } = {}): ShapeSpec {
  return newShape("box", { material, n: o.n ?? 1.5, filled: true, x: x + w / 2, y: y + h / 2, length: w, width: h, name: o.name ?? "" });
}

/** A straight line `thickness` wide from (x0, y0) to (x1, y1) (like Scene.segment). */
export function line(x0: number, y0: number, x1: number, y1: number, thickness: number, material: ShapeMaterial, o: { n?: number; name?: string } = {}): ShapeSpec {
  const s = newShape("line", { material, n: o.n ?? 1.5, thickness, name: o.name ?? "" });
  setShapeEnds(s, { x: x0, y: y0 }, { x: x1, y: y1 });
  return s;
}

/**
 * An upright wall from x to x + thickness, `length` tall and centred on cy, with `count` openings `width` wide and
 * `spacing` apart (centre to centre), centred on cy.
 */
export function slitWall(x: number, cy: number, length: number, thickness: number, count: number, width: number, spacing: number, name = ""): ShapeSpec {
  return newShape("slits", { angleDeg: 90, x: x + thickness / 2, y: cy, length, thickness, count, width, spacing, name });
}
