// Wave Dude 2D web - what the placing and painting tools do on the picture: sources, lasers, line sources, optical
// elements, probes, freehand paint, and walls, glass and absorbers drawn as straight lines and boxes (shape objects).
// GPL-3.0-or-later.

import type { Sim, ProbeSpec } from "./sim";
import type { Pt, Tool } from "../view/viewport";
import { BARRIER, VACUUM, type Material } from "../core/scene";
import { type SourceSpec, newSource } from "../core/sources";
import { newOptic } from "../core/optics";
import { type Stamp, paintStamp, stampBounds, stampDepth, snapAngle } from "../core/paint";
import { type ShapeSpec, type ShapeMaterial, newShape, setShapeEnds } from "../core/shapes";
import { isLogicTool, logicTool } from "../circuits/editor";

/** The tools that paint material. */
export type PaintTool = "glass" | "barrier" | "absorber" | "erase";
export const isPaintTool = (t: Tool): t is PaintTool => t === "glass" || t === "barrier" || t === "absorber" || t === "erase";

const clampInt = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export class ToolActions {
  /** Things being placed, drawn by the overlay until the mouse is let go. */
  lineDraft: SourceSpec | null = null;
  laserDraft: SourceSpec | null = null;
  probeDraft: ProbeSpec | null = null;
  /** A straight line or box being dragged out with a paint tool. */
  shapeDraft: { a: Pt; b: Pt; erase: boolean } | null = null;
  private lastPaint: Pt | null = null;

  constructor(private sim: Sim) {}

  /** Cancels whatever is being placed (Esc). True if there was something. */
  cancel(): boolean {
    const had = !!(this.lineDraft || this.laserDraft || this.probeDraft || this.shapeDraft);
    this.lineDraft = this.laserDraft = this.probeDraft = null;
    this.shapeDraft = null;
    this.lastPaint = null;
    return had;
  }

  act(tool: Tool, phase: "down" | "move" | "up", cell: Pt, start: Pt): void {
    const sim = this.sim, x = Math.floor(cell.x), y = Math.floor(cell.y);
    const inside = x >= 0 && y >= 0 && x < sim.scene.width && y < sim.scene.height;
    // every press of a tool is one undo step
    if (phase === "down") sim.undo.begin(TOOL_STEP[tool] ?? "Edit");
    try {
      this.run(tool, phase, cell, start, x, y, inside);
    } finally {
      if (phase === "up" || (phase === "down" && CLICK_TOOLS.has(tool))) sim.undo.commit();
    }
  }

  private run(tool: Tool, phase: "down" | "move" | "up", cell: Pt, start: Pt, x: number, y: number, inside: boolean): void {
    const sim = this.sim;
    if (isLogicTool(tool)) return logicTool(sim, tool, phase, cell, start);
    switch (tool) {
      case "glass": return this.stroke(phase, cell, { n: sim.glassIndex }, "glass");
      case "barrier": return this.stroke(phase, cell, BARRIER, "wall");
      case "absorber": return this.stroke(phase, cell, "absorber", "absorber");
      case "erase": return this.stroke(phase, cell, VACUUM, null);
      case "source":
        if (phase === "down" && inside) {
          const s = newSource({ ...this.template(), x, y, kind: sim.sourceTemplate.countX * sim.sourceTemplate.countY > 1 ? "array" : "point" });
          s.name = `Source ${s.id}`;
          sim.sources.push(s);
          sim.refreshSources();
          sim.select({ kind: "source", id: s.id });
        }
        return;
      case "line":
        if (phase === "down") this.lineDraft = newSource({ ...this.template(), kind: "line", x: Math.floor(start.x), y: Math.floor(start.y), x2: x, y2: y });
        else if (this.lineDraft) { this.lineDraft.x2 = x; this.lineDraft.y2 = y; }
        if (phase === "up" && this.lineDraft) {
          const s = this.lineDraft;
          this.lineDraft = null;
          if (Math.hypot(s.x2 - s.x, s.y2 - s.y) < 2) return;
          s.name = `Line ${s.id}`;
          sim.sources.push(s);
          sim.refreshSources();
          sim.select({ kind: "source", id: s.id });
        }
        return;
      case "optic":
        if (phase === "down" && inside) {
          const { id: _id, name: _name, ...tpl } = sim.opticTemplate;
          sim.addOptic(newOptic(tpl.kind, { ...tpl, x, y }));
        }
        return;
      case "laser":
        if (phase === "down") {
          if (!inside) return;
          this.laserDraft = newSource({ ...this.template(), kind: "laser", x, y, x2: x, y2: y, angleDeg: sim.sourceTemplate.angleDeg, beamWidth: sim.sourceTemplate.beamWidth });
        } else if (this.laserDraft && Math.hypot(cell.x - start.x, cell.y - start.y) > 4) {
          // drag to aim
          this.laserDraft.angleDeg = Math.round((Math.atan2(cell.y - start.y, cell.x - start.x) * 180) / Math.PI);
        }
        if (phase === "up" && this.laserDraft) {
          const l = this.laserDraft;
          this.laserDraft = null;
          l.name = `Laser ${l.id}`;
          sim.sources.push(l);
          sim.refreshSources();
          sim.select({ kind: "source", id: l.id });
        }
        return;
      case "pointProbe":
        if (phase === "down" && inside) {
          const id = sim.addProbe({ kind: "point", x, y, x2: x, y2: y, measurement: sim.viewMode === "field" ? "amplitude" : "intensity", mine: sim.keepMine || undefined });
          sim.select({ kind: "probe", id });
        }
        return;
      case "lineProbe":
        if (phase === "down") this.probeDraft = { id: 0, kind: "line", x: Math.floor(start.x), y: Math.floor(start.y), x2: x, y2: y, measurement: "intensity", color: "#fff", label: "" };
        else if (this.probeDraft) { this.probeDraft.x2 = clampInt(x, 0, sim.scene.width - 1); this.probeDraft.y2 = clampInt(y, 0, sim.scene.height - 1); }
        if (phase === "up" && this.probeDraft) {
          const p = this.probeDraft;
          this.probeDraft = null;
          if (Math.hypot(p.x2 - p.x, p.y2 - p.y) >= 2) {
            const id = sim.addProbe({ kind: "line", x: p.x, y: p.y, x2: p.x2, y2: p.y2, measurement: "intensity", mine: sim.keepMine || undefined });
            sim.select({ kind: "probe", id });
          }
        }
        return;
    }
  }

  /** The source template without its id and name, for making a new source from it. */
  private template(): Partial<SourceSpec> {
    const { id: _id, name: _name, ...rest } = this.sim.sourceTemplate;
    // its own copy of the motion, so the new source and the template do not share one
    return { ...rest, motion: rest.motion ? { ...rest.motion } : null };
  }

  // ------------------------------------------------------------------------------------------ painting

  /**
   * Paint tools. Freehand: dabs close enough together along the pointer path that there are no gaps. Line and box:
   * a wall, glass or absorber object (selectable, movable) — or, for the eraser, a straight or boxed stroke.
   */
  private stroke(phase: "down" | "move" | "up", cell: Pt, m: Material | "absorber", material: ShapeMaterial | null): void {
    const sim = this.sim, erase = material === null;
    if (sim.paintShape !== "free") return this.shapeStroke(phase, cell, m, material);
    if (phase === "up") { this.lastPaint = null; return; }
    const from = phase === "down" || !this.lastPaint ? cell : this.lastPaint;
    const dist = Math.hypot(cell.x - from.x, cell.y - from.y);
    const n = Math.max(1, Math.ceil(dist / Math.max(0.5, sim.brush * 0.5)));
    for (let k = phase === "down" ? 0 : 1; k <= n; k++) {
      const p = { x: from.x + ((cell.x - from.x) * k) / n, y: from.y + ((cell.y - from.y) * k) / n };
      this.applyStamp({ kind: "disc", x: Math.floor(p.x) + 0.5, y: Math.floor(p.y) + 0.5, r: sim.brush }, m, erase);
    }
    this.lastPaint = cell;
  }

  private shapeStroke(phase: "down" | "move" | "up", cell: Pt, m: Material | "absorber", material: ShapeMaterial | null): void {
    const sim = this.sim, p = { x: Math.floor(cell.x) + 0.5, y: Math.floor(cell.y) + 0.5 };
    if (phase === "down") { this.shapeDraft = { a: p, b: p, erase: material === null }; return; }
    const d = this.shapeDraft;
    if (!d) return;
    d.b = sim.paintShape === "line" ? snapAngle(d.a, p) : p;
    if (phase !== "up") return;
    this.shapeDraft = null;
    if (material === null) {
      const st = this.draftStamp(d);
      if (st) this.applyStamp(st, m, true);
      return;
    }
    const s = this.draftShape(d, material);
    if (s) sim.addShape(s);
  }

  /** The stamp the eraser lays down for a line or box being dragged. */
  draftStamp(d = this.shapeDraft): Stamp | null {
    if (!d) return null;
    const { a, b } = d, r = this.sim.brush, shape = this.sim.paintShape;
    if (shape === "line") return { kind: "segment", x0: a.x, y0: a.y, x1: b.x, y1: b.y, r };
    if (Math.abs(b.x - a.x) < 1 || Math.abs(b.y - a.y) < 1) return null;
    return shape === "box" ? { kind: "box", x0: a.x, y0: a.y, x1: b.x, y1: b.y, r } : { kind: "filledBox", x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  }

  /** The shape object a line or box being dragged with a material tool becomes. */
  draftShape(d = this.shapeDraft, material: ShapeMaterial | null = materialOfTool(this.sim.view.tool)): ShapeSpec | null {
    const sim = this.sim;
    if (!d || !material) return null;
    const { a, b } = d, t = 2 * sim.brush, over = { material, n: sim.glassIndex, thickness: t };
    if (sim.paintShape === "line") {
      if (Math.hypot(b.x - a.x, b.y - a.y) < 2) return null;
      const s = newShape("line", over);
      setShapeEnds(s, a, b);
      return s;
    }
    if (Math.abs(b.x - a.x) < 2 || Math.abs(b.y - a.y) < 2) return null;
    return newShape("box", { ...over, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, length: Math.abs(b.x - a.x), width: Math.abs(b.y - a.y), filled: sim.paintShape === "filledBox" });
  }

  /** Paints into the base layer, redraws (objects stay on top); the eraser also takes sources away. */
  private applyStamp(st: Stamp, m: Material | "absorber", erase: boolean): void {
    const sim = this.sim, b = stampBounds(st);
    sim.undo.beforePaint(b.x0 - 1, b.y0 - 1, b.x1 + 1, b.y1 + 1);
    paintStamp(sim.baseScene, st, m);
    sim.rasterize(b.x0 - 1, b.y0 - 1, b.x1 + 1, b.y1 + 1);
    if (!erase) return;
    const s = sim.scene, W = s.width;
    let removed = false;
    for (let y = Math.max(0, Math.floor(b.y0)); y <= Math.min(s.height - 1, Math.ceil(b.y1)); y++)
      for (let x = Math.max(0, Math.floor(b.x0)); x <= Math.min(W - 1, Math.ceil(b.x1)); x++)
        if (s.imageLevel[y * W + x] && stampDepth(st, x + 0.5, y + 0.5).depth >= 0) { s.imageLevel[y * W + x] = 0; removed = true; }
    const gone = sim.sources.filter(src => src.kind !== "line" && !sim.logic?.ownerOf(src) && stampDepth(st, src.x + 0.5, src.y + 0.5).depth >= 0);
    if (gone.length) sim.removeSources(gone);
    else if (removed) { sim.refreshSources(); sim.notify(); }
  }
}

/** The material a paint tool's lines and boxes are made of. */
export function materialOfTool(t: Tool): ShapeMaterial | null {
  return t === "barrier" ? "wall" : t === "glass" ? "glass" : t === "absorber" ? "absorber" : null;
}

/** Tools that act on a single click (their undo step ends right away). */
const CLICK_TOOLS = new Set<Tool>(["source", "optic", "pointProbe", "bit", "detector", "transistor"]);

const TOOL_STEP: Partial<Record<Tool, string>> = {
  source: "Add source", line: "Add line source", laser: "Add laser", optic: "Add element", pointProbe: "Add probe", lineProbe: "Add line probe",
  glass: "Paint glass", barrier: "Paint wall", absorber: "Paint absorber", erase: "Erase",
  guide: "Draw light guide", bit: "Input", detector: "Detector", transistor: "Transistor",
};
