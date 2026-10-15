// Wave Dude 2D web - the shared form controls: sliders, selects, checkboxes, number and text fields, segmented buttons, X/Y pairs.
// GPL-3.0-or-later.

import { h } from "./h";

/** A "?" that explains a control: hover (or tap) shows the text. */
export function help(text: string): HTMLElement {
  return h("button", { class: "q", type: "button", "data-help": text, "aria-label": "Help: " + text }, "?");
}

/** Shows how far along its range a slider is (the filled part of the track). */
function fill(input: HTMLInputElement): void {
  const min = +input.min || 0, max = +input.max || 100;
  input.style.setProperty("--p", `${max > min ? ((+input.value - min) / (max - min)) * 100 : 0}%`);
}

/** A labelled slider with a value readout. */
export function slider(o: {
  label: string; min: number; max: number; step: number; value: number; unit?: string; help?: string;
  format?: (v: number) => string; onInput: (v: number) => void; onChange?: (v: number) => void;
}): HTMLElement {
  const fmt = o.format ?? ((v: number) => `${+v.toFixed(3)}${o.unit ?? ""}`);
  const out = h("output", { class: "val" }, fmt(o.value));
  const input = h("input", { type: "range", min: o.min, max: o.max, step: o.step, value: o.value });
  fill(input);
  input.addEventListener("input", () => { out.textContent = fmt(+input.value); fill(input); o.onInput(+input.value); });
  if (o.onChange) input.addEventListener("change", () => o.onChange!(+input.value));
  return h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, o.label), o.help ? help(o.help) : null, out), input);
}

export function select(o: { label: string; options: [string, string][]; value: string; help?: string; onChange: (v: string) => void }): HTMLElement {
  const s = h("select", {});
  for (const [v, t] of o.options) s.append(h("option", { value: v, selected: v === o.value }, t));
  s.addEventListener("change", () => o.onChange(s.value));
  return h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, o.label), o.help ? help(o.help) : null), s);
}

export function check(o: { label: string; value: boolean; help?: string; onChange: (v: boolean) => void }): HTMLElement {
  const c = h("input", { type: "checkbox", checked: o.value });
  c.addEventListener("change", () => o.onChange(c.checked));
  return h("label", { class: "check" }, c, h("span", {}, o.label), o.help ? help(o.help) : null);
}

export function numberInput(o: { label: string; value: number; min?: number; max?: number; step?: number; help?: string; onChange: (v: number) => void }): HTMLElement {
  const i = h("input", { type: "number", value: o.value, min: o.min, max: o.max, step: o.step ?? 1 });
  i.addEventListener("change", () => { if (i.value !== "" && Number.isFinite(+i.value)) o.onChange(+i.value); });
  return h("label", { class: "field num" }, h("span", { class: "lbl" }, h("span", { class: "t" }, o.label), o.help ? help(o.help) : null), i);
}

/** A row of buttons of which one is on (a radio group), e.g. Continuous | Pulsed. */
export function segmented(o: { label?: string; options: [string, string][]; value: string; help?: string; small?: boolean; onChange: (v: string) => void }): HTMLElement {
  const group = h("div", { class: `segctl${o.small ? " small" : ""}`, role: "radiogroup", "aria-label": o.label ?? "" });
  const buttons = o.options.map(([v, t]) => h("button", {
    type: "button", role: "radio", "aria-checked": v === o.value ? "true" : "false", class: v === o.value ? "on" : "", "data-value": v,
    onclick: () => {
      for (const b of buttons) { const on = b.dataset.value === v; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(on)); }
      o.onChange(v);
    },
  }, t));
  group.append(...buttons);
  // arrow keys move along the group, as in a radio group
  group.addEventListener("keydown", e => {
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0 || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    const b = buttons[(i + (e.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length];
    b.focus(); b.click();
  });
  if (!o.label) return group;
  return h("div", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, o.label), o.help ? help(o.help) : null), group);
}


/** A labelled text field (a name). */
export function textField(o: { label: string; value: string; placeholder?: string; help?: string; onChange: (v: string) => void }): HTMLElement {
  const i = h("input", { type: "text", value: o.value, placeholder: o.placeholder, spellcheck: "false" });
  i.addEventListener("change", () => o.onChange(i.value.trim()));
  return h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, o.label), o.help ? help(o.help) : null), i);
}

/** Two number fields side by side (a position). */
export function xyFields(o: { labels?: [string, string]; x: number; y: number; onChange: (x: number, y: number) => void }): HTMLElement {
  const [lx, ly] = o.labels ?? ["X", "Y"];
  let x = o.x, y = o.y;
  return h("div", { class: "grid2" },
    numberInput({ label: lx, value: Math.round(x), onChange: v => { x = v; o.onChange(x, y); } }),
    numberInput({ label: ly, value: Math.round(y), onChange: v => { y = v; o.onChange(x, y); } }));
}
