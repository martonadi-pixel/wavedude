// Wave Dude 2D web - collecting one measurement per setting and drawing the curve they make
// (a Bragg scan, a Michelson fringe count, a thin-film reflection curve...).
// GPL-3.0-or-later.

export class Recorder {
  private points = new Map<number, number>();

  clear(): void { this.points.clear(); }
  set(x: number, y: number): void { this.points.set(x, y); }
  has(x: number): boolean { return this.points.has(x); }
  get size(): number { return this.points.size; }
  /** The value recorded at x (undefined if there is none). */
  get(x: number): number | undefined { return this.points.get(x); }

  /**
   * Records the measurement for setting x once `ready` (the run for it is done), if x has none yet. `measure` may
   * return null: nothing to record.
   */
  capture(x: number, ready: boolean, measure: () => number | null): void {
    if (!ready || this.points.has(x)) return;
    const y = measure();
    if (y !== null) this.points.set(x, y);
  }

  /** The recorded points, sorted by x. */
  list(): [number, number][] { return [...this.points.entries()].sort((a, b) => a[0] - b[0]); }

  /** The x with the largest y (null when nothing is recorded). */
  argmax(): number | null {
    let best: [number, number] | null = null;
    for (const p of this.points) if (!best || p[1] > best[1]) best = p;
    return best ? best[0] : null;
  }

  /**
   * A small SVG chart of the points (y scaled to the largest value), with the current setting marked and optional
   * vertical lines (e.g. a prediction).
   */
  chart(o: { xLabel: string; yLabel: string; xMin: number; xMax: number; current?: number; marks?: { x: number; label: string; color: string }[] }): string {
    const W = 320, H = 150, L = 34, R = 8, T = 10, B = 30;
    const pts = this.list();
    const ymax = Math.max(1e-30, ...pts.map(p => p[1]));
    const X = (x: number) => L + ((x - o.xMin) / (o.xMax - o.xMin || 1)) * (W - L - R);
    const Y = (y: number) => T + (1 - y / ymax) * (H - T - B);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ");
    const dots = pts.map(p => `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="3" fill="#fbbf24"/>`).join("");
    const marks = (o.marks ?? []).map(m => `<line x1="${X(m.x)}" x2="${X(m.x)}" y1="${T}" y2="${H - B}" stroke="${m.color}" stroke-dasharray="4 3"/>` +
      `<text x="${X(m.x) + 3}" y="${T + 10}" font-size="10" fill="${m.color}">${m.label}</text>`).join("");
    const cur = o.current === undefined ? "" : `<line x1="${X(o.current)}" x2="${X(o.current)}" y1="${T}" y2="${H - B}" stroke="currentColor" stroke-opacity="0.35"/>`;
    const ticks = [o.xMin, (o.xMin + o.xMax) / 2, o.xMax].map(x => `<text x="${X(x)}" y="${H - B + 13}" font-size="10" text-anchor="middle" fill="currentColor">${+x.toFixed(1)}</text>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}" class="rec-chart" role="img" aria-label="${o.yLabel} against ${o.xLabel}">
      <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="none" stroke="currentColor" stroke-opacity="0.25"/>
      ${cur}${marks}
      ${pts.length > 1 ? `<path d="${line}" fill="none" stroke="#fbbf24" stroke-width="1.5"/>` : ""}${dots}
      ${ticks}
      <text x="${(L + W - R) / 2}" y="${H - 4}" font-size="11" text-anchor="middle" fill="currentColor">${o.xLabel}</text>
      <text x="10" y="${(T + H - B) / 2}" font-size="11" text-anchor="middle" fill="currentColor" transform="rotate(-90 10 ${(T + H - B) / 2})">${o.yLabel}</text>
      ${pts.length ? "" : `<text x="${(L + W - R) / 2}" y="${(T + H - B) / 2}" font-size="11" text-anchor="middle" fill="currentColor" fill-opacity="0.6">no measurements yet</text>`}
    </svg>`;
  }
}
