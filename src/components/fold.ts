// Wave Dude 2D web - collapsible sections (remembered open or closed), their one-line summaries, and filtering them by a search.
// GPL-3.0-or-later.

import { h, nextId, type Child } from "./h";
import { loadPref, savePref } from "./prefs";

const summaries = new WeakMap<HTMLElement, () => string>();

/**
 * A collapsible section: a header button (icon, title, a one-line summary, chevron) and a body.
 * Its open/closed state is remembered in this browser under `id`.
 * `sub` makes the small variant used inside a section ("More options").
 */
export function fold(o: {
  id: string; title: string; icon?: string; summary?: string | (() => string); open?: boolean; sub?: boolean; class?: string;
  /** Extra words the "find a setting" box matches. */
  keywords?: string;
  /** Called after the user opened or closed it. */
  onToggle?: (open: boolean) => void;
}, ...children: Child[]): HTMLElement {
  const bodyId = nextId("fold");
  const btnId = bodyId + "-h";
  let open = loadPref<boolean>("fold." + o.id, o.open ?? true);
  const sum = h("span", { class: "sum" });
  const btn = h("button", { type: "button", class: "fold-h", id: btnId, "aria-controls": bodyId, "aria-expanded": String(open) },
    o.icon ? h("span", { class: "fic", "aria-hidden": "true" }, o.icon) : null,
    h("span", { class: "ft" }, o.title), sum, h("span", { class: "chev", "aria-hidden": "true" }));
  const body = h("div", { class: "fold-b", id: bodyId, role: "region", "aria-labelledby": btnId }, ...children);
  const sec = h("section", { class: `fold ${o.sub ? "sub" : "sec box"} ${o.class ?? ""}`, "data-fold": o.id, "data-keywords": o.keywords },
    o.sub ? btn : h("h3", { class: "fold-t" }, btn), body);
  const apply = () => {
    btn.setAttribute("aria-expanded", String(open));
    sec.classList.toggle("open", open);
    body.hidden = !open;
  };
  btn.addEventListener("click", () => { open = !open; savePref("fold." + o.id, open); apply(); o.onToggle?.(open); });
  if (o.summary !== undefined) summaries.set(sec, typeof o.summary === "function" ? o.summary : () => o.summary as string);
  apply();
  refreshSummaries(sec);
  return sec;
}

/** Opens or closes a section made by fold() (and remembers it). */
export function setFold(sec: HTMLElement, open: boolean): void {
  const btn = sec.querySelector<HTMLButtonElement>(":scope > .fold-h, :scope > .fold-t > .fold-h");
  if (btn && (btn.getAttribute("aria-expanded") === "true") !== open) btn.click();
}

/** Recomputes the one-line summaries of the sections in (and including) `root`. */
export function refreshSummaries(root: HTMLElement): void {
  const list = [root, ...root.querySelectorAll<HTMLElement>(".fold")];
  for (const sec of list) {
    const f = summaries.get(sec);
    if (!f) continue;
    const el = sec.querySelector(":scope > .fold-h > .sum, :scope > .fold-t > .fold-h > .sum");
    if (el) { const t = f(); if (el.textContent !== t) el.textContent = t; }
  }
}

/**
 * Shows only the controls whose label (or help text) contains `query`; sections without a match are hidden and
 * sections with one are shown open (without changing their remembered state). An empty query shows everything again.
 * Returns the number of matching controls.
 */
export function filterFolds(root: HTMLElement, query: string): number {
  const q = query.trim().toLowerCase();
  let hits = 0;
  root.querySelectorAll(".hit, .hit-path").forEach(e => e.classList.remove("hit", "hit-path"));
  for (const sec of root.querySelectorAll<HTMLElement>(".fold.box")) {
    const body = sec.querySelector<HTMLElement>(":scope > .fold-b")!;
    const btn = sec.querySelector<HTMLElement>(".fold-h")!;
    if (!q) {
      sec.hidden = false;
      body.classList.remove("filtering");
      body.hidden = btn.getAttribute("aria-expanded") !== "true";
      sec.querySelectorAll<HTMLElement>(".fold.sub").forEach(s => {
        s.querySelector<HTMLElement>(":scope > .fold-b")!.hidden = s.querySelector(".fold-h")!.getAttribute("aria-expanded") !== "true";
      });
      continue;
    }
    const titleHit = (btn.querySelector(".ft")?.textContent ?? "").toLowerCase().includes(q) || (sec.dataset.keywords ?? "").includes(q);
    let n = 0;
    if (!titleHit) {
      for (const item of body.querySelectorAll<HTMLElement>(".field, .check, .filter-item")) {
        const text = (item.querySelector(".lbl, :scope > span")?.textContent ?? item.textContent ?? "") + " " +
          [...item.querySelectorAll<HTMLElement>("[data-help]")].map(x => x.dataset.help).join(" ");
        if (!text.toLowerCase().includes(q)) continue;
        n++;
        item.classList.add("hit");
        for (let e = item.parentElement; e && e !== body; e = e.parentElement) e.classList.add("hit-path");
      }
    }
    hits += titleHit ? 1 : n;
    sec.hidden = !titleHit && n === 0;
    body.classList.toggle("filtering", !titleHit);
    body.hidden = sec.hidden;
    // reveal matches inside collapsed sub-sections too
    sec.querySelectorAll<HTMLElement>(".fold.sub").forEach(s => {
      const b = s.querySelector<HTMLElement>(":scope > .fold-b")!;
      b.hidden = titleHit ? s.querySelector(".fold-h")!.getAttribute("aria-expanded") !== "true" : !s.classList.contains("hit-path");
    });
  }
  return hits;
}

