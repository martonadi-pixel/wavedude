import { describe, expect, it } from "vitest";
import { clamp, deg, mean, rad, spectralPeak } from "./math";

describe("math", () => {
  it("converts angles both ways", () => {
    expect(deg(Math.PI)).toBe(180);
    expect(rad(90)).toBeCloseTo(Math.PI / 2, 15);
    for (const d of [-170, -30, 0, 12.5, 45, 359]) expect(deg(rad(d))).toBeCloseTo(d, 12);
  });

  it("averages, with 0 for nothing", () => {
    expect(mean([1, 2, 3, 6])).toBe(3);
    expect(mean(new Float32Array([0.5, 1.5]))).toBe(1);
    expect(mean([])).toBe(0);
    expect(mean(undefined)).toBe(0);
  });

  it("clamps", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.25, 0, 1)).toBe(0.25);
  });

  it("finds the frequency of a sine, also off the scan's grid", () => {
    const w = 0.2371, h = Array.from({ length: 2000 }, (_, j) => Math.sin(w * j + 0.4) + 0.3 * Math.sin(0.61 * j));
    const found = spectralPeak(h, 100, 1900, 0.05, 0.4, 0.004, 1e-7);
    expect(Math.abs(found - w)).toBeLessThan(1e-4);
  });
});
