// Wave Dude 2D web - "The double slit" (school): two slits, one pattern of bright and dark stripes; d · sin θ = m · λ.
// Then the puzzle: particles one at a time still make the stripes, and watching which slit they take removes them.
// GPL-3.0-or-later.
//
// The particles are drawn by Born's rule from the intensity along the screen probe (particles.ts); the which-way
// detector is glass in front of the lower slit whose index jumps every 3 periods, shifting that slit's phase by a random
// amount up to `strength` whole turns. Measured (whichway prototype, d 60, w 12): the stripes' contrast in the
// averaged picture falls from 0.99 to 0.3-0.45 (it averages only a few tens of kicks); the screen, which adds up
// thousands of particles over many kicks, goes to the ensemble value |sin(πs) / (πs)| for strength s.

import { Scene } from "../../../core/scene";
import { deg } from "../../../core/math";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { f1, f3, lam, lineProbe, lineSource, look, need, period, slitWall, within } from "../helpers";
import { ParticleScreen, WhichWay, visibilityAfter } from "../particles";

const W = 1200, H = 700, WALL_X = 360, WALL_T = 8, SCREEN_X = 1080, LEVEL = 60, SCREEN_Y0 = 70;

function firstFringeDeg(p: Values): number {
  return deg(Math.asin(Math.min(1, lam(LEVEL) / p.d)));
}

// ------------------------------------------------------------------ particles and the which-way detector

let screen: ParticleScreen | null = null;
let detector: WhichWay | null = null;
let stopFrames: (() => void) | null = null;
/** The stripes' contrast on the screen without the detector (to compare with). */
let plainContrast = NaN;

/** Where the screen's first bright stripe beside the middle is, from the middle (cells along the screen). */
const stripeSpacing = (p: Values) => (SCREEN_X - WALL_X - WALL_T) * Math.tan(Math.asin(Math.min(0.95, lam(LEVEL) / p.d)));
const contrastNow = (p: Values) => screen?.contrast(H / 2 - SCREEN_Y0, stripeSpacing(p)) ?? NaN;

/** A new screen and detector for this scene, driven every frame while the experiment is open. */
function particles(sim: Sim, p: Values): void {
  screen = new ParticleScreen(sim, { probe: 0, x: SCREEN_X, y: SCREEN_Y0, dx: 0, dy: 1, band: 80, color: "#ffe066", rate: 1 });
  const l = lam(LEVEL), len = 2;
  // it jumps every three periods: longer than light takes to cross it (about 2.5 periods), so each bit of the wave sees
  // one kick, not the average of a few (an average of random kicks is not spread evenly any more, and stripes survive)
  detector = new WhichWay(sim, { x: WALL_X - (len * l) / 2 - 1, y: H / 2 + p.d / 2 }, l, Math.round(3 * period(LEVEL)), { length: len, width: Math.min(50, p.d - 6) });
  stopFrames?.();
  stopFrames = sim.onFrame(() => {
    if (!location.hash.startsWith("#/experiment/double-slit")) { stopFrames?.(); stopFrames = null; screen = detector = null; return; }
    screen?.frame();
    detector?.frame();
  });
}

/** Detector on (with this strength, in whole turns of phase) or off; the screen starts afresh. */
function watch(sim: Sim, strength: number): void {
  if (!detector || !screen) return;
  detector.strength = strength;
  detector.on = strength > 0;
  const label = sim.annotations.labels.find(q => q.text.startsWith("👁"));
  if (detector.on && !label) sim.annotations.labels.push({ x: WALL_X - 150, y: detector.shape.y + detector.shape.width / 2 + 18, text: "👁 which-way detector", color: "#f472b6" });
  if (!detector.on) sim.annotations.labels = sim.annotations.labels.filter(q => !q.text.startsWith("👁"));
  screen.clear();
}

/** The particle steps: run a little faster, show the screen filling. */
function particleStep(sim: Sim, strength: number): void {
  // the particles keep coming: an earlier step's run to a set step must not stop them
  sim.cancelRunUntil();
  sim.viewMode = "intensity";
  if (sim.stepsPerFrame < 4) sim.stepsPerFrame = 4;
  if (!screen) return;
  watch(sim, strength);
  screen.on = true;
}

function screenReadout(p: Values, compare: boolean): string {
  if (!screen) return "";
  const n = screen.hits.length, c = contrastNow(p);
  const stripes = Number.isNaN(c) ? "too few dots yet to tell" : c > 0.75 ? `<b>clear stripes</b> (contrast ${f3(c)})` : c > 0.25 ? `faint stripes (contrast ${f3(c)})` : `<b>no stripes</b> (contrast ${f3(c)})`;
  const was = compare && !Number.isNaN(plainContrast) ? `<div class="muted small">Without the detector the stripes had a contrast of ${f3(plainContrast)}.</div>` : "";
  return `<div>Particles on the screen: <b>${n.toLocaleString()}</b> — ${stripes}</div>${was}`;
}

export const doubleSlit: Experiment = {
  id: "double-slit",
  title: "The double slit",
  level: "school",
  minutes: 30,
  summary: "The experiment that proved light is a wave: two slits, one pattern of bright and dark stripes. And the puzzle that still amazes physicists: watch which slit the light takes, and the stripes vanish.",
  goals: ["Two slits make a striped interference pattern", "Bright stripes where the path difference is a whole number of wavelengths", "d · sin θ = m · λ", "Single particles still make the stripes — unless you find out which slit they took"],
  readMore: [
    { page: "light-and-optics/is-light-a-wave", label: "Is light a wave?" },
    { page: "how-waves-behave/interference-and-superposition", label: "Interference and superposition" },
    { page: "maths-of-waves/interference-diffraction", label: "Interference and diffraction formulas" },
    { page: "light-and-optics/wave-or-particle", label: "Wave or particle? Watching the double slit" },
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
    particles(sim, p);
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
      enter(sim) { if (screen) screen.on = false; watch(sim, 0); },
    },
    {
      title: "One particle at a time",
      html: `<p>A hundred years after Young, physicists found that light also comes in tiny lumps of energy, <b>photons</b> — and that electrons, atoms and even big molecules make the same stripes. Make the light so faint that only <b>one photon</b> flies at a time: each one lands on the screen as a single dot, right of the screen line.</p>
             <p>Where does each one land? The simulator computes only the wave. Quantum physics adds one rule (Max Born, 1926): <b>the wave's brightness at a spot is the chance that the particle lands there</b>. So the dots are drawn at random, more where the wave is bright.</p>
             <p>Watch the dots. The first ones look scattered at random. Wait…</p>`,
      enter(sim) { particleStep(sim, 0); },
      predict: {
        question: "After thousands of single particles, the dots make…",
        options: ["Two bands, one behind each slit", "The same stripes as the waves", "A random sprinkle"],
        answer: 1,
        explain: "The stripes! Each particle went through the apparatus alone, yet thousands of them avoid the dark stripes. Each single particle behaves as if its wave went through both slits and interfered with itself. Akira Tonomura's team filmed exactly this with single electrons in 1989.",
      },
      readout: (_sim, p) => { const c = contrastNow(p); if (!Number.isNaN(c) && screen && screen.hits.length > 2000) plainContrast = c; return screenReadout(p, false); },
      actions: [
        { label: () => (screen?.on ? "⏸ Stop the particles" : "▶ Fire particles"), on: () => !!screen?.on, run: () => { if (screen) screen.on = !screen.on; } },
        { label: "Clear the screen", run: () => screen?.clear() },
      ],
    },
    {
      title: "Which slit did it go through?",
      html: `<p>Each particle lands as one dot, so surely it went through <b>one</b> slit? Let us check: we put a <b>which-way detector</b> 👁 at the lower slit. It notices every particle that goes through it — and if it does not, the particle took the upper slit.</p>
             <p>The screen starts again. Watch the dots — and the picture: the stripes behind the slits start to jump about.</p>`,
      enter(sim) { particleStep(sim, 1); },
      predict: {
        question: "With the detector watching, the dots make…",
        options: ["The same stripes", "No stripes: just two broad, overlapping bands", "Brighter stripes"],
        answer: 1,
        explain: "The stripes disappear! As soon as you can tell which slit each particle took, the particles land like little balls: each slit gives its own broad band and the bands simply add up. This is what puzzled the founders of quantum physics most.",
      },
      readout: (_sim, p) => screenReadout(p, true),
      actions: [
        { label: () => (detector?.on ? "Switch the detector off" : "Switch the detector on"), on: () => !!detector?.on, run: sim => watch(sim, detector?.on ? 0 : 1) },
        { label: "Clear the screen", run: () => screen?.clear() },
      ],
    },
    {
      title: "Why does watching change it?",
      html: () => `<p>To see a particle you must hit it with something — a photon of light, for example. To tell which slit it used, that light must have a wavelength shorter than the distance between the slits, and such light gives the particle a real <b>kick</b>. The kick shifts the timing (the <b>phase</b>) of the particle's wave at that slit by an amount nobody can predict. Every particle's stripes then end up in a different place, and thousands of shifted stripe patterns add up to a smooth glow. Richard Feynman used this argument; Werner Heisenberg's uncertainty principle says no detector can avoid it.</p>
             <p>The simulator's detector does exactly this: it shifts the phase of the wave through the lower slit by a random amount, many times a second. Try a <b>gentle</b> look — kicks of up to half a turn — and the stripes only fade. The rule: with kicks spread evenly up to a fraction s of a turn, the stripes keep a contrast of |sin(πs) / (πs)|: ${f3(visibilityAfter(0.5))} for half a turn, 0 for a whole turn.</p>
             <details class="goals"><summary>University note: it is not really about the kick</summary>
             <p>Later experiments (Dürr, Nonn and Rempe, 1998) marked which way atoms went using their internal state, with far too little momentum to shift the stripes — and the stripes still vanished. What removes them is that the paths can be told apart at all: the particle becomes entangled with the detector, and the fringe visibility V and the which-way distinguishability D obey D² + V² ≤ 1 (Englert, 1996). Read the detector or not, it does not matter. A classical wave simulator cannot show entanglement; it shows the kick, one way of getting the information. See the Learn page “Wave or particle?”.</p></details>`,
      enter(sim) { particleStep(sim, detector?.on ? detector.strength : 1); },
      readout: (_sim, p) => {
        const s = detector?.on ? detector.strength : 0;
        return screenReadout(p, true) + `<div class="muted small">Detector: ${s === 0 ? "off" : s === 1 ? "a hard look (kicks up to a whole turn)" : "a gentle look (kicks up to half a turn)"} — expected contrast ${f3(s === 0 ? Math.max(0, plainContrast || 1) : visibilityAfter(s))}${s === 0 ? "" : " (on a screen with very many particles)"}.</div>`;
      },
      actions: [
        { label: "Detector off", on: () => !detector?.on, run: sim => watch(sim, 0) },
        { label: "Gentle look (½ turn)", on: () => !!detector?.on && detector.strength === 0.5, run: sim => watch(sim, 0.5) },
        { label: "Hard look (whole turn)", on: () => !!detector?.on && detector.strength === 1, run: sim => watch(sim, 1) },
      ],
    },
  ],
};
