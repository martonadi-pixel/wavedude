// Wave Dude 2D web - every object in the scene in one list (sources, shapes, optical elements, probes, the parts of a
// wave circuit), with filters. A click selects (the picture and the inspector follow); on/off and delete on the row.
// GPL-3.0-or-later.

import type { Sim, Selection } from "../../sim/sim";
import { OPTIC_KINDS } from "../../core/optics";
import { levelColor } from "../../core/physics";
import { SHAPE_KINDS, shapeInfo } from "../../core/shapes";
import { h, loadPref, savePref } from "../../components";
import { led, type Live } from "./logic-editors";

type Filter = "all" | "sources" | "shapes" | "optics" | "probes" | "logic";

interface Row { sel: Selection; filter: Filter; icon: Node | string; name: string; meta: string; on?: { value: boolean; set: (v: boolean) => void }; off?: boolean }

function rows(sim: Sim, live: Live): Row[] {
  const out: Row[] = [];
  const logic = sim.logic;
  for (const s of sim.sources) {
    const owner = logic?.ownerOf(s);
    if (owner) continue; // shown with the circuit's parts
    const kind = s.kind === "array" ? `${s.countX}×${s.countY} array` : s.kind;
    out.push({ sel: { kind: "source", id: s.id }, filter: "sources", icon: h("span", { class: "swatch src-swatch", style: `--c:${sim.sourceColor(s)};--freq:${levelColor(s.level)}`, title: `Its colour on the picture · frequency ${Math.round(s.level)}` }), name: s.name,
      meta: `${kind} · f ${Math.round(s.level)}${s.mode === "pulsed" ? " · pulsed" : ""}${s.motion && s.kind === "point" ? ` · moves ${s.motion.mach.toFixed(2)}×` : ""}`,
      on: { value: s.enabled, set: v => { s.enabled = v; sim.refreshSources(); } }, off: !s.enabled });
  }
  for (const s of sim.shapes)
    out.push({ sel: { kind: "shape", id: s.id }, filter: "shapes", icon: h("span", { class: `shape-ic m-${s.material}`, "aria-hidden": "true" }, SHAPE_KINDS.find(k => k.kind === s.kind)?.icon ?? "▭"), name: s.name, meta: shapeInfo(s) });
  for (const o of sim.optics)
    out.push({ sel: { kind: "optic", id: o.id }, filter: "optics", icon: h("span", { class: "optic-ic", "aria-hidden": "true" }, OPTIC_KINDS.find(k => k.kind === o.kind)?.icon ?? "◐"), name: o.name,
      meta: `n ${o.n.toFixed(2)} · ${Math.round(o.angleDeg)}°` });
  for (const p of sim.probes)
    out.push({ sel: { kind: "probe", id: p.id }, filter: "probes", icon: h("span", { class: "swatch", style: `--c:${p.color}` }), name: p.label,
      meta: `${p.kind === "point" ? `point (${p.x}, ${p.y})` : `line (${p.x}, ${p.y}) → (${p.x2}, ${p.y2})`} · ${p.measurement}`,
      on: { value: p.active !== false, set: v => sim.setProbes(sim.probeList().map(q => (q.id === p.id ? { ...q, active: v } : q))) }, off: p.active === false });
  if (logic) {
    for (const s of logic.switches) out.push({ sel: { kind: "switch", id: s.id }, filter: "logic", icon: "⏻", name: `Input ${s.label} = ${s.bit}`, meta: `${s.sources.length} emitter${s.sources.length === 1 ? "" : "s"}` });
    for (const d of logic.detectors) out.push({ sel: { kind: "detector", id: d.id }, filter: "logic", icon: led(d, live), name: d.label || d.id, meta: "detector" });
    for (const t of logic.transistors) out.push({ sel: { kind: "transistor", id: t.id }, filter: "logic", icon: "⚡", name: t.label, meta: `transistor · ${t.invert ? "NOT" : "follows"} ${t.input.label || t.input.id}` });
  }
  return out;
}

const FILTERS: [Filter, string][] = [["all", "All"], ["sources", "Sources"], ["shapes", "Shapes"], ["optics", "Optics"], ["probes", "Probes"], ["logic", "Logic"]];

/** The list; `refresh` draws it again (after any change). */
export function objectList(sim: Sim, live: Live): { el: HTMLElement; refresh: () => void } {
  let filter = loadPref<Filter>("objects.filter", "all");
  const chips = h("div", { class: "chips obj-filters", role: "group", "aria-label": "Show" });
  const list = h("div", { class: "list obj-list", role: "listbox", "aria-label": "Objects in the scene" });
  const el = h("div", { class: "objects" }, chips, list);
  const refresh = () => {
    const all = rows(sim, live), sel = sim.selection;
    const count = (f: Filter) => (f === "all" ? all.length : all.filter(r => r.filter === f).length);
    if (filter !== "all" && !count(filter)) filter = "all";
    chips.replaceChildren(...FILTERS.filter(([f]) => f === "all" || count(f) > 0).map(([f, label]) => h("button", {
      type: "button", class: `chip ${f === filter ? "on" : ""}`, "aria-pressed": String(f === filter),
      onclick: () => { filter = f; savePref("objects.filter", f); refresh(); },
    }, label, h("span", { class: "n" }, String(count(f))))));
    const shown = all.filter(r => filter === "all" || r.filter === filter);
    if (!all.length) {
      list.replaceChildren(h("p", { class: "empty" }, "Nothing in the scene yet. Pick a tool on the rail left of the picture — ", h("b", {}, "◉ Sources"), ", ",
        h("b", {}, "▮ Draw"), ", ", h("b", {}, "◐ Optics"), " or ", h("b", {}, "⊕ Probes"), " — and click or drag on the picture."));
      return;
    }
    list.replaceChildren(...shown.map(r => {
      const on = !!sel && sel.kind === r.sel.kind && sel.id === r.sel.id;
      const row = h("div", {
        class: `row obj ${on ? "sel" : ""} ${r.off ? "off" : ""}`, role: "option", "aria-selected": String(on), tabindex: 0,
        onclick: (e: Event) => { if ((e.target as HTMLElement).closest("input, button")) return; sim.select(on ? null : r.sel); },
        onkeydown: (e: Event) => { const k = (e as KeyboardEvent).key; if ((k === "Enter" || k === " ") && e.target === row) { e.preventDefault(); sim.select(on ? null : r.sel); } },
      },
        h("span", { class: "obj-ic" }, r.icon),
        h("span", { class: "grow" }, h("span", { class: "nm" }, r.name), h("small", {}, ` ${r.meta}`)),
        r.on ? h("input", { type: "checkbox", class: "switch", checked: r.on.value, "aria-label": `${r.name} on`, title: "On / off",
          onchange: (e: Event) => { sim.undo.begin("On / off"); r.on!.set((e.target as HTMLInputElement).checked); sim.undo.commit(); refresh(); } }) : null,
        h("button", { type: "button", class: "icon del", "aria-label": `Delete ${r.name}`, title: "Delete",
          onclick: () => { sim.select(r.sel); sim.selector.deleteSelection(); } }, "✕"));
      return row;
    }));
    list.querySelector<HTMLElement>(".row.sel")?.scrollIntoView({ block: "nearest" });
  };
  refresh();
  return { el, refresh };
}
