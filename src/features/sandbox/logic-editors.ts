// Wave Dude 2D web - editing the parts of a wave circuit in the inspector: an input switch (flip, press, its emitters
// and their phase, fan-out), a detector (its live reading, on and off levels, calibration) and a transistor.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import type { Tool } from "../../view/viewport";
import type { BitSwitch, Circuit, Detector, Transistor } from "../../circuits/circuit";
import { PRESS } from "../../circuits/builds";
import { addEmitterTo, addingTo } from "../../circuits/editor";
import { h, slider, check, segmented, textField } from "../../components";

/** Readings shown in the inspector are refreshed every frame through these. */
export type Live = (() => void)[];

export function switchEditor(sim: Sim, c: Circuit, s: BitSwitch, live: Live, pick: (t: Tool) => void, relist: () => void): HTMLElement {
  const flip = h("button", { type: "button", class: "lg-bit", "aria-label": `Flip input ${s.label}` });
  const show = () => { flip.textContent = `${s.label} = ${s.bit}`; flip.classList.toggle("on", s.bit === 1); };
  show();
  live.push(show);
  flip.addEventListener("click", () => { sim.release(); c.toggle(s.id); sim.running = true; show(); });
  return h("div", { class: "editor" },
    h("div", { class: "btns" }, flip,
      h("button", { type: "button", "data-help": `A short press: on for ${PRESS} steps, then off by itself (like the SET and RESET buttons of a latch).`,
        onclick: () => { sim.release(); c.pulse(s.id, PRESS); sim.running = true; } }, "Press")),
    textField({ label: "Name", value: s.label, onChange: v => { s.label = v || s.label; c.drawLabels(); relist(); } }),
    h("p", { class: "hint" }, "Its emitters shine while the input is 1. Light from two emitters ", h("b", {}, "in phase"), " adds up; ",
      h("b", {}, "180° apart"), " it cancels — that is how an XOR or a NOT works."),
    ...s.sources.map((src, k) => h("div", { class: "row lg-em" }, h("span", { class: "grow" }, `Emitter ${k + 1} (${src.x}, ${src.y})`),
      segmented({ options: [["0", "0°"], ["180", "180°"]], value: Math.abs(src.phaseDeg) >= 90 ? "180" : "0", small: true,
        onChange: v => { sim.undo.begin("Emitter phase"); src.phaseDeg = +v; sim.refreshSources(); sim.undo.commit(); } }))),
    h("button", { type: "button", class: `small ${addingTo() === s.id ? "on" : ""}`, "data-help": "Fan-out: one input feeding several gates. Then click where the extra emitter goes.",
      onclick: () => { addEmitterTo(s.id); pick("bit"); } }, "＋ Add an emitter (fan-out)"));
}

/** A detector's reading as a bar, with dashes at its off and on levels (positions as CSS variables). */
export function meter(d: Detector, live: Live): HTMLElement {
  const fill = h("span", { class: "meter-fill" }), lo = h("span", { class: "meter-mark lo" }), hi = h("span", { class: "meter-mark hi" });
  const m = h("span", { class: "meter", title: "What it sees, in units of one standard “1” (dashes: the off and on levels)" }, fill, lo, hi);
  const show = () => {
    const max = Math.max(5, d.hi * 2), pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100)).toFixed(1)}%`;
    m.style.setProperty("--v", pct(d.value));
    m.style.setProperty("--lo", pct(d.lo));
    m.style.setProperty("--hi", pct(d.hi));
  };
  show();
  live.push(show);
  return m;
}

/** A lamp: lit while the detector reads 1. */
export function led(d: Detector, live: Live): HTMLElement {
  const el = h("span", { class: "led", "aria-hidden": "true" });
  const show = () => el.classList.toggle("on", d.bit === 1);
  show();
  live.push(show);
  return el;
}

export function detectorEditor(sim: Sim, c: Circuit, d: Detector, live: Live, relist: () => void): HTMLElement {
  const val = h("span", { class: "lg-val" });
  live.push(() => { val.textContent = d.value.toFixed(2); });
  const a = d.areas[0], used = c.transistors.filter(t => t.input === d).map(t => t.label);
  const change = (f: () => void) => { sim.undo.touch("Change detector"); f(); };
  return h("div", { class: "editor" },
    h("div", { class: "row lg-reading" }, led(d, live), meter(d, live), val),
    used.length ? h("p", { class: "muted small" }, `The eye of transistor ${used.join(", ")}.`) : null,
    textField({ label: "Name", value: d.label, onChange: v => { d.label = v; c.drawLabels(); relist(); } }),
    check({ label: "Show as a lamp on the picture", value: d.led, onChange: v => { d.led = v; c.drawLabels(); } }),
    slider({ label: "On above", min: 0.05, max: 6, step: 0.05, value: d.hi, format: v => v.toFixed(2),
      help: "It switches on when it sees more than this, in units of one standard “1”. Two inputs in phase give 4 (amplitudes add: 2² = 4), so an AND switches between 1 and 4.",
      onInput: v => change(() => { d.hi = v; if (d.lo > v) d.lo = v; }) }),
    slider({ label: "Off below", min: 0.05, max: 6, step: 0.05, value: d.lo, format: v => v.toFixed(2),
      help: "It switches off when it sees less than this. The gap between the two levels (hysteresis) keeps it from flickering.",
      onInput: v => change(() => { d.lo = Math.min(v, d.hi); }) }),
    h("div", { class: "btns" },
      h("button", { type: "button", class: "small", "data-help": "Makes what it sees right now one unit: switch one input on, wait until the light has arrived, then press.",
        onclick: () => { if (d.value > 0.01) { sim.undo.begin("Calibrate"); d.unit *= d.value; d.value = 1; sim.undo.commit(); relist(); } } }, "Calibrate: now = 1"),
      a ? h("span", { class: "muted small" }, `area ${a.w} × ${a.h} at (${a.x}, ${a.y})`) : null));
}

export function transistorEditor(sim: Sim, c: Circuit, t: Transistor, live: Live, relist: () => void): HTMLElement {
  const st = h("span", { class: "lg-tr" });
  const show = () => { st.textContent = t.on ? "▶ shining" : "▷ dark"; st.classList.toggle("on", t.on); };
  show();
  live.push(show);
  return h("div", { class: "editor" },
    h("div", { class: "row" }, st, h("span", { class: "muted small" }, ` looks at ${t.input.label || t.input.id}`)),
    textField({ label: "Name", value: t.label, onChange: v => { t.label = v || t.label; c.drawLabels(); relist(); } }),
    check({ label: "Inverted: shines while its detector is dark (a NOT)", value: t.invert,
      help: "Two inverted transistors that look at each other's light make a memory cell: each keeps the other off.",
      onChange: v => { sim.undo.begin("Invert"); t.invert = v; c.update(); sim.undo.commit(); relist(); } }),
    check({ label: "Show the control line", value: !!t.wires, onChange: v => { t.wires = v; c.drawLabels(); } }),
    h("p", { class: "hint" }, "It does what a transistor does in a chip: it decides (a sharp 0 or 1), restores a weak signal to full strength, and — wired in a loop — remembers."));
}
