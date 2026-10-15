// Wave Dude 2D web - editing a source (or the settings for the next one): frequency, amplitude, phase, pulses, laser beam, motion, arrays.
// GPL-3.0-or-later.

import { type SourceSpec, elementsOf, newMotion } from "../../core/sources";
import { levelColor } from "../../core/physics";
import { h, adv, slider, select, check, numberInput, segmented, fold } from "../../components";

/** The settings under "More options" that differ from a plain source, for the section's summary. */
function moreSummary(s: SourceSpec): string {
  const on: string[] = [];
  if (s.countX * s.countY > 1) on.push(`${s.countX}×${s.countY} array`);
  if (s.phaseStepXDeg || s.phaseStepYDeg) on.push("phase steps");
  if (s.randomize && s.countX * s.countY > 1) on.push("randomized");
  if (s.detach) on.push(`detach @ ${s.detachAfterSteps}`);
  return on.length ? on.join(" · ") : s.kind === "line" ? "phase step, detach" : s.kind === "laser" ? "detach" : "array, detach";
}

/** Edits a source's settings; `existing` = it is already in the simulation (shows name, position and the element count). */
export function sourceEditor(s: SourceSpec, changed: () => void, existing: boolean, relist: () => void): HTMLElement {
  const box = h("div", { class: "editor" });
  const draw = () => {
    // any change regenerates the elements (a loaded project's fixed elements are replaced)
    const c = () => { if (s.baked) { s.baked = undefined; draw(); } changed(); };
    const swatch = h("span", { class: "swatch big", style: `background:${levelColor(s.level)}` });
    const isArray = s.kind === "array" || (!existing && s.countX * s.countY > 1);
    const nameIn = h("input", { type: "text", value: s.name });
    nameIn.addEventListener("change", () => { s.name = nameIn.value; relist(); });
    const more = fold({ id: existing ? "src-more" : "tpl-more", title: "More options", sub: true, open: false, summary: () => moreSummary(s) },
      s.kind !== "line" && s.kind !== "laser" ? h("div", { class: "grid2" },
        numberInput({ label: "Array X", value: s.countX, min: 1, max: 256, help: "A grid of sources (a composite source in the Windows app), centred on the position.", onChange: v => { s.countX = Math.max(1, Math.round(v)); if (existing) s.kind = s.countX * s.countY > 1 ? "array" : "point"; c(); draw(); if (existing) relist(); } }),
        numberInput({ label: "Array Y", value: s.countY, min: 1, max: 256, onChange: v => { s.countY = Math.max(1, Math.round(v)); if (existing) s.kind = s.countX * s.countY > 1 ? "array" : "point"; c(); draw(); if (existing) relist(); } }),
        numberInput({ label: "Spacing X", value: s.spacingX, min: 1, max: 500, onChange: v => { s.spacingX = v; c(); } }),
        numberInput({ label: "Spacing Y", value: s.spacingY, min: 1, max: 500, onChange: v => { s.spacingY = v; c(); } }),
      ) : null,
      s.kind !== "point" && s.kind !== "laser" ? slider({ label: s.kind === "line" ? "Phase step along line" : "Phase step X", min: -180, max: 180, step: 5, value: s.phaseStepXDeg, unit: "°",
        help: "Extra phase for each next element. A steady phase step steers the beam (see the phased-array experiment).", onInput: v => { s.phaseStepXDeg = v; c(); } }) : null,
      isArray ? slider({ label: "Phase step Y", min: -180, max: 180, step: 5, value: s.phaseStepYDeg, unit: "°", onInput: v => { s.phaseStepYDeg = v; c(); } }) : null,
      isArray ? check({ label: "Randomize the elements", value: s.randomize, help: "Composite “inherit + randomize”: every element gets random offsets within ± the amounts below (fixed per seed).", onChange: v => { s.randomize = v; c(); draw(); } }) : null,
      isArray && s.randomize ? h("div", { class: "grid2" },
        numberInput({ label: "± frequency", value: s.randFrequency, min: 0, max: 254, onChange: v => { s.randFrequency = Math.max(0, Math.round(v)); c(); } }),
        numberInput({ label: "± phase (°)", value: s.randPhase, min: 0, max: 180, onChange: v => { s.randPhase = Math.max(0, Math.round(v)); c(); } }),
        numberInput({ label: "± off-width", value: s.randOffWidth, min: 0, max: 1000, onChange: v => { s.randOffWidth = Math.max(0, Math.round(v)); c(); } }),
        numberInput({ label: "± position", value: s.randPosition, min: 0, max: 1000, onChange: v => { s.randPosition = Math.max(0, Math.round(v)); c(); } })) : null,
      isArray && s.randomize ? h("button", { class: "filter-item", onclick: () => { s.seed = Math.floor(Math.random() * 2 ** 31); c(); }, "data-help": "New random numbers for the elements." }, "🎲 Re-roll") : null,
      check({ label: "Detach after some steps", value: s.detach, help: "The source fades out over 30 steps and stops holding the field, so waves pass through it.", onChange: v => { s.detach = v; c(); draw(); } }),
      s.detach ? numberInput({ label: "Detach after step", value: s.detachAfterSteps, min: 0, onChange: v => { s.detachAfterSteps = v; c(); } }) : null,
    );
    // a point source can move: in a line or round a circle (the Doppler effect)
    const canMove = existing ? s.kind === "point" : s.countX * s.countY <= 1;
    const m = s.motion;
    const motion = canMove ? fold({ id: existing ? "src-motion" : "tpl-motion", title: "Motion", sub: true, open: !!m,
      summary: () => (s.motion ? `${s.motion.kind === "circle" ? "circle" : "line"} · ${s.motion.mach.toFixed(2)}× wave speed` : "still") },
      segmented({ label: "Moves", options: [["still", "Still"], ["line", "→ Straight"], ["circle", "↻ Circle"]], value: m ? m.kind : "still",
        help: "A moving source squeezes its waves together ahead of it and stretches them behind (the Doppler effect). Faster than its own waves (above 1×) it drags a cone behind it.",
        onChange: v => { s.motion = v === "still" ? null : newMotion({ ...(s.motion ?? {}), kind: v as "line" | "circle" }); c(); draw(); if (existing) relist(); } }),
      m ? slider({ label: "Speed", min: 0, max: 2, step: 0.05, value: m.mach, format: v => `${v.toFixed(2)}× wave speed`,
        help: "As a multiple of the speed of the waves in empty space. Below about 0.75× the squeezed waves ahead stay long enough for the grid; 1× and faster makes a shock cone.",
        onInput: v => { m.mach = v; c(); }, onChange: () => relist() }) : null,
      m?.kind === "line" ? slider({ label: "Direction", min: -180, max: 180, step: 1, value: m.angleDeg, unit: "°", help: "0° = to the right, 90° = down.", onInput: v => { m.angleDeg = v; c(); } }) : null,
      m?.kind === "line" ? numberInput({ label: "Stops after (cells, 0 = at the edge)", value: m.distance, min: 0, onChange: v => { m.distance = Math.max(0, Math.round(v)); c(); } }) : null,
      m?.kind === "circle" ? slider({ label: "Radius", min: 5, max: 400, step: 1, value: m.radius, unit: " cells", help: "The circle is centred where the source was placed.", onInput: v => { m.radius = v; c(); } }) : null,
      m?.kind === "circle" ? check({ label: "Clockwise", value: m.clockwise, onChange: v => { m.clockwise = v; c(); } }) : null,
      m ? h("p", { class: "hint" }, "It starts from its place at step 0: press ⟲ Reset to watch it set off again.") : null,
    ) : null;
    const parts: (Node | null)[] = [
      existing ? h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Name")), nameIn) : null,
      existing ? adv(h("div", { class: "grid2" },
        numberInput({ label: "X", value: s.x, onChange: v => { const dx = Math.round(v) - s.x; s.x += dx; s.x2 += dx; c(); } }),
        numberInput({ label: "Y", value: s.y, onChange: v => { const dy = Math.round(v) - s.y; s.y += dy; s.y2 += dy; c(); } }))) : null,
      existing && s.baked ? h("p", { class: "note" }, `Loaded from a project: ${s.baked.length} fixed element${s.baked.length === 1 ? "" : "s"}. Changing a setting regenerates them.`) : null,
      h("div", { class: "freq" }, swatch, slider({ label: "Frequency", min: 1, max: 255, step: 1, value: s.level,
        help: "The source level 1–255 (the green value). Higher = faster oscillation = shorter waves. The colour shows it: red = low, violet = high.",
        onInput: v => { s.level = v; swatch.style.background = levelColor(v); c(); }, onChange: () => relist() })),
      slider({ label: "Amplitude", min: 0, max: 100, step: 1, value: s.amplitudePct, unit: "%", onInput: v => { s.amplitudePct = v; c(); } }),
      adv(slider({ label: "Phase", min: -180, max: 180, step: 5, value: s.phaseDeg, unit: "°", help: "Where in its cycle the source starts. Two sources 180° apart push in opposite directions.", onInput: v => { s.phaseDeg = v; c(); } })),
      adv(segmented({ label: "Mode", options: [["continuous", "Continuous"], ["pulsed", "Pulsed"]], value: s.mode, help: "Continuous: a steady wave. Pulsed: bursts of a few cycles, on and off.",
        onChange: v => { s.mode = v as SourceSpec["mode"]; c(); draw(); if (existing) relist(); } })),
      s.kind === "laser" || !existing ? adv(h("div", { class: "pulse" },
        !existing ? h("p", { class: "hint" }, "Laser (⇶ tool):") : null,
        slider({ label: "Beam direction", min: -180, max: 180, step: 1, value: s.angleDeg, unit: "°", help: "0° = to the right, 90° = down. You can also aim while placing a laser by dragging.", onInput: v => { s.angleDeg = v; c(); } }),
        slider({ label: "Beam width", min: 3, max: 80, step: 1, value: s.beamWidth, unit: " cells", help: "Half-width of the Gaussian beam profile (where the amplitude has fallen to 1/e). A narrow beam spreads out faster (diffraction).", onInput: v => { s.beamWidth = v; c(); } }))) : null,
      s.mode === "pulsed" ? adv(h("div", { class: "pulse" },
        select({ label: "Pulse shape", options: [["gaussian", "Gaussian"], ["square", "Smoothed square"]], value: s.shape, onChange: v => { s.shape = v as SourceSpec["shape"]; c(); } }),
        slider({ label: "On (cycles)", min: 1, max: 50, step: 1, value: s.onCycles, onInput: v => { s.onCycles = v; c(); } }),
        slider({ label: "Off (cycles)", min: 1, max: 300, step: 1, value: s.offCycles, onInput: v => { s.offCycles = v; c(); } }))) : null,
      adv(motion),
      adv(more),
      existing ? adv(h("p", { class: "muted small cells" }, `${elementsOf({ ...s, enabled: true, hasPosition: true }).length} driven cells`)) : null,
    ];
    box.replaceChildren(...parts.filter((x): x is Node => x !== null));
  };
  draw();
  return box;
}
