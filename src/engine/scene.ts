// Wave Dude 2D web - the per-cell description of a scene (SceneData.vb).
// GPL-3.0-or-later. Scene image rules from WaveSimulator2D by 0x23.
//
// All arrays are row by row from the top (index = y * width + x), like the scene image.

import { c2OfIndex } from "./physics";

export interface Material {
  /** Refractive index (0.9..10). Omitted: leave the index as it is. */
  n?: number;
  /** How strongly the material damps waves, 0 = not at all, 1 = stops them (blue / 255). Omitted: leave it. */
  absorb?: number;
}

export const VACUUM: Material = { n: 1, absorb: 0 };
export const BARRIER: Material = { n: 1, absorb: 1 };
export const glass = (n = 1.5): Material => ({ n });

export class Scene {
  readonly c2: Float32Array;
  /** Refractive index per cell (kept for display and for the experiments). */
  readonly n: Float32Array;
  /** Damping factor without the damping edge: 1 = none, 0 = stops the wave. */
  readonly dBase: Float32Array;
  /** Damping factor that the simulation uses: dBase with the damping edge applied. */
  readonly d: Float32Array;
  /** Green value of the scene image (0 = no source), the image sources. */
  readonly imageLevel: Uint8Array;
  edge = 64;
  edgeOn = true;

  constructor(readonly width: number, readonly height: number, background = 1) {
    const size = width * height;
    this.c2 = new Float32Array(size).fill(c2OfIndex(background));
    this.n = new Float32Array(size).fill(Math.min(10, Math.max(0.9, background)));
    this.dBase = new Float32Array(size).fill(1);
    this.d = new Float32Array(size);
    this.imageLevel = new Uint8Array(size);
    this.applyEdge();
  }

  /**
   * A scene from image pixels (RGBA, row by row from the top): red = refractive index x 100, green > 0 = a source
   * with that frequency level, blue = damping (1 - blue / 255).
   */
  static fromImage(rgba: Uint8ClampedArray, width: number, height: number, useSources = true): Scene {
    const s = new Scene(width, height);
    for (let i = 0; i < width * height; i++) {
      const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
      s.setCell(i, { n: r / 100, absorb: b / 255 });
      if (useSources) s.imageLevel[i] = g;
    }
    s.applyEdge();
    return s;
  }

  /** An independent copy (materials, image sources and edge settings). */
  clone(): Scene {
    const s = new Scene(this.width, this.height);
    s.c2.set(this.c2);
    s.n.set(this.n);
    s.dBase.set(this.dBase);
    s.d.set(this.d);
    s.imageLevel.set(this.imageLevel);
    s.edge = this.edge;
    s.edgeOn = this.edgeOn;
    return s;
  }

  setCell(i: number, m: Material): void {
    if (m.n !== undefined) {
      const n = Math.min(10, Math.max(0.9, m.n));
      this.n[i] = n;
      this.c2[i] = 1 / (n * n);
    }
    if (m.absorb !== undefined) this.dBase[i] = 1 - Math.min(1, Math.max(0, m.absorb));
  }

  /** The damping edge of SceneData.ApplyBorder: the ring i cells from the edge gets the factor sqrt(i / thickness). */
  applyEdge(): void {
    const { width: w, height: h, d } = this;
    d.set(this.dBase);
    if (!this.edgeOn) return;
    const t = Math.min(this.edge, Math.floor(Math.min(w, h) / 2));
    for (let i = 0; i < t; i++) {
      const v = Math.sqrt(i / t);
      for (let x = i; x < w - i; x++) {
        d[i * w + x] = Math.min(d[i * w + x], v);
        d[(h - 1 - i) * w + x] = Math.min(d[(h - 1 - i) * w + x], v);
      }
      for (let y = i; y < h - i; y++) {
        d[y * w + i] = Math.min(d[y * w + i], v);
        d[y * w + w - 1 - i] = Math.min(d[y * w + w - 1 - i], v);
      }
    }
  }

  /** Refreshes d for one rectangle after dBase changed there (edge included). */
  applyEdgeRect(x0: number, y0: number, x1: number, y1: number): void {
    const { width: w, height: h } = this;
    const t = this.edgeOn ? Math.min(this.edge, Math.floor(Math.min(w, h) / 2)) : 0;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = y * w + x;
        const ring = Math.min(x, y, w - 1 - x, h - 1 - y);
        this.d[i] = ring < t ? Math.min(this.dBase[i], Math.sqrt(ring / t)) : this.dBase[i];
      }
  }

  maxC2(): number {
    let m = 0;
    for (let i = 0; i < this.c2.length; i++) if (this.c2[i] > m) m = this.c2[i];
    return m;
  }

  // ------------------------------------------------------------ drawing (used by the experiments and the sandbox)

  rect(x: number, y: number, w: number, h: number, m: Material): void {
    const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.width, Math.round(x + w)), y1 = Math.min(this.height, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) this.setCell(yy * this.width + xx, m);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, m: Material): void {
    this.fill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, m);
  }

  disc(cx: number, cy: number, r: number, m: Material): void {
    this.ellipse(cx, cy, r, r, m);
  }

  /** A filled polygon (even-odd rule), points as [x, y] cell coordinates. */
  polygon(points: [number, number][], m: Material): void {
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    this.fill(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y) => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }, m);
  }

  /** A thick line segment from (x0, y0) to (x1, y1). */
  segment(x0: number, y0: number, x1: number, y1: number, thickness: number, m: Material): void {
    const r = thickness / 2, dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1;
    this.fill(Math.min(x0, x1) - r, Math.min(y0, y1) - r, Math.max(x0, x1) + r, Math.max(y0, y1) + r, (x, y) => {
      const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / len2));
      return (x - x0 - t * dx) ** 2 + (y - y0 - t * dy) ** 2 <= r * r;
    }, m);
  }

  /** Sets every cell whose centre passes the test inside the bounding box. */
  fill(bx0: number, by0: number, bx1: number, by1: number, inside: (x: number, y: number) => boolean, m: Material): void {
    const x0 = Math.max(0, Math.floor(bx0)), y0 = Math.max(0, Math.floor(by0));
    const x1 = Math.min(this.width - 1, Math.ceil(bx1)), y1 = Math.min(this.height - 1, Math.ceil(by1));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) if (inside(x + 0.5, y + 0.5)) this.setCell(y * this.width + x, m);
  }
}
