// Wave Dude 2D web - "Why soap bubbles are colourful" (school): thin-film interference.
// GPL-3.0-or-later.
//
// Measured in the engine (pulse + echo, level 40, n = 1.33): reflection peaks at film thicknesses of 1/4, 3/4, 5/4 of the
// wavelength in the film and nearly vanishes at 1/2 and 1. The heights are ~0.6 of the plane-wave formula because the
// beam spreads on its way back to the probe; the positions match.

//
// The last steps use white light (eight colours at once, 25 nm per cell): a white beam hits a flat film at 35° and two
// probes, on the reflected and on the transmitted beam at the same distance from the film, measure each colour. Nothing
// is absorbed, so the share of a colour that is reflected is R = I_reflected / (I_reflected + I_transmitted), and the
// beams' spreading cancels out of it.

import { Scene } from "../../../core/scene";
import { newSource } from "../../../core/sources";
import { NM_PER_CELL, spectrumToRgb } from "../../../core/spectrum";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { box, f1, lam, lineSource, look, need, period, pointProbe, within } from "../helpers";
import { Recorder } from "../record";
import { SpectrumMeter, spectrumBars, spectrumColour, swatch } from "../colour";

const W = 1600, H = 1100, FILM_X = 900, LEVEL = 40, N = 1.33;
const rec = new Recorder();
const runEnd = () => Math.round(20 * period(LEVEL) + (2 * 480 + 120) / 0.55 + 600);

// ------------------------------------------------------------------ the two scenes: a burst of one colour, or white light

const WW = 1000, WH = 700, FY = 420, HIT = { x: 450, y: FY }, INC = 35, BACK = 300, OUT = 180, WFROM = 1500, WRUN = 2600;
/** The scene shown: the burst of one colour (first steps) or the white beam (last steps). */
let shown: "burst" | "white" = "burst";
const meter = new SpectrumMeter(2, WFROM, WRUN);
/** Film thickness → the share of each colour it reflects (measured with white light). */
const reflects = new Map<number, number[]>();
/** A film reflecting this share of every colour is shown at full brightness (a soap film reflects up to about 16%). */
const FULL = 0.16;

function burstScene(sim: Sim, p: Values): void {
  const s = new Scene(W, H).add(box(FILM_X, 0, p.t, H, "glass", { n: N, name: "Soap film" }));
  const per = period(LEVEL);
  sim.load(s, [lineSource(300, 0, 300, H - 1, LEVEL, { name: "Light", mode: "pulsed", shape: "gaussian", onCycles: 20, offCycles: 1_000_000, detach: true, detachAfterSteps: Math.round(20 * per + 10) })],
    [pointProbe(420, H / 2)]);
  sim.engine.setSpectrumProbes([]);
  sim.annotations.labels.push({ x: FILM_X + p.t + 8, y: 60, text: `soap film (n = ${N}), ${p.t} cells`, color: "#9fe3ff" }, { x: 430, y: H / 2 - 14, text: "detector", color: "#ffd84a" });
  look(sim, { view: "field", field: 6, prepare: 48, runTo: runEnd() });
}

/** A flat film, and white light from the top left at 35°: the reflected beam goes up to the right, the rest down. */
function whiteScene(sim: Sim, p: Values): void {
  const s = new Scene(WW, WH).add(box(0, FY, WW, p.t, "glass", { n: N, name: "Soap film" }));
  const a = (INC * Math.PI) / 180, d = { x: Math.sin(a), y: Math.cos(a) }, r = { x: d.x, y: -d.y };
  const light = newSource({ kind: "laser", name: "White light", x: Math.round(HIT.x - BACK * d.x), y: Math.round(HIT.y - BACK * d.y),
    angleDeg: (Math.atan2(d.y, d.x) * 180) / Math.PI, beamWidth: 40, level: LEVEL });
  sim.load(s, [light]);
  const refl = { x: HIT.x + OUT * r.x, y: HIT.y + OUT * r.y }, through = { x: HIT.x + OUT * d.x, y: HIT.y + p.t + OUT * d.y };
  sim.engine.setSpectrumProbes([refl, through]);
  meter.reset();
  sim.annotations.labels.push(
    { x: light.x - 60, y: light.y - 16, text: "white light", color: "#ffffff" },
    { x: 20, y: FY - 10, text: `soap film: ${p.t} cells = ${p.t * NM_PER_CELL} nm`, color: "#9fe3ff" },
    { x: refl.x + 10, y: refl.y, text: "reflected", color: "#ffd84a" },
    { x: through.x + 10, y: through.y, text: "through the film", color: "#ffd84a" });
  // until the reflection is measured: bright enough for a reflection of a few % (the white beams over-expose)
  look(sim, { view: "intensity", intensity: 24, prepare: 32, runTo: WRUN });
}

const build = (sim: Sim, p: Values) => (shown === "white" ? whiteScene(sim, p) : burstScene(sim, p));
/** Steps say which scene they need; it is built only when it changes. */
const use = (want: "burst" | "white") => (sim: Sim, p: Values) => { if (shown !== want) { shown = want; build(sim, p); } };

/**
 * The white-light measurement for this thickness: each colour's share reflected. The picture's brightness is set from
 * the light that came in, so that a reflection of FULL just reaches full colour: a film that reflects little looks dark,
 * as it does in real life.
 */
function measureWhite(sim: Sim, p: Values): number[] | undefined {
  meter.update(sim);
  if (meter.done && !reflects.has(p.t)) {
    const re = meter.intensity(0), tr = meter.intensity(1);
    reflects.set(p.t, re.map((v, k) => v / Math.max(1e-30, v + tr[k])));
    const lin = spectrumToRgb(re.map((v, k) => v + tr[k])), mx = Math.max(...lin);
    if (mx > 0) sim.fadeBrightness("intensity", Math.sqrt(0.8 / (FULL * mx)) * (100 / sim.brightnessPct), 900);
  }
  return reflects.get(p.t);
}

/** How a reflection looks: dark when the film reflects little (FULL = full brightness). */
const reflected = (R: number[]) => spectrumColour(R.map(v => v / FULL), false);

/** What a white-light readout shows: the reflected colour, the colour that goes through, and the bars. */
function whiteReadout(sim: Sim, p: Values, bars: boolean): string {
  const R = measureWhite(sim, p);
  if (!R) return `Measuring the light that comes back… ${Math.round(100 * meter.progress)}%`;
  return swatch(reflected(R), `Reflected by a ${p.t * NM_PER_CELL} nm film`) +
    swatch(spectrumColour(R.map(v => 1 - v)), "What goes through (the colours that were not reflected)") +
    (bars ? spectrumBars(R, { percent: true, title: "share of each colour reflected (wavelength in nm)" }) : "");
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
  open() { rec.clear(); reflects.clear(); shown = "burst"; },
  setup(sim, p) { build(sim, p); },
  steps: [
    {
      title: "Two reflections",
      enter: use("burst"),
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
      enter: use("burst"),
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
      enter: use("burst"),
      html: () => `<p>The echo from the back face travels through the film twice: 2 × thickness. At a quarter wavelength that is half a wavelength — which would cancel — but the front echo is flipped upside down when it bounces off the denser film, which adds another half. So the two echoes end up <b>in step</b>, and the reflection is strongest.</p>
             <p class="formula">strongest when thickness = ¼, ¾, 1¼ … wavelengths in the film</p>
             <p>At half a wavelength the echoes cancel and the film almost disappears.</p>
             <p class="aside">On this grid the peaks come out about one cell thicker than the formula (strongest near 5 and 14 cells instead of 4.2 and 12.6): a film only a few cells thick has slightly blurred faces, which adds roughly a cell of thickness. The spacing between peaks, half a wavelength in the film, is exact. The heights are a little lower than the formula because the light spreads out on its way back to the detector.</p>`,
    },
    {
      title: "White light on the film",
      whiteLight: 1,
      enter: use("white"),
      html: (p: Values) => `<p>So far the light had <b>one</b> colour: one wavelength. Sunlight and lamplight are <b>white</b>: a mix of all the colours of the rainbow, each with its own wavelength, from violet (about 400 nm) to deep red (about 700 nm).</p>
             <p>Now the simulator runs <b>eight colours at once</b>, from violet 410 nm to deep red 690 nm, and the picture shows their real mix. One cell is 25 nm, so this film is ${p.t * NM_PER_CELL} nm thick: a real soap film.</p>
             <p>A beam of white light comes in from the top left. Part of it bounces off the film (up to the right); the rest goes through (down to the right).</p>`,
      predict: {
        question: "The light the film reflects will look…",
        options: ["White, like the light that came in", "Coloured", "Black"],
        answer: 1,
        explain: "Coloured! Each colour has its own wavelength, so for each colour the two reflections — from the front and from the back of the film — meet with a different delay. Some colours come back in step and are reflected strongly; others cancel and hardly come back at all. White light with some colours missing looks coloured.",
      },
      readout: (sim, p) => whiteReadout(sim, p, false),
    },
    {
      title: "Why that colour?",
      whiteLight: 1,
      enter: use("white"),
      html: (p: Values) => `<p>The bars show, for each of the eight colours, how much of it the film reflected — measured in the simulation, not calculated.</p>
             <p>Every colour hits the same film. But a ${p.t * NM_PER_CELL} nm film is a quarter wavelength thick (inside the water) for some colours and half a wavelength for others. A quarter wavelength makes the two reflections <b>add up</b> (as you measured with one colour); half a wavelength makes them <b>cancel</b>.</p>
             <p>Your eye does not see the bars: it sees the <b>mix</b> of what comes back. Reflect lots of red and blue but little green, and the mix looks purple; take away blue and it looks yellow. The colours that are <i>not</i> reflected go through the film, so the light behind it has the opposite colour.</p>`,
      readout: (sim, p) => whiteReadout(sim, p, true),
    },
    {
      title: "Thinner and thicker: the bubble's bands",
      whiteLight: 1,
      enter: use("white"),
      html: `<p>Change the <b>film thickness</b>. Each thickness is a fresh run; when its reflection is measured, its colour is added to the strip below.</p>
             <p>A real soap film drains: it is thicker at the bottom than at the top, so it shows <b>bands of colour</b>, one for each thickness — the swirls on a soap bubble, or on a puddle with a film of oil.</p>
             <ul><li>Very thin films (1–3 cells, under about 80 nm) reflect almost nothing: both reflections cancel for every colour. A bubble turns <b>black</b> at the top just before it pops.</li>
             <li>Thick films (many wavelengths) reflect a bit of every colour again and look white or grey: the colours overlap and wash out.</li></ul>
             <p><b>Anti-reflection coatings</b> on glasses and camera lenses use the same trick the other way round: a layer a quarter of a green wavelength thick whose two reflections cancel, so less light is lost and there is less glare.</p>`,
      readout: (sim, p) => {
        const R = measureWhite(sim, p);
        const cells = Array.from({ length: 30 }, (_, i) => {
          const r = reflects.get(i + 1);
          return `<rect x="${i * 10}" y="0" width="10" height="26" fill="${r ? reflected(r) : "transparent"}" stroke="${r ? "none" : "currentColor"}" stroke-opacity="0.15"/>`;
        }).join("");
        const strip = `<svg viewBox="0 0 302 42" class="rec-chart" role="img" aria-label="colours measured by thickness"><g>${cells}</g>` +
          `<rect x="${(p.t - 1) * 10}" y="0" width="10" height="26" fill="none" stroke="#fff" stroke-width="1.5"/>` +
          `<text x="0" y="38" font-size="9" fill="currentColor">25 nm</text><text x="302" y="38" font-size="9" text-anchor="end" fill="currentColor">750 nm</text></svg>`;
        return (R ? swatch(reflected(R), `A ${p.t * NM_PER_CELL} nm film reflects this colour`) : `Measuring… ${Math.round(100 * meter.progress)}%`) + strip +
          `<div class="muted small">${reflects.size} of 30 thicknesses measured</div>`;
      },
    },
  ],
};
