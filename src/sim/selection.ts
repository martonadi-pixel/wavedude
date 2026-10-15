// Wave Dude 2D web - picking things on the picture: what lies under the pointer, selecting it, dragging it (or one of
// its handles), and deleting, copying and nudging the selected object.
// GPL-3.0-or-later.

import type { Sim, ProbeSpec } from "./sim";
import type { Pt, Tool } from "../view/viewport";
import { type SourceSpec, newSource } from "../core/sources";
import { type ShapeSpec, copyShape, setShapeEnds, shapeBounds, shapeEnds, shapeHit } from "../core/shapes";
import { type OpticSpec, newOptic, opticBounds } from "../core/optics";

export type SelKind = "source" | "probe" | "optic" | "shape" | "switch" | "detector" | "transistor";
export interface Selection { kind: SelKind; id: number | string }
/** body: the whole thing; a, b: the ends of a line; aim: a laser's direction; rot: turns it; len, wid, size: resize it. */
export type Handle = "body" | "a" | "b" | "aim" | "rot" | "len" | "wid" | "size";
/** Handles drawn round (they turn the object); the others are squares. */
export const ROUND_HANDLES: ReadonlySet<Handle> = new Set<Handle>(["aim", "rot"]);
interface Hit extends Selection { handle: Handle; src?: SourceSpec }

/** What each placing tool may pick up (the hand tool picks up anything). */
const FAMILY: Partial<Record<Tool, SelKind[]>> = {
  source: ["source", "switch", "transistor"], line: ["source", "switch", "transistor"], laser: ["source", "switch", "transistor"],
  optic: ["optic"], pointProbe: ["probe"], lineProbe: ["probe"], detector: ["detector"],
};

const distToSeg = (p: Pt, a: Pt, b: Pt) => {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(a.x + t * dx - p.x, a.y + t * dy - p.y);
};
const c = (x: number, y: number): Pt => ({ x: x + 0.5, y: y + 0.5 });
const DEG = 180 / Math.PI;
/** An angle from a drag: whole degrees, pulled onto multiples of 15° when within 3° of one. */
export function snapTurn(deg: number): number {
  const d = Math.round(deg), m = Math.round(d / 15) * 15;
  const v = Math.abs(d - m) <= 3 ? m : d;
  return ((v % 360) + 540) % 360 - 180;
}
/** A point at (u, v) in the frame of something at (x, y) turned by angleDeg. */
const frame = (x: number, y: number, angleDeg: number) => {
  const a = angleDeg / DEG, ca = Math.cos(a), sa = Math.sin(a);
  return {
    at: (u: number, v: number): Pt => ({ x: x + u * ca - v * sa, y: y + u * sa + v * ca }),
    local: (p: Pt) => ({ u: (p.x - x) * ca + (p.y - y) * sa, v: -(p.x - x) * sa + (p.y - y) * ca }),
  };
};

export class Selector {
  private drag: { hit: Hit; orig: unknown; moved: boolean; last: Pt; start: Pt } | null = null;

  constructor(private sim: Sim) {}

  private get r(): number { return Math.max(4, 8 * this.sim.view.scale); }
  /** How far a turning handle stands off the object: about 26 screen pixels. */
  private get stand(): number { return Math.max(6, 26 * this.sim.view.scale); }

  /** The selected thing's drag handles, in cells. */
  handles(sel: Selection | null = this.sim.selection): [Handle, Pt][] {
    const sim = this.sim;
    if (!sel) return [];
    if (sel.kind === "source") {
      const s = sim.sources.find(q => q.id === sel.id);
      if (s?.kind === "line") return [["a", c(s.x, s.y)], ["b", c(s.x2, s.y2)]];
      if (s?.kind === "laser") { const a = (s.angleDeg * Math.PI) / 180; return [["aim", { x: s.x + 0.5 + 50 * Math.cos(a), y: s.y + 0.5 + 50 * Math.sin(a) }]]; }
    } else if (sel.kind === "probe") {
      const p = sim.probes.find(q => q.id === sel.id);
      if (p?.kind === "line") return [["a", c(p.x, p.y)], ["b", c(p.x2, p.y2)]];
    } else if (sel.kind === "shape") {
      const s = sim.shapes.find(q => q.id === sel.id);
      if (s && (s.kind === "line" || s.kind === "slits")) { const [a, b] = shapeEnds(s); return [["a", a], ["b", b]]; }
      if (s) {
        // box and ellipse: drag the right side for length, the bottom for width, the knob above to turn
        const f = frame(s.x, s.y, s.angleDeg), L = s.length / 2, W = s.width / 2;
        return [["len", f.at(L, 0)], ["wid", f.at(0, W)], ["rot", f.at(0, -W - this.stand)]];
      }
    } else if (sel.kind === "optic") {
      const o = sim.optics.find(q => q.id === sel.id);
      if (o) {
        // the aperture runs across the optical axis: the bottom end resizes it, the knob beyond the top turns it
        const f = frame(o.x, o.y, o.angleDeg), H = o.size / 2;
        return [["size", f.at(0, H)], ["rot", f.at(0, -H - this.stand)]];
      }
    } else if (sel.kind === "detector") {
      const d = sim.logic?.detectors.find(q => q.id === sel.id);
      if (d?.areas.length === 1) { const a = d.areas[0]; return [["size", { x: a.x + a.w, y: a.y + a.h }]]; }
    }
    return [];
  }

  /** What the active tool may pick up at this cell: a handle of the selected thing first, then the thing on top. */
  hit(cell: Pt, tool: Tool = this.sim.view.tool): Hit | null {
    const sim = this.sim, r = this.r, family = tool === "pan" ? null : FAMILY[tool];
    if (tool !== "pan" && !family) return null;
    const can = (k: SelKind) => !family || family.includes(k);
    const sel = sim.selection;
    if (sel && can(sel.kind)) for (const [handle, p] of this.handles(sel)) if (Math.hypot(p.x - cell.x, p.y - cell.y) <= r * 0.8) return { ...sel, handle };
    if (can("probe")) {
      const p = [...sim.probes].reverse().find(q => q.kind === "point" ? Math.hypot(q.x + 0.5 - cell.x, q.y + 0.5 - cell.y) <= r : distToSeg(cell, c(q.x, q.y), c(q.x2, q.y2)) <= r * 0.6);
      if (p) return { kind: "probe", id: p.id, handle: "body" };
    }
    for (const s of [...sim.sources].reverse()) {
      const p = sim.sourcePos(s);
      const near = s.kind === "line" ? distToSeg(cell, c(s.x, s.y), c(s.x2, s.y2)) <= r * 0.6 : Math.hypot(p.x + 0.5 - cell.x, p.y + 0.5 - cell.y) <= r;
      if (!near) continue;
      const owner = sim.logic?.ownerOf(s);
      if (owner && "input" in owner) { if (can("transistor")) return { kind: "transistor", id: owner.id, handle: "body", src: s }; continue; }
      if (owner) { if (can("switch")) return { kind: "switch", id: owner.id, handle: "body", src: s }; continue; }
      if (can("source")) return { kind: "source", id: s.id, handle: "body" };
    }
    if (can("detector")) { const d = sim.logic?.detectorNear(cell, Math.max(1, 3 * sim.view.scale)); if (d) return { kind: "detector", id: d.id, handle: "body" }; }
    if (can("shape")) { const s = [...sim.shapes].reverse().find(q => shapeHit(q, cell.x, cell.y, Math.max(2, 4 * sim.view.scale))); if (s) return { kind: "shape", id: s.id, handle: "body" }; }
    if (can("optic")) { const o = sim.opticNear(cell); if (o) return { kind: "optic", id: o.id, handle: "body" }; }
    return null;
  }

  // ------------------------------------------------------------------------------------------ dragging

  /** Pointer events of a grab (the viewport sends them when canGrab said yes). */
  grab(phase: "down" | "move" | "up", cell: Pt, start: Pt): void {
    const sim = this.sim;
    if (phase === "down") {
      const hit = this.hit(cell);
      if (!hit) return;
      sim.select({ kind: hit.kind, id: hit.id });
      sim.undo.begin(hit.handle === "body" ? "Move" : hit.handle === "rot" ? "Turn" : hit.handle === "a" || hit.handle === "b" || hit.handle === "aim" ? "Change" : "Resize");
      this.drag = { hit, orig: this.snapshot(hit), moved: false, last: { x: 0, y: 0 }, start };
      return;
    }
    const d = this.drag;
    if (!d) return;
    const dx = Math.round(cell.x - start.x), dy = Math.round(cell.y - start.y);
    if (dx || dy) d.moved = true;
    if (d.moved && (dx !== d.last.x || dy !== d.last.y || phase === "up")) this.apply(d.hit, d.orig, dx, dy, cell, phase === "up");
    d.last = { x: dx, y: dy };
    if (phase !== "up") return;
    this.drag = null;
    // a click on an input switch flips it
    if (!d.moved && d.hit.kind === "switch") { sim.release(); sim.logic?.toggle(String(d.hit.id)); sim.running = true; }
    if (d.moved && sim.owner === "experiment" && !(d.hit.kind === "probe" && sim.probes.find(p => p.id === d.hit.id)?.mine)) sim.layoutChanged = true;
    sim.undo.commit();
    sim.notify();
  }

  private snapshot(hit: Hit): unknown {
    const sim = this.sim;
    switch (hit.kind) {
      case "source": case "switch": case "transistor": {
        const s = hit.src ?? sim.sources.find(q => q.id === hit.id)!;
        return { s, x: s.x, y: s.y, x2: s.x2, y2: s.y2, angleDeg: s.angleDeg, baked: s.baked };
      }
      case "probe": { const p = sim.probes.find(q => q.id === hit.id)!; return { x: p.x, y: p.y, x2: p.x2, y2: p.y2 }; }
      case "shape": { const s = sim.shapes.find(q => q.id === hit.id)!; return { ...s, ends: shapeEnds(s) }; }
      case "optic": { const o = sim.optics.find(q => q.id === hit.id)!; return { x: o.x, y: o.y }; }
      case "detector": { const a = sim.logic?.detectors.find(q => q.id === hit.id)?.areas[0]; return a ? { ...a } : null; }
      default: return null;
    }
  }

  private apply(hit: Hit, orig: unknown, dx: number, dy: number, cell: Pt, done: boolean): void {
    const sim = this.sim, W = sim.scene.width - 1, H = sim.scene.height - 1;
    const clampX = (v: number) => Math.max(0, Math.min(W, v)), clampY = (v: number) => Math.max(0, Math.min(H, v));
    switch (hit.kind) {
      case "source": case "switch": case "transistor": {
        const o = orig as { s: SourceSpec; x: number; y: number; x2: number; y2: number; baked?: SourceSpec["baked"] }, s = o.s;
        if (hit.handle === "aim") s.angleDeg = snapTurn(Math.atan2(cell.y - s.y - 0.5, cell.x - s.x - 0.5) * DEG);
        else if (hit.handle === "a") { s.x = clampX(o.x + dx); s.y = clampY(o.y + dy); }
        else if (hit.handle === "b") { s.x2 = clampX(o.x2 + dx); s.y2 = clampY(o.y2 + dy); }
        else {
          // keep the whole source inside the scene
          const ddx = Math.max(-Math.min(o.x, o.x2), Math.min(W - Math.max(o.x, o.x2), dx)), ddy = Math.max(-Math.min(o.y, o.y2), Math.min(H - Math.max(o.y, o.y2), dy));
          s.x = o.x + ddx; s.y = o.y + ddy; s.x2 = o.x2 + ddx; s.y2 = o.y2 + ddy;
          if (o.baked) s.baked = o.baked.map(e => ({ ...e, x: e.x + ddx, y: e.y + ddy }));
        }
        if (hit.handle !== "body") s.baked = undefined;
        sim.refreshSources();
        sim.logic?.drawLabels();
        return;
      }
      case "probe": {
        const o = orig as { x: number; y: number; x2: number; y2: number }, p = sim.probes.find(q => q.id === hit.id);
        if (!p) return;
        if (hit.handle === "a") { p.x = clampX(o.x + dx); p.y = clampY(o.y + dy); }
        else if (hit.handle === "b") { p.x2 = clampX(o.x2 + dx); p.y2 = clampY(o.y2 + dy); }
        else {
          const ddx = Math.max(-Math.min(o.x, o.x2), Math.min(W - Math.max(o.x, o.x2), dx)), ddy = Math.max(-Math.min(o.y, o.y2), Math.min(H - Math.max(o.y, o.y2), dy));
          p.x = o.x + ddx; p.y = o.y + ddy; p.x2 = o.x2 + ddx; p.y2 = o.y2 + ddy;
        }
        // shown moving; measured again (from where it is dropped) when let go
        if (done) sim.setProbes(sim.probeList());
        return;
      }
      case "shape": {
        const o = orig as ShapeSpec & { ends: [Pt, Pt] }, s = sim.shapes.find(q => q.id === hit.id);
        if (!s) return;
        const before = shapeBounds(s), f = frame(s.x, s.y, s.angleDeg).local(cell);
        if (hit.handle === "a") setShapeEnds(s, { x: o.ends[0].x + dx, y: o.ends[0].y + dy }, o.ends[1]);
        else if (hit.handle === "b") setShapeEnds(s, o.ends[0], { x: o.ends[1].x + dx, y: o.ends[1].y + dy });
        else if (hit.handle === "rot") s.angleDeg = snapTurn(Math.atan2(cell.y - s.y, cell.x - s.x) * DEG + 90);
        // an outline box keeps room inside its walls
        else if (hit.handle === "len") s.length = Math.max(s.kind === "box" && !s.filled ? s.thickness + 2 : 2, Math.round(2 * Math.abs(f.u)));
        else if (hit.handle === "wid") s.width = Math.max(s.kind === "box" && !s.filled ? s.thickness + 2 : 2, Math.round(2 * Math.abs(f.v)));
        else { s.x = clampX(o.x + dx); s.y = clampY(o.y + dy); }
        sim.updateShape(s, before);
        return;
      }
      case "optic": {
        const o = orig as { x: number; y: number }, e = sim.optics.find(q => q.id === hit.id);
        if (!e) return;
        const before = opticBounds(e);
        if (hit.handle === "rot") e.angleDeg = snapTurn(Math.atan2(cell.y - e.y, cell.x - e.x) * DEG + 90);
        else if (hit.handle === "size") e.size = Math.max(8, Math.round(2 * Math.abs(frame(e.x, e.y, e.angleDeg).local(cell).v)));
        else { e.x = clampX(o.x + dx); e.y = clampY(o.y + dy); }
        sim.updateOptic(e, before);
        return;
      }
      case "detector": {
        const d = sim.logic?.detectors.find(q => q.id === hit.id), last = this.drag?.last ?? { x: 0, y: 0 };
        if (!d) return;
        if (hit.handle === "size") {
          const a = d.areas[0], o = orig as { x: number; y: number; w: number; h: number };
          a.w = Math.max(1, Math.round(o.w + dx)); a.h = Math.max(1, Math.round(o.h + dy));
          sim.logic!.areasChanged();
        } else sim.logic!.moveDetector(d, dx - last.x, dy - last.y);
        return;
      }
    }
  }

  // ------------------------------------------------------------------------------------------ edit the selection

  /** Deletes the selected thing (a source takes its light with it; a detector, the transistors it switches). */
  deleteSelection(): boolean {
    const sim = this.sim, sel = sim.selection;
    if (!sel) return false;
    // the reader's own probe in an experiment is not part of the experiment's layout
    const mine = sel.kind === "probe" && !!sim.probes.find(p => p.id === sel.id)?.mine;
    sim.undo.begin("Delete");
    switch (sel.kind) {
      case "source": { const s = sim.sources.find(q => q.id === sel.id); if (s) sim.removeSources([s]); break; }
      case "probe": sim.removeProbe(Number(sel.id)); break;
      case "shape": sim.removeShape(Number(sel.id)); break;
      case "optic": sim.removeOptic(Number(sel.id)); break;
      case "switch": case "detector": case "transistor": {
        const c = sim.logic, part = c && (sel.kind === "switch" ? c.switches : sel.kind === "detector" ? c.detectors : c.transistors).find(q => q.id === sel.id);
        if (c && part) sim.removeSources(c.remove(part));
        break;
      }
    }
    if (sim.owner === "experiment" && !mine) sim.layoutChanged = true;
    sim.select(null);
    sim.undo.commit();
    return true;
  }

  /** A copy of the selected source, probe, shape or optical element, a little to the right and down; it is selected. */
  duplicate(): boolean {
    const sim = this.sim, sel = sim.selection, D = 12;
    if (!sel) return false;
    sim.undo.begin("Duplicate");
    let done = true;
    if (sel.kind === "source") {
      const s = sim.sources.find(q => q.id === sel.id);
      if (!s) done = false;
      else {
        const { id: _id, ...rest } = structuredClone(s);
        const n = newSource({ ...rest, name: `${s.name} copy`, x: s.x + D, y: s.y + D, x2: s.x2 + D, y2: s.y2 + D, baked: s.baked?.map(e => ({ ...e, x: e.x + D, y: e.y + D })) });
        sim.sources.push(n);
        sim.refreshSources();
        sim.select({ kind: "source", id: n.id });
      }
    } else if (sel.kind === "probe") {
      const p = sim.probes.find(q => q.id === sel.id);
      if (!p) done = false;
      else {
        const { id: _i, color: _c, label: _l, ...rest } = p;
        const id = sim.addProbe({ ...rest, x: p.x + D, y: p.y + D, x2: p.x2 + D, y2: p.y2 + D });
        sim.select({ kind: "probe", id });
      }
    } else if (sel.kind === "shape") {
      const s = sim.shapes.find(q => q.id === sel.id);
      if (!s) done = false; else { const n = copyShape(s, D, D); sim.addShape(n); }
    } else if (sel.kind === "optic") {
      const o = sim.optics.find(q => q.id === sel.id);
      if (!o) done = false;
      else { const { id: _id, name, ...rest } = o as OpticSpec; sim.addOptic(newOptic(o.kind, { ...rest, name: `${name} copy`, x: o.x + D, y: o.y + D })); }
    } else done = false;
    sim.undo.commit();
    sim.notify();
    return done;
  }

  /** Can the selected thing be turned (a shape, an optical element, a laser)? */
  canTurn(sel: Selection | null = this.sim.selection): boolean {
    const sim = this.sim;
    if (!sel) return false;
    if (sel.kind === "shape" || sel.kind === "optic") return true;
    return sel.kind === "source" && sim.sources.find(q => q.id === sel.id)?.kind === "laser";
  }

  /** Turns the selected shape, optical element or laser by `deg` degrees (clockwise on the picture). */
  turn(deg: number): boolean {
    const sim = this.sim, sel = sim.selection;
    if (!sel || !this.canTurn(sel)) return false;
    const norm = (a: number) => ((Math.round(a) % 360) + 540) % 360 - 180;
    sim.undo.touch("Turn");
    if (sel.kind === "shape") {
      const s = sim.shapes.find(q => q.id === sel.id)!, before = shapeBounds(s);
      s.angleDeg = norm(s.angleDeg + deg);
      sim.updateShape(s, before);
    } else if (sel.kind === "optic") {
      const e = sim.optics.find(q => q.id === sel.id)!, before = opticBounds(e);
      e.angleDeg = norm(e.angleDeg + deg);
      sim.updateOptic(e, before);
    } else {
      const s = sim.sources.find(q => q.id === sel.id)!;
      s.angleDeg = norm(s.angleDeg + deg);
      sim.refreshSources();
    }
    if (sim.owner === "experiment") sim.layoutChanged = true;
    sim.notify();
    return true;
  }

  /** Moves the selected thing by whole cells (arrow keys). */
  nudge(dx: number, dy: number): boolean {
    const sim = this.sim, sel = sim.selection;
    if (!sel) return false;
    const hit: Hit = { ...sel, handle: "body", src: sel.kind === "switch" || sel.kind === "transistor" ? this.partSource(sel) : undefined };
    if ((sel.kind === "switch" || sel.kind === "transistor") && !hit.src) return false;
    sim.undo.touch("Move");
    this.apply(hit, this.snapshot(hit), dx, dy, { x: 0, y: 0 }, true);
    if (sim.owner === "experiment") sim.layoutChanged = true;
    sim.notify();
    return true;
  }

  private partSource(sel: Selection): SourceSpec | undefined {
    const c = this.sim.logic;
    if (!c) return undefined;
    const part = sel.kind === "switch" ? c.switches.find(q => q.id === sel.id) : c.transistors.find(q => q.id === sel.id);
    return part?.sources[0];
  }
}

export type { ProbeSpec };
