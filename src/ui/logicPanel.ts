// Wave Dude 2D web - the sandbox's Logic section: tools to build wave circuits (light guides, inputs, detectors,
// transistors), ready-made circuits, and the list of the circuit's parts with live readings.
// GPL-3.0-or-later.

import type { Sim } from "../sim";
import type { SourceSpec } from "../engine/sources";
import type { Tool } from "../view/viewport";
import { newSceneInfo } from "../project/project";
import type { BitSwitch, Circuit, Detector, Transistor } from "../logic/circuit";
import { buildGate, buildHalfAdder, buildFullAdder, buildTransistor, buildLatch, buildRegister, PRESS } from "../logic/builds";
import { logicTemplate, logicSelected, selectPart, addEmitterTo, addingTo, type LogicTool } from "../logic/editor";
import { h, help, slider, check, segmented, fold } from "./dom";
import type { Shell } from "./shell";

const PRESETS: { id: string; label: string; build: (sim: Sim) => void }[] = [
  { id: "andor", label: "OR and AND gate", build: sim => buildGate(sim, "andor") },
  { id: "xor", label: "XOR gate", build: sim => buildGate(sim, "xor") },
  { id: "not", label: "NOT gate", build: sim => buildGate(sim, "not") },
  { id: "half", label: "Half adder (1 + 1 = 10)", build: sim => buildHalfAdder(sim) },
  { id: "full", label: "Full adder (with transistors)", build: sim => buildFullAdder(sim) },
  { id: "tr", label: "Wave transistor", build: sim => buildTransistor(sim, 100, false) },
  { id: "inv", label: "Inverting transistor (NOT)", build: sim => buildTransistor(sim, 100, true) },
  { id: "latch", label: "One bit of memory (SR latch)", build: sim => buildLatch(sim) },
  { id: "reg", label: "4-bit register", build: sim => buildRegister(sim, 4) },
];
let preset = "andor";

const TOOL_PICKS: [LogicTool, string, string][] = [
  ["guide", "⟿ Light guide", "Drag to draw a glass light guide. Light stays inside it (total internal reflection). Ends in empty space soak up the light; an end on another guide joins it — two guides meeting make a combiner."],
  ["bit", "⏻ Input", "Click on a guide: an input switch (an emitter that shines while the input is 1). Click it again to flip it."],
  ["detector", "💡 Detector", "Click on a guide: a detector with a lamp. It lights up above its “on” level and goes dark below its “off” level."],
  ["transistor", "⚡ Transistor", "A light switched by light: click where it looks (a detector, new or existing), then where it shines."],
];

const fmtSettle = (v: number) => (v <= 0 ? "off" : `${v.toLocaleString()} steps`);

/**
 * The Logic section. `rerender` draws the whole panel again; the returned `relist` draws just the parts list (the
 * sandbox calls it whenever the simulation reports a change).
 */
export function logicSection(shell: Shell, rerender: () => void): { section: HTMLElement; relist: () => void } {
  const { sim } = shell;
  const listBox = h("div", { class: "list logic-list" });
  // readings shown in the list, updated every frame without drawing the list again
  let live: (() => void)[] = [];

  const removeSources = (gone: SourceSpec[]) => sim.removeSources(gone);

  function relist(): void {
    live = [];
    const c = sim.logic;
    if (!c || c.empty) {
      listBox.replaceChildren(h("p", { class: "empty" }, "No circuit yet. Load a ready-made one above, or draw a ", h("b", {}, "⟿ Light guide"),
        ", put an ", h("b", {}, "⏻ Input"), " at its start and a ", h("b", {}, "💡 Detector"), " at its end."));
      return;
    }
    const items: HTMLElement[] = [];
    if (c.switches.length) items.push(h("div", { class: "eyebrow lg-head" }, "Inputs"));
    for (const s of c.switches) items.push(switchItem(c, s));
    const lamps = c.detectors;
    if (lamps.length) items.push(h("div", { class: "eyebrow lg-head" }, "Detectors"));
    for (const d of lamps) items.push(detectorItem(c, d));
    if (c.transistors.length) items.push(h("div", { class: "eyebrow lg-head" }, "Transistors"));
    for (const t of c.transistors) items.push(transistorItem(c, t));
    listBox.replaceChildren(...items);
  }

  const item = (id: string, row: HTMLElement, editor: () => (Node | null)[]) => {
    const sel = logicSelected === id;
    row.classList.toggle("sel", sel);
    row.addEventListener("click", e => {
      if ((e.target as HTMLElement).closest("button, input, select")) return;
      selectPart(sel ? null : id);
      relist();
    });
    return h("div", { class: `src-item ${sel ? "sel" : ""}` }, row, sel ? h("div", { class: "editor" }, ...editor().filter((x): x is Node => !!x)) : null);
  };

  const nameField = (value: string, set: (v: string) => void) => {
    const i = h("input", { type: "text", value, spellcheck: "false" });
    i.addEventListener("change", () => { set(i.value.trim()); sim.logic?.drawLabels(); relist(); });
    return h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Name")), i);
  };

  function switchItem(c: Circuit, s: BitSwitch): HTMLElement {
    const flip = h("button", { class: "lg-bit", title: "Flip this input", "aria-label": `Input ${s.label}` });
    const show = () => { flip.textContent = `${s.label} = ${s.bit}`; flip.classList.toggle("on", s.bit === 1); };
    show();
    live.push(show);
    flip.addEventListener("click", () => { sim.release(); c.toggle(s.id); sim.running = true; show(); });
    const row = h("div", { class: "row" },
      flip,
      h("span", { class: "grow" }, h("small", {}, `${s.sources.length} emitter${s.sources.length === 1 ? "" : "s"}`)),
      h("button", { class: "small", "data-help": `A short press: on for ${PRESS} steps, then off by itself (like the SET and RESET buttons of a latch).`,
        onclick: () => { sim.release(); c.pulse(s.id, PRESS); sim.running = true; } }, "Press"),
      h("button", { class: "icon del", title: "Delete", "aria-label": `Delete input ${s.label}`, onclick: () => { removeSources(c.remove(s)); sim.notify(); } }, "✕"));
    return item(s.id, row, () => [
      nameField(s.label, v => { s.label = v || s.label; }),
      h("p", { class: "hint" }, "Its emitters shine while the input is 1. Light from two emitters ", h("b", {}, "in phase"), " adds up; ",
        h("b", {}, "180° apart"), " it cancels — that is how an XOR or a NOT works."),
      ...s.sources.map((src, k) => h("div", { class: "row lg-em" }, h("span", { class: "grow" }, `Emitter ${k + 1} (${src.x}, ${src.y})`),
        segmented({ options: [["0", "0°"], ["180", "180°"]], value: Math.abs(src.phaseDeg) >= 90 ? "180" : "0", small: true,
          onChange: v => { src.phaseDeg = +v; sim.refreshSources(); } }))),
      h("button", { class: `small ${addingTo() === s.id ? "on" : ""}`, "data-help": "Fan-out: one input feeding several gates. Then click where the extra emitter goes.",
        onclick: () => { addEmitterTo(s.id); shell.selectTool("bit"); rerender(); } }, "＋ Add an emitter (fan-out)"),
    ]);
  }

  function detectorItem(c: Circuit, d: Detector): HTMLElement {
    const led = h("span", { class: "lg-led" });
    const bar = h("span", { class: "lg-fill" });
    const val = h("small", { class: "lg-val" });
    const max = () => Math.max(5, d.hi * 2);
    const marks = () => [h("span", { class: "lg-mark lo", style: `left:${(d.lo / max()) * 100}%` }), h("span", { class: "lg-mark hi", style: `left:${(d.hi / max()) * 100}%` })];
    const meter = h("span", { class: "lg-meter", title: "What it sees, in units of one standard “1” (dashes: the off and on levels)" }, bar, ...marks());
    const show = () => {
      led.classList.toggle("on", d.bit === 1);
      bar.style.width = `${Math.min(100, (d.value / max()) * 100)}%`;
      val.textContent = d.value.toFixed(2);
    };
    show();
    live.push(show);
    const used = c.transistors.filter(t => t.input === d).map(t => t.label);
    const row = h("div", { class: "row" }, led,
      h("span", { class: "nm" }, d.label || (used.length ? `${used.join(", ")}'s eye` : d.id)),
      h("span", { class: "grow lg-mid" }, meter), val,
      h("button", { class: "icon del", title: used.length ? `Delete (and the transistor${used.length > 1 ? "s" : ""} ${used.join(", ")} it switches)` : "Delete", "aria-label": `Delete detector ${d.label || d.id}`,
        onclick: () => { removeSources(c.remove(d)); sim.notify(); } }, "✕"));
    return item(d.id, row, () => {
      const a = d.areas[0];
      return [
        nameField(d.label, v => { d.label = v; }),
        check({ label: "Show as a lamp on the picture", value: d.led, onChange: v => { d.led = v; c.drawLabels(); } }),
        slider({ label: "On above", min: 0.05, max: 6, step: 0.05, value: d.hi, format: v => `${v.toFixed(2)}`,
          help: "It switches on when it sees more than this, in units of one standard “1”. Two inputs in phase give 4 (amplitudes add: 2² = 4), so an AND switches between 1 and 4.",
          onInput: v => { d.hi = v; if (d.lo > v) d.lo = v; }, onChange: () => relist() }),
        slider({ label: "Off below", min: 0.05, max: 6, step: 0.05, value: d.lo, format: v => `${v.toFixed(2)}`,
          help: "It switches off when it sees less than this. The gap between the two levels (hysteresis) keeps it from flickering.",
          onInput: v => { d.lo = Math.min(v, d.hi); }, onChange: () => relist() }),
        h("div", { class: "btns" },
          h("button", { class: "small", "data-help": "Makes what it sees right now one unit: switch one input on, wait until the light has arrived, then press.",
            onclick: () => { if (d.value > 0.01) { d.unit *= d.value; d.value = 1; relist(); } } }, "Calibrate: now = 1"),
          a ? h("span", { class: "muted small" }, `area ${a.w} × ${a.h} at (${a.x}, ${a.y})`) : null),
      ];
    });
  }

  function transistorItem(c: Circuit, t: Transistor): HTMLElement {
    const st = h("span", { class: "lg-tr" });
    const show = () => { st.textContent = t.on ? "▶ on" : "▷ off"; st.classList.toggle("on", t.on); };
    show();
    live.push(show);
    const row = h("div", { class: "row" }, st, h("span", { class: "nm" }, t.label),
      h("span", { class: "grow" }, h("small", {}, ` ${t.invert ? "dark" : "light"} at ${t.input.label || t.input.id} → shines`)),
      h("button", { class: "icon del", title: "Delete", "aria-label": `Delete transistor ${t.label}`, onclick: () => { removeSources(c.remove(t)); sim.notify(); } }, "✕"));
    return item(t.id, row, () => [
      nameField(t.label, v => { t.label = v || t.label; }),
      check({ label: "Inverted: shines while its detector is dark (a NOT)", value: t.invert,
        help: "Two inverted transistors that look at each other's light make a memory cell: each keeps the other off.",
        onChange: v => { t.invert = v; c.update(); relist(); } }),
      check({ label: "Show the control line", value: !!t.wires, onChange: v => { t.wires = v; c.drawLabels(); } }),
      h("p", { class: "hint" }, "It does what a transistor does in a chip: it decides (a sharp 0 or 1), restores a weak signal to full strength, and — wired in a loop — remembers."),
    ]);
  }

  const presetLoad = () => {
    const p = PRESETS.find(q => q.id === preset) ?? PRESETS[0];
    p.build(sim);
    sim.logic!.showBoxes = true;
    sim.logic!.drawLabels();
    sim.sceneInfo = { ...newSceneInfo(), mode: "image", dirty: true };
    // the brightness the computing experiments use (most inputs start off, so measuring would pick too bright)
    sim.brightness = { field: 12, intensity: 18 };
    sim.keepBrightness = true;
    sim.hold();
    shell.selectTool("pan");
    rerender();
  };

  const tool = sim.view.tool as Tool;
  const c = sim.logic;
  const section = fold({ id: "sbx-logic", title: "Logic: computing with light", icon: "⚡",
    summary: () => {
      const l = sim.logic;
      return l && !l.empty ? [l.switches.length && `${l.switches.length} in`, l.detectors.length && `${l.detectors.length} det`, l.transistors.length && `${l.transistors.length} tr`].filter(Boolean).join(" · ") : "gates, transistors, memory";
    } },
    h("p", { class: "hint" }, "Build a computer from waves: light guides carry the bits, waves add up or cancel, detectors and transistors decide. ",
      help("Light is 1, darkness is 0. Two waves that meet in phase add up (brighter), half a wave apart they cancel (dark). A detector turns “how much light” into a clean 0 or 1, and a transistor — a light switched by light — sends a result on at full strength or keeps a bit in memory.")),
    h("div", { class: "tool-picks" }, ...TOOL_PICKS.map(([t, label, hl]) =>
      h("button", { type: "button", class: `pick ${tool === t ? "on" : ""}`, "data-help": hl, onclick: () => { shell.selectTool(t); rerender(); } }, label))),
    fold({ id: "sbx-logic-tpl", title: "Settings for new parts", sub: true, open: false, class: "tpl",
      summary: () => `guide ${logicTemplate.guideWidth} cells · n ${logicTemplate.guideN.toFixed(2)}${logicTemplate.invert ? " · inverting" : ""}` },
      slider({ label: "Guide width", min: 3, max: 16, step: 1, value: logicTemplate.guideWidth, unit: " cells",
        help: "6 cells carry a single mode at frequency 60: only then do two inputs in anti-phase cancel cleanly. Wider guides carry several modes.", onInput: v => { logicTemplate.guideWidth = v; } }),
      slider({ label: "Guide refractive index", min: 1.2, max: 2.5, step: 0.05, value: logicTemplate.guideN, onInput: v => { logicTemplate.guideN = v; } }),
      check({ label: "Soak up the light at open ends", value: logicTemplate.absorbEnds, help: "A guide that just stops reflects light back towards the inputs; an absorbing end works like a photodiode at the end of a fibre.", onChange: v => { logicTemplate.absorbEnds = v; } }),
      segmented({ label: "Emitters and detectors", options: [["h", "↕ across ⟷ guides"], ["v", "↔ across ↕ guides"], ["point", "• point"]], value: logicTemplate.emitter,
        help: "Inputs and transistors shine across the guide you click on: a short line across a left-right guide, or across an up-down one.", onChange: v => { logicTemplate.emitter = v as typeof logicTemplate.emitter; } }),
      check({ label: "New transistors are inverted (NOT)", value: logicTemplate.invert, onChange: v => { logicTemplate.invert = v; } })),
    h("div", { class: "lg-preset" },
      h("select", { "aria-label": "Ready-made circuit", onchange: (e: Event) => { preset = (e.target as HTMLSelectElement).value; } },
        ...PRESETS.map(p => h("option", { value: p.id, selected: p.id === preset }, p.label))),
      h("button", { "data-help": "Replaces the scene with this circuit. Flip its inputs here or by clicking them on the picture.", onclick: presetLoad }, "Load circuit")),
    listBox,
    c && !c.empty ? slider({ label: "Fast-forward after a flip", min: 0, max: 4000, step: 100, value: c.settle, format: fmtSettle,
      help: "Light in a guide needs about 1100 steps for 400 cells. After you flip an input the simulation runs fast this many steps, then carries on at your speed.",
      onInput: v => { if (sim.logic) sim.logic.settle = v; } }) : null,
  );
  section.dataset.keywords = "logic gate transistor memory latch adder register bit computer guide fibre detector";

  const stop = sim.onFrame(() => {
    if (!section.isConnected) { stop(); return; }
    for (const f of live) f();
  });
  relist();
  return { section, relist };
}
