// Wave Dude 2D web - tiny DOM helpers, the shared panel controls and the "?" help tooltips.
// GPL-3.0-or-later.

type Child = Node | string | null | undefined | false;
type Attrs = Record<string, string | number | boolean | ((e: Event) => void) | undefined>;

/** h("div", { class: "x", onclick: f }, "text", child) */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "html") el.innerHTML = String(v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

// ------------------------------------------------------------------------------------ preferences

const PREF = "waveDude.ui.";

/** A small UI preference remembered in this browser (open sections, filters). Never throws. */
export function loadPref<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREF + key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch { return fallback; }
}

export function savePref(key: string, value: unknown): void {
  try { localStorage.setItem(PREF + key, JSON.stringify(value)); } catch { /* private mode: kept for this visit only */ }
}

let uid = 0;
const nextId = (p: string) => `${p}-${++uid}`;

// ------------------------------------------------------------------------------------ controls

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

/** A plain titled group (not collapsible). */
export function section(title: string, ...children: Child[]): HTMLElement {
  return h("section", { class: "sec" }, h("h3", {}, title), ...children);
}

// ------------------------------------------------------------------------------------ collapsible sections

const summaries = new WeakMap<HTMLElement, () => string>();

/**
 * A collapsible section: a header button (icon, title, a one-line summary, chevron) and a body.
 * Its open/closed state is remembered in this browser under `id`.
 * `sub` makes the small variant used inside a section ("More options").
 */
export function fold(o: {
  id: string; title: string; icon?: string; summary?: string | (() => string); open?: boolean; sub?: boolean; class?: string;
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
  const sec = h("section", { class: `fold ${o.sub ? "sub" : "sec box"} ${o.class ?? ""}`, "data-fold": o.id },
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

// ------------------------------------------------------------------------------------ side panel toggle

/** A button in the header that hides the side panel to give the simulation the whole width (remembered). */
export function installPanelToggle(): void {
  const app = document.getElementById("app"), header = app?.querySelector("header");
  if (!app || !header || header.querySelector(".side-toggle")) return;
  const icon = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect class="side" x="3.3" y="4.3" width="4.6" height="11.4" rx="1.2" fill="currentColor"/></svg>';
  const btn = h("button", { type: "button", class: "side-toggle", "aria-controls": "panel", html: icon });
  const apply = (hidden: boolean) => {
    app.classList.toggle("panel-hidden", hidden);
    btn.setAttribute("aria-expanded", String(!hidden));
    const t = hidden ? "Show the side panel" : "Hide the side panel to give the simulation more room";
    btn.setAttribute("aria-label", t);
    btn.dataset.help = t;
  };
  btn.addEventListener("click", () => {
    const hidden = !app.classList.contains("panel-hidden");
    savePref("panelHidden", hidden);
    apply(hidden);
  });
  apply(loadPref("panelHidden", false));
  header.prepend(btn);
}

// ------------------------------------------------------------------------------------ side panel width

const PANEL_DEFAULT = 380, PANEL_MIN = 280;

/** A handle on the side panel's right edge: drag to make it wider or narrower (remembered); double-click resets. */
export function installPanelResizer(): void {
  const app = document.getElementById("app");
  if (!app || app.querySelector(".panel-resizer")) return;
  const max = () => Math.max(PANEL_MIN, Math.min(900, Math.round(window.innerWidth * 0.6)));
  const handle = h("div", {
    class: "panel-resizer", role: "separator", tabindex: 0, "aria-orientation": "vertical", "aria-controls": "panel",
    "aria-label": "Resize the side panel", "data-help": "Drag to make the side panel wider or narrower. Double-click to reset. Arrow keys work too.",
  });
  const apply = (w: number) => {
    const v = Math.max(PANEL_MIN, Math.min(max(), Math.round(w)));
    app.style.setProperty("--panel-w", `${v}px`);
    handle.setAttribute("aria-valuenow", String(v));
    return v;
  };
  let width = apply(loadPref("panelWidth", PANEL_DEFAULT));
  handle.addEventListener("pointerdown", e => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    app.classList.add("resizing");
    const move = (ev: PointerEvent) => { width = apply(ev.clientX); };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      app.classList.remove("resizing");
      savePref("panelWidth", width);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  });
  handle.addEventListener("dblclick", () => { width = apply(PANEL_DEFAULT); savePref("panelWidth", width); });
  handle.addEventListener("keydown", e => {
    const step = e.shiftKey ? 60 : 20;
    if (e.key === "ArrowLeft") width = apply(width - step);
    else if (e.key === "ArrowRight") width = apply(width + step);
    else return;
    e.preventDefault();
    savePref("panelWidth", width);
  });
  window.addEventListener("resize", () => { width = apply(width); });
  app.append(handle);
}

// ------------------------------------------------------------------------------------ help tooltips

/** Installs the shared tooltip for every [data-help] element (and the side panel toggle in the header). */
export function installHelp(): void {
  const tip = h("div", { class: "tip", role: "tooltip" });
  document.body.append(tip);
  let current: HTMLElement | null = null;
  const show = (el: HTMLElement) => {
    current = el;
    tip.textContent = el.dataset.help ?? "";
    tip.style.display = "block";
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const x = Math.min(window.innerWidth - t.width - 8, Math.max(8, r.left + r.width / 2 - t.width / 2));
    const y = r.bottom + 6 + t.height > window.innerHeight ? r.top - t.height - 6 : r.bottom + 6;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };
  const hide = () => { current = null; tip.style.display = "none"; };
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
