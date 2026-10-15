import { describe, expect, it } from "vitest";
import { c2OfIndex, continuumSpeed, continuumWavelength, omegaOfLevel, subStepsFor, wavelength } from "./physics";

describe("physics", () => {
  it("maps a level to its angular frequency (level / 255 * 0.5 * scale)", () => {
    expect(omegaOfLevel(255)).toBeCloseTo(1);
    expect(omegaOfLevel(60, 1)).toBeCloseTo(60 / 510);
  });

  it("gives c² = 1 / n², with n limited to 0.9..10", () => {
    expect(c2OfIndex(1.5)).toBeCloseTo(1 / 2.25);
    expect(c2OfIndex(100)).toBeCloseTo(0.01);
  });

  it("needs no sub-steps for 3x3 and two for the scaled 4th-order cross at c² = 1", () => {
    expect(subStepsFor(1, "3x3")).toBe(1);
    expect(subStepsFor(1, "4th")).toBe(2);
  });

  it("long waves match the continuum: same speed for both stencils", () => {
    const w = omegaOfLevel(20);
    expect(wavelength(w, 1, "3x3") / continuumWavelength(w, 1)).toBeCloseTo(1, 2);
    expect(wavelength(w, 1, "4th", 2) / continuumWavelength(w, 1)).toBeCloseTo(1, 2);
    expect(continuumSpeed(1)).toBeCloseTo(Math.sqrt(0.316));
  });

  it("short waves are slower on the grid (the 3x3 wavelength comes out shorter)", () => {
    const w = omegaOfLevel(120);
    expect(wavelength(w, 1, "3x3")).toBeLessThan(continuumWavelength(w, 1));
  });

  it("has no propagating wave above the grid's cut-off", () => {
    expect(wavelength(3, 1, "3x3")).toBeNaN();
  });
});

import { edgeDamping } from "./scene";

describe("damping edge", () => {
  it("starts with no damping and no kink, and damps most at the border", () => {
    expect(edgeDamping(64, 64)).toBeCloseTo(1);
    expect(1 - edgeDamping(63, 64)).toBeLessThan(1e-4);
    expect(edgeDamping(0, 64)).toBeCloseTo(1 - 12 / 64);
    expect(edgeDamping(0, 8)).toBeCloseTo(0.5);
  });
});
