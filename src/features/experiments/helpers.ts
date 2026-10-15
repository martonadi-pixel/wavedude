// Wave Dude 2D web - small helpers for writing experiments.
// GPL-3.0-or-later.

import { c2OfIndex, omegaOfLevel, wavelength } from "../../core/physics";
import { newSource, type SourceSpec } from "../../core/sources";
import { newShape, setShapeEnds, type ShapeMaterial, type ShapeSpec } from "../../core/shapes";
import type { Quantity } from "../../engine/engine";
import type { Measurement, NewProbe, Sim } from "../../sim/sim";
import type { CheckResult } from "./types";

/** Wavelength in cells of a source with this level in a medium of index n (the grid's own dispersion relation). */
export function lam(level: number, n = 1): number {
  return wavelength(omegaOfLevel(level), c2OfIndex(n));
}

/** "λ = 14.9 cells": the wavelength of this level in a medium of index n, for help texts and readouts. */
export function lamText(level: number, n = 1): string {
  return `λ = ${lam(level, n).toFixed(1)} cells`;
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

/**
 * A beam of straight waves travelling in direction `dir` (a unit vector) towards `aim`: a line of sources 2 · halfLen
 * long, square to `dir`, centred `dist` cells back from `aim`. side 1 lists the sources from the beam's right-hand side
 * to its left (y pointing down), -1 the other way round. Also returns the centre, where an arrow can start.
 */
export function beam(aim: { x: number; y: number }, dir: { x: number; y: number }, dist: number, halfLen: number, level: number,
  over: Partial<SourceSpec> = {}, side: 1 | -1 = 1): { source: SourceSpec; x: number; y: number } {
  const cx = aim.x - dist * dir.x, cy = aim.y - dist * dir.y;
  const ux = side * dir.y, uy = -side * dir.x;
  return { source: lineSource(cx - ux * halfLen, cy - uy * halfLen, cx + ux * halfLen, cy + uy * halfLen, level, over), x: cx, y: cy };
}

/** A probe at one cell (amplitude: the field itself; intensity: its time average). */
export function pointProbe(x: number, y: number, measurement: Measurement = "amplitude"): NewProbe {
  return { kind: "point", x, y, x2: x, y2: y, measurement };
}

/** A probe along a line from (x0, y0) to (x1, y1), e.g. a screen. */
export function lineProbe(x0: number, y0: number, x1: number, y1: number, measurement: Measurement = "intensity"): NewProbe {
  return { kind: "line", x: x0, y: y0, x2: x1, y2: y1, measurement };
}

/** How an experiment's scene is shown. Anything not given is left as it is. */
export interface Look {
  /** What the picture shows. */
  view: Quantity;
  /** Full brightness of the field and the intensity view: what the scene was tuned for (the picture starts at 30% of it). */
  field?: number;
  intensity?: number;
  /** Steps per frame (the guide opens every experiment at 1×). */
  speed?: number;
  /** Steps per frame while running ahead to `runTo` unseen. */
  prepare?: number;
  /** Run ahead to this step, then call `then`. */
  runTo?: number;
  then?: () => void;
}

/** Sets the view, the brightness and the speed of an experiment's scene, and runs ahead when asked to. */
export function look(sim: Sim, o: Look): void {
  sim.viewMode = o.view;
  if (o.field !== undefined) sim.brightness.field = o.field;
  if (o.intensity !== undefined) sim.brightness.intensity = o.intensity;
  if (o.speed !== undefined) sim.stepsPerFrame = o.speed;
  if (o.prepare !== undefined) sim.prepareSpeed = o.prepare;
  if (o.runTo !== undefined) sim.runUntil(o.runTo, o.then);
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
