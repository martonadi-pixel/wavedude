// Wave Dude 2D web - Simple mode, for young explorers: the Sandbox offers a few tools (sources, walls, glass, the
// eraser, probes) and the panels and bars show only their main settings. Advanced controls carry the class "adv".
// GPL-3.0-or-later.

import type { Tool } from "../view/viewport";
import { h, isSimple, onSimpleChange, setSimple } from "../components";

export { isSimple, onSimpleChange };

/** The Sandbox's tools in Simple mode. */
export const SIMPLE_TOOLS: readonly Tool[] = ["pan", "source", "line", "barrier", "glass", "erase", "pointProbe"];

/** The switch in the header. */
export function simpleToggle(): HTMLElement {
  document.documentElement.classList.toggle("simple", isSimple());
  const b = h("button", { type: "button", class: "simple-toggle", "aria-pressed": String(isSimple()),
    "aria-label": "Simple mode", "data-help": "Simple mode: fewer tools and settings, for young explorers. Click again to see everything." },
    "🧸", h("span", { class: "bl" }, " Simple"));
  const sync = () => { b.classList.toggle("on", isSimple()); b.setAttribute("aria-pressed", String(isSimple())); };
  b.addEventListener("click", () => { setSimple(!isSimple()); });
  onSimpleChange(sync);
  sync();
  return b;
}
