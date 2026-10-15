// Wave Dude 2D web - physics helpers shared by the engine and the experiments.
// GPL-3.0-or-later. The update rule is the one of WaveSimulator.vb (based on WaveSimulator2D by 0x23).

/** SimulationSettings.SourceFrequencyScale default. */
export const FREQUENCY_SCALE = 2.0;

/** Angular frequency (radians per step) of a source with this level (green value / frequency 1..255). */
export function omegaOfLevel(level: number, frequencyScale = FREQUENCY_SCALE): number {
  return (level / 255) * 0.5 * frequencyScale;
}

/** Squared wave speed of a cell with refractive index n (index limited to 0.9..10 as in SceneData). */
export function c2OfIndex(n: number): number {
  const m = Math.min(10, Math.max(0.9, n));
  return 1 / (m * m);
}

export type Stencil = "3x3" | "4th";

/**
 * Minus the stencil's Laplacian eigenvalue for a plane wave along x with wavenumber k (radians per cell).
 * 3x3 kernel [[0.066,0.184,0.066],[0.184,-1,0.184],[0.066,0.184,0.066]]: 1.264 sin^2(k/2), which is about 0.316 k^2,
 * so that kernel is 0.316 times the true Laplacian for long waves.
 * 4th order cross stencil: (1/6) cos 2k - (8/3) cos k + 5/2, about k^2.
 */
function laplacianMagnitude(k: number, stencil: Stencil): number {
  if (stencil === "3x3") return 1.264 * Math.sin(k / 2) ** 2;
  // the cross, scaled by the 3x3 kernel's long-wave factor 0.316 (same wave speed for both stencils)
  return 0.316 * ((1 / 6) * Math.cos(2 * k) - (8 / 3) * Math.cos(k) + 2.5);
}

/** Sub-steps the engine takes per step for the 4th order stencil (WaveSimulator.ComputeSubSteps). */
export function subStepsFor(maxC2: number, stencil: Stencil): number {
  if (stencil === "3x3" || maxC2 <= 0) return 1;
  // largest |symbol| of the scaled cross: 0.316 * 32/3; keep (c2 / N^2) |symbol| <= 2, half the limit 4
  return Math.max(1, Math.ceil(Math.sqrt((maxC2 * 0.316 * (32 / 3)) / 2)));
}

/**
 * Wavelength in cells of a free wave of angular frequency omega (per step) in a medium with squared speed c2,
 * from the discrete dispersion relation of the update u+ = 2u - u- + c2 L u (no damping):
 *   4 sin^2(omega_s / 2) = (c2 / sub^2) |L(k)|, with omega_s = omega / sub per sub-step.
 * Returns NaN above the grid's cut-off (no propagating wave).
 */
export function wavelength(omega: number, c2: number, stencil: Stencil = "3x3", subSteps = 1): number {
  const lhs = (4 * Math.sin(omega / subSteps / 2) ** 2 * subSteps * subSteps) / c2;
  let lo = 0, hi = Math.PI;
  if (laplacianMagnitude(hi, stencil) < lhs) return NaN;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (laplacianMagnitude(mid, stencil) < lhs) lo = mid; else hi = mid;
  }
  return (2 * Math.PI) / ((lo + hi) / 2);
}

/** Long-wave (continuum) speed in cells per step: sqrt(0.316 c2), for both stencils (the cross is scaled to match). */
export function continuumSpeed(c2: number, _stencil: Stencil = "3x3"): number {
  return Math.sqrt(0.316 * c2);
}

/** Wavelength the continuum wave equation would give (no grid effects). */
export function continuumWavelength(omega: number, c2: number, stencil: Stencil = "3x3"): number {
  return (2 * Math.PI * continuumSpeed(c2, stencil)) / omega;
}

/** A display colour for a source level, running through the visible spectrum: low = red, high = violet. */
export function levelColor(level: number): string {
  const f = Math.min(1, Math.max(0, (level - 1) / 254));
  const hue = f * 280; // 0 = red ... 280 = violet
  return `hsl(${hue.toFixed(0)} 100% 60%)`;
}

export function levelColorRgb(level: number): [number, number, number] {
  const f = Math.min(1, Math.max(0, (level - 1) / 254));
  const h = f * 280 / 60, s = 1, l = 0.6;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : [x, 0, c];
  return [r + m, g + m, b + m];
}

/** Angular frequency per step of a free wave with wavenumber k (inverse of wavelength()). NaN if not representable. */
export function omegaOfK(k: number, c2: number, stencil: Stencil = "3x3", subSteps = 1): number {
  const s = Math.sqrt((c2 / (subSteps * subSteps)) * laplacianMagnitude(k, stencil)) / 2;
  return s > 1 ? NaN : 2 * subSteps * Math.asin(s);
}

/** Group velocity (cells per step) of a wave packet with carrier omega: d omega / d k from the discrete relation. */
export function groupVelocity(omega: number, c2: number, stencil: Stencil = "3x3", subSteps = 1): number {
  const k = (2 * Math.PI) / wavelength(omega, c2, stencil, subSteps);
  const h = 1e-4;
  return (omegaOfK(k + h, c2, stencil, subSteps) - omegaOfK(k - h, c2, stencil, subSteps)) / (2 * h);
}

/** Phase velocity (cells per step): omega / k. */
export function phaseVelocity(omega: number, c2: number, stencil: Stencil = "3x3", subSteps = 1): number {
  return (omega * wavelength(omega, c2, stencil, subSteps)) / (2 * Math.PI);
}
