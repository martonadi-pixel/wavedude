// Wave Dude 2D web - experiments for secondary school.
// GPL-3.0-or-later.

import { Scene, BARRIER, glass } from "../engine/scene";
import { omegaOfLevel } from "../engine/physics";
import type { Experiment, Values } from "./types";
import { f1, f2, f3, lam, lineSource, need, within } from "./helpers";

// ------------------------------------------------------------------------------------------ wavelength

const W1 = 1000, H1 = 560;

export const wavelengthExp: Experiment = {
  id: "wavelength",
  title: "How long is a wave?",
  level: "school",
  minutes: 15,
  summary: "Measure the wavelength with a ruler, change the frequency, and discover v = f · λ.",
  goals: ["Measure a wavelength accurately", "See that frequency and wavelength are linked", "Find the wave speed from v = f · λ"],
  params: [
    {
      id: "level", label: "Frequency", min: 20, max: 120, step: 1, value: 40,
      help: "How often the wave maker moves up and down (the source level 1–255, as in the Windows app).",
      live: (sim, p) => { for (const s of sim.sources) s.level = p.level; sim.refreshSources(); },
    },
  ],
  setup(sim, p) {
    sim.load(new Scene(W1, H1), [lineSource(90, 0, 90, H1 - 1, p.level)]);
    sim.viewMode = "field";
    sim.brightness.field = 4.8;
  },
  steps: [
    {
      title: "A straight wave",
      html: `<p>On the left is a <b>wave maker</b>: a whole line of sources moving together. Together they make straight wave fronts, like waves rolling onto a beach.</p>
             <p>The <b>wavelength λ</b> (lambda) is the distance from one crest (red) to the next crest.</p>
             <p>Press <b>▶ Run</b> and let the waves fill most of the screen, then press <b>⏸ Pause</b>.</p>`,
      enter(sim) { sim.runUntil(1100); },
    },
    {
      title: "Measure λ",
      html: `<p>Choose the <b>Ruler</b> tool and drag from the middle of one red crest to the middle of another crest several waves further on (hold <kbd>Ctrl</kbd> to keep the ruler straight).</p>
             <p>Measuring across <b>5 or more</b> waves and dividing is much more accurate than measuring one.</p>
             <p>Zoom in with the mouse wheel if that helps.</p>`,
      tools: ["ruler"],
      task: {
        prompt: "How many whole wavelengths does your ruler span?",
        input: { label: "Number of waves", placeholder: "e.g. 5" },
        check(m, p) {
          if (m.ruler === null) return need("First draw the ruler across a few crests.");
          if (!m.input || m.input <= 0) return need("Type how many wavelengths the ruler spans.");
          return within(m.ruler / m.input, lam(p.level), 0.12, "wavelength", " cells", true);
        },
      },
    },
    {
      title: "Double the frequency",
      html: (p: Values) => `<p>Now set the <b>Frequency</b> slider to about <b>${Math.min(120, p.level * 2)}</b> — twice as fast. The field restarts.</p>`,
      predict: {
        question: "When the frequency doubles, the wavelength…",
        options: ["Doubles", "Halves", "Stays the same"],
        answer: 1,
        explain: "It halves. The waves travel at the same speed, but there are twice as many per second, so each one must be half as long.",
      },
      enter(sim) { sim.reset(); sim.runUntil(1100); },
      tools: ["ruler"],
      task: {
        prompt: "Measure the new wavelength the same way.",
        input: { label: "Number of waves" },
        check(m, p) {
          if (m.ruler === null || !m.input) return need("Draw the ruler and type the number of waves.");
          return within(m.ruler / m.input, lam(p.level), 0.12, "wavelength", " cells", true);
        },
      },
    },
    {
      title: "The wave speed",
      html: (p: Values) => {
        const f = omegaOfLevel(p.level) / (2 * Math.PI);
        const l = lam(p.level);
        return `<p>The frequency <b>f</b> is how many waves leave the source per time step. At this setting f = ${f3(f)} waves per step.</p>
                <p>Each wave is λ long, so every step the wave front moves on by</p>
                <p class="formula">v = f · λ = ${f3(f)} × ${f1(l)} = <b>${f2(f * l)} cells per step</b></p>
                <p>Try other frequencies: λ changes, but <b>v stays (almost) the same</b>. The speed is a property of the <i>medium</i>, not of the source.</p>
                <p class="aside">Very high frequencies travel a bit slower on the grid — the Research experiment “Waves on a grid” explains why.</p>`;
      },
    },
  ],
};

// ------------------------------------------------------------------------------------------ refraction

const W2 = 1100, H2 = 700, Y_SURFACE = 330, HIT = { x: 480, y: Y_SURFACE };
const REF_LEVEL = 50;

function refractedAngle(p: Values): number {
  const s = Math.sin((p.theta * Math.PI) / 180) * (lam(REF_LEVEL, p.n) / lam(REF_LEVEL, 1));
  return (Math.asin(Math.min(1, s)) * 180) / Math.PI;
}

export const refraction: Experiment = {
  id: "refraction",
  title: "Bending waves: Snell's law",
  level: "school",
  minutes: 20,
  summary: "Send a beam into glass at an angle, measure how much it bends, and check Snell's law.",
  goals: ["Waves slow down and get shorter in glass", "A beam bends towards the normal when it slows down", "n₁ sin θ₁ = n₂ sin θ₂"],
  params: [
    { id: "theta", label: "Angle of the beam θ₁", min: 15, max: 55, step: 1, value: 40, unit: "°", help: "Angle between the beam and the normal (the dashed line, square to the surface)." },
    { id: "n", label: "Refractive index of the glass", min: 1.2, max: 2.2, step: 0.05, value: 1.5, help: "How many times slower the wave travels in the glass." },
  ],
  setup(sim, p) {
    const scene = new Scene(W2, H2);
    scene.rect(0, Y_SURFACE, W2, H2 - Y_SURFACE, glass(p.n));
    const t = (p.theta * Math.PI) / 180, D = 230, hl = 110;
    const cx = HIT.x - D * Math.sin(t), cy = HIT.y - D * Math.cos(t);
    const ux = Math.cos(t), uy = -Math.sin(t);
    sim.load(scene, [lineSource(cx - ux * hl, cy - uy * hl, cx + ux * hl, cy + uy * hl, REF_LEVEL)]);
    sim.annotations.arrows.push(
      { x0: HIT.x, y0: HIT.y - 170, x1: HIT.x, y1: HIT.y + 200, color: "#ffffffaa", dashed: true },
      { x0: cx, y0: cy, x1: HIT.x - Math.sin(t) * 18, y1: HIT.y - Math.cos(t) * 18, color: "#ffd84a" },
    );
    sim.annotations.labels.push(
      { x: HIT.x + 8, y: HIT.y - 150, text: "normal" },
      { x: 40 + 64, y: Y_SURFACE - 14, text: "air  n = 1.0" },
      { x: 40 + 64, y: Y_SURFACE + 28, text: `glass  n = ${p.n.toFixed(2)}`, color: "#9fe3ff" },
      { x: HIT.x, y: HIT.y, mark: "●", text: "hit point", color: "#ffd84a" },
    );
    sim.viewMode = "field";
    sim.brightness.field = 6.4;
    sim.brightness.intensity = 8;
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
        const s1 = Math.sin((p.theta * Math.PI) / 180), s2 = Math.sin((t2 * Math.PI) / 180);
        return `<p>Snell's law says</p><p class="formula">n₁ · sin θ₁ = n₂ · sin θ₂</p>
                <p>Here: 1.0 × sin ${p.theta}° = ${f3(s1)} and ${p.n.toFixed(2)} × sin ${f1(t2)}° = ${f3(p.n * s2)}.</p>
                <p>Change the beam angle or the glass index with the sliders and measure again. Does the law hold every time?</p>
                <p class="aside">On this grid the speed ratio is not exactly n for short waves, so the model's θ₂ can differ from the textbook value by a fraction of a degree.</p>`;
      },
      tools: ["protractor"],
    },
  ],
};

// ------------------------------------------------------------------------------------------ double slit

const W3 = 1200, H3 = 700, WALL_X = 360, WALL_T = 8, SCREEN_X = 1080, DS_LEVEL = 60;

function firstFringeDeg(p: Values): number {
  return (Math.asin(Math.min(1, lam(DS_LEVEL) / p.d)) * 180) / Math.PI;
}

export const doubleSlit: Experiment = {
  id: "double-slit",
  title: "The double slit",
  level: "school",
  minutes: 20,
  summary: "The experiment that proved light is a wave: two slits, one pattern of bright and dark stripes.",
  goals: ["Two slits make a striped interference pattern", "Bright stripes where the path difference is a whole number of wavelengths", "d · sin θ = m · λ"],
  graph: "profile",
  params: [
    { id: "d", label: "Distance between the slits d", min: 30, max: 120, step: 2, value: 60, unit: " cells" },
    { id: "w", label: "Width of each slit", min: 4, max: 24, step: 1, value: 12, unit: " cells", help: "Below about half a wavelength (≈ 7.5 cells) hardly anything gets through." },
  ],
  setup(sim, p) {
    const s = new Scene(W3, H3);
    const cy = H3 / 2;
    s.rect(WALL_X, 0, WALL_T, H3, BARRIER);
    for (const y of [cy - p.d / 2, cy + p.d / 2]) s.rect(WALL_X, Math.round(y - p.w / 2), WALL_T, p.w, { n: 1, absorb: 0 });
    sim.load(s, [lineSource(150, 0, 150, H3 - 1, DS_LEVEL)], [
      { kind: "line", x: SCREEN_X, y: 70, x2: SCREEN_X, y2: H3 - 70, measurement: "intensity" },
    ]);
    sim.annotations.arrows.push({ x0: WALL_X + WALL_T, y0: cy, x1: SCREEN_X + 40, y1: cy, color: "#ffffff88", dashed: true });
    sim.annotations.labels.push({ x: SCREEN_X + 8, y: 60, text: "screen", color: "#ffd84a" });
    sim.viewMode = "field";
    // only a little gets through the slits: show the weak waves behind the wall (the side in front saturates)
    sim.brightness.field = 4.9;
    sim.brightness.intensity = 7;
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
        const l = lam(DS_LEVEL);
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
