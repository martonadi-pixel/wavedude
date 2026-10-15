// Wave Dude 2D web - measuring and showing white light in experiments: how much of each colour reaches a few probes,
// bars for a spectrum, and colour swatches (see core/spectrum.ts for the colours themselves).
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { CHANNELS, SPECTRAL_NM, spectrumCss, wavelengthCss } from "../../core/spectrum";

/**
 * Adds up each colour's u² at the white-light probes (Sim.engine.setSpectrumProbes) over the steps from `from` to
 * `to`: their mean is that colour's intensity there. Call update() often (each readout); it reads what the probes
 * recorded since the last call.
 */
export class SpectrumMeter {
  private sums: number[][] = [];
  private steps = 0;

  constructor(private probes: number, private from: number, private to: number) { this.reset(); }

  reset(): void {
    this.sums = Array.from({ length: this.probes }, () => new Array<number>(CHANNELS).fill(0));
    this.steps = 0;
  }

  update(sim: Sim): void {
    const data = sim.engine.readSpectrumProbes(), n = data[0]?.length ?? 0;
    for (let i = 0; i < n; i++) {
      const step = sim.time - n + i;
      if (step < this.from || step >= this.to) continue;
      for (let p = 0; p < Math.min(this.probes, data.length); p++) for (let k = 0; k < CHANNELS; k++) this.sums[p][k] += data[p][i][k] ** 2;
      this.steps++;
    }
  }

  /** All the steps from `from` to `to` are in. */
  get done(): boolean { return this.steps >= this.to - this.from; }
  /** How far the measurement has got (0 to 1). */
  get progress(): number { return Math.min(1, this.steps / (this.to - this.from)); }

  /** Each colour's mean u² at probe p (violet first). */
  intensity(p: number): number[] { return this.sums[p].map(v => v / Math.max(1, this.steps)); }
}

/** A round swatch of a colour with a few words beside it. */
export const swatch = (css: string, text: string): string =>
  `<div class="film-row"><span class="film-dot" style="--c:${css}"></span><span>${text}</span></div>`;

/** The colour a spectrum looks: scaled to full brightness, or as it is (1 in every colour = white). */
export const spectrumColour = (values: number[], normalise = true): string => spectrumCss(values, normalise);

/**
 * Bars for a spectrum: one per simulated colour, in its own colour, as a share (0..1) or relative to the largest.
 * `percent`: label the bars with their value in %.
 */
export function spectrumBars(values: number[], o: { percent?: boolean; title?: string } = {}): string {
  const W = 320, H = 120, L = 8, B = 22, T = o.title ? 18 : 6, bw = (W - 2 * L) / CHANNELS;
  const max = Math.max(1e-12, ...values);
  const bars = values.map((v, k) => {
    const h = ((H - T - B) * v) / max, x = L + k * bw, y = H - B - h;
    const label = o.percent ? `<text x="${x + bw / 2}" y="${y - 3}" font-size="9" text-anchor="middle" fill="currentColor">${(100 * v).toFixed(v < 0.1 ? 1 : 0)}%</text>` : "";
    return `<rect x="${x + 2}" y="${y}" width="${bw - 4}" height="${Math.max(0.5, h)}" rx="2" fill="${wavelengthCss(SPECTRAL_NM[k])}"/>${label}` +
      `<text x="${x + bw / 2}" y="${H - 8}" font-size="9" text-anchor="middle" fill="currentColor">${SPECTRAL_NM[k]}</text>`;
  }).join("");
  const title = o.title ? `<text x="${L}" y="11" font-size="10" fill="currentColor">${o.title}</text>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" class="rec-chart" role="img" aria-label="${o.title ?? "spectrum"}">${title}${bars}</svg>`;
}
