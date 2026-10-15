// Wave Dude 2D web - the bar above the picture with the settings of the active tool (what the next thing drawn or
// placed will be like). Painting is the same everywhere; pages add their own (sources, optics, logic in the Sandbox).
// GPL-3.0-or-later.

import type { Sim } from "../sim/sim";
import type { Tool } from "../view/viewport";
import { isPaintTool } from "../sim/tools";
import { h, adv, slider, segmented } from "../components";
import { TOOLS } from "./tools";

export type OptionsRenderer = (tool: Tool) => Node | Node[] | null;

export class ToolOptions {
  readonly el: HTMLElement;
  private extra: OptionsRenderer | null = null;
  private shownFor: Tool | null = null;

  constructor(private sim: Sim) {
    this.el = h("div", { id: "tool-options", class: "tool-options", role: "toolbar", "aria-label": "Settings of the active tool" });
  }

  /** Options a page adds for its tools (null: none). */
  setRenderer(fn: OptionsRenderer | null): void { this.extra = fn; this.render(true); }

  /** Draws the bar for the active tool (again only when the tool changed, unless forced). */
  render(force = false): void {
    const tool = this.sim.view.tool;
    if (!force && tool === this.shownFor) return;
    this.shownFor = tool;
    const extra = this.extra?.(tool);
    const parts = [...this.builtin(tool), ...(extra ? (Array.isArray(extra) ? extra : [extra]) : [])];
    // always there (so the picture does not jump when the tool changes): the tool, then its settings or what it does
    this.el.hidden = false;
    this.el.replaceChildren(h("span", { class: "opt-tool" }, h("span", { class: "ic", "aria-hidden": "true" }, TOOLS[tool].icon), TOOLS[tool].label),
      ...(parts.length ? parts : [h("span", { class: "opt-hint" }, TOOLS[tool].hint)]));
  }

  private builtin(tool: Tool): Node[] {
    const sim = this.sim;
    if (!isPaintTool(tool)) return [];
    const thick = slider({ label: "Thickness", min: 1, max: 60, step: 1, value: sim.brush, format: v => `${2 * v} cells`,
      help: tool === "absorber" ? "Absorbers soak up waves gradually from their edge inwards, so they need to be thick (40+ cells): a thin one lets part of the wave through." : "How wide a stroke, a line or a box's outline is.",
      onInput: v => { sim.brush = v; } });
    return [
      segmented({ options: [["free", "✎ Freehand"], ["line", "╱ Line"], ["box", "▭ Box"], ["filledBox", "■ Filled"]], value: sim.paintShape, small: true,
        help: "Freehand paints as you drag. Line, Box and Filled make an object you can select, move and delete later (drag from one end or corner to the other; lines snap to straight and 45°).",
        onChange: v => { sim.paintShape = v as typeof sim.paintShape; } }),
      thick,
      tool === "glass" ? adv(slider({ label: "Refractive index", min: 1.05, max: 2.55, step: 0.05, value: sim.glassIndex, format: v => `n ${v.toFixed(2)}`,
        help: "How many times slower waves travel in the glass.", onInput: v => { sim.glassIndex = v; } })) : null,
    ].filter((x): x is HTMLElement => !!x);
  }
}
