// Wave Dude 2D web - keyboard shortcuts: running, the view, tools (one key per group, pressed again for the group's
// next tool), and editing the selection (Delete, Esc, undo, redo, duplicate, arrow keys). "?" lists them.
// GPL-3.0-or-later.

import type { Sim } from "../sim/sim";
import type { Tool } from "../view/viewport";
import { isPaintTool } from "../sim/tools";
import { cancelLogicDraft } from "../circuits/editor";
import { h } from "../components";
import { GROUPS, TOOLS, TOOL_KEYS } from "./tools";

export interface KeyboardHost {
  sim: Sim;
  allowed: (t: Tool) => boolean;
  pick: (t: Tool) => void;
}

export const SHORTCUTS: [string, string][] = [
  ["Space", "Run / pause"], ["R", "Reset (clear the waves)"], ["F", "Fit the scene in view"], ["+ / −", "Zoom in / out"],
  ["A", "Automatic brightness"], ["O", "Outlines on / off"],
  ...GROUPS.map(g => [g.key.toUpperCase(), `${g.label}: ${g.tools.map(t => TOOLS[t].label).join(", ")} (again: the next one)`] as [string, string]),
  ["E", "Eraser"],
  ["Delete", "Delete the selected object"], ["Esc", "Cancel what you are placing · deselect · back to Select"],
  ["Ctrl+Z / Ctrl+Shift+Z", "Undo / redo"], ["Ctrl+D", "Duplicate the selected object"], ["Arrow keys", "Move the selected object (Shift: 10 cells)"],
  ["[ / ]", "Thinner / thicker brush"], ["?", "This list"],
];

export function installKeyboard(host: KeyboardHost): void {
  const { sim } = host;
  window.addEventListener("keydown", e => {
    const target = e.target as HTMLElement;
    if (target.closest("input, select, textarea, [contenteditable]")) return;
    const mod = e.ctrlKey || e.metaKey, key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    // editing
    if (mod && key === "z") { e.preventDefault(); if (e.shiftKey) sim.undo.redo(); else sim.undo.undo(); return; }
    if (mod && key === "y") { e.preventDefault(); sim.undo.redo(); return; }
    if (mod && key === "d") { e.preventDefault(); sim.selector.duplicate(); return; }
    if (mod) return;
    if (key === "Delete" || key === "Backspace") { if (sim.selector.deleteSelection()) e.preventDefault(); return; }
    if (key === "Escape") {
      if (sim.tools.cancel() || cancelLogicDraft()) return;
      if (sim.selection) { sim.select(null); return; }
      if (sim.view.tool !== "pan") host.pick("pan");
      return;
    }
    if (key.startsWith("Arrow") && sim.selection) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      sim.selector.nudge(key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0, key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0);
      return;
    }
    // running and the view
    if (key === " ") { e.preventDefault(); if (sim.running) sim.running = false; else sim.play(); return; }
    if (key === "r") return sim.reset();
    if (key === "f") return sim.view.fit();
    if (key === "+" || key === "=") return sim.view.zoomBy(1.4);
    if (key === "-") return sim.view.zoomBy(1 / 1.4);
    if (key === "a") return sim.autoExposure();
    if (key === "o") { sim.setOutlines(!sim.showOutlines); sim.notify(); return; }
    if (key === "?") return showShortcuts();
    if ((key === "[" || key === "]") && isPaintTool(sim.view.tool)) { sim.brush = Math.max(1, Math.min(60, sim.brush + (key === "]" ? 2 : -2))); return; }
    // tools
    for (const [t, k] of Object.entries(TOOL_KEYS)) if (k === key && host.allowed(t as Tool)) return host.pick(t as Tool);
    const g = GROUPS.find(q => q.key === key);
    if (!g) return;
    const tools = g.tools.filter(host.allowed);
    if (!tools.length) return;
    const i = tools.indexOf(sim.view.tool);
    host.pick(tools[i < 0 ? 0 : (i + 1) % tools.length]);
  });
}

/** The list of shortcuts, in a small dialog. */
function showShortcuts(): void {
  if (document.querySelector(".shortcuts")) return;
  const close = () => dlg.remove();
  const dlg = h("div", { class: "shortcuts", role: "dialog", "aria-modal": "true", "aria-label": "Keyboard shortcuts", onclick: (e: Event) => { if (e.target === dlg) close(); } },
    h("div", { class: "box" },
      h("h3", {}, "Keyboard shortcuts"),
      h("table", {}, ...SHORTCUTS.map(([k, v]) => h("tr", {}, h("td", {}, h("kbd", {}, k)), h("td", {}, v)))),
      h("button", { type: "button", class: "primary", onclick: close }, "Close")));
  dlg.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  document.body.append(dlg);
  dlg.querySelector<HTMLButtonElement>("button")?.focus();
}
