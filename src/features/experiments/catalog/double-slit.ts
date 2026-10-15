// Wave Dude 2D web - "The double slit" (school): two slits, one pattern of bright and dark stripes; d · sin θ = m · λ.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { deg } from "../../../core/math";
import type { Experiment, Values } from "../types";
import { f1, f3, lam, lineProbe, lineSource, look, need, slitWall, within } from "../helpers";

const W = 1200, H = 700, WALL_X = 360, WALL_T = 8, SCREEN_X = 1080, LEVEL = 60;

function firstFringeDeg(p: Values): number {
  return deg(Math.asin(Math.min(1, lam(LEVEL) / p.d)));
}

export const doubleSlit: Experiment = {
  id: "double-slit",
  title: "The double slit",
  level: "school",
  minutes: 20,
  summary: "The experiment that proved light is a wave: two slits, one pattern of bright and dark stripes.",
  goals: ["Two slits make a striped interference pattern", "Bright stripes where the path difference is a whole number of wavelengths", "d · sin θ = m · λ"],
  readMore: [
    { page: "light-and-optics/is-light-a-wave", label: "Is light a wave?" },
    { page: "how-waves-behave/interference-and-superposition", label: "Interference and superposition" },
    { page: "maths-of-waves/interference-diffraction", label: "Interference and diffraction formulas" },
  ],
  graph: "profile",
  params: [
    { id: "d", label: "Distance between the slits d", min: 30, max: 120, step: 2, value: 60, unit: " cells" },
    { id: "w", label: "Width of each slit", min: 4, max: 24, step: 1, value: 12, unit: " cells", help: "Below about half a wavelength (≈ 7.5 cells) hardly anything gets through." },
  ],
  setup(sim, p) {
    const s = new Scene(W, H);
    const cy = H / 2;
    s.add(slitWall(WALL_X, cy, H, WALL_T, 2, p.w, p.d, "Double slit"));
    sim.load(s, [lineSource(150, 0, 150, H - 1, LEVEL)], [lineProbe(SCREEN_X, 70, SCREEN_X, H - 70)]);
    sim.annotations.arrows.push({ x0: WALL_X + WALL_T, y0: cy, x1: SCREEN_X + 40, y1: cy, color: "#ffffff88", dashed: true });
    sim.annotations.labels.push({ x: SCREEN_X + 8, y: 60, text: "screen", color: "#ffd84a" });
    // only a little gets through the slits: show the weak waves behind the wall (the side in front saturates)
    look(sim, { view: "field", field: 4, intensity: 7 });
  },
  steps: [
    {
      title: "Waves through two gaps",
      html: `<p>A straight wave hits a wall with <b>two narrow slits</b>. Each slit acts like a new little source on the other side.</p>
             <p>Far to the right is a <b>screen</b> (the dashed line L1) that measures how strong the waves are.</p>`,
      predict: {
        question: "What will we see on the screen?",
        options: ["Two bright spots, one behind each slit", "Many bright and dark stripes", "An even glow"],
        answer: 1,
        explain: "Many stripes! The waves from the two slits overlap. Where they arrive in step they add up (bright); where one arrives half a wave later they cancel (dark).",
      },
      enter(sim) { sim.runUntil(2600); },
    },
    {
      title: "The pattern on the screen",
      html: `<p>We switched to the <b>Intensity</b> view. The graph under the simulation shows the brightness along the screen L1.</p>
             <p>The middle stripe is bright: both slits are the same distance from it, so the waves arrive in step.</p>`,
      enter(sim) { sim.viewMode = "intensity"; },
    },
    {
      title: "Measure the angle of the first bright stripe",
      html: `<p>Use the <b>Protractor</b>:</p>
             <ol><li>Drag from the point between the slits along the dashed centre line.</li>
             <li>Drag again from that point to the middle of the <b>next bright stripe</b> above or below the centre.</li></ol>`,
      tools: ["protractor"],
      task: {
        prompt: "The protractor angle is θ₁, the angle of the first-order bright stripe.",
        check(m, p) {
          if (m.angle === null) return need("Draw both arms of the protractor first.");
          return within(m.angle, firstFringeDeg(p), 2.5, "angle θ₁", "°");
        },
      },
    },
    {
      title: "Why that angle?",
      html: (p: Values) => {
        const l = lam(LEVEL);
        return `<p>At the first bright stripe the wave from the far slit travels exactly <b>one wavelength</b> further than the wave from the near slit. Geometry gives the path difference as d · sin θ, so</p>
                <p class="formula">d · sin θ = m · λ &nbsp;&nbsp; (m = 0, 1, 2, …)</p>
                <p>Here λ = ${f1(l)} cells and d = ${p.d} cells, so sin θ₁ = ${f3(l / p.d)} and θ₁ = ${f1(firstFringeDeg(p))}°.</p>`;
      },
      predict: {
        question: "If we move the slits closer together, the stripes…",
        options: ["Spread further apart", "Move closer together", "Stay the same"],
        answer: 0,
        explain: "They spread out: a smaller d needs a bigger angle to make the same path difference of one wavelength. Try it with the slider!",
      },
    },
    {
      title: "Play with the slits",
      html: `<p>Change the slit distance and the slit width. Some things to look for:</p>
             <ul><li>Wider slits make the whole pattern fade faster towards the edges (each slit's own diffraction).</li>
             <li>Very close slits give only a few, wide stripes.</li></ul>
             <p>In 1801 Thomas Young did this with sunlight and settled that light is a wave.</p>`,
      tools: ["protractor", "ruler"],
    },
  ],
};
