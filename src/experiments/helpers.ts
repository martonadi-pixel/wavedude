// Wave Dude 2D web - small helpers for writing experiments.
// GPL-3.0-or-later.

import { c2OfIndex, omegaOfLevel, wavelength } from "../engine/physics";
import { newSource, type SourceSpec } from "../engine/sources";
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
