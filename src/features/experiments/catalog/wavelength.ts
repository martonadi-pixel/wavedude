// Wave Dude 2D web - "How long is a wave?" (school): measure the wavelength with a ruler and find v = f · λ.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { omegaOfLevel } from "../../../core/physics";
import type { Experiment, Values } from "../types";
import { f1, f2, f3, lam, lineSource, look, need, within } from "../helpers";

const W = 1000, H = 560;

export const wavelengthExp: Experiment = {
  id: "wavelength",
  title: "How long is a wave?",
  level: "school",
  minutes: 15,
  summary: "Measure the wavelength with a ruler, change the frequency, and discover v = f · λ.",
  goals: ["Measure a wavelength accurately", "See that frequency and wavelength are linked", "Find the wave speed from v = f · λ"],
  readMore: [
    { page: "waves-around-us/describing-a-wave", label: "Describing a wave" },
    { page: "maths-of-waves/sine-waves", label: "Sine waves, period and phase" },
  ],
  params: [
    {
      id: "level", label: "Frequency", min: 20, max: 120, step: 1, value: 40,
      help: "How often the wave maker moves up and down (the source level 1–255, as in the Windows app).",
      live: (sim, p) => { for (const s of sim.sources) s.level = p.level; sim.refreshSources(); },
    },
  ],
  setup(sim, p) {
    sim.load(new Scene(W, H), [lineSource(90, 0, 90, H - 1, p.level)]);
    look(sim, { view: "field", field: 4.8 });
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
