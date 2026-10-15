import { describe, expect, it } from "vitest";
import { CHANNELS, SPECTRAL_NM, dispersionFactor, omegaForWavelength, spectrumToRgb, displayRgb, wavelengthCells } from "./spectrum";
import { wavelength } from "./physics";

describe("white light", () => {
  it("white light (every channel equal) is white", () => {
    const [r, g, b] = spectrumToRgb(new Array(CHANNELS).fill(1));
    expect(r).toBeCloseTo(1, 6); expect(g).toBeCloseTo(1, 6); expect(b).toBeCloseTo(1, 6);
  });

  it("single wavelengths have their colours", () => {
    const only = (nm: number) => spectrumToRgb(SPECTRAL_NM.map(w => (w === nm ? 1 : 0)));
    const red = only(650), green = only(530), blue = only(450);
    expect(red[0]).toBeGreaterThan(Math.max(red[1], red[2]));
    expect(green[1]).toBeGreaterThan(Math.max(green[0], green[2]));
    expect(blue[2]).toBeGreaterThan(Math.max(blue[0], blue[1]));
  });

  it("missing green looks magenta, missing blue looks yellow", () => {
    const without = (lo: number, hi: number) => displayRgb(spectrumToRgb(SPECTRAL_NM.map(w => (w >= lo && w <= hi ? 0.05 : 1))));
    const m = without(490, 570), y = without(410, 470);
    expect(m[1]).toBeLessThan(Math.min(m[0], m[2]));
    expect(y[2]).toBeLessThan(Math.min(y[0], y[1]));
  });

  it("each channel's frequency gives exactly its wavelength on the grid", () => {
    for (const nm of SPECTRAL_NM) {
      const lam = wavelengthCells(nm);
      expect(wavelength(omegaForWavelength(lam), 1)).toBeCloseTo(lam, 3);
    }
  });

  it("dispersion: real crown glass, blue bends more than red", () => {
    const n = (nm: number) => 1 + 0.5168 * dispersionFactor(nm);
    expect(n(589)).toBeCloseTo(1.5168, 4);
    expect(n(410)).toBeCloseTo(1.530, 2);
    expect(n(690)).toBeCloseTo(1.513, 2);
    expect(dispersionFactor(410, 10) - 1).toBeCloseTo(10 * (dispersionFactor(410) - 1), 9);
  });
});
