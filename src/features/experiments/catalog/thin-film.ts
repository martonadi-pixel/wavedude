// Wave Dude 2D web - "Why soap bubbles are colourful" (school): thin-film interference.
// GPL-3.0-or-later.
//
// Measured in the engine (pulse + echo, level 40, n = 1.33): reflection peaks at film thicknesses of 1/4, 3/4, 5/4 of the
// wavelength in the film and nearly vanishes at 1/2 and 1. The heights are ~0.6 of the plane-wave formula because the
// beam spreads on its way back to the probe; the positions match.

import { Scene } from "../../../core/scene";
import type { Experiment } from "../types";
import { box, f1, lam, lineSource, look, need, period, pointProbe, within } from "../helpers";
import { Recorder } from "../record";

const W = 1600, H = 1100, FILM_X = 900, LEVEL = 40, N = 1.33;
const rec = new Recorder();
const runEnd = () => Math.round(20 * period(LEVEL) + (2 * 480 + 120) / 0.55 + 600);

/** Reflectance of a film of index n and thickness t (cells) for a wave of this level, with the grid's wavelengths. */
function filmR(level: number, t: number): number {
  const k0 = (2 * Math.PI) / lam(level), k1 = (2 * Math.PI) / lam(level, N), n = k1 / k0;
  const r1 = (1 - n) / (1 + n), r2 = -r1, d = 2 * k1 * t;
  const re = r1 + r2 * Math.cos(d), im = r2 * Math.sin(d), dr = 1 + r1 * r2 * Math.cos(d), di = r1 * r2 * Math.sin(d);
  return (re * re + im * im) / (dr * dr + di * di);
}

/** The colour a film of thickness t reflects: three wavelengths standing for red, green and blue (700, 550, 450 nm). */
function filmColour(t: number): string {
  const levels = [33, 42, 52]; // wavelengths in the ratio 700 : 550 : 450
  const maxR = filmR(42, lam(42, N) / 4);
  const c = levels.map(l => Math.min(255, Math.round(255 * Math.sqrt(filmR(l, t) / maxR))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export const thinFilm: Experiment = {
  id: "thin-film",
  title: "Why soap bubbles are colourful",
  level: "school",
  minutes: 15,
  summary: "A film thinner than a hair reflects some colours and swallows others — thin-film interference, from soap bubbles to the coating on your glasses.",
  goals: ["Light reflects from both faces of a thin film", "The two reflections add or cancel depending on the thickness", "Strongest reflection when the film is a quarter of a wavelength thick"],
  readMore: [
    { page: "how-waves-behave/interference-and-superposition", label: "Interference and superposition" },
    { page: "light-and-optics/colour-dispersion-rainbows", label: "Colour, dispersion and rainbows" },
  ],
  params: [{ id: "t", label: "Film thickness", min: 1, max: 30, step: 1, value: 2, unit: " cells", help: `Wavelength inside the film: ${lam(LEVEL, N).toFixed(1)} cells. Each setting is a fresh run.` }],
  open() { rec.clear(); },
  setup(sim, p) {
    const s = new Scene(W, H).add(box(FILM_X, 0, p.t, H, "glass", { n: N, name: "Soap film" }));
    const per = period(LEVEL);
    sim.load(s, [lineSource(300, 0, 300, H - 1, LEVEL, { name: "Light", mode: "pulsed", shape: "gaussian", onCycles: 20, offCycles: 1_000_000, detach: true, detachAfterSteps: Math.round(20 * per + 10) })],
      [pointProbe(420, H / 2)]);
    sim.annotations.labels.push({ x: FILM_X + p.t + 8, y: 60, text: `soap film (n = ${N}), ${p.t} cells`, color: "#9fe3ff" }, { x: 430, y: H / 2 - 14, text: "detector", color: "#ffd84a" });
    look(sim, { view: "field", field: 6, prepare: 48, runTo: runEnd() });
  },
  steps: [
    {
      title: "Two reflections",
      html: `<p>A soap bubble's wall is a film of soapy water only a few hundred nanometres thick — less than one hundredth of a hair. Light reflects from its <b>front</b> face and from its <b>back</b> face.</p>
             <p>Here a short burst of light hits a film (the thin blue line). The detector measures the burst going out and the echo coming back from the film.</p>`,
      predict: {
        question: "If the film gets thicker, the reflection…",
        options: ["Always gets stronger", "Goes up and down as the thickness grows", "Stays the same"],
        answer: 1,
        explain: "It goes up and down. The echo from the back face travels further; depending on how much further, it arrives in step (strong reflection) or out of step (almost none) with the echo from the front face.",
      },
    },
    {
      title: "Measure the reflection",
      html: `<p>Change the thickness one cell at a time. Each setting is a fresh burst; when its echo is back, the share of the light that was reflected is added to the curve.</p>`,
      readout: (sim, p) => {
        rec.capture(p.t, sim.time >= runEnd(), () => {
          // the burst going out, then the echo: the strongest field at the detector before and after they part
          const h = sim.history[0] ?? [], per = period(LEVEL);
          const split = Math.round(10 * per + 600 / 0.562) - sim.historyStart;
          let inc = 0, ref = 0;
          h.forEach((u, i) => { if (i < split) inc = Math.max(inc, Math.abs(u)); else ref = Math.max(ref, Math.abs(u)); });
          return inc > 0 ? (ref / inc) ** 2 : null;
        });
        const r = rec.get(p.t);
        return (r !== undefined ? `Reflected: <b>${(100 * r).toFixed(2)}%</b> of the light` : "Measuring…") +
          rec.chart({ xLabel: "film thickness (cells)", yLabel: "reflected", xMin: 1, xMax: 30, current: p.t });
      },
      task: {
        prompt: "Which is the thinnest film that reflects the most?",
        input: { label: "Thickness (cells)", placeholder: "e.g. 5" },
        check(m) {
          if (rec.size < 8) return need("Measure at least 8 thicknesses first.");
          if (m.input === null) return need("Type the thickness.");
          const r = within(m.input, lam(LEVEL, N) / 4, 1.5, "thickness", " cells");
          r.message += ` That is a quarter of the wavelength inside the film (${f1(lam(LEVEL, N))} cells).`;
          return r;
        },
      },
    },
    {
      title: "Quarter of a wavelength",
      html: () => `<p>The echo from the back face travels through the film twice: 2 × thickness. At a quarter wavelength that is half a wavelength — which would cancel — but the front echo is flipped upside down when it bounces off the denser film, which adds another half. So the two echoes end up <b>in step</b>, and the reflection is strongest.</p>
             <p class="formula">strongest when thickness = ¼, ¾, 1¼ … wavelengths in the film</p>
             <p>At half a wavelength the echoes cancel and the film almost disappears.</p>
             <p class="aside">On this grid the peaks come out about one cell thicker than the formula (strongest near 5 and 14 cells instead of 4.2 and 12.6): a film only a few cells thick has slightly blurred faces, which adds roughly a cell of thickness. The spacing between peaks, half a wavelength in the film, is exact. The heights are a little lower than the formula because the light spreads out on its way back to the detector.</p>`,
    },
    {
      title: "And the colours?",
      html: `<p>White light is a mix of all colours, and each colour has its own wavelength. A film that is a quarter of a wavelength thick for green is not for red or blue, so it reflects mostly green. Change the thickness and the reflected colour changes: that is the swirl of colours on a soap bubble or an oil puddle, and why a bubble turns black just before it pops (too thin to reflect anything).</p>
             <p>The colour below is <i>predicted</i> from the formula you just tested, using three wavelengths in the ratio of red, green and blue light.</p>
             <p>Anti-reflection coatings on glasses and camera lenses use the same trick the other way round: a quarter-wave layer whose two reflections cancel.</p>`,
      readout: (_sim, p) => {
        const strip = Array.from({ length: 61 }, (_, i) => `<rect x="${i * 5}" y="0" width="5.5" height="26" fill="${filmColour(i * 0.5)}"/>`).join("");
        return `<div class="film-row"><span class="film-dot" style="--c:${filmColour(p.t)}"></span>` +
          `<span>A ${p.t}-cell film reflects this colour.</span></div>` +
          `<svg viewBox="0 0 305 40" class="rec-chart"><g>${strip}</g><line x1="${p.t * 10}" x2="${p.t * 10}" y1="0" y2="30" stroke="#fff" stroke-width="1.5"/>` +
          `<text x="0" y="38" font-size="9" fill="currentColor">0</text><text x="290" y="38" font-size="9" fill="currentColor">30 cells</text></svg>`;
      },
    },
  ],
};
