// Wave Dude 2D web - the side panel: a header button that hides it, and a handle that resizes it.
// GPL-3.0-or-later.

import { h } from "./h";
import { loadPref, savePref } from "./prefs";

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

