// Wave Dude 2D web - editing a shape: what it is made of, where it is, its size and angle, and a wall's slits.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { type ShapeSpec, type ShapeMaterial, shapeBounds, shapeInfo } from "../../core/shapes";
import { h, slider, check, numberInput, segmented, textField, xyFields } from "../../components";

export function shapeEditor(sim: Sim, s: ShapeSpec, relist: () => void): HTMLElement {
  const box = h("div", { class: "editor" });
  const info = h("p", { class: "muted small cells" }, shapeInfo(s));
  // every change redraws the shape where it was and where it is now (one undo step per pause)
  const ch = (f: () => void) => { sim.undo.touch("Change shape"); const before = shapeBounds(s); f(); sim.updateShape(s, before); info.textContent = shapeInfo(s); };
  const draw = () => {
    const isLine = s.kind === "line" || s.kind === "slits";
    box.replaceChildren(...[
      textField({ label: "Name", value: s.name, onChange: v => { s.name = v || s.name; relist(); } }),
      segmented({ label: "Made of", options: [["wall", "▮ Wall"], ["glass", "⬭ Glass"], ["absorber", "░ Absorber"]], value: s.material,
        help: "Wall: waves bounce off completely. Glass: waves go slower and bend. Absorber: soaks waves up gradually from its edge inwards.",
        onChange: v => { ch(() => { s.material = v as ShapeMaterial; }); draw(); relist(); } }),
      s.material === "glass" ? slider({ label: "Refractive index", min: 1.05, max: 2.55, step: 0.01, value: s.n, format: v => `n ${v.toFixed(2)}`, onInput: v => ch(() => { s.n = v; }) }) : null,
      xyFields({ labels: ["Centre X", "Centre Y"], x: s.x, y: s.y, onChange: (x, y) => ch(() => { s.x = x; s.y = y; }) }),
      slider({ label: "Angle", min: -180, max: 180, step: 1, value: Math.round(s.angleDeg), unit: "°", help: "0° = its length runs to the right; 90° = down.", onInput: v => ch(() => { s.angleDeg = v; }) }),
      slider({ label: "Length", min: 2, max: 2000, step: 1, value: Math.round(s.length), unit: " cells", onInput: v => ch(() => { s.length = v; }) }),
      isLine ? null : slider({ label: "Width", min: 2, max: 2000, step: 1, value: Math.round(s.width), unit: " cells", onInput: v => ch(() => { s.width = v; }) }),
      s.kind === "box" ? check({ label: "Filled", value: s.filled, help: "Off: only the outline is drawn (a frame).", onChange: v => { ch(() => { s.filled = v; }); draw(); } }) : null,
      isLine || (s.kind === "box" && !s.filled) ? slider({ label: "Thickness", min: 1, max: 120, step: 1, value: Math.round(s.thickness), unit: " cells",
        help: s.material === "absorber" ? "Absorbers need to be thick (40+ cells) to swallow waves without reflecting them." : undefined, onInput: v => ch(() => { s.thickness = v; }) }) : null,
      s.kind === "slits" ? h("div", { class: "grid2" },
        numberInput({ label: "Slits", value: s.count, min: 0, max: 50, help: "How many openings the wall has.", onChange: v => ch(() => { s.count = Math.max(0, Math.round(v)); }) }),
        numberInput({ label: "Slit width", value: s.width, min: 1, max: 500, onChange: v => ch(() => { s.width = Math.max(1, v); }) })) : null,
      s.kind === "slits" ? numberInput({ label: "Spacing (centre to centre)", value: s.spacing, min: 1, max: 2000, onChange: v => ch(() => { s.spacing = Math.max(1, v); }) }) : null,
      info,
    ].filter((x): x is HTMLElement => !!x));
  };
  draw();
  return box;
}
