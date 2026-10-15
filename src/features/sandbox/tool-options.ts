// Wave Dude 2D web - the Sandbox's settings in the bar above the picture: what the next source, optical element or
// logic part will be like (painting is handled by the app itself).
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import type { Tool } from "../../view/viewport";
import { OPTIC_KINDS, newOptic } from "../../core/optics";
import { levelColor } from "../../core/physics";
import { logicTemplate } from "../../circuits/editor";
import { h, adv, slider, check, segmented, showPopover } from "../../components";
import { sourceEditor } from "./source-editor";
import { opticEditor } from "./optic-editor";

export function sandboxToolOptions(sim: Sim, refresh: () => void): (tool: Tool) => Node[] | null {
  return tool => {
    if (tool === "source" || tool === "line" || tool === "laser") {
      const t = sim.sourceTemplate;
      const sw = h("span", { class: "swatch", style: `--c:${levelColor(t.level)}` });
      const more = h("button", { type: "button", class: "opt-more", "data-help": "Every setting of the next source: phase, pulses, arrays, motion…" }, "⚙ More…");
      more.addEventListener("click", () => showPopover(more, sourceEditor(t, () => {}, false, () => {}), "Next source"));
      return [
        h("span", { class: "opt-group" }, sw, slider({ label: "Frequency", min: 1, max: 255, step: 1, value: t.level, help: "Higher = faster oscillation = shorter waves. The colour shows it: red = low, violet = high.",
          onInput: v => { t.level = v; sw.style.setProperty("--c", levelColor(v)); } })),
        adv(slider({ label: "Amplitude", min: 0, max: 100, step: 1, value: t.amplitudePct, unit: "%", onInput: v => { t.amplitudePct = v; } })),
        adv(segmented({ options: [["continuous", "Continuous"], ["pulsed", "Pulsed"]], value: t.mode, small: true, onChange: v => { t.mode = v as typeof t.mode; } })),
        ...(tool === "laser" ? [
          slider({ label: "Width", min: 3, max: 80, step: 1, value: t.beamWidth, unit: " cells", help: "Half-width of the beam. A narrow beam spreads out faster (diffraction).", onInput: v => { t.beamWidth = v; } }),
        ] : []),
        adv(more),
      ];
    }
    if (tool === "optic") {
      const tpl = sim.opticTemplate;
      const mirror = tpl.kind === "mirror" || tpl.kind === "parabolic";
      const more = h("button", { type: "button", class: "opt-more", "data-help": "Every setting of the next element: rotation, curvature, thickness…" }, "⚙ More…");
      more.addEventListener("click", () => showPopover(more, opticEditor(sim, tpl, false, () => {}), "Next element"));
      return [
        h("span", { class: "opt-group", role: "radiogroup", "aria-label": "Element" }, ...OPTIC_KINDS.map(k => h("button", {
          type: "button", role: "radio", "aria-checked": String(k.kind === tpl.kind), class: k.kind === tpl.kind ? "on" : "", "data-help": `${k.label}: ${k.help}`,
          onclick: () => {
            // keep the glass the user chose; take the new shape's own sizes
            sim.opticTemplate = newOptic(k.kind, k.kind === "mirror" || k.kind === "parabolic" || k.kind === "splitter" ? {} : { n: mirror || tpl.kind === "splitter" ? 1.5 : tpl.n });
            refresh();
          },
        }, h("span", { class: "ic", "aria-hidden": "true" }, k.icon), " ", k.label))),
        mirror ? null : slider({ label: "n", min: 1.05, max: 2.55, step: 0.01, value: Math.min(2.55, tpl.n), format: v => v.toFixed(2), help: "Refractive index of the glass.", onInput: v => { tpl.n = v; } }),
        slider({ label: "Size", min: 20, max: 700, step: 2, value: tpl.size, unit: " cells", onInput: v => { tpl.size = v; } }),
        more,
      ].filter((x): x is HTMLElement => !!x);
    }
    if (tool === "guide") return [
      slider({ label: "Width", min: 3, max: 16, step: 1, value: logicTemplate.guideWidth, unit: " cells",
        help: "6 cells carry a single mode at frequency 60: only then do two inputs in anti-phase cancel cleanly.", onInput: v => { logicTemplate.guideWidth = v; } }),
      slider({ label: "n", min: 1.2, max: 2.5, step: 0.05, value: logicTemplate.guideN, format: v => v.toFixed(2), onInput: v => { logicTemplate.guideN = v; } }),
      check({ label: "Soak up the light at open ends", value: logicTemplate.absorbEnds, help: "A guide that just stops reflects light back towards the inputs; an absorbing end works like a photodiode at the end of a fibre.",
        onChange: v => { logicTemplate.absorbEnds = v; } }),
    ];
    if (tool === "bit" || tool === "detector" || tool === "transistor") return [
      segmented({ options: [["h", "↕ across ⟷ guides"], ["v", "↔ across ↕ guides"], ["point", "• point"]], value: logicTemplate.emitter, small: true,
        help: "Inputs, transistors and detectors sit across the guide you click on: a short line across a left-right guide, or across an up-down one.",
        onChange: v => { logicTemplate.emitter = v as typeof logicTemplate.emitter; } }),
      tool === "transistor" ? check({ label: "Inverted (NOT): shines while its detector is dark", value: logicTemplate.invert, onChange: v => { logicTemplate.invert = v; } }) : null,
    ].filter((x): x is HTMLElement => !!x);
    return null;
  };
}
