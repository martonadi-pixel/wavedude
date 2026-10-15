// Wave Dude 2D web - editing an optical element (or the settings for the next one): rotation, glass, size, curvature.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { type OpticSpec, opticBounds, opticInfo } from "../../core/optics";
import { h, slider, numberInput } from "../../components";

/** Edits an optical element (the one about to be placed when `existing` is false). */
export function opticEditor(sim: Sim, o: OpticSpec, existing: boolean, relist: () => void): HTMLElement {
  const box = h("div", { class: "editor" });
  const info = h("p", { class: "muted small cells" }, opticInfo(o));
  // every change redraws the element where it was and where it is now
  const ch = (f: () => void) => { const before = opticBounds(o); f(); if (existing) sim.updateOptic(o, before); info.textContent = opticInfo(o); };
  const lens = ["convex", "concave", "planoConvex", "planoConcave", "meniscus"].includes(o.kind);
  const mirror = o.kind === "mirror" || o.kind === "parabolic";
  const nameIn = h("input", { type: "text", value: o.name });
  nameIn.addEventListener("change", () => { o.name = nameIn.value; relist(); });
  const parts: (Node | null)[] = [
    existing ? h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Name")), nameIn) : null,
    existing ? h("div", { class: "grid2" },
      numberInput({ label: "X", value: o.x, onChange: v => ch(() => { o.x = Math.round(v); }) }),
      numberInput({ label: "Y", value: o.y, onChange: v => ch(() => { o.y = Math.round(v); }) })) : null,
    slider({ label: "Rotation", min: -180, max: 180, step: 1, value: o.angleDeg, unit: "°", help: "0° = the light travels left to right through it.", onInput: v => ch(() => { o.angleDeg = v; }) }),
    mirror ? null : slider({ label: o.kind === "grin" ? "Index in the middle" : "Refractive index n", min: 1.05, max: 2.55, step: 0.01, value: Math.min(2.55, o.n),
      help: "How many times slower waves travel in the glass (scene images can hold up to 2.55).", onInput: v => ch(() => { o.n = v; }) }),
    slider({ label: o.kind === "ball" ? "Diameter" : o.kind === "prism" ? "Height" : "Size (aperture)", min: 20, max: 700, step: 2, value: o.size, unit: " cells", onInput: v => ch(() => { o.size = v; }) }),
    lens ? slider({ label: "Radius of curvature R", min: 30, max: 1500, step: 5, value: o.radius, unit: " cells", help: "Smaller R = more strongly curved faces = shorter focal length.", onInput: v => ch(() => { o.radius = v; }) }) : null,
    o.kind === "parabolic" ? slider({ label: "Focal length", min: 30, max: 800, step: 5, value: o.radius, unit: " cells", onInput: v => ch(() => { o.radius = v; }) }) : null,
    o.kind === "prism" ? slider({ label: "Apex angle", min: 10, max: 120, step: 1, value: o.radius, unit: "°", onInput: v => ch(() => { o.radius = v; }) }) : null,
    o.kind === "ball" || o.kind === "prism" ? null : slider({ label: "Thickness", min: 1, max: 240, step: 1, value: o.thickness, unit: " cells",
      help: lens ? "Thickness in the middle (a converging lens is made at least thick enough to keep 2 cells at its rim)." : undefined, onInput: v => ch(() => { o.thickness = v; }) }),
    info,
  ];
  box.replaceChildren(...parts.filter((x): x is Node => x !== null));
  return box;
}
