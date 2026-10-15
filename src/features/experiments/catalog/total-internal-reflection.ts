// Wave Dude 2D web - "Trapped light: total internal reflection" (school): a beam inside glass meets the surface;
// beyond the critical angle none of it escapes.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { deg, rad } from "../../../core/math";
import type { Experiment } from "../types";
import { beam, box, f1, lam, look, need, within } from "../helpers";

const W = 1100, H = 800, SURF = 300, HIT = { x: 550, y: SURF }, LEVEL = 50, N = 1.5;

/** The critical angle in the model: sin θc = (wave speed in glass) / (wave speed in air) = λ_glass / λ_air. */
function criticalDeg(): number {
  return deg(Math.asin(lam(LEVEL, N) / lam(LEVEL, 1)));
}

export const tir: Experiment = {
  id: "total-internal-reflection",
  title: "Trapped light: total internal reflection",
  level: "school",
  minutes: 15,
  summary: "A beam inside glass meets the surface. Tilt it far enough and none of it escapes — the trick behind optical fibres.",
  goals: ["Leaving glass, a beam bends away from the normal", "Beyond the critical angle all of it is reflected", "sin θc = n₂ / n₁"],
  readMore: [
    { page: "light-and-optics/total-internal-reflection-and-fibres", label: "Total internal reflection and optical fibres" },
    { page: "how-waves-behave/refraction", label: "Refraction: why waves bend" },
  ],
  params: [{ id: "theta", label: "Angle of the beam θ", min: 20, max: 70, step: 1, value: 30, unit: "°", help: "Angle between the beam and the normal (the dashed line)." }],
  setup(sim, p) {
    const s = new Scene(W, H).add(box(0, SURF, W, H - SURF, "glass", { n: N, name: "Glass" }));
    // the beam goes up from the bottom left towards the hit point
    const t = rad(p.theta), b = beam(HIT, { x: Math.sin(t), y: -Math.cos(t) }, 320, 100, LEVEL, {}, -1);
    sim.load(s, [b.source]);
    sim.annotations.arrows.push(
      { x0: HIT.x, y0: HIT.y + 220, x1: HIT.x, y1: HIT.y - 200, color: "#ffffffaa", dashed: true },
      { x0: b.x, y0: b.y, x1: HIT.x - Math.sin(t) * 18, y1: HIT.y + Math.cos(t) * 18, color: "#ffd84a" },
    );
    sim.annotations.labels.push(
      { x: 100, y: SURF - 14, text: "air  n = 1.0" },
      { x: 100, y: SURF + 28, text: `glass  n = ${N}`, color: "#9fe3ff" },
      { x: HIT.x + 8, y: HIT.y - 180, text: "normal" },
    );
    look(sim, { view: "intensity", field: 3.8, intensity: 6.2 });
  },
  steps: [
    {
      title: "Out of the glass",
      html: `<p>This time the beam starts <b>inside</b> the glass and heads up towards the surface with air above it.</p>
             <p>Look at the beam that comes out into the air.</p>`,
      enter(sim) { sim.runUntil(1800); },
      predict: {
        question: "Going from glass into air, the beam bends…",
        options: ["Towards the normal", "Away from the normal", "Not at all"],
        answer: 1,
        explain: "Away from the normal — the reverse of going into glass, because the wave speeds up. Some of the beam is also reflected back down.",
      },
    },
    {
      title: "Tilt the beam",
      html: `<p>Slowly increase the <b>angle</b> with the slider (the scene restarts each time). Watch the beam that comes out into the air: it gets closer and closer to the surface…</p>`,
      predict: {
        question: "What happens when the outgoing beam would have to bend past the surface?",
        options: ["It goes into the glass sideways", "It cannot get out: all of it is reflected", "It gets brighter"],
        answer: 1,
        explain: "It cannot get out. Beyond the critical angle no beam goes into the air at all and everything is reflected. That is total internal reflection.",
      },
    },
    {
      title: "Find the critical angle",
      html: `<p>Find the smallest angle at which <b>no beam</b> comes out into the air any more, only reflection. Zoom in on the surface if it helps.</p>`,
      task: {
        prompt: "At which angle does the outgoing beam disappear?",
        input: { label: "Critical angle (°)", placeholder: "e.g. 45" },
        check(m) {
          if (m.input === null) return need("Type the angle you found.");
          return within(m.input, criticalDeg(), 3, "critical angle", "°");
        },
      },
    },
    {
      title: "Why that angle?",
      html: () => `<p>Snell's law going out is n₁ sin θ₁ = n₂ sin θ₂. The outgoing angle θ₂ reaches 90° (along the surface) when</p>
             <p class="formula">sin θc = n₂ / n₁ = 1 / ${N}  →  θc = ${f1(deg(Math.asin(1 / N)))}°</p>
             <p>In this model the speed ratio for this wavelength gives θc = ${f1(criticalDeg())}°.</p>
             <p>Set the angle above θc and look closely at the surface in the <b>Field</b> view: the wave pokes a little way into the air but does not travel. That is the <b>evanescent wave</b>.</p>
             <p><b>Optical fibres</b> carry internet data this way: the light bounces along inside the glass, always beyond the critical angle. Try the “Light guide” scene in the Sandbox.</p>`,
    },
  ],
};
