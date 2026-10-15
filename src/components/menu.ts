// Wave Dude 2D web - a small menu that opens under a button (Open ▾) or at the pointer (right-click).
// GPL-3.0-or-later.

import { h } from "./h";

export interface MenuItem { label: string; help?: string; disabled?: boolean; run: () => void }

let openMenu: HTMLElement | null = null;

export function closeMenu(): void { openMenu?.remove(); openMenu = null; }

/** Opens a menu at (x, y) in the page (it stays on screen). */
export function showMenu(items: (MenuItem | "-")[], x: number, y: number, label = "Menu"): void {
  closeMenu();
  const m = h("div", { class: "menu", role: "menu", "aria-label": label },
    ...items.map(it => it === "-" ? h("hr", {}) : h("button", { type: "button", role: "menuitem", disabled: it.disabled, "data-help": it.help,
      onclick: () => { closeMenu(); it.run(); } }, it.label)));
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.setProperty("--x", `${Math.max(4, Math.min(window.innerWidth - r.width - 4, x))}px`);
  m.style.setProperty("--y", `${Math.max(4, Math.min(window.innerHeight - r.height - 4, y))}px`);
  openMenu = m;
  m.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
  m.addEventListener("keydown", e => {
    const bs = [...m.querySelectorAll<HTMLButtonElement>("button:not([disabled])")], i = bs.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") { e.stopPropagation(); closeMenu(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); bs[(i + 1) % bs.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); bs[(i + bs.length - 1) % bs.length]?.focus(); }
  });
}

/** A button that opens a menu under itself. */
export function menuButton(label: string, items: () => (MenuItem | "-")[], attrs: Record<string, string> = {}): HTMLButtonElement {
  const b = h("button", { type: "button", "aria-haspopup": "menu", ...attrs }, label);
  b.addEventListener("click", e => { e.stopPropagation(); const r = b.getBoundingClientRect(); showMenu(items(), r.left, r.bottom + 4, label); });
  return b;
}

document.addEventListener("pointerdown", e => { if (openMenu && !(e.target as HTMLElement).closest(".menu")) closeMenu(); });
window.addEventListener("blur", closeMenu);

let openPop: HTMLElement | null = null;

/** A panel that opens under a button (more settings); a click outside or Esc closes it. */
export function showPopover(anchor: HTMLElement, content: Node, label: string): void {
  openPop?.remove();
  const pop = h("div", { class: "popover", role: "dialog", "aria-label": label }, h("div", { class: "eyebrow" }, label), content);
  document.body.append(pop);
  const r = anchor.getBoundingClientRect(), pr = pop.getBoundingClientRect();
  pop.style.setProperty("--x", `${Math.max(8, Math.min(window.innerWidth - pr.width - 8, r.left))}px`);
  pop.style.setProperty("--y", `${Math.max(8, Math.min(window.innerHeight - pr.height - 8, r.bottom + 6))}px`);
  openPop = pop;
  const close = (e: Event) => { if (!(e.target as HTMLElement).closest(".popover") && e.target !== anchor) { pop.remove(); openPop = null; document.removeEventListener("pointerdown", close); } };
  setTimeout(() => document.addEventListener("pointerdown", close));
  pop.addEventListener("keydown", e => { if (e.key === "Escape") { pop.remove(); openPop = null; anchor.focus(); } });
}
