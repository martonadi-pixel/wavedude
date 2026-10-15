// Wave Dude 2D web - a small line chart for the probes (ProbeGraphPainter.vb, simplified).
// GPL-3.0-or-later.

export interface Series { values: ArrayLike<number>; color: string; label: string }

export interface GraphOptions {
  title: string;
  xLabel: string;
  /** x value of the first sample and per sample (e.g. the step number). */
  x0?: number;
  dx?: number;
  /** Fixed y range; otherwise automatic and symmetric around 0 when the data has both signs. */
  yRange?: [number, number];
  /** Vertical marker lines at these x values. */
  markers?: { x: number; color: string; label?: string }[];
}

export class Graph {
  readonly el: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(height = 150) {
    this.el = document.createElement("canvas");
    this.el.className = "graph";
    this.el.style.height = `${height}px`;
    this.ctx = this.el.getContext("2d")!;
  }

  draw(series: Series[], o: GraphOptions): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = this.el.clientWidth, H = this.el.clientHeight;
    if (W === 0 || H === 0) return;
    if (this.el.width !== Math.round(W * dpr)) this.el.width = Math.round(W * dpr);
    if (this.el.height !== Math.round(H * dpr)) this.el.height = Math.round(H * dpr);
    const c = this.ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(this.el);
    const fg = css.getPropertyValue("--fg").trim() || "#ddd";
    const muted = css.getPropertyValue("--muted").trim() || "#888";
    const grid = css.getPropertyValue("--line").trim() || "#333";
    c.clearRect(0, 0, W, H);

    const L = 44, R = 8, T = 20, B = 22;
    const pw = W - L - R, ph = H - T - B;
    let n = 0, lo = Infinity, hi = -Infinity;
    for (const s of series) {
      n = Math.max(n, s.values.length);
      for (let i = 0; i < s.values.length; i++) {
        const v = s.values[i];
        if (Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; }
      }
    }
    if (o.yRange) [lo, hi] = o.yRange;
    else if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
    else if (lo < 0 && hi > 0) { const m = Math.max(-lo, hi) * 1.1 || 1; lo = -m; hi = m; }
    else if (lo >= 0) { lo = 0; hi = hi * 1.1 || 1; }
    else { hi = 0; lo = lo * 1.1 || -1; }

    const x0 = o.x0 ?? 0, dx = o.dx ?? 1;
    const xs = (i: number) => L + (n > 1 ? (i / (n - 1)) * pw : 0);
    const ys = (v: number) => T + (1 - (v - lo) / (hi - lo)) * ph;

    c.font = "11px system-ui, sans-serif";
    c.fillStyle = fg;
    c.fillText(o.title, L, 13);
    c.strokeStyle = grid; c.lineWidth = 1;
    c.strokeRect(L + 0.5, T + 0.5, pw, ph);
    c.fillStyle = muted;
    c.textAlign = "right";
    for (const v of [lo, (lo + hi) / 2, hi]) c.fillText(fmt(v), L - 4, ys(v) + 4);
    if (lo < 0 && hi > 0) { c.beginPath(); c.moveTo(L, ys(0) + 0.5); c.lineTo(L + pw, ys(0) + 0.5); c.stroke(); }
    c.textAlign = "left";
    if (n > 1) {
      c.fillText(fmt(x0), L, H - 6);
      c.textAlign = "right";
      c.fillText(`${fmt(x0 + (n - 1) * dx)}  ${o.xLabel}`, L + pw, H - 6);
      c.textAlign = "left";
    }
    // labels that would run into the one before go a row lower
    const rowEnds: number[] = [];
    for (const m of [...(o.markers ?? [])].sort((a, b) => a.x - b.x)) {
      const i = (m.x - x0) / dx;
      if (i < 0 || i > n - 1) continue;
      c.strokeStyle = m.color; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(xs(i), T); c.lineTo(xs(i), T + ph); c.stroke(); c.setLineDash([]);
      if (m.label) {
        const lx = xs(i) + 3, w = c.measureText(m.label).width;
        let row = rowEnds.findIndex(end => lx > end + 2);
        if (row < 0) row = rowEnds.length;
        rowEnds[row] = lx + w;
        c.fillStyle = m.color; c.fillText(m.label, lx, T + 11 + 12 * row);
      }
    }
    c.save();
    c.beginPath(); c.rect(L, T, pw, ph); c.clip();
    for (const s of series) {
      c.strokeStyle = s.color; c.lineWidth = 1.5;
      c.beginPath();
      // gaps (NaN) lift the pen: a probe placed later has no values before it existed
      let pen = false;
      for (let i = 0; i < s.values.length; i++) {
        const v = s.values[i];
        if (!Number.isFinite(v)) { pen = false; continue; }
        const y = ys(v);
        if (pen) c.lineTo(xs(i), y); else { c.moveTo(xs(i), y); pen = true; }
      }
      c.stroke();
    }
    c.restore();
    let lx = L + pw;
    c.textAlign = "right";
    for (const s of [...series].reverse()) {
      c.fillStyle = s.color;
      c.fillText(s.label, lx, 13);
      lx -= c.measureText(s.label).width + 12;
    }
    c.textAlign = "left";
  }
}

function fmt(v: number): string {
  const a = Math.abs(v);
  if (a === 0) return "0";
  if (a >= 1000 || a < 0.01) return v.toExponential(1);
  return v.toFixed(a >= 10 ? 0 : 2);
}
