// Wave Dude 2D web - small maths shared by the experiments and the app: angles, averages, the strongest frequency in
// a recorded signal.
// GPL-3.0-or-later.

/** Radians to degrees. */
export const deg = (r: number): number => (r * 180) / Math.PI;

/** Degrees to radians. */
export const rad = (d: number): number => (d * Math.PI) / 180;

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** The average of the values (0 when there are none). */
export function mean(a: ArrayLike<number> | undefined): number {
  if (!a || !a.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}

/** Power of the signal h[from, to) at angular frequency w (per sample), the sample index being the time. */
export function spectralPower(h: ArrayLike<number>, from: number, to: number, w: number): number {
  let re = 0, im = 0;
  for (let j = from; j < to; j++) { re += h[j] * Math.cos(w * j); im -= h[j] * Math.sin(w * j); }
  return re * re + im * im;
}

/**
 * The angular frequency between lo and hi where the spectrum of h[from, to) peaks: a scan in steps of `step`, then
 * a search that halves its step until it is below `tol`.
 */
export function spectralPeak(h: ArrayLike<number>, from: number, to: number, lo: number, hi: number, step: number, tol: number): number {
  const power = (w: number) => spectralPower(h, from, to, w);
  let best = lo, bestP = -1;
  for (let w = lo; w <= hi; w += step) { const pw = power(w); if (pw > bestP) { bestP = pw; best = w; } }
  for (let d = step / 2; d > tol; d /= 2) {
    const l = power(best - d), r = power(best + d);
    if (l > bestP && l >= r) { best -= d; bestP = l; } else if (r > bestP) { best += d; bestP = r; }
  }
  return best;
}
