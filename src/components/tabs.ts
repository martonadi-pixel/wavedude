// Wave Dude 2D web - tabs: a row of buttons, one panel shown at a time (remembered in this browser).
// GPL-3.0-or-later.

import { h } from "./h";
import { loadPref, savePref } from "./prefs";

export interface TabSpec { id: string; label: string; badge?: () => string; render: () => Node }

/**
 * Tabs whose panels are drawn when shown (so they are always up to date). `key` remembers the open tab. Returns the
 * element and a function that redraws the open panel.
 */
export function tabs(key: string, list: TabSpec[], first?: string): { el: HTMLElement; refresh: () => void; labels: () => void; show: (id: string) => void; current: () => string } {
  let open = loadPref<string>(`tab.${key}`, first ?? list[0].id);
  if (!list.some(t => t.id === open)) open = list[0].id;
  const bar = h("div", { class: "tabs", role: "tablist" });
  const body = h("div", { class: "tab-body", role: "tabpanel" });
  const buttons = list.map(t => h("button", { type: "button", role: "tab", class: "tab", "data-tab": t.id, onclick: () => show(t.id) }));
  bar.append(...buttons);
  bar.addEventListener("keydown", e => {
    const i = list.findIndex(t => t.id === open);
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const n = list[(i + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length];
    show(n.id);
    buttons[list.indexOf(n)].focus();
  });
  const labels = () => list.forEach((t, i) => {
    const b = buttons[i], on = t.id === open, badge = t.badge?.() ?? "";
    b.replaceChildren(t.label, badge ? h("span", { class: "badge-n" }, badge) : "");
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  const refresh = () => { labels(); body.replaceChildren(list.find(t => t.id === open)!.render()); };
  const show = (id: string) => { open = id; savePref(`tab.${key}`, id); refresh(); };
  refresh();
  return { el: h("div", { class: "tabbed" }, bar, body), refresh, labels, show, current: () => open };
}
