// Wave Dude 2D web - Simple mode, for young explorers: the Sandbox offers a few tools (sources, walls, glass, the
// eraser, probes) and the panels and bars show only their main settings. Advanced controls carry the class "adv".
// GPL-3.0-or-later.

import type { Tool } from "../view/viewport";
import { h, loadPref, savePref } from "../components";

/** The Sandbox's tools in Simple mode. */
export const SIMPLE_TOOLS: readonly Tool[] = ["pan", "source", "line", "barrier", "glass", "erase", "pointProbe"];

let on = loadPref<boolean>("simple", false);
const listeners: (() => void)[] = [];

export const isSimple = (): boolean => on;

/** Called whenever Simple mode is switched (once per listener, for the life of the page). */
export function onSimpleChange(f: () => void): void { listeners.push(f); }

export function setSimple(v: boolean): void {
  on = v;
  savePref("simple", v);
  document.documentElement.classList.toggle("simple", v);
  for (const f of listeners) f();
}

/** The switch in the header. */
export function simpleToggle(): HTMLElement {
  document.documentElement.classList.toggle("simple", on);
  const b = h("button", { type: "button", class: "simple-toggle", "aria-pressed": String(on),
    "data-help": "Simple mode: fewer tools and settings, for young explorers. Click again to see everything." }, "🧸 Simple");
  const sync = () => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); };
  b.addEventListener("click", () => { setSimple(!on); });
  onSimpleChange(sync);
  sync();
  return b;
}
