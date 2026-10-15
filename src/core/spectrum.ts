// Wave Dude 2D web - white light: eight colours simulated side by side, glass whose refractive index depends on the
// colour (dispersion), and the colour a mix of them looks to the eye.
//
// In white-light mode the engine runs eight independent fields at once, one per wavelength from violet to deep red.
// A source sends all eight (white light); glass slows each by its own index; the picture shows the colour their
// intensities add up to, by the CIE 1931 colour-matching functions and sRGB.
// GPL-3.0-or-later.

import { type Stencil, laplacianMagnitude } from "./physics";

/** The wavelengths (nm) simulated in white-light mode: violet to deep red, 40 nm apart. */
export const SPECTRAL_NM = [410, 450, 490, 530, 570, 610, 650, 690] as const;
export const CHANNELS = SPECTRAL_NM.length;

/** Scale of the white-light scenes: one cell is this many nanometres (a 410 nm wave is 16.4 cells long in air). */
export const NM_PER_CELL = 25;

export const wavelengthCells = (nm: number): number => nm / NM_PER_CELL;

/**
 * How much harder a white-light source drives each colour, so that white light comes out white (the same power in every
 * colour). A source cell is pulled a tenth of the way to its value each step, and it follows fast (violet) oscillations
 * less fully than slow (red) ones: measured, a point source, a line source and a laser radiate 0.63, 0.47 and 0.51 of the
 * red power in violet. These gains are 1 / √(their average power), scaled to a mean of 1; with them the three are within
 * about ±12% of flat.
 */
const POWER = [0.536, 0.652, 0.748, 0.831, 0.874, 0.911, 0.947, 0.982];
export const SOURCE_GAIN: readonly number[] = (() => {
  const g = POWER.map(p => 1 / Math.sqrt(p)), mean = g.reduce((a, b) => a + b, 0) / g.length;
  return g.map(v => v / mean);
})();

/**
 * Angular frequency (radians per step) whose wave on the grid is exactly `lambda` cells long in empty space (the grid's
 * own dispersion included), for `sub` sub-steps per step: 4 sin²(ω / 2sub) sub² = |L(k)|, k = 2π / λ.
 */
export function omegaForWavelength(lambda: number, stencil: Stencil = "3x3", sub = 1): number {
  const L = laplacianMagnitude((2 * Math.PI) / lambda, stencil);
  return 2 * sub * Math.asin(Math.min(1, Math.sqrt(L) / (2 * sub)));
}

/**
 * Dispersion: n(λ) − 1 = (n − 1) · factor(λ). Cauchy's law fitted to crown glass (BK7: n = 1.5168 at 589 nm,
 * B = 0.0042 µm²), relative to 589 nm, so any glass keeps its index there and a stronger glass disperses more.
 * `exaggerate` multiplies the spread (1 = real glass).
 */
export function dispersionFactor(nm: number, exaggerate = 1): number {
  const um = nm / 1000;
  return 1 + exaggerate * (0.0042 / 0.5168) * (1 / (um * um) - 1 / (0.589 * 0.589));
}

// ---------------------------------------------------------------------------------------------- colour

/** A two-sided Gaussian lobe (the analytic fit of Wyman, Sloan and Shirley 2013 to the CIE 1931 functions). */
const lobe = (x: number, mu: number, s1: number, s2: number) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };

/** The CIE 1931 2° colour-matching functions x̄, ȳ, z̄ at a wavelength (nm). */
export function cie1931(nm: number): [number, number, number] {
  return [
    1.056 * lobe(nm, 599.8, 37.9, 31.0) + 0.362 * lobe(nm, 442.0, 16.0, 26.7) - 0.065 * lobe(nm, 501.1, 20.4, 26.2),
    0.821 * lobe(nm, 568.8, 46.9, 40.5) + 0.286 * lobe(nm, 530.9, 16.3, 31.1),
    1.217 * lobe(nm, 437.0, 11.8, 36.0) + 0.681 * lobe(nm, 459.0, 26.0, 13.8),
  ];
}

/** CIE XYZ to linear sRGB (D65). */
function xyzToRgb([x, y, z]: [number, number, number]): [number, number, number] {
  return [3.2406 * x - 1.5372 * y - 0.4986 * z, -0.9689 * x + 1.8758 * y + 0.0415 * z, 0.0557 * x - 0.204 * y + 1.057 * z];
}

/**
 * How much each channel adds to linear red, green and blue: weights[k] = [r, g, b] for SPECTRAL_NM[k], scaled so that
 * all eight at the same intensity (white light) give exactly white (1, 1, 1).
 */
export const CHANNEL_RGB: readonly (readonly [number, number, number])[] = (() => {
  const raw = SPECTRAL_NM.map(nm => xyzToRgb(cie1931(nm)));
  const sum = [0, 1, 2].map(c => raw.reduce((a, w) => a + w[c], 0));
  return raw.map(w => [w[0] / sum[0], w[1] / sum[1], w[2] / sum[2]] as const);
})();

/** Linear RGB of a spectrum (one intensity per channel; 1 everywhere = white 1, 1, 1). */
export function spectrumToRgb(intensity: ArrayLike<number>): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  for (let k = 0; k < CHANNELS; k++) for (let c = 0; c < 3; c++) out[c] += CHANNEL_RGB[k][c] * (intensity[k] ?? 0);
  return out;
}

/**
 * Linear RGB to an sRGB colour for the screen: negative parts (colours outside sRGB) dropped, too-bright colours scaled
 * down as a whole (so they keep their hue), then the sRGB curve.
 */
export function displayRgb(lin: [number, number, number]): [number, number, number] {
  let [r, g, b] = lin.map(v => Math.max(0, v));
  const m = Math.max(r, g, b);
  if (m > 1) { r /= m; g /= m; b /= m; }
  const enc = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  return [enc(r), enc(g), enc(b)];
}

/** A CSS colour for a spectrum (for readouts), with the brightest channel mix scaled to full brightness. */
export function spectrumCss(intensity: ArrayLike<number>, normalise = true): string {
  let lin = spectrumToRgb(intensity);
  if (normalise) { const m = Math.max(...lin, 1e-12); lin = lin.map(v => v / m) as [number, number, number]; }
  const [r, g, b] = displayRgb(lin);
  return `rgb(${Math.round(255 * r)}, ${Math.round(255 * g)}, ${Math.round(255 * b)})`;
}

/** The colour of one wavelength on its own (for the spectrum bars). */
export const wavelengthCss = (nm: number): string => {
  const [r, g, b] = displayRgb((() => { const c = xyzToRgb(cie1931(nm)); const m = Math.max(...c); return c.map(v => v / m) as [number, number, number]; })());
  return `rgb(${Math.round(255 * r)}, ${Math.round(255 * g)}, ${Math.round(255 * b)})`;
};
