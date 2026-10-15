// Wave Dude 2D web - "The Michelson interferometer" (university, 1887): one fringe per half wavelength of mirror travel.
// GPL-3.0-or-later.
//
// Measured in the engine: the detector's intensity goes from bright to almost dark (contrast > 95%) with a period of
// 7.5-8 cells of mirror travel at level 60 (lambda = 14.94 cells): lambda / 2, as it should.

import { Scene } from "../../../core/scene";
import { mean } from "../../../core/math";
import type { Sim } from "../../../sim/sim";
import type { Experiment } from "../types";
import { box, f1, lam, lamText, line, lineProbe, lineSource, look, need, within } from "../helpers";
import { Recorder } from "../record";

const W = 1100, H = 1000, MC = 520, LEVEL = 60, RUN = 4500;
const rec = new Recorder();

function scene(sim: Sim, shift: number): void {
  const s = new Scene(W, H);
  s.add(
    line(MC - 90, MC + 90, MC + 90, MC - 90, 3, "glass", { n: 2.5, name: "Beam splitter" }),    // at 45°
    box(900 + shift, MC - 120, 40, 240, "glass", { n: 10, name: "Mirror 1" }),                // moves
    box(MC - 120, 140, 240, 40, "glass", { n: 10, name: "Mirror 2" }));
  sim.load(s, [lineSource(160, MC - 70, 160, MC + 70, LEVEL, { name: "Light" })], [lineProbe(MC - 60, 860, MC + 60, 860)]);
  sim.annotations.labels.push(
    { x: 120, y: MC - 85, text: "light" },
    { x: MC + 30, y: MC - 100, text: "beam splitter" },
    { x: 900 + shift, y: MC - 135, text: "mirror 1 →" },
    { x: MC + 130, y: 165, text: "mirror 2" },
    { x: MC + 70, y: 875, text: "detector", color: "#ffd84a" },
  );
}

export const michelson: Experiment = {
  id: "michelson",
  title: "The Michelson interferometer",
  level: "university",
  minutes: 20,
  summary: "Split a beam, send the halves to two mirrors and bring them back together: moving one mirror by half a wavelength turns bright into dark into bright.",
  goals: ["A beam splitter divides a wave and recombines it", "The output depends on the path difference: one fringe per λ/2 of mirror travel", "From Michelson–Morley (1887) to LIGO's gravitational waves"],
  readMore: [
    { page: "maths-of-waves/adding-waves", label: "Adding waves" },
    { page: "how-waves-behave/interference-and-superposition", label: "Interference and superposition" },
  ],
  params: [{ id: "shift", label: "Move mirror 1", min: 0, max: 30, step: 1, value: 0, unit: " cells", help: `${lamText(LEVEL)}. Each setting is a fresh run.` }],
  open() { rec.clear(); },
  setup(sim, p) {
    scene(sim, p.shift);
    look(sim, { view: "intensity", intensity: 6.4, field: 3.2, prepare: 32, runTo: RUN });
  },
  steps: [
    {
      title: "Two paths",
      html: `<p>Light from the left meets a <b>beam splitter</b>: a thin glass plate at 45° that reflects part of the wave up towards mirror 2 and lets the rest through to mirror 1. Both parts come back, and the splitter sends a share of each down to the <b>detector</b>.</p>
             <p>What the detector sees depends on whether the two returning waves arrive <i>in step</i> (bright) or <i>out of step</i> (dark).</p>`,
      predict: {
        question: "Mirror 1 moves back by a quarter of a wavelength. The light going to it now travels…",
        options: ["A quarter wavelength further", "Half a wavelength further", "A whole wavelength further"],
        answer: 1,
        explain: "Half a wavelength further: it goes to the mirror and back. Half a wavelength turns ‘in step’ into ‘out of step’, so the detector goes from bright to dark when the mirror moves only λ/4.",
      },
    },
    {
      title: "Count the fringes",
      html: `<p>Move mirror 1 one cell at a time with the slider. Each setting is a fresh run, and when it is done the detector reading is added to the curve below.</p>
             <p>Measure several positions — enough to see at least two dark readings.</p>`,
      readout: (sim, p) => {
        rec.capture(p.shift, sim.time >= RUN, () => mean(sim.profiles[0]));
        const max = Math.max(1e-30, ...rec.list().map(q => q[1])), here = rec.get(p.shift);
        const now = here !== undefined ? `Detector: <b>${Math.round((100 * here) / max)}%</b> of the brightest reading so far` : "Measuring…";
        return now + rec.chart({ xLabel: "mirror 1 moved (cells)", yLabel: "detector", xMin: 0, xMax: 30, current: p.shift });
      },
      task: {
        prompt: "How far does the mirror move from one dark reading to the next?",
        input: { label: "Distance (cells)", placeholder: "e.g. 8" },
        check(m) {
          if (rec.size < 8) return need("Measure at least 8 mirror positions first.");
          if (m.input === null) return need("Type the distance between two dark readings.");
          return within(m.input, lam(LEVEL) / 2, 1.2, "fringe spacing", " cells");
        },
      },
    },
    {
      title: "Why half a wavelength — and why it matters",
      html: () => `<p>The light to mirror 1 travels there and back, so moving the mirror by Δx changes its path by 2Δx. Bright repeats whenever 2Δx = λ, so</p>
             <p class="formula">Δx = λ / 2 = ${f1(lam(LEVEL) / 2)} cells</p>
             <p>Counting fringes measures distances in units of half a wavelength — for visible light, about a quarter of a micrometre.</p>
             <ul>
               <li><b>1887, Michelson and Morley</b> turned their interferometer around, expecting the fringes to shift as the Earth moved through the supposed “ether”. They found no shift: one of the results that led to Einstein's relativity.</li>
               <li><b>LIGO</b> uses the same layout with 4 km arms and detected gravitational waves in 2015: a change in arm length of about a thousandth of a proton's width.</li>
             </ul>`,
    },
  ],
};
