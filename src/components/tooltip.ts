// Wave Dude 2D web - the shared tooltip for every [data-help] element (hover, tap or keyboard focus on a "?").
// GPL-3.0-or-later.

import { h } from "./h";

/** Installs the shared tooltip for every [data-help] element (and the side panel toggle in the header). */
export function installHelp(): void {
  const tip = h("div", { class: "tip", role: "tooltip", hidden: true });
  document.body.append(tip);
  let current: HTMLElement | null = null;
  const show = (el: HTMLElement) => {
    current = el;
    tip.textContent = el.dataset.help ?? "";
    tip.hidden = false;
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const x = Math.min(window.innerWidth - t.width - 8, Math.max(8, r.left + r.width / 2 - t.width / 2));
    const y = r.bottom + 6 + t.height > window.innerHeight ? r.top - t.height - 6 : r.bottom + 6;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };
  const hide = () => { current = null; tip.hidden = true; };
  document.addEventListener("mouseover", e => {
    const el = (e.target as HTMLElement).closest?.("[data-help]") as HTMLElement | null;
    if (el) show(el); else if (current) hide();
  });
  document.addEventListener("click", e => {
    const el = (e.target as HTMLElement).closest?.(".q") as HTMLElement | null;
    if (el) { e.preventDefault(); if (current === el) hide(); else show(el); }
  });
  // keyboard users get the same help on the "?" buttons
  document.addEventListener("focusin", e => {
    const el = (e.target as HTMLElement).closest?.(".q") as HTMLElement | null;
    if (el) show(el); else if (current) hide();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && current) hide(); });
  document.addEventListener("scroll", hide, true);
}
