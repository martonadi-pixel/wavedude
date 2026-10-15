// Wave Dude 2D web - experiments for university and research level.
// GPL-3.0-or-later.

import { Scene } from "../engine/scene";
import { continuumSpeed, continuumWavelength, groupVelocity, omegaOfLevel, phaseVelocity } from "../engine/physics";
import type { Experiment, Values } from "./types";
import { f1, f2, f3, lam, lineSource, need, period, within } from "./helpers";
import { newSource } from "../engine/sources";

// ------------------------------------------------------------------------------------------ phased array

const W4 = 1100, H4 = 700, ARRAY_X = 170, PA_LEVEL = 60, ELEMENTS = 16;

function beamDeg(p: Values): number {
  const s = (p.phase / 360) * lam(PA_LEVEL) / p.spacing;
  return Math.abs(s) > 1 ? NaN : (Math.asin(Math.abs(s)) * 180) / Math.PI;
}

export const phasedArray: Experiment = {
  id: "phased-array",
  title: "Steering a beam with a phased array",
  level: "university",
  minutes: 25,
  summary: "Sixteen sources, no moving parts: steer a beam just by delaying each source a little. How radar, 5G and ultrasound scanners aim.",
  goals: ["A row of in-phase sources makes a narrow beam", "A linear phase gradient tilts the beam: sin θ = Δφ λ / (2π s)", "Spacing above λ/2 creates grating lobes"],
  params: [
    {
      id: "phase", label: "Phase step Δφ between neighbours", min: -150, max: 150, step: 5, value: 0, unit: "°",
      help: "Each source starts this much later in its cycle than the one above it.",
      live: (sim, p) => { sim.sources[0].phaseStepYDeg = p.phase; sim.refreshSources(); },
    },
    { id: "spacing", label: "Element spacing s", min: 3, max: 30, step: 1, value: 6, unit: " cells", help: `λ = ${lam(PA_LEVEL).toFixed(1)} cells at this frequency.` },
  ],
  setup(sim, p) {
    const s = new Scene(W4, H4);
    sim.load(s, [newSource({
      name: "Array", kind: "array", x: ARRAY_X, y: H4 / 2, level: PA_LEVEL, countX: 1, countY: ELEMENTS,
      spacingY: p.spacing, phaseStepYDeg: p.phase,
    })]);
    sim.annotations.arrows.push({ x0: ARRAY_X, y0: H4 / 2, x1: W4 - 70, y1: H4 / 2, color: "#ffffff88", dashed: true });
    sim.viewMode = "intensity";
    sim.brightness.field = 30;
    sim.brightness.intensity = 52;
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
        const l = lam(PA_LEVEL);
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

// ------------------------------------------------------------------------------------------ numerical dispersion

const W5 = 1400, H5 = 360, SRC_X = 100, P1_X = 350, P2_X = 1150;

export const dispersion: Experiment = {
  id: "grid-dispersion",
  title: "Waves on a grid: numerical dispersion",
  level: "research",
  minutes: 30,
  summary: "The simulator is a finite-difference scheme, not the continuum wave equation. Measure where the two part ways.",
  goals: ["Derive the scheme's dispersion relation", "Measure phase velocity deviating at high k", "See a wave packet arrive late at the group velocity"],
  graph: "points",
  params: [
    {
      id: "level", label: "Source level (frequency)", min: 10, max: 255, step: 1, value: 30,
      help: "ω = level/255 rad per step (frequency scale 2).",
      live: (sim, p) => { for (const s of sim.sources) s.level = p.level; sim.refreshSources(); },
    },
  ],
  setup(sim, p) {
    sim.load(new Scene(W5, H5), [lineSource(SRC_X, 0, SRC_X, H5 - 1, p.level)], [
      { kind: "point", x: P1_X, y: H5 / 2, x2: 0, y2: 0, measurement: "amplitude" },
      { kind: "point", x: P2_X, y: H5 / 2, x2: 0, y2: 0, measurement: "amplitude" },
    ]);
    sim.viewMode = "field";
    sim.brightness.field = 4;
    sim.prepareSpeed = 12;
  },
  steps: [
    {
      title: "The scheme",
      html: `<p>Each step the engine applies</p>
             <p class="formula">u<sup>n+1</sup> = u<sup>n</sup> + d·(u<sup>n</sup> − u<sup>n−1</sup>) + c²·(K ∗ u<sup>n</sup>)</p>
             <p>with c² = 1/n² and the 3×3 kernel K = [[0.066, 0.184, 0.066], [0.184, −1, 0.184], [0.066, 0.184, 0.066]]. Expanding K for smooth fields gives K ∗ u ≈ 0.316 ∇²u, so the long-wave speed is <b>c = √0.316 / n ≈ 0.562 / n cells per step</b>.</p>
             <p>For a plane wave e<sup>i(kx−ωt)</sup> along x (d = 1) the scheme is exact for</p>
             <p class="formula">4 sin²(ω/2) = 1.264 c² sin²(k/2)</p>
             <p>which tends to ω = 0.562 c k only for small ω and k.</p>`,
      enter(sim) { sim.runUntil(1500); },
    },
    {
      title: "Long waves: λ at level 30",
      html: (p: Values) => `<p>Set the level to <b>30</b> (now ${p.level}). Measure the wavelength with the <b>Ruler</b> across several crests.</p>`,
      tools: ["ruler"],
      enter(sim) { setContinuous(sim); },
      task: {
        prompt: "How many wavelengths does the ruler span?",
        input: { label: "Number of waves" },
        check(m, p) {
          if (m.ruler === null || !m.input) return need("Draw the ruler and type the number of wavelengths.");
          const r = within(m.ruler / m.input, lam(p.level), 0.06, "λ", " cells", true);
          const w = omegaOfLevel(p.level);
          r.message += ` Continuum: ${f2(continuumWavelength(w, 1))}, scheme: ${f2(lam(p.level))} cells (${f2(100 * (lam(p.level) / continuumWavelength(w, 1) - 1))}%).`;
          return r;
        },
      },
    },
    {
      title: "Short waves: λ at level 220",
      html: (p: Values) => {
        const w = omegaOfLevel(220);
        return `<p>Now set the level to <b>220</b> (now ${p.level}) and measure again. Zoom in: each wavelength is only a few cells.</p>
                <p>Predicted: continuum λ = ${f2(continuumWavelength(w, 1))}, scheme λ = ${f2(lam(220))} cells.</p>`;
      },
      tools: ["ruler"],
      enter(sim) { setContinuous(sim); sim.reset(); sim.runUntil(1500); },
      task: {
        prompt: "How many wavelengths does the ruler span?",
        input: { label: "Number of waves" },
        check(m, p) {
          if (p.level < 150) return need("Set the level to 220 first.");
          if (m.ruler === null || !m.input) return need("Draw the ruler and type the number of wavelengths.");
          const r = within(m.ruler / m.input, lam(p.level), 0.06, "λ", " cells", true);
          const w = omegaOfLevel(p.level);
          r.message += ` Phase velocity here is ${f3(phaseVelocity(w, 1))} vs ${f3(continuumSpeed(1))} cells/step for long waves.`;
          return r;
        },
      },
    },
    {
      title: "A wave packet arrives late",
      html: (p: Values) => {
        const w = omegaOfLevel(p.level);
        const vg = groupVelocity(w, 1), vc = continuumSpeed(1);
        return `<p>The source now emits a single <b>Gaussian pulse</b> (6 cycles). The graph shows the field at probe P1 (x = ${P1_X}) and P2 (x = ${P2_X}).</p>
                <p>Once the pulse has passed P1, dashed markers show when it should reach P2, ${P2_X - P1_X} cells further: at the long-wave speed (${f3(vc)}) and at the scheme's group velocity <b>v<sub>g</sub> = dω/dk = ${f3(vg)}</b> cells/step.</p>
                <p>Try level 40 and level 200 (the pulse restarts on each change). At high frequency the packet is late, and it spreads because v<sub>g</sub> varies across its bandwidth.</p>`;
      },
      enter(sim, p) { setPulse(sim, p); },
    },
    {
      title: "Take-aways",
      html: `<ul><li>The phase velocity is about 1% low at 10 cells per wavelength, 3% at 6 and 7% at 4 cells per wavelength: keep ≥ 10 cells per wavelength when speeds matter.</li>
             <li>The error is anisotropic too: the 3×3 kernel's sin²(k/2) term differs along the diagonals. Try a point source at a high level in the Sandbox and look at the ring.</li>
             <li>The intensity view uses a two-stage exponential filter of u², with time constant TimeDecayFactor·100/level steps, so it lags behind fast changes.</li>
             <li>The damping edge is a graded absorber (d = √(i/thickness)), not a perfect one: put a probe near it in the Sandbox and measure how much comes back at different frequencies.</li></ul>`,
    },
  ],
};

function setContinuous(sim: Parameters<Experiment["setup"]>[0]): void {
  if (sim.sources[0]?.mode !== "pulsed") return;
  sim.sources[0].mode = "continuous";
  sim.refreshSources();
  sim.reset();
  sim.runUntil(1500);
}

/** Switches the experiment's source to a single Gaussian pulse at the current level and restarts. */
function setPulse(sim: Parameters<Experiment["setup"]>[0], p: Values): void {
  const s = sim.sources[0];
  s.mode = "pulsed";
  s.shape = "gaussian";
  s.onCycles = 6;
  s.offCycles = 1_000_000;
  s.level = p.level;
  sim.refreshSources();
  sim.reset();
  sim.runUntil(Math.ceil(3 * period(p.level) + (P2_X - SRC_X) / groupVelocity(omegaOfLevel(p.level), 1) + 8 * period(p.level) + 300));
}

/**
 * Graph markers for the pulse step: when the pulse that passed P1 should reach P2 at the long-wave speed and at the
 * group velocity. Anchored on the measured arrival at P1 (centroid of u^2), so the source's start-up does not matter.
 */
export function pulseMarkers(sim: Parameters<Experiment["setup"]>[0]): { x: number; color: string; label: string }[] {
  const h1 = sim.history[0];
  if (!h1 || h1.length < 10 || sim.sources[0]?.mode !== "pulsed") return [];
  let s = 0, sw = 0, peak = 0;
  for (let i = 0; i < h1.length; i++) { const e = h1[i] * h1[i]; s += e * i; sw += e; peak = Math.max(peak, e); }
  // wait until the pulse has fully passed P1
  const tail = h1.slice(-20).reduce((m, v) => Math.max(m, v * v), 0);
  if (sw === 0 || tail > peak * 0.01) return [];
  const t1 = sim.historyStart + s / sw;
  const level = sim.sources[0].level, dist = P2_X - P1_X;
  return [
    { x: t1, color: "#ffd84a", label: "P1" },
    { x: t1 + dist / continuumSpeed(1), color: "#9ca3af", label: "long-wave speed" },
    { x: t1 + dist / groupVelocity(omegaOfLevel(level), 1), color: "#f472b6", label: "group velocity" },
  ];
}

dispersion.params![0].live = (sim, p) => {
  for (const s of sim.sources) s.level = p.level;
  if (sim.sources[0]?.mode === "pulsed") setPulse(sim, p);
  else sim.refreshSources();
};
