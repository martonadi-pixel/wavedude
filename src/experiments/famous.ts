// Wave Dude 2D web - famous experiments: Arago's spot (1818), the Michelson interferometer (1887), Bragg's X-ray
// crystallography (1913) with Davisson-Germer's electrons (1927), Compton scattering (1923), and soap-film colours.
// Each geometry was checked in the engine before it was written down (see the comments for the measured numbers).
// GPL-3.0-or-later.

import { Scene, BARRIER, glass } from "../engine/scene";
import { newSource, elementsOf } from "../engine/sources";
import { groupVelocity, omegaOfLevel, wavelength } from "../engine/physics";
import type { Experiment, Values } from "./types";
import type { Sim } from "../sim";
import { f1, f2, lam, lineSource, need, period, within } from "./helpers";
import { Recorder } from "./record";

function mean(a: ArrayLike<number> | undefined): number {
  if (!a || !a.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** "measuring" while the run that belongs to the current setting is still going, else the measured value. */
function measured(sim: Sim, target: number): boolean {
  return sim.time >= target;
}

// ------------------------------------------------------------------------------------------ Arago's spot (school)
// Measured in the engine with a clean, one-way plane wave (a laser beam far wider than the scene, whose housing
// absorbs anything coming back, so no cavity forms between the obstacle and the source). Along a screen behind the
// obstacle there are three regimes, set by the Fresnel number a^2 / (lambda L):
//  - close behind it (e.g. a = 35, L < 200) the light that bends round the edges has not met in the middle yet:
//    the brightest light in the shadow is near its edges, though the centre is already a small bright line;
//  - at medium distances (a = 35: 200-450, a = 40: 300-950, a = 55: 700+) the centre line is the brightest part
//    of the shadow, 2-3 times brighter than the dark bands next to it;
//  - far behind it the dark bands are gone and light fills the shadow, brightest in the middle.
// P2 therefore sits on the dark band next to the centre line, found from the light along the screen, instead of a
// fixed distance from it: halfway to the shadow's edge lands on a bright band at some distances.

const AW = 1500, AH = 1000, A_CY = 500, A_OBST_X = 400, A_LEVEL = 60;
const A_RUN = 4500;

interface AragoScan {
  /** P2's distance below the centre line, in cells. */
  off: number;
  /** P2 sits on a dark band (else there is none any more and it sits halfway to the shadow's edge). */
  onBand: boolean;
  /** The brightest light in the shadow compared with the centre line. */
  edge: number;
  /** Close behind the obstacle: the light bending round the edges has not met in the middle yet. */
  close: boolean;
  /** The centre line compared with the light outside the shadow. */
  ofOpen: number;
}

/** What the screen shows now (P2's place and the regime), for the readout and the graph markers. */
let aragoNow: { half: number; off: number; scan: AragoScan | null } = { half: 40, off: 20, scan: null };

/** Reads the light along the screen and finds the dark band next to the centre line. */
function aragoScan(sim: Sim, p: Values): AragoScan {
  const x = A_OBST_X + p.dist, h = p.half, R = 200;
  const col = sim.engine.readIntensity(x, A_CY - R, 1, 2 * R + 1);
  // both halves of the screen averaged, then smoothed over 5 cells (the time average still ripples a little)
  const sym = Array.from({ length: R + 1 }, (_, k) => (col[R + k] + col[R - k]) / 2);
  const sm = sym.map((_, k) => {
    let s = 0, n = 0;
    for (let j = k - 2; j <= k + 2; j++) if (Math.abs(j) <= R) { s += sym[Math.abs(j)]; n++; }
    return s / n;
  });
  let band = 0;
  // the first dip that is clearly darker than the centre and that the light rises again from (towards the edge)
  for (let k = 3; k <= h && !band; k++)
    if (sm[k] <= sm[k - 1] && sm[k] <= sm[k + 1] && sm[k] < 0.8 * sm[0] && Math.max(...sm.slice(k, h + 25)) > 1.2 * sm[k]) band = k;
  const brightest = Math.max(...sm.slice(0, Math.max(1, h - 3)));
  let open = 0;
  for (let k = h + 60; k <= Math.min(R, h + 160); k++) open += sm[k] / (Math.min(R, h + 160) - h - 59);
  // measured: the centre line is the brightest part of the shadow once the Fresnel number a^2 / (lambda L) < ~0.42
  const edge = brightest / Math.max(1e-12, sm[0]), fresnel = (h * h) / (lam(A_LEVEL) * (p.dist - 2));
  return { off: band || Math.round(h / 2), onBand: band > 0, edge, close: edge > 1.25 && fresnel > 0.3, ofOpen: sm[0] / Math.max(1e-12, open) };
}

/** The screen: P1 on the centre line, P2 on the dark band next to it, and the line probe L1 along it. */
function aragoProbe(sim: Sim, p: Values): void {
  const x = A_OBST_X + p.dist;
  const scan = sim.time >= A_RUN ? aragoScan(sim, p) : null;
  aragoNow = { half: p.half, off: scan ? scan.off : Math.round(p.half / 2), scan };
  const y2 = A_CY + aragoNow.off;
  sim.setProbes([
    { kind: "point", x, y: A_CY, x2: x, y2: A_CY, measurement: "intensity" },
    { kind: "point", x, y: y2, x2: x, y2, measurement: "intensity" },
    { kind: "line", x, y: A_CY - 200, x2: x, y2: A_CY + 200, measurement: "intensity" },
  ]);
  sim.annotations.labels = sim.annotations.labels.filter(l => !l.text.startsWith("screen"));
  sim.annotations.labels.push({ x: x + 8, y: A_CY - 205, text: "screen", color: "#f472b6" });
}

/** Zooms onto the shadow from the obstacle to a little behind the screen, with the whole line probe. */
function aragoZoom(sim: Sim, p: Values): void {
  if (sim.view.mode3d) return;
  sim.view.zoomTo(A_OBST_X - 60, A_CY - 215, A_OBST_X + Math.max(450, p.dist + 120), A_CY + 215);
}

/** Intensity now at the two probes (read straight from the simulation, so it works paused too). */
function aragoProbes(sim: Sim, p: Values): { p1: number; p2: number } | null {
  if (sim.time < A_RUN) return null;
  const x = A_OBST_X + p.dist;
  return { p1: sim.engine.readCell(x, A_CY)[1], p2: sim.engine.readCell(x, A_CY + aragoNow.off)[1] };
}

const times = (r: number) => (r >= 20 ? "more than 20×" : `${r.toFixed(1)}×`);

export const arago: Experiment = {
  id: "arago-spot",
  title: "Arago's spot: light in the middle of a shadow",
  level: "school",
  minutes: 12,
  summary: "In 1818 a prediction meant to ridicule the wave theory of light — a bright spot in the middle of a shadow — turned out to be true.",
  goals: ["Shadows of small objects are not completely dark", "Waves bending round both edges meet in step in the middle", "How one experiment convinced scientists that light is a wave"],
  graph: "auto",
  profileMarkers: () => [
    { x: 200 - aragoNow.half, color: "#ffffff66", label: "shadow" },
    { x: 200 + aragoNow.half, color: "#ffffff66" },
    { x: 200, color: "#ffd84a", label: "P1" },
    { x: 200 + aragoNow.off, color: "#4ade80", label: "P2" },
  ],
  // dark purple bands and an orange centre line: the clearest scheme for the faint structure in the shadow
  colors: { intensity: "inferno.json" },
  params: [
    { id: "half", label: "Half-width of the obstacle", min: 25, max: 60, step: 5, value: 40, unit: " cells", help: `λ = ${lam(A_LEVEL).toFixed(1)} cells. Each change restarts the run.` },
    { id: "dist", label: "Screen distance behind the obstacle", min: 100, max: 950, step: 10, value: 330, unit: " cells", help: "Move the screen (the graph shows the light along it).",
      live: (sim, p) => {
        aragoProbe(sim, p);
        // follow the screen when it leaves the picture
        const x = A_OBST_X + p.dist, v = sim.view;
        if (x > v.toCell(v.cssW, 0).x - 30 || x < v.toCell(0, 0).x + 30) aragoZoom(sim, p);
      } },
  ],
  setup(sim, p) {
    const s = new Scene(AW, AH);
    s.rect(A_OBST_X, A_CY - p.half, 4, 2 * p.half, BARRIER);
    // a very wide laser beam: a clean plane wave that only goes one way
    sim.load(s, [newSource({ name: "Light", kind: "laser", x: 150, y: A_CY, level: A_LEVEL, beamWidth: 2500 })]);
    sim.annotations.labels.push({ x: A_OBST_X + 10, y: A_CY - p.half - 10, text: "obstacle" });
    sim.annotations.arrows.push(
      { x0: A_OBST_X + 4, y0: A_CY - p.half, x1: AW - 120, y1: A_CY - p.half, color: "#ffffff66", dashed: true },
      { x0: A_OBST_X + 4, y0: A_CY + p.half, x1: AW - 120, y1: A_CY + p.half, color: "#ffffff66", dashed: true },
    );
    aragoProbe(sim, p);
    // the shadow and what is in it fill the screen (zoom out to see the whole scene); again once the graphs under
    // the picture have appeared and the view has its final size
    aragoZoom(sim, p);
    setTimeout(() => aragoZoom(sim, p), 300);
    sim.viewMode = "intensity";
    sim.brightness.intensity = 3;
    sim.brightness.field = 2;
    sim.prepareSpeed = 24;
    sim.runUntil(A_RUN, () => {
      // the light on the centre line at full colour: the line shows bright, the dark bands next to it stay dark
      // (the light outside the shadow simply saturates)
      const centre = sim.engine.readCell(A_OBST_X + p.dist, A_CY)[1];
      if (centre > 0) sim.fadeBrightness("intensity", 0.95 / Math.sqrt(centre));
      // P2 onto the dark band, now that the light along the screen has settled
      aragoProbe(sim, p);
      // keep running so the probe graphs stay live when the screen is moved
      sim.running = true;
      aragoZoom(sim, p);
    });
  },
  steps: [
    {
      title: "A shadow",
      html: `<p>A straight wave hits a small obstacle. The dashed lines mark its <b>geometric shadow</b>: where a beam of tiny particles flying in straight lines could not reach.</p>
             <p>In 1818 the French Academy held a prize contest on the nature of light. Augustin Fresnel entered a wave theory. One of the judges, Siméon Denis Poisson, worked out what Fresnel's equations predicted behind a small round obstacle, and found something he thought was absurd.</p>`,
      predict: {
        question: "What is in the very middle of the shadow?",
        options: ["Complete darkness", "A bright spot", "A blurry grey, evenly dim"],
        answer: 1,
        explain: "A bright spot! The waves that bend round the edges all travel the same distance to the centre line, so they arrive in step and add up. Poisson thought this proved Fresnel wrong — then François Arago did the experiment and saw the spot.",
      },
    },
    {
      title: "Find the bright line",
      html: `<p>Look along the middle of the shadow, between the dashed lines: a <b>bright line runs down its centre</b>, with darker bands on either side.</p>
             <p>Two probes sit on the screen: <b style="color:#ffd84a">P1</b> exactly on the centre line, <b style="color:#4ade80">P2</b> a little closer to the shadow's edge. The graphs show what they measure over time, and the light all along the screen (L1, with P1, P2 and the shadow's edges marked).</p>
             <p>The picture is zoomed onto the shadow; press <b>Fit</b> to see the whole set-up.</p>
             <p>Move the screen with the <b>Screen distance</b> slider; P2 moves along, staying beside the centre line. <b>Close</b> behind the obstacle the light bending round the edges has not met in the middle yet, so the shadow is brightest near its edges. At <b>medium</b> distances the bright centre line stands out most. <b>Far</b> away the dark bands fade and light fills the shadow.</p>`,
      predict: {
        question: "P1 is in the very middle of the shadow, P2 is a little closer to the shadow's edge. Which one measures more light?",
        options: ["P2 — it is nearer the light", "P1 — the middle", "Both the same: it is all shadow"],
        answer: 1,
        explain: "P1, in the middle! P2 is closer to the lit area, yet it sits on a dark band where the waves from the two edges arrive out of step. On the centre line they always arrive in step.",
      },
      readout: (sim, p) => {
        const q = aragoProbes(sim, p), s = aragoNow.scan;
        if (!q || !s) return "Waiting for the light to fill the picture…";
        const ratio = q.p1 / Math.max(1e-12, q.p2);
        let txt = `<span style="color:#ffd84a">P1</span> (centre): <b>${q.p1.toExponential(2)}</b> · ` +
          `<span style="color:#4ade80">P2</span> (${s.onBand ? "dark band" : "halfway to the edge"}): <b>${q.p2.toExponential(2)}</b><br>`;
        if (s.close)
          txt += `<b>Close behind the obstacle:</b> ${s.onBand ? `the centre is already ${times(ratio)} brighter than the dark band beside it, but ` : ""}` +
            `the brightest light in the shadow is near its edges (${s.edge.toFixed(1)}× the centre). The waves bending round the two edges have not met in the middle yet — move the screen further back.`;
        else if (s.onBand)
          txt += `The centre gets <b>${times(ratio)}</b> as much light as P2 on the dark band beside it: a bright line in the middle of the shadow, ${Math.round(100 * s.ofOpen)}% as bright as the light outside it.`;
        else if (ratio >= 1.2)
          txt += `<b>Further back</b> the dark bands fade as light fills the shadow, but the centre still gets <b>${times(ratio)}</b> as much light as P2 — ${Math.round(100 * s.ofOpen)}% as bright as the light outside.`;
        else
          txt += `<b>Further back</b> light fills the shadow and the centre line no longer stands out (${times(ratio)} P2). Move the screen closer to find it again.`;
        return txt;
      },
    },
    {
      title: "A spot in 3D, a line in 2D",
      html: `<p>Arago used a small metal disc. Every point of its round edge is the same distance from the axis behind it, so <i>all</i> the bent waves meet there in step: a bright spot about as bright as if the disc were not there at all.</p>
             <p>This simulator is 2D, so the “disc” is a strip with only <b>two</b> edges. Their waves still meet in step on the centre line — the bright line you see — but with only two edges adding up it is fainter than Arago's spot, and clearest at medium distances.</p>
             <p>Change the obstacle's width: the bright centre line is always there, it just appears further away for wider obstacles. Fresnel won the prize, and the wave theory of light was accepted.</p>`,
    },
  ],
};

// ------------------------------------------------------------------------------------------ Michelson interferometer (university)
// Measured in the engine: the detector's intensity goes from bright to almost dark (contrast > 95%) with a period of
// 7.5-8 cells of mirror travel at level 60 (lambda = 14.94 cells): lambda / 2, as it should.

const MW = 1100, MH = 1000, MC = 520, M_LEVEL = 60;
const michelsonRec = new Recorder();

function michelsonScene(sim: Sim, shift: number): void {
  const s = new Scene(MW, MH);
  s.segment(MC - 90, MC + 90, MC + 90, MC - 90, 3, glass(2.5));              // beam splitter at 45°
  s.rect(900 + shift, MC - 120, 40, 240, { n: 10 });                         // mirror 1 (moves)
  s.rect(MC - 120, 140, 240, 40, { n: 10 });                                  // mirror 2
  sim.load(s, [lineSource(160, MC - 70, 160, MC + 70, M_LEVEL, { name: "Light" })],
    [{ kind: "line", x: MC - 60, y: 860, x2: MC + 60, y2: 860, measurement: "intensity" }]);
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
  params: [{ id: "shift", label: "Move mirror 1", min: 0, max: 30, step: 1, value: 0, unit: " cells", help: `λ = ${lam(M_LEVEL).toFixed(1)} cells. Each setting is a fresh run.` }],
  open() { michelsonRec.clear(); },
  setup(sim, p) {
    michelsonScene(sim, p.shift);
    sim.viewMode = "intensity";
    sim.brightness.intensity = 6.4;
    sim.brightness.field = 3.2;
    sim.prepareSpeed = 32;
    sim.runUntil(4500);
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
        if (measured(sim, 4500) && !michelsonRec.has(p.shift)) michelsonRec.set(p.shift, mean(sim.profiles[0]));
        const max = Math.max(1e-30, ...michelsonRec.list().map(q => q[1]));
        const now = michelsonRec.has(p.shift) ? `Detector: <b>${Math.round((100 * michelsonRec.list().find(q => q[0] === p.shift)![1]) / max)}%</b> of the brightest reading so far` : "Measuring…";
        return now + michelsonRec.chart({ xLabel: "mirror 1 moved (cells)", yLabel: "detector", xMin: 0, xMax: 30, current: p.shift });
      },
      task: {
        prompt: "How far does the mirror move from one dark reading to the next?",
        input: { label: "Distance (cells)", placeholder: "e.g. 8" },
        check(m) {
          if (michelsonRec.size < 8) return need("Measure at least 8 mirror positions first.");
          if (m.input === null) return need("Type the distance between two dark readings.");
          return within(m.input, lam(M_LEVEL) / 2, 1.2, "fringe spacing", " cells");
        },
      },
    },
    {
      title: "Why half a wavelength — and why it matters",
      html: () => `<p>The light to mirror 1 travels there and back, so moving the mirror by Δx changes its path by 2Δx. Bright repeats whenever 2Δx = λ, so</p>
             <p class="formula">Δx = λ / 2 = ${f1(lam(M_LEVEL) / 2)} cells</p>
             <p>Counting fringes measures distances in units of half a wavelength — for visible light, about a quarter of a micrometre.</p>
             <ul>
               <li><b>1887, Michelson and Morley</b> turned their interferometer around, expecting the fringes to shift as the Earth moved through the supposed “ether”. They found no shift: one of the results that led to Einstein's relativity.</li>
               <li><b>LIGO</b> uses the same layout with 4 km arms and detected gravitational waves in 2015: a change in arm length of about a thousandth of a proton's width.</li>
             </ul>`,
    },
  ],
};

// ------------------------------------------------------------------------------------------ Bragg / Davisson-Germer (university)
// Measured in the engine (square lattice d = 14 of weak atoms, n = 1.25, radius 2; level 60): a single clear reflection
// peak at 30° glancing angle. Bragg's law alone gives 32.2°; with the refraction of the crystal's average index
// (eps_eff = 1 + f (n^2 - 1)) it predicts 29.9° — the same correction X-ray crystallographers apply.

const BW = 1500, BH = 1150, B_TOP = 560, B_HX = 850, B_D = 14, B_ATOM_N = 1.25, B_ATOM_R = 2;
const braggRec = new Map<number, Recorder>();
let braggFill = 0.064;

function braggPrediction(level: number): { bragg: number; corrected: number } {
  const l = lam(level);
  const nEff = Math.sqrt(1 + braggFill * (B_ATOM_N ** 2 - 1));
  const s = l / (2 * B_D);
  const sIn = l / (2 * B_D * nEff);
  const corrected = sIn < 1 ? deg(Math.acos(Math.min(1, nEff * Math.cos(Math.asin(sIn))))) : NaN;
  return { bragg: s < 1 ? deg(Math.asin(s)) : NaN, corrected };
}

export const bragg: Experiment = {
  id: "bragg",
  title: "X-rays and crystals: Bragg's law",
  level: "university",
  minutes: 25,
  summary: "How the Braggs turned X-ray reflections into the atomic structure of crystals (1913) — and how electrons did the same and proved matter is a wave (1927).",
  goals: ["Rows of atoms reflect strongly only at special angles", "2 d sin θ = m λ, and the small refraction correction", "Davisson–Germer: electrons diffract too (λ = h / p)"],
  params: [
    { id: "theta", label: "Glancing angle of the beam θ", min: 16, max: 50, step: 1, value: 22, unit: "°", help: "Angle between the beam and the rows of atoms. Each setting is a fresh run." },
    { id: "level", label: "Wavelength (frequency level)", min: 45, max: 90, step: 1, value: 60, help: "Higher level = shorter wavelength." },
  ],
  open() { braggRec.clear(); },
  setup(sim, p) {
    const s = new Scene(BW, BH);
    for (let y = B_TOP + B_D / 2; y < BH - 70; y += B_D) for (let x = 500; x < 1300; x += B_D) s.disc(x, y, B_ATOM_R, { n: B_ATOM_N });
    // the crystal's filling fraction, for the refraction correction
    let atoms = 0, cells = 0;
    for (let y = B_TOP; y < BH - 70; y++) for (let x = 500; x < 1300; x++) { cells++; if (s.n[y * BW + x] > 1.01) atoms++; }
    braggFill = atoms / cells;
    const t = rad(p.theta), D = 400, hl = 100;
    const cx = B_HX - D * Math.cos(t), cy = B_TOP - D * Math.sin(t);
    const qx = Math.sin(t), qy = -Math.cos(t), rx = Math.cos(t), ry = -Math.sin(t);
    const dx = B_HX + 260 * rx, dy = B_TOP + 260 * ry, ex = Math.sin(t), ey = Math.cos(t);
    sim.load(s, [lineSource(cx - qx * hl, cy - qy * hl, cx + qx * hl, cy + qy * hl, p.level, { name: "X-ray beam" })],
      [{ kind: "line", x: Math.round(dx - ex * 70), y: Math.round(dy - ey * 70), x2: Math.round(dx + ex * 70), y2: Math.round(dy + ey * 70), measurement: "intensity" }]);
    sim.annotations.arrows.push({ x0: cx, y0: cy, x1: B_HX - 20 * Math.cos(t), y1: B_TOP - 20 * Math.sin(t), color: "#ffd84a" },
      { x0: 480, y0: B_TOP, x1: 1320, y1: B_TOP, color: "#ffffff44", dashed: true });
    sim.annotations.labels.push({ x: dx + 20, y: dy - 10, text: "detector", color: "#ffd84a" }, { x: 1000, y: B_TOP + 30, text: "crystal: rows of atoms, 14 cells apart" });
    sim.viewMode = "intensity";
    sim.brightness.intensity = 9.6;
    sim.brightness.field = 4.8;
    sim.prepareSpeed = 48;
    sim.runUntil(3200);
  },
  steps: [
    {
      title: "Rows of atoms as mirrors",
      html: `<p>In 1912 Max von Laue showed that X-rays passing through a crystal make a pattern of spots. A year later William Lawrence Bragg, then a student, found the simple way to read it: treat each layer of atoms as a very weak mirror. Every layer reflects a little; the reflections only add up when they arrive in step.</p>
             <p>Here a beam (yellow arrow) meets a “crystal” of small scatterers in rows 14 cells apart, at a glancing angle θ. A detector catches what is reflected like a mirror would reflect it.</p>`,
      predict: {
        question: "As you change θ, the reflection into the detector…",
        options: ["Changes smoothly and stays weak", "Is strong only near certain angles", "Gets steadily stronger at steeper angles"],
        answer: 1,
        explain: "Strong only near certain angles: the reflections from successive layers must differ in path by a whole number of wavelengths. Everywhere else they cancel.",
      },
    },
    {
      title: "Scan the angle",
      html: `<p>Step θ from 16° to 50° (a degree or two at a time). Each setting is a fresh run; its detector reading is added to the curve. Look for the peak.</p>`,
      readout: (sim, p) => {
        const rec = braggRec.get(p.level) ?? braggRec.set(p.level, new Recorder()).get(p.level)!;
        if (measured(sim, 3200) && !rec.has(p.theta)) rec.set(p.theta, mean(sim.profiles[0]));
        return (rec.has(p.theta) ? `Detector at θ = ${p.theta}°: measured.` : "Measuring…") +
          rec.chart({ xLabel: "glancing angle θ (°)", yLabel: "detector", xMin: 16, xMax: 50, current: p.theta });
      },
      task: {
        prompt: "At which angle is the reflection strongest?",
        input: { label: "Angle of the peak (°)", placeholder: "e.g. 30" },
        check(m, p) {
          const rec = braggRec.get(p.level);
          if (!rec || rec.size < 8) return need("Scan at least 8 angles first.");
          if (m.input === null) return need("Type the angle of the peak.");
          const pr = braggPrediction(p.level);
          const r = within(m.input, pr.corrected, 2.5, "Bragg angle", "°");
          r.message += ` (Bragg's law alone: ${f1(pr.bragg)}°; with the crystal's refraction: ${f1(pr.corrected)}°.)`;
          return r;
        },
      },
    },
    {
      title: "Bragg's law",
      html: (p: Values) => {
        const pr = braggPrediction(p.level), l = lam(p.level);
        return `<p>Two neighbouring rows, d apart. The wave reflected by the lower row travels an extra 2 d sin θ. The reflections add up when that is a whole number of wavelengths:</p>
               <p class="formula">2 d sin θ = m λ</p>
               <p>Here d = ${B_D} cells and λ = ${f1(l)} cells, so sin θ = ${f2(l / (2 * B_D))} and θ = ${f1(pr.bragg)}°.</p>
               <p><b>The small correction.</b> Inside the crystal the wave is slightly slower (its average index is ${f2(Math.sqrt(1 + braggFill * (B_ATOM_N ** 2 - 1)))}), so it bends a little as it enters. The peak you measure outside is at ${f1(pr.corrected)}°. Real X-ray work applies the same correction — for X-rays the index differs from 1 by only about a millionth, so it is tiny there.</p>
               <p>Knowing λ, the peak angle gives d: the spacing of atoms. The Braggs measured the structure of salt this way and shared the 1915 Nobel Prize; the same method later revealed the double helix of DNA.</p>`;
      },
    },
    {
      title: "Electrons are waves too",
      html: `<p>In 1924 Louis de Broglie suggested that particles have a wavelength, λ = h / p (Planck's constant over momentum). In 1927 Clinton Davisson and Lester Germer fired electrons at a nickel crystal and found a strong reflection at a special angle, just like X-rays: 54 eV electrons have λ = 0.167 nm, and the peak sat where the nickel atom spacing (0.215 nm) predicted. George Paget Thomson saw electron diffraction rings the same year.</p>
             <p>Try it here: change the <b>wavelength</b> slider (faster electrons = shorter wavelength) and scan again. The peak moves exactly as Bragg's law says — the maths does not care whether the wave is light or matter.</p>
             <p class="aside">This simulator solves the classical wave equation, not Schrödinger's equation for electrons. The diffraction geometry — where the peaks are — is the same for both, which is what this step shows.</p>`,
      readout: (sim, p) => {
        const rec = braggRec.get(p.level) ?? braggRec.set(p.level, new Recorder()).get(p.level)!;
        if (measured(sim, 3200) && !rec.has(p.theta)) rec.set(p.theta, mean(sim.profiles[0]));
        const pr = braggPrediction(p.level);
        return `λ = ${f1(lam(p.level))} cells: predicted peak at ${f1(pr.corrected)}°.` +
          rec.chart({ xLabel: "glancing angle θ (°)", yLabel: "detector", xMin: 16, xMax: 50, current: p.theta, marks: [{ x: pr.corrected, label: "predicted", color: "#c084fc" }] });
      },
    },
  ],
};

// ------------------------------------------------------------------------------------------ thin films (school)
// Measured in the engine (pulse + echo, level 40, n = 1.33): reflection peaks at film thicknesses of 1/4, 3/4, 5/4 of the
// wavelength in the film and nearly vanishes at 1/2 and 1. The heights are ~0.6 of the plane-wave formula because the
// beam spreads on its way back to the probe; the positions match.

const FW = 1600, FH = 1100, F_FILM_X = 900, F_LEVEL = 40, F_N = 1.33;
const filmRec = new Recorder();
const filmTarget = () => Math.round(20 * period(F_LEVEL) + (2 * 480 + 120) / 0.55 + 600);

/** Reflectance of a film of index n and thickness t (cells) for a wave of this level, with the grid's wavelengths. */
function filmR(level: number, t: number): number {
  const k0 = (2 * Math.PI) / lam(level), k1 = (2 * Math.PI) / lam(level, F_N), n = k1 / k0;
  const r1 = (1 - n) / (1 + n), r2 = -r1, d = 2 * k1 * t;
  const re = r1 + r2 * Math.cos(d), im = r2 * Math.sin(d), dr = 1 + r1 * r2 * Math.cos(d), di = r1 * r2 * Math.sin(d);
  return (re * re + im * im) / (dr * dr + di * di);
}

/** The colour a film of thickness t reflects: three wavelengths standing for red, green and blue (700, 550, 450 nm). */
function filmColour(t: number): string {
  const levels = [33, 42, 52]; // wavelengths in the ratio 700 : 550 : 450
  const maxR = filmR(42, lam(42, F_N) / 4);
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
  params: [{ id: "t", label: "Film thickness", min: 1, max: 30, step: 1, value: 2, unit: " cells", help: `Wavelength inside the film: ${lam(F_LEVEL, F_N).toFixed(1)} cells. Each setting is a fresh run.` }],
  open() { filmRec.clear(); },
  setup(sim, p) {
    const s = new Scene(FW, FH);
    s.rect(F_FILM_X, 0, p.t, FH, glass(F_N));
    const per = period(F_LEVEL);
    sim.load(s, [lineSource(300, 0, 300, FH - 1, F_LEVEL, { name: "Light", mode: "pulsed", shape: "gaussian", onCycles: 20, offCycles: 1_000_000, detach: true, detachAfterSteps: Math.round(20 * per + 10) })],
      [{ kind: "point", x: 420, y: FH / 2, x2: 0, y2: 0, measurement: "amplitude" }]);
    sim.annotations.labels.push({ x: F_FILM_X + p.t + 8, y: 60, text: `soap film (n = ${F_N}), ${p.t} cells`, color: "#9fe3ff" }, { x: 430, y: FH / 2 - 14, text: "detector", color: "#ffd84a" });
    sim.viewMode = "field";
    sim.brightness.field = 6;
    sim.prepareSpeed = 48;
    sim.runUntil(filmTarget());
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
        if (measured(sim, filmTarget()) && !filmRec.has(p.t)) {
          const h = sim.history[0] ?? [], per = period(F_LEVEL);
          const split = Math.round(10 * per + 600 / 0.562) - sim.historyStart;
          let inc = 0, ref = 0;
          h.forEach((u, i) => { if (i < split) inc = Math.max(inc, Math.abs(u)); else ref = Math.max(ref, Math.abs(u)); });
          if (inc > 0) filmRec.set(p.t, (ref / inc) ** 2);
        }
        const r = filmRec.list().find(q => q[0] === p.t);
        return (r ? `Reflected: <b>${(100 * r[1]).toFixed(2)}%</b> of the light` : "Measuring…") +
          filmRec.chart({ xLabel: "film thickness (cells)", yLabel: "reflected", xMin: 1, xMax: 30, current: p.t });
      },
      task: {
        prompt: "Which is the thinnest film that reflects the most?",
        input: { label: "Thickness (cells)", placeholder: "e.g. 5" },
        check(m) {
          if (filmRec.size < 8) return need("Measure at least 8 thicknesses first.");
          if (m.input === null) return need("Type the thickness.");
          const r = within(m.input, lam(F_LEVEL, F_N) / 4, 1.5, "thickness", " cells");
          r.message += ` That is a quarter of the wavelength inside the film (${f1(lam(F_LEVEL, F_N))} cells).`;
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
        return `<div style="display:flex;align-items:center;gap:12px"><span style="width:44px;height:44px;border-radius:50%;background:${filmColour(p.t)};box-shadow:0 0 0 2px #0006"></span>` +
          `<span>A ${p.t}-cell film reflects this colour.</span></div>` +
          `<svg viewBox="0 0 305 40" class="rec-chart"><g>${strip}</g><line x1="${p.t * 10}" x2="${p.t * 10}" y1="0" y2="30" stroke="#fff" stroke-width="1.5"/>` +
          `<text x="0" y="38" font-size="9" fill="currentColor">0</text><text x="290" y="38" font-size="9" fill="currentColor">30 cells</text></svg>`;
      },
    },
  ],
};

// ------------------------------------------------------------------------------------------ Compton scattering (university)
// The wave equation knows nothing about photons, but Compton's law has an exact wave picture: in the frame that moves
// with the centre of momentum of photon + electron (speed beta = E / (E + m c^2) along the beam) the scattering is
// plain wave scattering with no change of wavelength; seen from the lab, the electron recedes at beta and the Doppler
// effect gives lambda' / lambda = (1 - beta cos theta) / (1 - beta) = 1 + (E / m c^2)(1 - cos theta), Compton's law.
// So the "electron" here is a tiny antenna that re-radiates the wave it receives (with the phase it receives) while it
// recedes at beta times the wave speed, and three probes measure the scattered wavelength at 90, 135 and 180 degrees.
// Visible light: beta = 5e-6, nothing changes. Compton's X-rays: beta = 0.033 (a few % longer backwards).
// Gamma rays from caesium-137: beta = 0.56 (3.6 times longer backwards).

const CW = 1400, CH = 800, C_X = 720, C_Y = 400, C_LEVEL = 60, C_SRC = C_X - 330, C_R = 300, C_GAIN = 20;
const LAMBDA_C = 2.42631; // Compton wavelength of the electron, pm
const HC = 1239.84;        // h c in keV pm
const MEC2 = 510.999;      // electron rest energy, keV

const LIGHTS = [
  { name: "Visible light", short: "visible", lamPm: 532000, note: "green light, 532 nm" },
  { name: "X-ray", short: "X-ray", lamPm: 70.9, note: "Compton's molybdenum X-rays" },
  { name: "Gamma ray", short: "gamma", lamPm: HC / 661.7, note: "from caesium-137" },
];
const lightOf = (p: Values) => LIGHTS[Math.min(LIGHTS.length, Math.max(1, Math.round(p.light))) - 1];
/** Recoil speed of the centre-of-momentum frame, as a fraction of the speed of light. */
const betaOf = (lamPm: number) => { const E = HC / lamPm; return E / (E + MEC2); };

/** The three probes: angle from the beam direction, and position at distance C_R from the electron's start. */
const C_PROBES = [90, 135, 180].map(a => ({ a, x: Math.round(C_X + C_R * Math.cos(rad(a))), y: Math.round(C_Y - C_R * Math.sin(rad(a))) }));

function compton(lamIn: number, thetaDeg: number) {
  const th = rad(thetaDeg);
  const dl = LAMBDA_C * (1 - Math.cos(th));
  const lamOut = lamIn + dl;
  const E = HC / lamIn, E2 = HC / lamOut;
  const phi = thetaDeg <= 0 ? 90 : thetaDeg >= 180 ? 0 : deg(Math.atan(1 / ((1 + E / MEC2) * Math.tan(th / 2))));
  return { dl, lamOut, E, E2, ke: E - E2, phi };
}

/** The wave run for one kind of light: the electron's motion, its re-radiation and when the probes can be read. */
function comptonRun(lamPm: number) {
  const w = omegaOfLevel(C_LEVEL), L = lam(C_LEVEL), k = (2 * Math.PI) / L, T = period(C_LEVEL);
  const vph = w / k, vg = groupVelocity(w, 1), beta = betaOf(lamPm), v = beta * vph;
  // the incoming burst (Gaussian, sigma = cycles / 6) leaves the wave maker centred at t = cycles / 2 periods. A long
  // burst has a sharp frequency, so the probes read the wavelength to a few 0.1%; the fast gamma-ray recoil needs a
  // short one (the electron would otherwise travel far while it radiates)
  const cycles = beta > 0.2 ? 6 : 18, sigma = (cycles / 6) * T;
  const tc = (cycles / 2) * T + (C_X - C_SRC) / vg;
  const ts = tc - 3 * sigma;
  const xe = (t: number) => C_X + v * (Math.max(t, ts) - tc);
  const env = (t: number) => Math.exp(-0.5 * ((t - (cycles / 2) * T - (xe(t) - C_SRC) / vg) / sigma) ** 2);
  const sigmaE = sigma / (1 - v / vg);
  // where the electron is when it radiates most (for the angles the formula is compared with)
  let tPeak = tc;
  for (let t = ts, best = 0; t < tc + 8 * sigmaE; t += 1) { const e = env(t); if (e > best) { best = e; tPeak = t; } }
  const end = Math.round(tc + C_R / (0.9 * vg) + 4 * sigmaE * (1 + beta) + 60);
  return { w, L, k, T, vg, beta, v, cycles, tc, ts, xe, env, tPeak, xPeak: xe(tPeak), end };
}

/** Angular frequency of the burst in h[from, to): where its spectrum peaks (a scan, then refined); NaN if empty. */
function burstOmega(h: number[], from: number, to: number, guess: number): number {
  to = Math.min(to, h.length);
  if (to - from < 8) return NaN;
  const power = (w: number) => {
    let re = 0, im = 0;
    for (let j = from; j < to; j++) { re += h[j] * Math.cos(w * j); im -= h[j] * Math.sin(w * j); }
    return re * re + im * im;
  };
  let best = guess, bestP = -1;
  for (let w = 0.15 * guess; w <= 1.3 * guess; w += 0.005 * guess) { const pw = power(w); if (pw > bestP) { bestP = pw; best = w; } }
  for (let d = 0.0025 * guess; d > 1e-6 * guess; d /= 2) {
    const l = power(best - d), r = power(best + d);
    if (l > bestP && l >= r) { best -= d; bestP = l; } else if (r > bestP) { best += d; bestP = r; }
  }
  return best;
}

/** Wavelength of the scattered burst at each probe (from its frequency), and what Compton's law predicts there. */
function comptonMeasure(sim: Sim, p: Values) {
  const light = lightOf(p), run = comptonRun(light.lamPm);
  if (sim.time < run.end) return null;
  const E = HC / light.lamPm;
  return C_PROBES.map((pr, i) => {
    const h = sim.history[i] ?? [];
    const dist = Math.hypot(pr.x - C_X, pr.y - C_Y);
    // between the incoming burst passing and the scattered one arriving
    const split = Math.max(0, Math.round(run.tc + (0.5 * dist) / run.vg) - sim.historyStart);
    const wOut = burstOmega(h, split, h.length, run.w);
    const angle = deg(Math.atan2(C_Y - pr.y, pr.x - run.xPeak));
    const predicted = 1 + (E / MEC2) * (1 - Math.cos(rad(angle)));
    const ratio = wavelength(wOut, 1) / run.L;
    return { ...pr, angle, ratio, predicted };
  });
}

function comptonTable(sim: Sim, p: Values): string {
  const light = lightOf(p), run = comptonRun(light.lamPm), q = comptonMeasure(sim, p);
  const speed = run.beta < 1e-3 ? `${(100 * run.beta).toPrecision(1)}%` : `${(100 * run.beta).toFixed(1)}%`;
  const head = `<b>${light.name}</b> (${light.note}, λ = ${light.lamPm >= 1000 ? `${Math.round(light.lamPm / 1000)} nm` : `${f2(light.lamPm)} pm`}, ` +
    `photon energy ${HC / light.lamPm >= 1 ? `${f1(HC / light.lamPm)} keV` : `${(1000 * HC / light.lamPm).toFixed(1)} eV`}) — the electron recoils at <b>${speed}</b> of the speed of light.`;
  if (!q) return `${head}<br>Waiting for the scattered waves to reach the probes…`;
  const cell = (r: number) => (Number.isFinite(r) ? r.toFixed(3) : "—");
  const real = (r: number) => (!Number.isFinite(r) ? "—" : light.lamPm >= 1000 ? `${Math.round((light.lamPm * r) / 1000)} nm` : `${f2(light.lamPm * r)} pm`);
  return `${head}<table class="ctab" style="font-size:13px;margin-top:6px;border-collapse:collapse;width:100%">` +
    `<tr style="text-align:left"><th>probe</th><th>angle</th><th>measured λ′ ÷ λ</th><th>Compton's law</th><th>λ′</th></tr>` +
    q.map((r, i) => `<tr><td style="color:${["#ffd84a", "#4ade80", "#f472b6"][i]}">P${i + 1}</td><td>${Math.round(r.angle)}°</td><td><b>${cell(r.ratio)}</b></td><td>${cell(r.predicted)}</td><td>${real(r.ratio)}</td></tr>`).join("") +
    `</table>`;
}

/** The billiard picture: photon in, photon out at θ, electron recoiling at φ (wavelength change drawn 10× larger). */
function comptonSvg(lamIn: number, thetaDeg: number): string {
  const c = compton(lamIn, thetaDeg);
  const ox = 170, oy = 110;
  const wave = (x0: number, y0: number, ang: number, len: number, periodPx: number, color: string) => {
    let d = "";
    for (let s = 0; s <= len; s += 2) {
      const a = Math.sin((2 * Math.PI * s) / periodPx) * 7;
      const x = x0 + s * Math.cos(ang) - a * Math.sin(ang), y = y0 - s * Math.sin(ang) - a * Math.cos(ang);
      d += `${s ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"/>`;
  };
  const p0 = 18, p1 = Math.min(60, p0 * (1 + (10 * c.dl) / lamIn));
  const th = rad(thetaDeg), ph = rad(c.phi);
  const fmtL = (l: number) => (l >= 1000 ? `${f1(l / 1000)} nm` : `${f2(l)} pm`);
  return `<svg viewBox="0 0 340 220" class="rec-chart" style="max-width:420px">
    ${wave(15, oy, 0, 140, p0, "#60a5fa")}
    <text x="15" y="${oy - 16}" font-size="11" fill="#60a5fa">photon in, λ = ${fmtL(lamIn)}</text>
    <circle cx="${ox}" cy="${oy}" r="6" fill="#fbbf24"/>
    ${wave(ox + 8 * Math.cos(th), oy - 8 * Math.sin(th), th, 130, p1, "#f87171")}
    <text x="${Math.min(250, ox + 120 * Math.cos(th) + 4)}" y="${Math.max(14, oy - 120 * Math.sin(th) - 10)}" font-size="11" fill="#f87171">λ′ = ${fmtL(c.lamOut)}</text>
    <line x1="${ox}" y1="${oy}" x2="${ox + 110 * Math.cos(-ph)}" y2="${oy - 110 * Math.sin(-ph)}" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#ah)"/>
    <text x="${ox + 70 * Math.cos(-ph) + 6}" y="${oy - 70 * Math.sin(-ph) + 16}" font-size="11" fill="#fbbf24">electron, φ = ${f1(c.phi)}°</text>
    <path d="M ${ox + 34} ${oy} A 34 34 0 0 0 ${ox + 34 * Math.cos(th)} ${oy - 34 * Math.sin(th)}" fill="none" stroke="currentColor" stroke-opacity=".6"/>
    <text x="${ox + 40 * Math.cos(th / 2) + 2}" y="${oy - 40 * Math.sin(th / 2)}" font-size="11" fill="currentColor">θ = ${thetaDeg}°</text>
    <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fbbf24"/></marker></defs>
    <text x="10" y="212" font-size="10" fill="currentColor" fill-opacity=".7">wavelength change drawn 10× larger</text>
  </svg>`;
}

export const comptonExp: Experiment = {
  id: "compton",
  title: "Compton scattering: light as particles",
  level: "university",
  minutes: 25,
  summary: "Light scattered by an electron keeps its wavelength — unless the light is X-rays or gamma rays. Then it comes back stretched: each photon kicks the electron like a billiard ball. Compton's 1923 discovery.",
  goals: ["Scattered light normally keeps its wavelength", "X-rays and gamma rays come back with a longer wavelength — longest backwards", "Photons carry momentum p = h / λ; the kick makes the electron recoil", "Compton's law: Δλ = (h / m c)(1 − cos θ)"],
  graph: "points",
  params: [
    { id: "light", label: "Light", min: 1, max: LIGHTS.length, step: 1, value: 1, format: v => LIGHTS[Math.round(v) - 1].name,
      help: "Visible light, Compton's X-rays (70.9 pm) or gamma rays from caesium-137 (1.87 pm). On screen every kind is drawn with the same wavelength; what changes is how hard each photon kicks the electron. Each change is a fresh run." },
    { id: "theta", label: "Calculator: scattering angle θ", min: 0, max: 180, step: 1, value: 90, unit: "°", help: "Used by the photon calculator (steps 3–4), not by the wave simulation.", live: () => {} },
  ],
  setup(sim, p) {
    const light = lightOf(p), run = comptonRun(light.lamPm);
    const s = new Scene(CW, CH);
    const burst = lineSource(C_SRC, 0, C_SRC, CH - 1, C_LEVEL, { name: "Light", mode: "pulsed", shape: "gaussian", onCycles: run.cycles, offCycles: 1_000_000, detach: true, detachAfterSteps: Math.round(run.cycles * run.T + 10) });
    sim.load(s, [burst], C_PROBES.map(q => ({ kind: "point" as const, x: q.x, y: q.y, x2: q.x, y2: q.y, measurement: "amplitude" as const })));
    const lineEls = elementsOf(burst);
    const start = { x: run.xe(0), y: C_Y };
    const track = { x0: start.x, y0: C_Y, x1: start.x, y1: C_Y, color: "#fbbf24" };
    const label = { x: start.x + 10, y: C_Y - 12, text: "electron", color: "#fbbf24" };
    sim.annotations.arrows.push(track);
    sim.annotations.labels.push(label, ...C_PROBES.map(q => ({ x: q.x + 8, y: q.y + 16, text: `${q.a}°`, color: "#ffffffaa" })));
    // the burst first, then the electron: a tiny antenna that re-radiates what it receives while it recoils
    let shown: "line" | "electron" | "none" = "line";
    const lineEnd = Math.round(run.cycles * run.T + 50);
    sim.stepHook = t => {
      const x = run.xe(t);
      track.x1 = x; label.x = x + 10;
      if (t < lineEnd) { if (shown !== "line") { sim.engine.setSources(lineEls); shown = "line"; } return; }
      const e = run.env(t);
      if (e < 1e-3) { if (shown !== "none") { sim.engine.setSources([]); shown = "none"; } return; }
      const x0 = Math.floor(x), f = x - x0, phase = -run.k * (x - C_SRC);
      const el = (cx: number, amp: number) => ({ x: cx, y: C_Y, level: C_LEVEL, amplitude: amp, phase, mode: "continuous" as const, shape: "gaussian" as const, onCycles: 1, offCycles: 0, detachStep: -1 });
      // a single cell radiates weakly: drive it hard so the scattered wave is clear on screen and at the probes
      sim.engine.setSources([el(x0, C_GAIN * (1 - f) * e), el(x0 + 1, C_GAIN * f * e)]);
      shown = "electron";
    };
    sim.viewMode = "field";
    sim.brightness.field = 9;
    sim.prepareSpeed = 6;
    sim.runUntil(run.end);
  },
  steps: [
    {
      title: "Light meets an electron",
      html: `<p>A short burst of light (from the left) sweeps over an electron. The electron is shaken by the wave and sends out a new wave in all directions: it <b>scatters</b> the light.</p>
             <p>Three probes measure the scattered wave: <b style="color:#ffd84a">P1</b> to the side (90°), <b style="color:#4ade80">P2</b> half-way back (135°) and <b style="color:#f472b6">P3</b> straight back (180°). The graph shows what they pick up: first the passing burst, later the scattered wave.</p>`,
      predict: {
        question: "With ordinary visible light, how does the scattered wavelength compare with the incoming light?",
        options: ["The same in every direction", "Longer to the side and backwards", "Shorter to the side and backwards"],
        answer: 0,
        explain: "The same in every direction. Something shaken at one frequency sends out that frequency — this is how light scatters in everyday life (it is why the sky is blue: blue light keeps its colour when air molecules scatter it).",
      },
      readout: (sim, p) => comptonTable(sim, p),
    },
    {
      title: "Turn up the energy",
      html: `<p>Now move the <b>Light</b> slider to <b>X-ray</b>, then to <b>Gamma ray</b>, and watch the electron and the probes.</p>
             <p>In 1923 Arthur Compton shone X-rays on graphite and found that the scattered X-rays had a <b>longer wavelength</b> — the larger the angle, the longer. Classical wave physics could not explain it.</p>`,
      predict: {
        question: "With gamma rays, the light scattered straight back (P3) has…",
        options: ["The same wavelength as before", "A longer wavelength", "A shorter wavelength"],
        answer: 1,
        explain: "A longer wavelength — more than three times longer for these gamma rays. Each photon gives the electron a kick; the electron flies off, and light sent out by something moving away is stretched (the Doppler effect, like the lower pitch of a passing siren).",
      },
      readout: (sim, p) => comptonTable(sim, p),
    },
    {
      title: "Why: every photon gives a kick",
      html: `<p>Compton's explanation: light comes as particles, <b>photons</b>, each with energy E = h c / λ and momentum p = h / λ. A photon hitting a free electron is like a billiard ball hitting another: the electron recoils and takes some energy, so the photon leaves with less energy — a longer wavelength.</p>
             <p><b>Is it only high-energy light that behaves like particles?</b> No — every photon kicks. But the stretch is always the same tiny length, at most 4.9 pm (twice the electron's <i>Compton wavelength</i>, 2.43 pm). For green light (532 000 pm) that is a millionth: invisible. For Compton's X-rays (70.9 pm) it is a few percent, and for gamma rays (1.9 pm) it is bigger than the wavelength itself. Visible light also mostly meets electrons held in atoms; then the whole atom takes the kick and the change is smaller still. High energy does not turn a wave into a particle; it makes the particle side easy to see.</p>
             <p>Use the <b>θ</b> slider to explore one collision (the light is the one you chose with the Light slider).</p>`,
      readout: (_sim, p) => {
        const lamIn = lightOf(p).lamPm, c = compton(lamIn, p.theta);
        const L = (l: number) => (l >= 1000 ? `${f1(l / 1000)} nm` : `${f2(l)} pm`);
        return comptonSvg(lamIn, p.theta) +
          `<table style="font-size:13px;margin-top:6px;border-collapse:collapse"><tr><td>wavelength in / out</td><td>${L(lamIn)} → <b>${L(c.lamOut)}</b> (Δλ = ${f2(c.dl)} pm)</td></tr>` +
          `<tr><td>photon energy in / out</td><td>${c.E >= 1 ? `${f2(c.E)} → ${f2(c.E2)} keV` : `${(1000 * c.E).toFixed(3)} → ${(1000 * c.E2).toFixed(3)} eV`}</td></tr>` +
          `<tr><td>electron recoil</td><td>${c.ke * 1000 >= 1 ? `${(c.ke * 1000).toFixed(0)} eV` : `${(c.ke * 1e6).toExponential(1)} meV`} at φ = ${f1(c.phi)}°</td></tr></table>`;
      },
    },
    {
      title: "Compton's formula",
      html: `<p>Conserving energy and momentum in the collision (with relativity for the electron) gives</p>
             <p class="formula">λ′ − λ = (h / m<sub>e</sub> c) · (1 − cos θ)</p>
             <p>h / m<sub>e</sub> c = 2.426 pm is the <b>Compton wavelength</b> of the electron. The shift depends only on the angle — not on the light's wavelength — which is why it is easy to see with X-rays and gamma rays and invisible for visible light.</p>
             <p>The probes agree: their measured λ′ ÷ λ follows 1 + (E / m<sub>e</sub>c²)(1 − cos θ), the same law written with the photon energy E (m<sub>e</sub>c² = 511 keV).</p>`,
      readout: (_sim, p) => comptonSvg(lightOf(p).lamPm, p.theta),
      task: {
        prompt: "At θ = 90°, by how much does the wavelength grow? (Set θ to 90° and read the calculator, or use the formula.)",
        input: { label: "Δλ (pm)", placeholder: "e.g. 2.4" },
        check(m) {
          if (m.input === null) return need("Type Δλ in picometres.");
          return within(m.input, LAMBDA_C, 0.08, "Δλ at 90°", " pm");
        },
      },
    },
    {
      title: "Wave and particle",
      html: `<p>Compton won the 1927 Nobel Prize. Together with Einstein's explanation of the photoelectric effect (1905), his result settled that light carries energy and momentum in lumps. Yet the same light still makes interference fringes in the double slit and diffracts in crystals — the Bragg spectrometer Compton used to measure the wavelengths depends on exactly that.</p>
             <p>Light is neither just a wave nor just a particle: it is a quantum object that shows either face depending on the experiment. In 1924 de Broglie turned the idea round — particles are waves too — which <a href="#/experiment/bragg">Bragg and Davisson–Germer</a> shows.</p>
             <p class="aside"><b>How this simulation does it.</b> It solves a classical wave equation, which knows nothing about photons. But Compton's law has an exact wave picture: seen from a frame moving along the beam at β = E / (E + m<sub>e</sub>c²), photon and electron have equal and opposite momenta and the light scatters without changing its wavelength. Seen from the lab, the electron recedes at β, and the Doppler effect turns that into λ′ ÷ λ = (1 − β cos θ) / (1 − β) = 1 + (E / m<sub>e</sub>c²)(1 − cos θ). So the electron here is a tiny antenna that re-radiates the wave it receives while it moves away at β times the wave speed; the photon's energy only enters through β. The probes then measure the Doppler-stretched waves.</p>`,
    },
  ],
};
