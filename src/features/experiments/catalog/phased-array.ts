// Wave Dude 2D web - "Steering a beam with a phased array" (university): sixteen sources and a phase step aim a
// beam with no moving parts.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { deg } from "../../../core/math";
import { newSource } from "../../../core/sources";
import type { Experiment, Values } from "../types";
import { f1, f2, lam, lamText, look, need, within } from "../helpers";

const W = 1100, H = 700, ARRAY_X = 170, LEVEL = 60, ELEMENTS = 16;

function beamDeg(p: Values): number {
  const s = (p.phase / 360) * lam(LEVEL) / p.spacing;
  return Math.abs(s) > 1 ? NaN : deg(Math.asin(Math.abs(s)));
}

export const phasedArray: Experiment = {
  id: "phased-array",
  title: "Steering a beam with a phased array",
  level: "university",
  minutes: 25,
  summary: "Sixteen sources, no moving parts: steer a beam just by delaying each source a little. How radar, 5G and ultrasound scanners aim.",
  goals: ["A row of in-phase sources makes a narrow beam", "A linear phase gradient tilts the beam: sin θ = Δφ λ / (2π s)", "Spacing above λ/2 creates grating lobes"],
  readMore: [
    { page: "waves-at-work/radar-phased-arrays-5g", label: "Radar, phased arrays and 5G" },
    { page: "maths-of-waves/adding-waves", label: "Adding waves" },
  ],
  params: [
    {
      id: "phase", label: "Phase step Δφ between neighbours", min: -150, max: 150, step: 5, value: 0, unit: "°",
      help: "Each source starts this much later in its cycle than the one above it.",
      live: (sim, p) => { sim.sources[0].phaseStepYDeg = p.phase; sim.refreshSources(); },
    },
    { id: "spacing", label: "Element spacing s", min: 3, max: 30, step: 1, value: 6, unit: " cells", help: `${lamText(LEVEL)} at this frequency.` },
  ],
  setup(sim, p) {
    const s = new Scene(W, H);
    sim.load(s, [newSource({
      name: "Array", kind: "array", x: ARRAY_X, y: H / 2, level: LEVEL, countX: 1, countY: ELEMENTS,
      spacingY: p.spacing, phaseStepYDeg: p.phase,
    })]);
    sim.annotations.arrows.push({ x0: ARRAY_X, y0: H / 2, x1: W - 70, y1: H / 2, color: "#ffffff88", dashed: true });
    look(sim, { view: "intensity", field: 30, intensity: 52 });
  },
  steps: [
    {
      title: "Sixteen sources in step",
      html: (p: Values) => `<p>A column of ${ELEMENTS} point sources, ${p.spacing} cells apart, all driven <b>in phase</b>. We show the time-averaged <b>intensity</b>.</p>
             <p>Each source alone would radiate in all directions. Straight ahead their waves arrive in step and add up; at most other angles they arrive out of step and largely cancel. The result is a <b>beam</b>.</p>`,
      enter(sim) { sim.runUntil(1800); },
    },
    {
      title: "Add a phase step",
      html: `<p>Now give every source a small delay relative to its neighbour with the <b>Δφ</b> slider.</p>`,
      predict: {
        question: "A linear phase step across the array will…",
        options: ["Tilt the beam", "Make the beam wider but keep its direction", "Switch the beam off"],
        answer: 0,
        explain: "It tilts the beam. The direction of constructive interference moves to where the extra path s·sin θ makes up for the phase step: k s sin θ = Δφ.",
      },
    },
    {
      title: "Measure the steering angle",
      html: (p: Values) => `<p>Set Δφ to <b>45°</b> (it is now ${p.phase}°). Wait for the beam to settle, then use the <b>Protractor</b>:</p>
             <ol><li>Drag from the centre of the array along the dashed line.</li><li>Drag again from there along the middle of the beam.</li></ol>`,
      tools: ["protractor"],
      task: {
        prompt: "Compare with sin θ = Δφ · λ / (360° · s).",
        check(m, p) {
          if (p.phase === 0) return need("First set the phase step to something other than 0°.");
          if (m.angle === null) return need("Draw both arms of the protractor.");
          const e = beamDeg(p);
          if (!Number.isFinite(e)) return need("At this phase step the main beam has no real angle — reduce Δφ.");
          return within(m.angle, e, 3, "steering angle", "°");
        },
      },
    },
    {
      title: "Grating lobes",
      html: (p: Values) => {
        const l = lam(LEVEL);
        return `<p>The spacing is now s = ${p.spacing} cells and λ = ${f1(l)} cells (s/λ = ${f2(p.spacing / l)}).</p>
                <p>Increase the <b>element spacing</b> past λ/2 ≈ ${f1(l / 2)} and then past λ.</p>`;
      },
      predict: {
        question: "With the elements more than one wavelength apart you will see…",
        options: ["A sharper single beam", "Extra beams (grating lobes)", "No beam at all"],
        answer: 1,
        explain: "Extra beams: whenever s · sin θ differs from the steering condition by a whole wavelength the waves line up again. Real arrays keep s ≤ λ/2 so no lobe appears for any steering angle.",
      },
    },
    {
      title: "Where this is used",
      html: `<ul><li><b>Radar</b> and <b>5G base stations</b> steer beams electronically, thousands of times per second.</li>
             <li><b>Medical ultrasound</b> probes focus and sweep with 64–256 elements.</li>
             <li>A longer array (more elements) gives a narrower beam: width ≈ λ / (N s).</li></ul>
             <p>Try a quadratic phase in your head: it would <i>focus</i> instead of steer. In the Sandbox you can build arrays with your own phases.</p>`,
    },
  ],
};
