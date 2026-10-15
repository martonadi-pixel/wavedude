// Wave Dude 2D web - the simulation view: zoom and pan, the overlay (sources, probes, ruler, protractor, labels),
// and turning pointer input into tool actions in cell coordinates.
// GPL-3.0-or-later.

import { type WaveEngine, type DisplayOptions } from "../engine/engine";
import { levelColor } from "../core/physics";
import { lookAt, multiply, perspective, type Vec3 } from "./mat4";

export type Tool =
  | "pan" | "ruler" | "protractor"
  | "source" | "line" | "glass" | "barrier" | "absorber" | "erase"
  | "pointProbe" | "lineProbe" | "optic" | "laser"
  | "guide" | "bit" | "detector" | "transistor";

export interface Pt { x: number; y: number }

/** Things drawn on top of the simulation, all in cell coordinates. */
export interface Overlay {
  /** color: the source's own colour (else the colour of its frequency). */
  sources: { x: number; y: number; level: number; label?: string; x2?: number; y2?: number; selected?: boolean; color?: string }[];
  pointProbes: { x: number; y: number; color: string; label: string }[];
  lineProbes: { x0: number; y0: number; x1: number; y1: number; color: string; label: string }[];
  /** mark: a symbol drawn centred exactly on (x, y), with the text beside it (else the text starts at x, y). */
  labels: { x: number; y: number; text: string; color?: string; mark?: string }[];
  arrows: { x0: number; y0: number; x1: number; y1: number; color?: string; dashed?: boolean }[];
  /** Outlined rectangles of cells (the detectors of a wave circuit). */
  boxes: { x: number; y: number; w: number; h: number; color: string }[];
  /** Shapes being drawn: a polyline (closed: a polygon), with a see-through band `width` cells wide, or filled. */
  paths: { pts: Pt[]; closed?: boolean; width?: number; fill?: boolean; color: string }[];
}

export const emptyOverlay = (): Overlay => ({ sources: [], pointProbes: [], lineProbes: [], labels: [], arrows: [], boxes: [], paths: [] });

export interface Measure {
  ruler: { a: Pt; b: Pt } | null;
  /** Vertex and the two arm end points. */
  protractor: { v: Pt; a: Pt; b: Pt } | null;
}

export class Viewport {
  readonly canvas: HTMLCanvasElement;
  readonly overlayCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  /** Cell at the top-left corner, and cells per CSS pixel. */
  offX = 0;
  offY = 0;
  scale = 1;
  dpr = 1;
  tool: Tool = "pan";
  overlay: Overlay = emptyOverlay();
  /** 3D view: the mouse turns the camera instead of using the tools. */
  mode3d = false;
  /** Orbit camera around the point (tx, 0, tz): angles in radians, distance in units of half the longest side. */
  cam = { yaw: -0.55, pitch: 0.62, dist: 2.25, tx: 0, tz: 0.05 };
  measure: Measure = { ruler: null, protractor: null };
  /** Called for paint/place tools: phase "down" | "move" | "up", with the cell under the pointer. */
  onTool: (tool: Tool, phase: "down" | "move" | "up", cell: Pt, start: Pt) => void = () => {};
  onMeasure: () => void = () => {};
  /** Something movable (a source, a probe) under this cell? Then the Pan tool drags it instead of the view. */
  canGrab: (cell: Pt) => boolean = () => false;
  onGrab: (phase: "down" | "move" | "up", cell: Pt, start: Pt) => void = () => {};
  onHover: (cell: Pt | null) => void = () => {};
  private pointers = new Map<number, Pt>();
  private drag: { mode: "pan" | "tool" | "pinch" | "grab"; start: Pt; startCell: Pt; offX: number; offY: number; dist?: number; scale?: number; mid?: Pt } | null = null;
  private protractorStage = 0;
  private userMoved = false;

  constructor(private host: HTMLElement, private engine: WaveEngine) {
    this.canvas = engine.canvas;
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.className = "overlay";
    host.append(this.overlayCanvas);
    this.ctx = this.overlayCanvas.getContext("2d")!;
    new ResizeObserver(() => this.resize()).observe(host);
    this.overlayCanvas.addEventListener("pointerdown", e => this.down(e));
    this.overlayCanvas.addEventListener("pointermove", e => this.move(e));
    this.overlayCanvas.addEventListener("pointerup", e => this.up(e));
    this.overlayCanvas.addEventListener("pointercancel", e => this.up(e));
    this.overlayCanvas.addEventListener("pointerleave", () => this.onHover(null));
    this.overlayCanvas.addEventListener("wheel", e => this.wheel(e), { passive: false });
    this.overlayCanvas.addEventListener("contextmenu", e => e.preventDefault());
    this.resize();
  }

  get cssW(): number { return this.host.clientWidth; }
  get cssH(): number { return this.host.clientHeight; }

  resize(): void {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const c of [this.canvas, this.overlayCanvas]) {
      c.width = Math.max(1, Math.round(this.cssW * this.dpr));
      c.height = Math.max(1, Math.round(this.cssH * this.dpr));
    }
    if (!this.userMoved) this.fit();
  }

  /** Shows the whole scene, centred (in 3D: the camera's starting position). */
  fit(): void {
    if (this.mode3d) { this.cam = { yaw: -0.55, pitch: 0.62, dist: 2.25, tx: 0, tz: 0.05 }; return; }
    const w = this.engine.width || 1, h = this.engine.height || 1;
    const pad = 0.98;
    this.scale = Math.max(w / (this.cssW * pad), h / (this.cssH * pad));
    this.offX = w / 2 - (this.cssW / 2) * this.scale;
    this.offY = h / 2 - (this.cssH / 2) * this.scale;
    this.userMoved = false;
  }

  /**
   * Shows this rectangle of cells as large as possible (2D), never showing anything outside the scene: when the view's
   * shape does not match, it shows the part of the scene around the rectangle, starting from its left edge.
   */
  zoomTo(x0: number, y0: number, x1: number, y1: number): void {
    const W = this.engine.width || x1, H = this.engine.height || y1;
    let scale = Math.max((x1 - x0) / (this.cssW * 0.98), (y1 - y0) / (this.cssH * 0.98));
    scale = Math.min(scale, W / this.cssW, H / this.cssH);
    const vw = this.cssW * scale, vh = this.cssH * scale;
    const ox = vw >= x1 - x0 ? (x0 + x1) / 2 - vw / 2 : x0 - 0.02 * vw;
    const oy = vh >= y1 - y0 ? (y0 + y1) / 2 - vh / 2 : y0;
    this.scale = scale;
    this.offX = Math.min(Math.max(0, ox), Math.max(0, W - vw));
    this.offY = Math.min(Math.max(0, oy), Math.max(0, H - vh));
    this.userMoved = true;
  }

  zoomBy(factor: number, cx = this.cssW / 2, cy = this.cssH / 2): void {
    if (this.mode3d) { this.cam.dist = Math.min(12, Math.max(0.15, this.cam.dist / factor)); return; }
    const before = this.toCell(cx, cy);
    const w = this.engine.width || 1, h = this.engine.height || 1;
    const maxScale = Math.max(w / this.cssW, h / this.cssH) * 4;
    this.scale = Math.min(maxScale, Math.max(1 / 64, this.scale / factor));
    this.offX = before.x - cx * this.scale;
    this.offY = before.y - cy * this.scale;
    this.userMoved = true;
  }

  toCell(px: number, py: number): Pt {
    return { x: this.offX + px * this.scale, y: this.offY + py * this.scale };
  }

  toScreen(x: number, y: number): Pt {
    return { x: (x - this.offX) / this.scale, y: (y - this.offY) / this.scale };
  }

  /** The camera matrix and position for the 3D view. */
  camera(): { mvp: Float32Array; eye: Vec3 } {
    const c = this.cam;
    const target: Vec3 = [c.tx, 0, c.tz];
    const eye: Vec3 = [
      c.tx + c.dist * Math.cos(c.pitch) * Math.sin(c.yaw),
      c.dist * Math.sin(c.pitch),
      c.tz + c.dist * Math.cos(c.pitch) * Math.cos(c.yaw),
    ];
    const proj = perspective((45 * Math.PI) / 180, this.cssW / Math.max(1, this.cssH), 0.02, 50);
    return { mvp: multiply(proj, lookAt(eye, target, [0, 1, 0])), eye };
  }

  /** Clears the overlay (the 3D view has no overlay; a short hint instead). */
  clearOverlay(hint = ""): void {
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.cssW, this.cssH);
    if (hint) text(c, hint, 10, this.cssH - 12, "#cfd5e2");
  }

  display(base: Omit<DisplayOptions, "offsetX" | "offsetY" | "cellsPerPx">): void {
    this.engine.render({ ...base, offsetX: this.offX, offsetY: this.offY, cellsPerPx: this.scale / this.dpr });
    this.drawOverlay();
  }

  // ------------------------------------------------------------------------------------------ input

  private local(e: PointerEvent | WheelEvent): Pt {
    const r = this.overlayCanvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private down(e: PointerEvent): void {
    this.overlayCanvas.setPointerCapture(e.pointerId);
    const p = this.local(e);
    this.pointers.set(e.pointerId, p);
    if (this.pointers.size === 2) {
      // two fingers: pinch zoom and pan (cancels a tool drag that the first finger started)
      const [a, b] = [...this.pointers.values()];
      this.drag = { mode: "pinch", start: p, startCell: this.toCell(p.x, p.y), offX: this.offX, offY: this.offY,
        dist: Math.hypot(a.x - b.x, a.y - b.y), scale: this.mode3d ? this.cam.dist : this.scale, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
      return;
    }
    if (this.mode3d) {
      // left drag turns the camera, right (or shift) drag moves it
      const pan = e.button === 1 || e.button === 2 || e.shiftKey;
      this.drag = { mode: pan ? "pan" : "tool", start: p, startCell: { x: this.cam.yaw, y: this.cam.pitch }, offX: this.cam.tx, offY: this.cam.tz };
      this.overlayCanvas.style.cursor = "grabbing";
      return;
    }
    const cell = this.toCell(p.x, p.y);
    if (e.button === 0 && !e.shiftKey && (this.tool === "pan" || this.tool === "source" || this.tool === "optic") && this.canGrab(cell)) {
      // pick up the source or probe under the pointer
      this.drag = { mode: "grab", start: p, startCell: cell, offX: this.offX, offY: this.offY };
      this.overlayCanvas.style.cursor = "grabbing";
      this.onGrab("down", cell, cell);
      return;
    }
    const panning = this.tool === "pan" || e.button === 1 || e.button === 2 || e.shiftKey;
    this.drag = { mode: panning ? "pan" : "tool", start: p, startCell: cell, offX: this.offX, offY: this.offY };
    if (panning) { this.overlayCanvas.style.cursor = "grabbing"; return; }
    if (this.tool === "ruler") {
      this.measure.ruler = { a: cell, b: cell };
    } else if (this.tool === "protractor") {
      // first drag draws the first arm from the vertex, the second drag draws the second arm from the same vertex
      if (!this.measure.protractor || this.protractorStage === 0) {
        this.measure.protractor = { v: cell, a: cell, b: cell };
        this.protractorStage = 1;
      } else {
        this.protractorStage = 2;
        this.measure.protractor.b = cell;
      }
    } else {
      this.onTool(this.tool, "down", cell, cell);
    }
  }

  private move(e: PointerEvent): void {
    const p = this.local(e);
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, p);
    const d = this.drag;
    if (this.mode3d) {
      this.onHover(null);
      if (!d) return;
      if (d.mode === "pinch" && this.pointers.size >= 2) {
        const [a, b] = [...this.pointers.values()];
        this.cam.dist = Math.min(12, Math.max(0.15, (d.scale! * d.dist!) / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))));
      } else if (d.mode === "pan") {
        // move the target over the ground, along the screen's directions
        const k = this.cam.dist / Math.max(200, this.cssH);
        const dx = (p.x - d.start.x) * k, dy = (p.y - d.start.y) * k;
        const sy = Math.sin(this.cam.yaw), cy = Math.cos(this.cam.yaw);
        this.cam.tx = d.offX - dx * cy - dy * sy;
        this.cam.tz = d.offY + dx * sy - dy * cy;
      } else if (d.mode === "tool") {
        this.cam.yaw = d.startCell.x - (p.x - d.start.x) * 0.006;
        this.cam.pitch = Math.min(1.55, Math.max(0.05, d.startCell.y + (p.y - d.start.y) * 0.006));
      }
      return;
    }
    const cell = this.toCell(p.x, p.y);
    this.onHover(cell);
    if (!d) {
      if (this.tool === "pan" || this.tool === "source" || this.tool === "optic") this.overlayCanvas.style.cursor = this.canGrab(cell) ? "grab" : "";
      return;
    }
    if (d.mode === "grab") { this.onGrab("move", cell, d.startCell); return; }
    if (d.mode === "pinch" && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const anchor = { x: d.offX + d.mid!.x * d.scale!, y: d.offY + d.mid!.y * d.scale! };
      this.scale = Math.max(1 / 64, (d.scale! * d.dist!) / Math.max(1, dist));
      this.offX = anchor.x - mid.x * this.scale;
      this.offY = anchor.y - mid.y * this.scale;
      this.userMoved = true;
    } else if (d.mode === "pan") {
      this.offX = d.offX - (p.x - d.start.x) * this.scale;
      this.offY = d.offY - (p.y - d.start.y) * this.scale;
      this.userMoved = true;
    } else if (this.tool === "ruler" && this.measure.ruler) {
      this.measure.ruler.b = snap(this.measure.ruler.a, cell, e.ctrlKey);
      this.onMeasure();
    } else if (this.tool === "protractor" && this.measure.protractor) {
      const pr = this.measure.protractor;
      if (this.protractorStage === 1) pr.a = snap(pr.v, cell, e.ctrlKey);
      else pr.b = snap(pr.v, cell, e.ctrlKey);
      this.onMeasure();
    } else {
      this.onTool(this.tool, "move", cell, d.startCell);
    }
  }

  private up(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
    const d = this.drag;
    if (this.pointers.size > 0) return;
    this.drag = null;
    this.overlayCanvas.style.cursor = "";
    const cell = this.toCell(this.local(e).x, this.local(e).y);
    if (d?.mode === "grab") { this.onGrab("up", cell, d.startCell); return; }
    if (!d || d.mode !== "tool" || this.mode3d) return;
    if (this.tool === "protractor") {
      if (this.protractorStage === 2) this.protractorStage = 0;
      this.onMeasure();
    } else if (this.tool === "ruler") {
      this.onMeasure();
    } else {
      this.onTool(this.tool, "up", cell, d.startCell);
    }
  }

  private wheel(e: WheelEvent): void {
    e.preventDefault();
    const p = this.local(e);
    const lines = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
    this.zoomBy(Math.exp(-lines * 0.0015), p.x, p.y);
  }

  // ------------------------------------------------------------------------------------------ overlay

  private drawOverlay(): void {
    const c = this.ctx, o = this.overlay;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.cssW, this.cssH);
    c.lineCap = "round";
    const S = (x: number, y: number) => this.toScreen(x, y);
    const cellPx = 1 / this.scale;

    // cell grid when zoomed in far
    if (cellPx >= 14) {
      c.strokeStyle = "rgba(255,255,255,0.08)";
      c.lineWidth = 1;
      c.beginPath();
      const x0 = Math.max(0, Math.floor(this.offX)), y0 = Math.max(0, Math.floor(this.offY));
      const x1 = Math.min(this.engine.width, Math.ceil(this.offX + this.cssW * this.scale));
      const y1 = Math.min(this.engine.height, Math.ceil(this.offY + this.cssH * this.scale));
      for (let x = x0; x <= x1; x++) { const s = S(x, 0).x; c.moveTo(s, S(0, y0).y); c.lineTo(s, S(0, y1).y); }
      for (let y = y0; y <= y1; y++) { const s = S(0, y).y; c.moveTo(S(x0, 0).x, s); c.lineTo(S(x1, 0).x, s); }
      c.stroke();
    }

    for (const a of o.arrows) arrow(c, S(a.x0, a.y0), S(a.x1, a.y1), a.color ?? "#fff", a.dashed);
    for (const p of o.paths) {
      if (p.pts.length < 2) continue;
      const pts = p.pts.map(q => S(q.x, q.y));
      c.beginPath();
      c.moveTo(pts[0].x, pts[0].y);
      for (const q of pts.slice(1)) c.lineTo(q.x, q.y);
      if (p.closed) c.closePath();
      c.setLineDash([]);
      c.lineJoin = "round";
      if (p.fill) { c.globalAlpha = 0.35; c.fillStyle = p.color; c.fill(); c.globalAlpha = 1; }
      if (p.width) { c.globalAlpha = 0.35; c.strokeStyle = p.color; c.lineWidth = Math.max(2, p.width * cellPx); c.stroke(); c.globalAlpha = 1; }
      c.strokeStyle = p.color; c.lineWidth = 1.5; c.setLineDash([6, 4]); c.stroke(); c.setLineDash([]);
    }
    for (const b of o.boxes) {
      const p = S(b.x, b.y), q = S(b.x + b.w, b.y + b.h);
      c.setLineDash([]); c.lineWidth = 2;
      c.strokeStyle = "rgba(0,0,0,0.6)"; c.strokeRect(p.x - 1.5, p.y - 1.5, q.x - p.x + 3, q.y - p.y + 3);
      c.strokeStyle = b.color; c.strokeRect(p.x, p.y, q.x - p.x, q.y - p.y);
    }

    // sources: a ring in their own colour (or that of their frequency: low = red ... high = violet)
    for (const s of o.sources) {
      const col = s.color ?? levelColor(s.level);
      if (s.x2 !== undefined && s.y2 !== undefined) {
        const a = S(s.x + 0.5, s.y + 0.5), b = S(s.x2 + 0.5, s.y2 + 0.5);
        c.strokeStyle = col; c.lineWidth = s.selected ? 4 : 2.5; c.setLineDash([]);
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      }
      const p = S(s.x + 0.5, s.y + 0.5);
      const r = Math.max(5, cellPx * 0.8);
      c.lineWidth = s.selected ? 3 : 2;
      c.strokeStyle = "rgba(0,0,0,0.6)"; c.beginPath(); c.arc(p.x, p.y, r + 1.5, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = col; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.stroke();
      if (s.label) text(c, s.label, p.x + r + 4, p.y - r - 2, col);
    }

    for (const l of o.lineProbes) {
      const a = S(l.x0 + 0.5, l.y0 + 0.5), b = S(l.x1 + 0.5, l.y1 + 0.5);
      c.strokeStyle = l.color; c.lineWidth = 2; c.setLineDash([6, 4]);
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); c.setLineDash([]);
      for (const p of [a, b]) { c.fillStyle = l.color; c.fillRect(p.x - 3, p.y - 3, 6, 6); }
      text(c, l.label, b.x + 6, b.y, l.color);
    }
    for (const p of o.pointProbes) {
      const s = S(p.x + 0.5, p.y + 0.5);
      c.strokeStyle = p.color; c.lineWidth = 2;
      c.beginPath(); c.moveTo(s.x - 8, s.y); c.lineTo(s.x + 8, s.y); c.moveTo(s.x, s.y - 8); c.lineTo(s.x, s.y + 8); c.stroke();
      c.beginPath(); c.arc(s.x, s.y, 4, 0, Math.PI * 2); c.stroke();
      text(c, p.label, s.x + 8, s.y - 8, p.color);
    }
    for (const l of o.labels) {
      const p = S(l.x, l.y);
      if (l.mark) {
        c.save(); c.textAlign = "center"; c.textBaseline = "middle";
        text(c, l.mark, p.x, p.y, l.color ?? "#fff");
        c.restore();
        if (l.text) text(c, l.text, p.x + 10, p.y + 4, l.color ?? "#fff");
      } else text(c, l.text, p.x, p.y, l.color ?? "#fff");
    }

    const m = this.measure;
    if (m.ruler) {
      const a = S(m.ruler.a.x, m.ruler.a.y), b = S(m.ruler.b.x, m.ruler.b.y);
      c.strokeStyle = "#ffd84a"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      // end ticks
      const ang = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
      for (const p of [a, b]) {
        c.beginPath(); c.moveTo(p.x - Math.cos(ang) * 7, p.y - Math.sin(ang) * 7);
        c.lineTo(p.x + Math.cos(ang) * 7, p.y + Math.sin(ang) * 7); c.stroke();
      }
      const len = Math.hypot(m.ruler.b.x - m.ruler.a.x, m.ruler.b.y - m.ruler.a.y);
      text(c, `${len.toFixed(1)} cells`, (a.x + b.x) / 2 + 8, (a.y + b.y) / 2 - 8, "#ffd84a");
    }
    if (m.protractor) {
      const { v, a, b } = m.protractor;
      const V = S(v.x, v.y), A = S(a.x, a.y), B = S(b.x, b.y);
      c.strokeStyle = "#7df9ff"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(V.x, V.y); c.lineTo(B.x, B.y); c.stroke();
      const deg = angleDeg(m.protractor);
      if (deg !== null) {
        const a1 = Math.atan2(A.y - V.y, A.x - V.x), a2 = Math.atan2(B.y - V.y, B.x - V.x);
        let d = a2 - a1;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        c.beginPath(); c.arc(V.x, V.y, 28, a1, a1 + d, d < 0); c.stroke();
        text(c, `${deg.toFixed(1)}°`, V.x + 32 * Math.cos(a1 + d / 2), V.y + 32 * Math.sin(a1 + d / 2), "#7df9ff");
      }
    }
  }
}

/** The angle between the two protractor arms in degrees (null while an arm has no length). */
export function angleDeg(p: { v: Pt; a: Pt; b: Pt }): number | null {
  const ax = p.a.x - p.v.x, ay = p.a.y - p.v.y, bx = p.b.x - p.v.x, by = p.b.y - p.v.y;
  const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
  if (la < 0.5 || lb < 0.5) return null;
  return (Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)))) * 180) / Math.PI;
}

/** With ctrl held, snaps the direction from a to b to multiples of 15 degrees. */
function snap(a: Pt, b: Pt, on: boolean): Pt {
  if (!on) return b;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ang = Math.round(Math.atan2(b.y - a.y, b.x - a.x) / (Math.PI / 12)) * (Math.PI / 12);
  return { x: a.x + Math.cos(ang) * len, y: a.y + Math.sin(ang) * len };
}

function text(c: CanvasRenderingContext2D, s: string, x: number, y: number, color: string): void {
  c.font = "600 13px system-ui, sans-serif";
  c.lineWidth = 3.5;
  c.strokeStyle = "rgba(0,0,0,0.75)";
  c.strokeText(s, x, y);
  c.fillStyle = color;
  c.fillText(s, x, y);
}

function arrow(c: CanvasRenderingContext2D, a: Pt, b: Pt, color: string, dashed = false): void {
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.5;
  c.setLineDash(dashed ? [8, 6] : []);
  c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  c.setLineDash([]);
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  c.beginPath();
  c.moveTo(b.x, b.y);
  c.lineTo(b.x - 12 * Math.cos(ang - 0.4), b.y - 12 * Math.sin(ang - 0.4));
  c.lineTo(b.x - 12 * Math.cos(ang + 0.4), b.y - 12 * Math.sin(ang + 0.4));
  c.closePath(); c.fill();
}
