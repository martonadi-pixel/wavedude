// Wave Dude 2D web - building wave circuits by hand in the sandbox: the light-guide, input, detector and transistor
// tools, and what they draw while you place them.
// GPL-3.0-or-later.

import type { Sim } from "../sim";
import type { Overlay, Pt, Tool } from "../view/viewport";
import type { Scene } from "../engine/scene";
import { newSource, SourceSpec } from "../engine/sources";
import { Circuit, Detector } from "./circuit";
import { CORE_W, LEVEL, LATCH_UNIT } from "./parts";
import { snapAngle } from "../engine/paint";

export type LogicTool = "guide" | "bit" | "detector" | "transistor";
export const LOGIC_TOOLS: LogicTool[] = ["guide", "bit", "detector", "transistor"];
export const isLogicTool = (t: Tool): t is LogicTool => (LOGIC_TOOLS as Tool[]).includes(t);

/** Settings for the next parts placed with the logic tools (the sandbox's "Settings for new parts"). */
export const logicTemplate = {
  /** Light guide: core width (cells) and refractive index; 6 cells of n = 1.5 carry one mode at frequency 60. */
  guideWidth: CORE_W,
  guideN: 1.5,
  /** Guide ends in empty space soak up the light (no echoes running back to the inputs). */
  absorbEnds: true,
  /** Emitters: across a left-right guide (a short vertical line), across an up-down guide, or a point. */
  emitter: "h" as "h" | "v" | "point",
  /** New transistors shine while their detector is dark (a NOT). */
  invert: false,
};

/** Steps a hand-built circuit fast-forwards after a switch flips (light in a guide needs ~1100 steps per 400 cells). */
export const HAND_SETTLE = 1500;

/** The part picked last (its row opens in the panel). */
export let logicSelected: string | null = null;
export function selectPart(id: string | null): void { logicSelected = id; }

let guideDraft: { a: Pt; b: Pt } | null = null;
/** A transistor being placed: its detector is chosen, the emitter comes next. */
let trDraft: Detector | null = null;
/** An extra emitter goes to this switch (fan-out) with the next click of the input tool. */
let addTo: string | null = null;
export function addEmitterTo(id: string | null): void { addTo = id; }
export function addingTo(): string | null { return addTo; }

/** The sim's circuit, made (and attached) on first use. */
export function ensureCircuit(sim: Sim): Circuit {
  if (sim.logic) return sim.logic;
  const c = new Circuit(sim);
  c.settle = HAND_SETTLE;
  c.holdUntil = 600;
  c.showBoxes = true;
  c.attach();
  return c;
}

/** The middle of the light guide across (x, y), looking up and down (h) or left and right (v); (x, y) if there is none. */
function onGuide(scene: Scene, x: number, y: number, dir: "h" | "v" | "point"): Pt & { width: number } {
  if (dir === "point") return { x, y, width: 0 };
  const W = scene.width, H = scene.height;
  const glassAt = (k: number) => {
    const xx = dir === "h" ? x : x + k, yy = dir === "h" ? y + k : y;
    return xx >= 0 && yy >= 0 && xx < W && yy < H && scene.n[yy * W + xx] > 1.15;
  };
  // the nearest glass cell within 10 cells, then the run of glass around it
  let k0: number | null = null;
  for (let d = 0; d <= 10 && k0 === null; d++) for (const k of [d, -d]) if (glassAt(k)) { k0 = k; break; }
  if (k0 === null) return { x, y, width: 0 };
  let lo = k0, hi = k0;
  while (lo > k0 - 30 && glassAt(lo - 1)) lo--;
  while (hi < k0 + 30 && glassAt(hi + 1)) hi++;
  const mid = Math.round((lo + hi) / 2);
  return dir === "h" ? { x, y: y + mid, width: hi - lo + 1 } : { x: x + mid, y, width: hi - lo + 1 };
}

function makeEmitter(name: string, x: number, y: number, width: number, dir: "h" | "v" | "point"): SourceSpec {
  if (dir === "point") return newSource({ name, kind: "point", x, y, level: LEVEL });
  // across the core, one cell short of its walls on each side (as parts.emitter)
  const half = Math.max(1, Math.floor(((width || logicTemplate.guideWidth) - 2) / 2));
  return dir === "h" ? newSource({ name, kind: "line", x, y: y - half, x2: x, y2: y + half, level: LEVEL })
    : newSource({ name, kind: "line", x: x - half, y, x2: x + half, y2: y, level: LEVEL });
}

/** A light guide from a to b; ends in empty space get an absorbing tip. */
export function drawGuide(sim: Sim, a: Pt, b: Pt): void {
  const base = sim.baseScene, t = logicTemplate, w = t.guideWidth, len = 40;
  const glassAt = (p: Pt) => { const x = Math.round(p.x), y = Math.round(p.y); return x >= 0 && y >= 0 && x < base.width && y < base.height && base.n[y * base.width + x] > 1.15; };
  // an end that lands on another guide joins it (no tip there)
  const openA = glassAt(a), openB = glassAt(b);
  base.segment(a.x, a.y, b.x, b.y, w, { n: t.guideN, absorb: 0 });
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
  const tip = (p: Pt, dx: number, dy: number) => {
    for (let k = 0; k < len; k++) {
      const absorb = 0.25 * ((k + 1) / len) ** 2;
      base.segment(p.x + dx * k, p.y + dy * k, p.x + dx * (k + 1), p.y + dy * (k + 1), w + 4, { n: t.guideN, absorb });
    }
  };
  if (t.absorbEnds) {
    if (!openB) tip(b, ux, uy);
    if (!openA) tip(a, -ux, -uy);
  }
  const m = len + w + 4;
  sim.rasterize(Math.min(a.x, b.x) - m, Math.min(a.y, b.y) - m, Math.max(a.x, b.x) + m, Math.max(a.y, b.y) + m);
}

/** Snaps a guide to 0°, 45°, 90°... when it is within 4° of one (whole cells). */
function snapEnd(a: Pt, b: Pt): Pt {
  const p = snapAngle(a, b);
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

const letter = (c: Circuit) => {
  const used = new Set(c.switches.map(s => s.label));
  for (const l of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") if (!used.has(l)) return l;
  return c.freeId("In");
};

/** What the logic tools do on the simulation (called by Sim for these tools). */
export function logicTool(sim: Sim, tool: LogicTool, phase: "down" | "move" | "up", cell: Pt, start: Pt): void {
  const x = Math.floor(cell.x), y = Math.floor(cell.y);
  const inside = x >= 0 && y >= 0 && x < sim.scene.width && y < sim.scene.height;
  const r = Math.max(4, 8 * sim.view.scale);
  if (tool !== "transistor") trDraft = null;
  if (tool !== "bit") addTo = null;
  switch (tool) {
    case "guide": {
      const s = { x: Math.round(start.x), y: Math.round(start.y) };
      if (phase === "down") guideDraft = { a: s, b: s };
      else if (guideDraft) guideDraft.b = snapEnd(guideDraft.a, { x: Math.round(cell.x), y: Math.round(cell.y) });
      if (phase === "up" && guideDraft) {
        const g = guideDraft;
        guideDraft = null;
        if (Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y) >= 4) { drawGuide(sim, g.a, g.b); sim.notify(); }
      }
      return;
    }
    case "bit": {
      if (phase !== "down" || !inside) return;
      const c = ensureCircuit(sim);
      const target = addTo ? c.switches.find(s => s.id === addTo) : undefined;
      const hit = target ? undefined : c.switchAt(cell, r);
      if (hit) { c.toggle(hit.id); logicSelected = hit.id; sim.notify(); return; }
      const p = onGuide(sim.scene, x, y, logicTemplate.emitter);
      if (target) {
        const src = makeEmitter(`${target.label} (${target.sources.length + 1})`, p.x, p.y, p.width, logicTemplate.emitter);
        src.enabled = target.bit === 1;
        target.sources.push(src);
        sim.sources.push(src);
        addTo = null;
        logicSelected = target.id;
      } else {
        const label = letter(c), id = c.freeId("in");
        const src = makeEmitter(label, p.x, p.y, p.width, logicTemplate.emitter);
        sim.sources.push(src);
        c.addSwitch(id, label, [src], { x: p.x + 8, y: Math.min(src.y, src.y2) - 6 });
        logicSelected = id;
      }
      sim.refreshSources();
      c.drawLabels();
      sim.notify();
      return;
    }
    case "detector": {
      if (phase !== "down" || !inside) return;
      const c = ensureCircuit(sim);
      const near = c.detectorNear(cell, 2);
      if (near) { logicSelected = near.id; sim.notify(); return; }
      addDetectorAt(c, sim, x, y);
      sim.notify();
      return;
    }
    case "transistor": {
      if (phase !== "down" || !inside) return;
      const c = ensureCircuit(sim);
      if (!trDraft || !c.detectors.includes(trDraft)) {
        // first click: where it looks (an existing detector, or a new one here)
        trDraft = c.detectorNear(cell, 2) ?? addDetectorAt(c, sim, x, y, "gate");
        logicSelected = trDraft.id;
        sim.notify();
        return;
      }
      // second click: where it shines
      const det = trDraft;
      trDraft = null;
      const p = onGuide(sim.scene, x, y, logicTemplate.emitter);
      const id = c.freeId("T"), invert = logicTemplate.invert;
      const src = makeEmitter(`Transistor ${id}`, p.x, p.y, p.width, logicTemplate.emitter);
      sim.sources.push(src);
      // it starts in the state its detector asks for (nothing flips before the light arrives)
      const t = c.addTransistor(id, id, det, [src], invert, (det.bit === 1) !== invert);
      t.wires = true;
      t.at = { x: p.x + 8, y: Math.max(src.y, src.y2) + 14 };
      logicSelected = id;
      sim.refreshSources();
      c.drawLabels();
      sim.notify();
      return;
    }
  }
}

/** A detector (with an LED label) across the guide at (x, y), or a small square in open space. */
function addDetectorAt(c: Circuit, sim: Sim, x: number, y: number, kind: "led" | "gate" = "led"): Detector {
  const dir = logicTemplate.emitter === "v" ? "v" : "h";
  const p = onGuide(sim.scene, x, y, dir);
  const half = p.width ? Math.max(1, Math.floor((p.width - 2) / 2)) : 2;
  const area = dir === "h" ? { x: p.x - 2, y: p.y - half, w: 4, h: 2 * half + 1 } : { x: p.x - half, y: p.y - 2, w: 2 * half + 1, h: 4 };
  const n = c.detectors.filter(d => d.led).length + 1;
  const id = c.freeId("D");
  // a transistor's gate switches at 10-15% of a full "1" (so a weak input still counts); a lamp at 30-50%
  const d = c.addDetector(id, kind === "gate" ? "" : `D${n}`, [area], {
    unit: LATCH_UNIT, ...(kind === "gate" ? { lo: 0.1, hi: 0.15 } : { lo: 0.3, hi: 0.5 }),
    at: { x: area.x + area.w + 4, y: area.y - 6 }, led: kind === "led",
  });
  c.drawLabels();
  return d;
}

/** What the tools draw while placing (a guide being dragged, the detector a transistor will look at). */
export function logicOverlay(sim: Sim, o: Overlay): void {
  if (guideDraft && sim.view.tool === "guide") {
    const g = guideDraft;
    o.arrows.push({ x0: g.a.x, y0: g.a.y, x1: g.b.x, y1: g.b.y, color: "#7df9ff", dashed: true });
    o.labels.push({ x: g.b.x + 8, y: g.b.y - 8, text: `${Math.round(Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y))} cells`, color: "#7df9ff" });
  }
  if (trDraft && sim.view.tool === "transistor" && sim.logic?.detectors.includes(trDraft)) {
    const a = trDraft.areas[0];
    o.boxes.push({ x: a.x - 2, y: a.y - 2, w: a.w + 4, h: a.h + 4, color: "#fbbf24" });
    o.labels.push({ x: a.x + a.w + 6, y: a.y + a.h + 16, text: "⚡ now click where the transistor shines", color: "#fbbf24" });
  } else if (sim.view.tool !== "transistor") trDraft = null;
  if (addTo && sim.view.tool === "bit") {
    const s = sim.logic?.switches.find(q => q.id === addTo);
    if (s?.at) o.labels.push({ x: s.at.x, y: s.at.y - 16, text: `＋ click where ${s.label}'s next emitter goes`, color: "#fbbf24" });
  }
}
