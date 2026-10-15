// Wave Dude 2D web - the tool rail beside the picture: one button per group of tools (select, measure, sources, draw,
// optics, probes, logic). A group shows the tool used last; when it has several, a click on the active group (or on
// its small arrow) opens a flyout with all of them.
// GPL-3.0-or-later.

import type { Tool } from "../view/viewport";
import { h } from "../components";
import { GROUPS, TOOLS, TOOL_KEYS, type ToolGroup } from "./tools";

export class Rail {
  readonly el: HTMLElement;
  /** The tool each group shows (the one used last). */
  private shown = new Map<string, Tool>();
  private flyout: HTMLElement | null = null;
  private allowed: Tool[] = [];

  constructor(private current: () => Tool, private pick: (t: Tool) => void) {
    this.el = h("nav", { id: "rail", class: "rail", "aria-label": "Tools" });
    document.addEventListener("pointerdown", e => { if (this.flyout && !(e.target as HTMLElement).closest(".rail-flyout, .rail-btn")) this.close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && this.flyout) { this.close(); e.stopPropagation(); } }, true);
  }

  /** The tools on offer (the select tool and the measuring tools are always there). */
  setAllowed(tools: Tool[]): void {
    this.allowed = ["pan", "ruler", "protractor", ...tools.filter(t => t !== "pan" && t !== "ruler" && t !== "protractor")];
    this.render();
  }

  isAllowed(t: Tool): boolean { return this.allowed.includes(t); }

  groups(): { g: ToolGroup; tools: Tool[] }[] {
    return GROUPS.map(g => ({ g, tools: g.tools.filter(t => this.allowed.includes(t)) })).filter(x => x.tools.length);
  }

  render(): void {
    this.close();
    const cur = this.current();
    this.el.replaceChildren(...this.groups().map(({ g, tools }) => {
      if (tools.includes(cur)) this.shown.set(g.id, cur);
      const t = this.shown.get(g.id) && tools.includes(this.shown.get(g.id)!) ? this.shown.get(g.id)! : tools[0];
      const on = tools.includes(cur), info = TOOLS[t], more = tools.length > 1;
      const btn = h("button", {
        type: "button", class: `rail-btn${on ? " on" : ""}`, "aria-pressed": String(on), "aria-label": `${g.label}: ${info.label}`,
        "data-help": `${info.label} (${g.key.toUpperCase()}): ${info.help}`,
        onclick: () => { if (on && more) this.open(g, tools, btn); else this.pick(t); },
      }, h("span", { class: "ic", "aria-hidden": "true" }, info.icon), h("span", { class: "rl" }, g.label),
        more ? h("span", { class: "more", "aria-hidden": "true", onclick: (e: Event) => { e.stopPropagation(); this.open(g, tools, btn); } }) : null);
      return btn;
    }));
  }

  private open(g: ToolGroup, tools: Tool[], at: HTMLElement): void {
    this.close();
    const cur = this.current();
    const fly = h("div", { class: "rail-flyout", role: "menu", "aria-label": g.label },
      h("div", { class: "eyebrow" }, g.label),
      ...tools.map(t => h("button", {
        type: "button", role: "menuitemradio", "aria-checked": String(t === cur), class: t === cur ? "on" : "",
        "data-help": TOOLS[t].help, onclick: () => { this.close(); this.pick(t); },
      }, h("span", { class: "ic", "aria-hidden": "true" }, TOOLS[t].icon), h("span", { class: "tl" }, TOOLS[t].label),
        h("kbd", {}, (TOOL_KEYS[t] ?? g.key).toUpperCase()))));
    const r = at.getBoundingClientRect(), host = this.el.getBoundingClientRect();
    fly.style.setProperty("--top", `${r.top - host.top}px`);
    this.el.append(fly);
    this.flyout = fly;
    (fly.querySelector("button.on") as HTMLElement ?? fly.querySelector("button"))?.focus();
  }

  close(): void { this.flyout?.remove(); this.flyout = null; }
}
