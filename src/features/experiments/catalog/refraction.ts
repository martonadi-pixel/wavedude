// Wave Dude 2D web - "Bending waves: Snell's law" (school): a beam enters glass; measure how much it bends.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { deg, rad } from "../../../core/math";
import type { Experiment, Values } from "../types";
import { beam, box, f1, f3, lam, look, need, within } from "../helpers";

const W = 1100, H = 700, Y_SURFACE = 330, HIT = { x: 480, y: Y_SURFACE };
const LEVEL = 50;

function refractedAngle(p: Values): number {
  const s = Math.sin(rad(p.theta)) * (lam(LEVEL, p.n) / lam(LEVEL, 1));
  return deg(Math.asin(Math.min(1, s)));
}

export const refraction: Experiment = {
  id: "refraction",
  title: "Bending waves: Snell's law",
  level: "school",
  minutes: 20,
  summary: "Send a beam into glass at an angle, measure how much it bends, and check Snell's law.",
  goals: ["Waves slow down and get shorter in glass", "A beam bends towards the normal when it slows down", "n₁ sin θ₁ = n₂ sin θ₂"],
  readMore: [
    { page: "how-waves-behave/refraction", label: "Refraction: why waves bend" },
    { page: "light-and-optics/lenses-and-focusing", label: "Lenses and focusing" },
    { page: "maths-of-waves/reflection-refraction", label: "Deriving reflection and refraction" },
  ],
  params: [
    { id: "theta", label: "Angle of the beam θ₁", min: 15, max: 55, step: 1, value: 40, unit: "°", help: "Angle between the beam and the normal (the dashed line, square to the surface)." },
    { id: "n", label: "Refractive index of the glass", min: 1.2, max: 2.2, step: 0.05, value: 1.5, help: "How many times slower the wave travels in the glass." },
  ],
  setup(sim, p) {
    const scene = new Scene(W, H).add(box(0, Y_SURFACE, W, H - Y_SURFACE, "glass", { n: p.n, name: "Glass" }));
    // the beam comes down from the top left towards the hit point
    const t = rad(p.theta), b = beam(HIT, { x: Math.sin(t), y: Math.cos(t) }, 230, 110, LEVEL);
    sim.load(scene, [b.source]);
    sim.annotations.arrows.push(
      { x0: HIT.x, y0: HIT.y - 170, x1: HIT.x, y1: HIT.y + 200, color: "#ffffffaa", dashed: true },
      { x0: b.x, y0: b.y, x1: HIT.x - Math.sin(t) * 18, y1: HIT.y - Math.cos(t) * 18, color: "#ffd84a" },
    );
    sim.annotations.labels.push(
      { x: HIT.x + 8, y: HIT.y - 150, text: "normal" },
      { x: 40 + 64, y: Y_SURFACE - 14, text: "air  n = 1.0" },
      { x: 40 + 64, y: Y_SURFACE + 28, text: `glass  n = ${p.n.toFixed(2)}`, color: "#9fe3ff" },
      { x: HIT.x, y: HIT.y, mark: "●", text: "hit point", color: "#ffd84a" },
    );
    look(sim, { view: "field", field: 6.4, intensity: 8 });
  },
  steps: [
    {
      title: "Into the glass",
      html: `<p>A beam of waves comes in from the top left and hits a block of glass (the bluish half).</p>
             <p>Press <b>▶ Run</b> and look closely at the waves <b>inside</b> the glass.</p>`,
      enter(sim) { sim.runUntil(1400); },
      predict: {
        question: "Inside the glass, the wavelength is…",
        options: ["Longer", "Shorter", "The same"],
        answer: 1,
        explain: "Shorter. The frequency cannot change at the surface (every wave that arrives goes on), but the wave is slower in glass, so by v = f · λ the wavelength gets shorter — n times shorter.",
      },
    },
    {
      title: "Which way does it bend?",
      html: `<p>The dashed line is the <b>normal</b>: the line square to the surface at the hit point.</p>
             <p>Compare the direction of the beam above and below the surface. Switching to <b>Intensity</b> view makes the beam easier to see.</p>`,
      predict: {
        question: "In the glass, the beam bends…",
        options: ["Towards the normal", "Away from the normal", "Not at all"],
        answer: 0,
        explain: "Towards the normal. The side of a wave front that enters the glass first slows down first, so the front swings round — like a car whose right wheels hit sand.",
      },
    },
    {
      title: "Measure the angle θ₂",
      html: `<p>Use the <b>Protractor</b>:</p>
             <ol><li>Drag from the <b>hit point</b> straight <b>down</b> along the dashed normal.</li>
             <li>Drag again from the hit point along the <b>middle of the beam inside the glass</b>.</li></ol>
             <p>Hold <kbd>Ctrl</kbd> to snap the first arm straight down. Zoom in for accuracy.</p>`,
      tools: ["protractor"],
      enter(sim) { sim.viewMode = "intensity"; },
      task: {
        prompt: "The protractor angle is the refraction angle θ₂.",
        check(m, p) {
          if (m.angle === null) return need("Draw both arms of the protractor first.");
          return within(m.angle, refractedAngle(p), 3, "angle θ₂", "°");
        },
      },
    },
    {
      title: "Snell's law",
      html: (p: Values) => {
        const t2 = refractedAngle(p);
        const s1 = Math.sin(rad(p.theta)), s2 = Math.sin(rad(t2));
        return `<p>Snell's law says</p><p class="formula">n₁ · sin θ₁ = n₂ · sin θ₂</p>
                <p>Here: 1.0 × sin ${p.theta}° = ${f3(s1)} and ${p.n.toFixed(2)} × sin ${f1(t2)}° = ${f3(p.n * s2)}.</p>
                <p>Change the beam angle or the glass index with the sliders and measure again. Does the law hold every time?</p>
                <p class="aside">On this grid the speed ratio is not exactly n for short waves, so the model's θ₂ can differ from the textbook value by a fraction of a degree.</p>`;
      },
      tools: ["protractor"],
    },
  ],
};
