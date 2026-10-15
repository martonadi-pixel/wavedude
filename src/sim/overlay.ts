// Wave Dude 2D web - what is drawn on top of the waves: sources (a moving one where it is now, with its path),
// lasers, probes, shape and element names, things being placed, the selected object with its handles, and the
// labels and arrows experiments and wave circuits add.
// GPL-3.0-or-later.

import type { Sim } from "./sim";
import type { Selection } from "./selection";
import { ROUND_HANDLES } from "./selection";
import { isPaintTool } from "./tools";
import { emptyOverlay, type Overlay, type Pt } from "../view/viewport";
import type { SourceSpec } from "../core/sources";
import { motionPosition } from "../core/sources";
import { opticBounds } from "../core/optics";
import { shapeOutline, shapeBounds } from "../core/shapes";
import { logicOverlay } from "../circuits/editor";

const SELECTED = "#ffffff";
/** The halo of what the pointer is over (a click would pick it up). */
const HOVER = "#ffffff70";

export function buildOverlay(sim: Sim): Overlay {
  const o = emptyOverlay(), sel = sim.selection, tools = sim.tools;
  if (sim.showSources) {
    // in the sandbox each source carries its name on the canvas; experiments label their own scenes
    const named = sim.owner === "sandbox";
    for (const s of sim.sources) {
      if (!s.enabled) continue;
      const color = sim.sourceColor(s), selected = sel?.kind === "source" && sel.id === s.id;
      const label = [named ? s.name : "", s.kind === "array" ? `${s.countX}×${s.countY}` : ""].filter(Boolean).join(" · ") || undefined;
      if (s.motion && s.kind === "point") { motion(sim, o, s, color, selected, label); continue; }
      if (s.kind === "line") o.sources.push({ x: s.x, y: s.y, x2: s.x2, y2: s.y2, level: s.level, selected, color, label });
      else if (s.kind === "laser") laser(sim, o, s, selected);
      else o.sources.push({ x: s.x, y: s.y, level: s.level, selected, color, label });
    }
    if (!sim.useObjectSources) o.sources.length = 0;
    const ld = tools.lineDraft;
    if (ld) o.sources.push({ x: ld.x, y: ld.y, x2: ld.x2, y2: ld.y2, level: ld.level });
    if (tools.laserDraft) laser(sim, o, tools.laserDraft, true);
  }
  for (const p of [...sim.probes.filter(q => q.active !== false), ...(tools.probeDraft ? [tools.probeDraft] : [])]) {
    if (p.kind === "point") o.pointProbes.push({ x: p.x, y: p.y, color: p.color, label: p.label });
    else o.lineProbes.push({ x0: p.x, y0: p.y, x1: p.x2, y1: p.y2, color: p.color, label: p.label });
  }
  if (sim.showOutlines)
    for (const e of sim.optics) {
      if (sel?.kind === "optic" && sel.id === e.id) continue;
      const b = opticBounds(e);
      o.labels.push({ x: e.x - 30, y: b.y0 - 6, text: e.name, color: "#9fe3ffcc" });
    }
  o.labels.push(...sim.annotations.labels);
  o.arrows.push(...sim.annotations.arrows);
  o.boxes.push(...sim.annotations.boxes);
  drafts(sim, o);
  hover(sim, o);
  brush(sim, o);
  selection(sim, o);
  logicOverlay(sim, o);
  return o;
}

const ring = (x: number, y: number, r: number): Pt[] => Array.from({ length: 32 }, (_, k) => ({ x: x + r * Math.cos((k / 32) * 2 * Math.PI), y: y + r * Math.sin((k / 32) * 2 * Math.PI) }));
const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];

/** The outline of an object (closed polygons in cells), and where its name goes. */
function outlineOf(sim: Sim, sel: Selection): { polys: Pt[][]; name?: { x: number; y: number; text: string } } {
  const r = Math.max(6, 10 * sim.view.scale);
  switch (sel.kind) {
    case "shape": {
      const s = sim.shapes.find(q => q.id === sel.id);
      return s ? { polys: [shapeOutline(s)], name: { x: s.x - 30, y: shapeBounds(s).y0 - 6, text: s.name } } : { polys: [] };
    }
    case "optic": {
      const e = sim.optics.find(q => q.id === sel.id);
      if (!e) return { polys: [] };
      const b = opticBounds(e);
      return { polys: [rect(b.x0, b.y0, b.x1, b.y1)], name: { x: e.x - 30, y: b.y0 - 6, text: e.name } };
    }
    case "probe": {
      const p = sim.probes.find(q => q.id === sel.id);
      if (!p) return { polys: [] };
      if (p.kind === "point") return { polys: [ring(p.x + 0.5, p.y + 0.5, r * 1.3)] };
      // a band around the line
      const a = Math.atan2(p.y2 - p.y, p.x2 - p.x), nx = -Math.sin(a) * r * 0.7, ny = Math.cos(a) * r * 0.7;
      return { polys: [[{ x: p.x + 0.5 + nx, y: p.y + 0.5 + ny }, { x: p.x2 + 0.5 + nx, y: p.y2 + 0.5 + ny }, { x: p.x2 + 0.5 - nx, y: p.y2 + 0.5 - ny }, { x: p.x + 0.5 - nx, y: p.y + 0.5 - ny }]] };
    }
    case "source": {
      const s = sim.sources.find(q => q.id === sel.id);
      if (!s) return { polys: [] };
      if (s.kind === "line") {
        const a = Math.atan2(s.y2 - s.y, s.x2 - s.x), nx = -Math.sin(a) * r * 0.8, ny = Math.cos(a) * r * 0.8;
        return { polys: [[{ x: s.x + 0.5 + nx, y: s.y + 0.5 + ny }, { x: s.x2 + 0.5 + nx, y: s.y2 + 0.5 + ny }, { x: s.x2 + 0.5 - nx, y: s.y2 + 0.5 - ny }, { x: s.x + 0.5 - nx, y: s.y + 0.5 - ny }]] };
      }
      const p = sim.sourcePos(s);
      return { polys: [ring(p.x + 0.5, p.y + 0.5, r * 1.6)] };
    }
    case "detector": {
      const d = sim.logic?.detectors.find(q => q.id === sel.id);
      return { polys: (d?.areas ?? []).map(a => rect(a.x - 2, a.y - 2, a.x + a.w + 2, a.y + a.h + 2)) };
    }
    default: {
      const c = sim.logic, part = c && (sel.kind === "switch" ? c.switches : c.transistors).find(q => q.id === sel.id);
      return { polys: (part?.sources ?? []).map(s => ring((s.x + s.x2) / 2 + 0.5, (s.y + s.y2) / 2 + 0.5, r * 1.6)) };
    }
  }
}

/** The selected object: a white outline, its name, and its drag handles (a line to the knob that turns it). */
function selection(sim: Sim, o: Overlay): void {
  const sel = sim.selection;
  if (!sel) return;
  const { polys, name } = outlineOf(sim, sel);
  for (const pts of polys) o.paths.push({ pts, closed: true, color: SELECTED });
  if (name) o.labels.push({ x: name.x, y: name.y, text: `◆ ${name.text}`, color: sel.kind === "optic" ? "#7df9ff" : SELECTED });
  const hs = sim.selector.handles(sel);
  const centre = sel.kind === "shape" ? sim.shapes.find(q => q.id === sel.id) : sel.kind === "optic" ? sim.optics.find(q => q.id === sel.id) : undefined;
  for (const [kind, p] of hs) {
    if (kind === "rot" && centre) o.paths.push({ pts: [{ x: centre.x, y: centre.y }, p], color: "#ffffffaa", solid: true });
    o.handles.push({ ...p, round: ROUND_HANDLES.has(kind) });
  }
}

/** A faint halo around what a click would pick up (not while dragging, not on the selected object). */
function hover(sim: Sim, o: Overlay): void {
  const cell = sim.view.hoverCell;
  if (!cell || sim.view.pressed || sim.view.tool === "ruler" || sim.view.tool === "protractor") return;
  const hit = sim.selector.hit(cell);
  if (!hit || hit.handle !== "body") return;
  const sel = sim.selection;
  if (sel && sel.kind === hit.kind && sel.id === hit.id) return;
  for (const pts of outlineOf(sim, hit).polys) o.paths.push({ pts, closed: true, color: HOVER });
}

/** Where a paint tool would paint, and how thick: a circle the size of the brush under the pointer. */
function brush(sim: Sim, o: Overlay): void {
  const cell = sim.view.hoverCell, tool = sim.view.tool;
  if (!cell || !isPaintTool(tool) || sim.tools.shapeDraft || (sim.paintShape === "filledBox" && tool !== "erase")) return;
  const color = tool === "erase" ? "#f87171" : tool === "glass" ? "#7dd3fc" : tool === "absorber" ? "#c4b5fd" : "#e2e8f0";
  o.paths.push({ pts: ring(Math.floor(cell.x) + 0.5, Math.floor(cell.y) + 0.5, Math.max(0.5, sim.brush)), closed: true, color, solid: true });
}

/** A line or box being dragged out with a paint tool, as it will be drawn. */
function drafts(sim: Sim, o: Overlay): void {
  const d = sim.tools.shapeDraft;
  if (!d) return;
  const color = d.erase ? "#f87171" : sim.view.tool === "glass" ? "#7dd3fc" : sim.view.tool === "absorber" ? "#c4b5fd" : "#e2e8f0";
  let size = "";
  if (d.erase) {
    const st = sim.tools.draftStamp();
    if (!st || st.kind === "disc") return;
    if (st.kind === "segment") o.paths.push({ pts: [{ x: st.x0, y: st.y0 }, { x: st.x1, y: st.y1 }], width: 2 * st.r, color });
    else {
      const pts = [{ x: st.x0, y: st.y0 }, { x: st.x1, y: st.y0 }, { x: st.x1, y: st.y1 }, { x: st.x0, y: st.y1 }];
      o.paths.push(st.kind === "box" ? { pts, closed: true, width: 2 * st.r, color } : { pts, closed: true, fill: true, color });
    }
    size = st.kind === "segment" ? `${Math.round(Math.hypot(st.x1 - st.x0, st.y1 - st.y0))} cells` : `${Math.round(Math.abs(st.x1 - st.x0))} × ${Math.round(Math.abs(st.y1 - st.y0))}`;
  } else {
    const s = sim.tools.draftShape();
    if (!s) return;
    o.paths.push(s.kind === "line" ? { pts: [{ x: s.x - (Math.cos((s.angleDeg * Math.PI) / 180) * s.length) / 2, y: s.y - (Math.sin((s.angleDeg * Math.PI) / 180) * s.length) / 2 }, { x: s.x + (Math.cos((s.angleDeg * Math.PI) / 180) * s.length) / 2, y: s.y + (Math.sin((s.angleDeg * Math.PI) / 180) * s.length) / 2 }], width: s.thickness, color }
      : { pts: shapeOutline(s), closed: true, width: s.filled ? undefined : s.thickness, fill: s.filled, color });
    size = s.kind === "line" ? `${Math.round(s.length)} cells` : `${Math.round(s.length)} × ${Math.round(s.width)}`;
  }
  o.labels.push({ x: d.b.x + 10, y: d.b.y - 10, text: size, color });
}

/** A moving source: where it is now, and the path it follows (faint, dashed). */
function motion(sim: Sim, o: Overlay, s: SourceSpec, color: string, selected: boolean, label?: string): void {
  const m = s.motion!, p = sim.sourcePos(s);
  if (m.kind === "circle") {
    const r = Math.max(1, m.radius), n = Math.max(24, Math.min(120, Math.round(r)));
    o.paths.push({ pts: Array.from({ length: n }, (_, k) => ({ x: s.x + 0.5 + r * Math.cos((2 * Math.PI * k) / n), y: s.y + 0.5 + r * Math.sin((2 * Math.PI * k) / n) })), closed: true, color: `${color}88` });
  } else {
    const end = motionPosition(s, 1e9, sim.waveSpeed, sim.scene.width, sim.scene.height);
    o.paths.push({ pts: [{ x: s.x + 0.5, y: s.y + 0.5 }, { x: end.x + 0.5, y: end.y + 0.5 }], color: `${color}88` });
  }
  o.sources.push({ x: Math.round(p.x), y: Math.round(p.y), level: s.level, selected, color, label: label ? `${label} → ${m.mach.toFixed(2)}× wave speed` : undefined });
}

/** A laser: its emitting aperture as a line, and an arrow along the beam. */
function laser(sim: Sim, o: Overlay, s: SourceSpec, selected: boolean): void {
  const a = (s.angleDeg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), half = 1.8 * s.beamWidth;
  o.sources.push({ x: Math.round(s.x + dy * half), y: Math.round(s.y - dx * half), x2: Math.round(s.x - dy * half), y2: Math.round(s.y + dx * half), level: s.level, selected,
    color: sim.sourceColor(s), label: sim.owner === "sandbox" ? s.name : undefined });
  o.arrows.push({ x0: s.x, y0: s.y, x1: s.x + dx * 50, y1: s.y + dy * 50, color: selected ? "#ffffff" : "#ffffffaa" });
}
