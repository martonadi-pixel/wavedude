// Wave Dude 2D web - "One gap: how waves spread" (school): diffraction behind a single slit; a · sin θ₁ = λ.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { deg } from "../../../core/math";
import type { Experiment, Values } from "../types";
import { f1, lam, lamText, lineProbe, lineSource, look, need, slitWall, within } from "../helpers";

const W = 1200, H = 700, WALL_X = 360, SCREEN_X = 1080, LEVEL = 60;

function firstMinDeg(p: Values): number {
  const s = lam(LEVEL) / p.a;
  return s >= 1 ? NaN : deg(Math.asin(s));
}

export const singleSlit: Experiment = {
  id: "single-slit",
  title: "One gap: how waves spread",
  level: "school",
  minutes: 15,
  summary: "Waves squeezing through a gap spread out. Measure how much — narrow gaps spread more.",
  goals: ["Waves bend around the edges of a gap (diffraction)", "Narrower gaps make the waves spread more", "The first dark band is at sin θ = λ / a", "For particles this is Heisenberg's uncertainty principle"],
  readMore: [
    { page: "how-waves-behave/diffraction", label: "Diffraction" },
    { page: "maths-of-waves/interference-diffraction", label: "Interference and diffraction formulas" },
  ],
  graph: "profile",
  params: [{ id: "a", label: "Width of the gap a", min: 36, max: 90, step: 2, value: 50, unit: " cells", help: `${lamText(LEVEL)} at this frequency.` }],
  setup(sim, p) {
    const s = new Scene(W, H), cy = H / 2;
    s.add(slitWall(WALL_X, cy, H, 8, 1, p.a, 0, "Slit"));
    sim.load(s, [lineSource(150, 0, 150, H - 1, LEVEL)], [lineProbe(SCREEN_X, 10, SCREEN_X, H - 10)]);
    sim.annotations.arrows.push({ x0: WALL_X + 8, y0: cy, x1: SCREEN_X + 40, y1: cy, color: "#ffffff88", dashed: true });
    sim.annotations.labels.push({ x: SCREEN_X + 8, y: 24, text: "screen", color: "#ffd84a" });
    look(sim, { view: "intensity", field: 4.6, intensity: 5.5 });
  },
  steps: [
    {
      title: "Through the gap",
      html: `<p>Straight waves hit a wall with one gap. Look at the waves on the other side.</p>`,
      enter(sim) { sim.runUntil(2600); },
      predict: {
        question: "Behind the gap the waves…",
        options: ["Go straight on as a narrow beam", "Spread out like a fan", "Stop"],
        answer: 1,
        explain: "They spread out. Every point in the gap acts as a new little source (Huygens' principle), so the wave fans out behind it. This bending around edges is called diffraction.",
      },
    },
    {
      title: "Dark bands",
      html: `<p>The picture shows the <b>intensity</b>, and the graph shows it along the screen. There is a wide bright middle, then a <b>dark band</b> on each side.</p>
             <p>At the first dark band, waves from the top half of the gap cancel the waves from the bottom half exactly.</p>`,
    },
    {
      title: "Measure the angle of the first dark band",
      html: `<p>Use the <b>Protractor</b>: drag from the middle of the gap along the dashed line, then drag again from there to the middle of the first <b>dark</b> band.</p>`,
      tools: ["protractor"],
      task: {
        prompt: "The angle of the first dark band, θ₁.",
        check(m, p) {
          if (m.angle === null) return need("Draw both arms of the protractor first.");
          const e = firstMinDeg(p);
          if (!Number.isFinite(e)) return need("This gap is narrower than one wavelength: there is no dark band. Make it wider.");
          return within(m.angle, e, 3, "angle θ₁", "°");
        },
      },
    },
    {
      title: "Narrow or wide?",
      html: (p: Values) => `<p>The first dark band is where the path difference across the gap is one wavelength:</p>
             <p class="formula">a · sin θ₁ = λ</p>
             <p>Here a = ${p.a} and λ = ${f1(lam(LEVEL))} cells, so θ₁ = ${f1(firstMinDeg(p))}°.</p>
             <p>Make the gap narrower with the slider. A narrow gap spreads the waves <b>more</b> — that is why you can hear sound through a door that is only open a crack.</p>`,
      predict: {
        question: "If the gap is made half as wide, the waves spread…",
        options: ["Less", "More", "The same"],
        answer: 1,
        explain: "More: sin θ₁ = λ / a doubles. The smaller the opening compared with the wavelength, the more the wave spreads.",
      },
    },
    {
      title: "Squeeze it and it spreads: Heisenberg",
      html: () => `<p>Physicists were puzzled when they found that electrons and photons, which arrive as single particles, spread behind a gap exactly like this wave. Think of one particle going through:</p>
             <ul><li>Behind the gap we know <b>where</b> it went through, to within the gap's width a. The narrower the gap, the better we know its position.</li>
             <li>But it leaves the gap in a direction we cannot predict, anywhere in the bright fan: its sideways speed is uncertain. And the narrower the gap, the wider the fan.</li></ul>
             <p>So pinning down where a particle is makes it less certain where it is going, and the other way round. For this gap the product does not depend on a at all:</p>
             <p class="formula">a · sin θ₁ = λ &nbsp;→&nbsp; (position spread) × (spread of sideways momentum) ≈ a × (h / λ) sin θ₁ = h</p>
             <p>since a particle with wavelength λ has momentum h / λ (de Broglie). This is <b>Heisenberg's uncertainty principle</b> (1927), seen in the simplest possible experiment. It is not a fault of our instruments: it is how waves work, and every particle has a wave.</p>
             <p>Change the gap and watch the table: a changes, θ₁ changes, a · sin θ₁ stays one wavelength (${f1(lam(LEVEL))} cells).</p>`,
      readout: (_sim, p) => {
        const t = firstMinDeg(p), sin = lam(LEVEL) / p.a;
        return `<table class="ro-table"><tr><th>gap a</th><th>first dark band θ₁</th><th>a · sin θ₁</th></tr>` +
          `<tr><td>${p.a} cells</td><td>${Number.isFinite(t) ? `${f1(t)}°` : "none (gap under one wavelength)"}</td><td>${Number.isFinite(t) ? `${f1(p.a * sin)} cells = λ` : "—"}</td></tr></table>`;
      },
    },
  ],
};
