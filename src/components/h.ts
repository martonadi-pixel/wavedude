// Wave Dude 2D web - building DOM elements: h("div", { class: "x", onclick: f }, "text", child).
// GPL-3.0-or-later.

export type Child = Node | string | null | undefined | false;
export type Attrs = Record<string, string | number | boolean | ((e: Event) => void) | undefined>;

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


/** Marks an advanced control: hidden in Simple mode. */
export function adv<T extends Element | null>(e: T): T {
  e?.classList.add("adv");
  return e;
}

let uid = 0;
/** A unique id for elements (aria links). */
export const nextId = (p: string) => `${p}-${++uid}`;

