// Wave Dude 2D web - the inspector: the selected object's name, on/off, duplicate and delete, and all its settings.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import type { Tool } from "../../view/viewport";
import { OPTIC_KINDS } from "../../core/optics";
import { SHAPE_KINDS } from "../../core/shapes";
import { h } from "../../components";
import { sourceEditor } from "./source-editor";
import { opticEditor } from "./optic-editor";
import { shapeEditor } from "./shape-editor";
import { probeEditor } from "./probe-editor";
import { switchEditor, detectorEditor, transistorEditor, type Live } from "./logic-editors";

export function inspector(sim: Sim, live: Live, pick: (t: Tool) => void, relist: () => void): HTMLElement | null {
  const sel = sim.selection;
  if (!sel) return null;
  let icon = "", name = "", kind = "", color = "", body: HTMLElement | null = null, toggle: HTMLElement | null = null;
  const sw = (on: boolean, label: string, set: (v: boolean) => void) =>
    h("input", { type: "checkbox", class: "switch", checked: on, "aria-label": label, title: label, onchange: (e: Event) => { sim.undo.begin("On / off"); set((e.target as HTMLInputElement).checked); sim.undo.commit(); relist(); } });
  switch (sel.kind) {
    case "source": {
      const s = sim.sources.find(q => q.id === sel.id);
      if (!s) return null;
      icon = s.kind === "line" ? "━" : s.kind === "laser" ? "⇶" : s.kind === "array" ? "⣿" : "◉";
      name = s.name; color = sim.sourceColor(s);
      kind = s.kind === "array" ? `${s.countX}×${s.countY} array` : `${s.kind} source${s.motion && s.kind === "point" ? " · moving" : ""}`;
      toggle = sw(s.enabled, "On", v => { s.enabled = v; sim.refreshSources(); });
      body = sourceEditor(s, () => { sim.undo.touch("Change source"); sim.refreshSources(); }, true, relist);
      break;
    }
    case "probe": {
      const p = sim.probes.find(q => q.id === sel.id);
      if (!p) return null;
      icon = p.kind === "point" ? "⊕" : "⟷"; name = p.label; color = p.color; kind = p.kind === "point" ? "point probe" : "line probe";
      body = probeEditor(sim, p, relist);
      break;
    }
    case "shape": {
      const s = sim.shapes.find(q => q.id === sel.id);
      if (!s) return null;
      icon = SHAPE_KINDS.find(k => k.kind === s.kind)?.icon ?? "▭"; name = s.name; kind = `${s.material} ${s.kind === "slits" ? "with slits" : s.kind}`;
      body = shapeEditor(sim, s, relist);
      break;
    }
    case "optic": {
      const o = sim.optics.find(q => q.id === sel.id);
      if (!o) return null;
      const k = OPTIC_KINDS.find(q => q.kind === o.kind);
      icon = k?.icon ?? "◐"; name = o.name; kind = k?.label.toLowerCase() ?? o.kind;
      body = opticEditor(sim, o, true, relist);
      break;
    }
    default: {
      const c = sim.logic;
      if (!c) return null;
      if (sel.kind === "switch") { const s = c.switches.find(q => q.id === sel.id); if (!s) return null; icon = "⏻"; name = `Input ${s.label}`; kind = "input switch"; body = switchEditor(sim, c, s, live, pick, relist); }
      else if (sel.kind === "detector") { const d = c.detectors.find(q => q.id === sel.id); if (!d) return null; icon = "💡"; name = d.label || d.id; kind = "detector"; body = detectorEditor(sim, c, d, live, relist); }
      else { const t = c.transistors.find(q => q.id === sel.id); if (!t) return null; icon = "⚡"; name = t.label; kind = "wave transistor"; body = transistorEditor(sim, c, t, live, relist); }
    }
  }
  const canCopy = sel.kind === "source" || sel.kind === "probe" || sel.kind === "shape" || sel.kind === "optic";
  return h("section", { class: "inspector box", "aria-label": `Selected: ${name}` },
    h("div", { class: "insp-head" },
      h("span", { class: "insp-ic", "aria-hidden": "true" }, color ? h("span", { class: "swatch", style: `--c:${color}` }) : icon),
      h("span", { class: "grow" }, h("span", { class: "nm" }, name), h("small", {}, ` ${kind}`)),
      toggle,
      canCopy ? h("button", { type: "button", class: "icon", "aria-label": "Duplicate", "data-help": "Duplicate (Ctrl+D)", onclick: () => sim.selector.duplicate() }, "⧉") : null,
      h("button", { type: "button", class: "icon del", "aria-label": "Delete", "data-help": "Delete (Del)", onclick: () => sim.selector.deleteSelection() }, "✕"),
      h("button", { type: "button", class: "icon", "aria-label": "Deselect", "data-help": "Deselect (Esc)", onclick: () => sim.select(null) }, "×")),
    body);
}
