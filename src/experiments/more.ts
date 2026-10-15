// Wave Dude 2D web - more experiments: echoes and mirrors (kids), single slit and total internal reflection (school),
// how well the damping edge absorbs (research).
// GPL-3.0-or-later.

import { Scene, BARRIER, glass } from "../engine/scene";
import { groupVelocity, omegaOfLevel } from "../engine/physics";
import type { Experiment, Values } from "./types";
import type { Sim } from "../sim";
import { f1, f2, lam, lineSource, need, period, pointSource, within } from "./helpers";

// ------------------------------------------------------------------------------------------ kids: echoes and mirrors

const EW = 1000, EH = 600;
let echoScene: "wall" | "dish" | "" = "";

function wallScene(sim: Sim): void {
  const s = new Scene(EW, EH);
  s.rect(720, 120, 10, 360, BARRIER);
  sim.load(s, [pointSource(260, 300, 55, { name: "Clap", mode: "pulsed", shape: "gaussian", onCycles: 3, offCycles: 100000 })],
    [{ kind: "point", x: 300, y: 300, x2: 0, y2: 0, measurement: "amplitude" }]);
  sim.annotations.labels.push({ x: 740, y: 110, text: "wall" }, { x: 310, y: 290, text: "ear 👂", color: "#ffd84a" });
  sim.viewMode = "field";
  // measured: the clap peaks at |u| 0.016 near the source, the ring is ~0.005 half-way to the wall and the echo ~0.002;
  // at the default 30% this shows the ring at ~0.6 of full colour and the echo at ~0.25 (the first moment saturates)
  sim.brightness.field = 800;
  echoScene = "wall";
}

const DISH_X = 880, FOCUS = 160;
function dishScene(sim: Sim): void {
  const s = new Scene(EW, EH);
  // a parabola opening to the left: x = DISH_X - (y - c)^2 / (4 f), focus at (DISH_X - f, c)
  const c = EH / 2;
  let prev: [number, number] | null = null;
  for (let y = c - 230; y <= c + 230; y += 6) {
    const x = DISH_X - ((y - c) ** 2) / (4 * FOCUS);
    if (prev) s.segment(prev[0], prev[1], x, y, 8, BARRIER);
    prev = [x, y];
  }
  sim.load(s, [lineSource(150, 70, 150, EH - 70, 55, { name: "Waves" })]);
  sim.annotations.labels.push({ x: DISH_X - FOCUS, y: c, mark: "★", text: "focus", color: "#ffd84a" });
  sim.viewMode = "field";
  sim.brightness.field = 6;
  sim.brightness.intensity = 9;
  echoScene = "dish";
}

export const echoes: Experiment = {
  id: "echoes",
  title: "Echoes and mirrors",
  level: "kids",
  movable: true,
  minutes: 10,
  summary: "Clap and hear the echo, then catch waves with a dish-shaped mirror like a satellite dish.",
  goals: ["Waves bounce off walls: that is an echo", "The time until the echo tells how far away the wall is", "A curved mirror collects waves in one spot"],
  graph: "points",
  setup(sim) { wallScene(sim); },
  steps: [
    {
      title: "Clap!",
      html: `<p>The coloured ring is a <b>clap</b>: one short splash of waves. Next to it is an <b>ear</b> that listens (the yellow cross).</p>
             <p>Press <b>▶ Run</b> and watch the ring travel towards the wall.</p>`,
      enter(sim) { if (echoScene !== "wall") wallScene(sim); sim.reset(); },
      predict: {
        question: "What happens when the ring reaches the wall?",
        options: ["It goes through the wall", "It bounces back", "It stops and disappears"],
        answer: 1,
        explain: "It bounces back! A wave that hits a hard wall turns around. When that happens to sound, you hear an echo.",
      },
    },
    {
      title: "Hear the echo",
      html: `<p>The graph under the picture shows what the ear hears. The first wiggle is the clap itself. The second, smaller wiggle is the <b>echo</b> coming back from the wall.</p>
             <p>Bats and dolphins send out clicks and listen for echoes. The longer they wait, the further away the wall (or the tasty insect) is. Ships do the same with sonar.</p>`,
      enter(sim) { if (echoScene !== "wall") wallScene(sim); sim.reset(); sim.runUntil(2300); },
    },
    {
      title: "A curved mirror",
      html: `<p>Now straight waves come from the left and hit a <b>curved mirror</b>, shaped like a satellite dish.</p>`,
      enter(sim) { if (echoScene !== "dish") dishScene(sim); sim.runUntil(2400); },
      predict: {
        question: "After bouncing off the curved mirror, the waves…",
        options: ["Spread out in all directions", "All meet in one spot", "Disappear"],
        answer: 1,
        explain: "They all meet in one spot, the focus. Every part of the dish sends its wave to the same place.",
      },
    },
    {
      title: "Find the focus",
      html: `<p>We switched to the <b>Intensity</b> picture. The brightest spot in front of the mirror is the <b>focus</b> (★).</p>
             <p>Satellite dishes put their receiver right there, and big telescopes use curved mirrors to collect faint starlight.</p>`,
      enter(sim) { if (echoScene !== "dish") dishScene(sim); sim.viewMode = "intensity"; sim.running = true; },
    },
  ],
};

// ------------------------------------------------------------------------------------------ school: single slit

const SW = 1200, SH = 700, SWALL = 360, SSCREEN = 1080, SS_LEVEL = 60;

function firstMinDeg(p: Values): number {
  const s = lam(SS_LEVEL) / p.a;
  return s >= 1 ? NaN : (Math.asin(s) * 180) / Math.PI;
}

export const singleSlit: Experiment = {
  id: "single-slit",
  title: "One gap: how waves spread",
  level: "school",
  minutes: 15,
  summary: "Waves squeezing through a gap spread out. Measure how much — narrow gaps spread more.",
  goals: ["Waves bend around the edges of a gap (diffraction)", "Narrower gaps make the waves spread more", "The first dark band is at sin θ = λ / a"],
  graph: "profile",
  params: [{ id: "a", label: "Width of the gap a", min: 36, max: 90, step: 2, value: 50, unit: " cells", help: `λ = ${lam(SS_LEVEL).toFixed(1)} cells at this frequency.` }],
  setup(sim, p) {
    const s = new Scene(SW, SH), cy = SH / 2;
    s.rect(SWALL, 0, 8, SH, BARRIER);
    s.rect(SWALL, Math.round(cy - p.a / 2), 8, p.a, { n: 1, absorb: 0 });
    sim.load(s, [lineSource(150, 0, 150, SH - 1, SS_LEVEL)], [{ kind: "line", x: SSCREEN, y: 10, x2: SSCREEN, y2: SH - 10, measurement: "intensity" }]);
    sim.annotations.arrows.push({ x0: SWALL + 8, y0: cy, x1: SSCREEN + 40, y1: cy, color: "#ffffff88", dashed: true });
    sim.annotations.labels.push({ x: SSCREEN + 8, y: 24, text: "screen", color: "#ffd84a" });
    sim.viewMode = "intensity";
    sim.brightness.field = 4.6;
    sim.brightness.intensity = 5.5;
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
             <p>Here a = ${p.a} and λ = ${f1(lam(SS_LEVEL))} cells, so θ₁ = ${f1(firstMinDeg(p))}°.</p>
             <p>Make the gap narrower with the slider. A narrow gap spreads the waves <b>more</b> — that is why you can hear sound through a door that is only open a crack.</p>`,
      predict: {
        question: "If the gap is made half as wide, the waves spread…",
        options: ["Less", "More", "The same"],
        answer: 1,
        explain: "More: sin θ₁ = λ / a doubles. The smaller the opening compared with the wavelength, the more the wave spreads.",
      },
    },
  ],
};

// ------------------------------------------------------------------------------------------ school: total internal reflection

const TW = 1100, TH = 800, T_SURF = 300, T_HIT = { x: 550, y: T_SURF }, T_LEVEL = 50, T_N = 1.5;

/** The critical angle in the model: sin θc = (wave speed in glass) / (wave speed in air) = λ_glass / λ_air. */
function criticalDeg(): number {
  return (Math.asin(lam(T_LEVEL, T_N) / lam(T_LEVEL, 1)) * 180) / Math.PI;
}

export const tir: Experiment = {
  id: "total-internal-reflection",
  title: "Trapped light: total internal reflection",
  level: "school",
  minutes: 15,
  summary: "A beam inside glass meets the surface. Tilt it far enough and none of it escapes — the trick behind optical fibres.",
  goals: ["Leaving glass, a beam bends away from the normal", "Beyond the critical angle all of it is reflected", "sin θc = n₂ / n₁"],
  params: [{ id: "theta", label: "Angle of the beam θ", min: 20, max: 70, step: 1, value: 30, unit: "°", help: "Angle between the beam and the normal (the dashed line)." }],
  setup(sim, p) {
    const s = new Scene(TW, TH);
    s.rect(0, T_SURF, TW, TH - T_SURF, glass(T_N));
    const t = (p.theta * Math.PI) / 180, D = 320, hl = 100;
    const cx = T_HIT.x - D * Math.sin(t), cy = T_HIT.y + D * Math.cos(t);
    const ux = Math.cos(t), uy = Math.sin(t);
    sim.load(s, [lineSource(cx - ux * hl, cy - uy * hl, cx + ux * hl, cy + uy * hl, T_LEVEL)]);
    sim.annotations.arrows.push(
      { x0: T_HIT.x, y0: T_HIT.y + 220, x1: T_HIT.x, y1: T_HIT.y - 200, color: "#ffffffaa", dashed: true },
      { x0: cx, y0: cy, x1: T_HIT.x - Math.sin(t) * 18, y1: T_HIT.y + Math.cos(t) * 18, color: "#ffd84a" },
    );
    sim.annotations.labels.push(
      { x: 100, y: T_SURF - 14, text: "air  n = 1.0" },
      { x: 100, y: T_SURF + 28, text: `glass  n = ${T_N}`, color: "#9fe3ff" },
      { x: T_HIT.x + 8, y: T_HIT.y - 180, text: "normal" },
    );
    sim.viewMode = "intensity";
    sim.brightness.field = 3.8;
    sim.brightness.intensity = 6.2;
  },
  steps: [
    {
      title: "Out of the glass",
      html: `<p>This time the beam starts <b>inside</b> the glass and heads up towards the surface with air above it.</p>
             <p>Look at the beam that comes out into the air.</p>`,
      enter(sim) { sim.runUntil(1800); },
      predict: {
        question: "Going from glass into air, the beam bends…",
        options: ["Towards the normal", "Away from the normal", "Not at all"],
        answer: 1,
        explain: "Away from the normal — the reverse of going into glass, because the wave speeds up. Some of the beam is also reflected back down.",
      },
    },
    {
      title: "Tilt the beam",
      html: `<p>Slowly increase the <b>angle</b> with the slider (the scene restarts each time). Watch the beam that comes out into the air: it gets closer and closer to the surface…</p>`,
      predict: {
        question: "What happens when the outgoing beam would have to bend past the surface?",
        options: ["It goes into the glass sideways", "It cannot get out: all of it is reflected", "It gets brighter"],
        answer: 1,
        explain: "It cannot get out. Beyond the critical angle no beam goes into the air at all and everything is reflected. That is total internal reflection.",
      },
    },
    {
      title: "Find the critical angle",
      html: `<p>Find the smallest angle at which <b>no beam</b> comes out into the air any more, only reflection. Zoom in on the surface if it helps.</p>`,
      task: {
        prompt: "At which angle does the outgoing beam disappear?",
        input: { label: "Critical angle (°)", placeholder: "e.g. 45" },
        check(m) {
          if (m.input === null) return need("Type the angle you found.");
          return within(m.input, criticalDeg(), 3, "critical angle", "°");
        },
      },
    },
    {
      title: "Why that angle?",
      html: () => `<p>Snell's law going out is n₁ sin θ₁ = n₂ sin θ₂. The outgoing angle θ₂ reaches 90° (along the surface) when</p>
             <p class="formula">sin θc = n₂ / n₁ = 1 / ${T_N}  →  θc = ${f1((Math.asin(1 / T_N) * 180) / Math.PI)}°</p>
             <p>In this model the speed ratio for this wavelength gives θc = ${f1(criticalDeg())}°.</p>
             <p>Set the angle above θc and look closely at the surface in the <b>Field</b> view: the wave pokes a little way into the air but does not travel. That is the <b>evanescent wave</b>.</p>
             <p><b>Optical fibres</b> carry internet data this way: the light bounces along inside the glass, always beyond the critical angle. Try the “Light guide” scene in the Sandbox.</p>`,
    },
  ],
};

// ------------------------------------------------------------------------------------------ research: the damping edge

const AW = 1400, AH = 800, A_SRC = 1100, A_PROBE = 900;

/** Incident and reflected pulse amplitude at the probe, from its recorded field. */
function reflection(sim: Sim, p: Values): { inc: number; ref: number } | null {
  const h = sim.history[0];
  if (!h || !h.length) return null;
  const v = groupVelocity(omegaOfLevel(p.level), 1);
  const T = period(p.level), t0 = 3 * T;
  // the direct pulse arrives after (source - probe) / v. The echo comes back from somewhere in the layer: between a
  // bounce at its inner side and one at the border. Only that time is searched: the two ends of the source line (in
  // the top and bottom edges) send a faint wave of their own that reaches the probe earlier and would pass for an echo.
  const direct = t0 + (A_SRC - A_PROBE) / v;
  const echoFrom = t0 + (2 * (AW - p.edge - A_SRC) + (A_SRC - A_PROBE)) / v - 3 * T;
  const echoTo = t0 + (2 * (AW - A_SRC) + (A_SRC - A_PROBE)) / v + 9 * T;
  const split = sim.historyStart + direct + 6 * T, from = sim.historyStart + echoFrom, end = sim.historyStart + echoTo;
  // the amplitude at the pulse's own frequency over two periods (a lock-in): the pulse leaves a slow wake of about 1%
  // behind it, which a plain maximum of |u| would count as an echo
  const w = omegaOfLevel(p.level), N = Math.round(2 * T);
  const amp = (c: number) => {
    let re = 0, im = 0;
    for (let j = Math.max(0, c - (N >> 1)); j < Math.min(h.length, c + (N >> 1)); j++) { re += h[j] * Math.cos(w * j); im -= h[j] * Math.sin(w * j); }
    return (2 / N) * Math.hypot(re, im);
  };
  let inc = 0, ref = 0;
  for (let i = 0; i < h.length; i += 2) {
    const t = sim.historyStart + i;
    if (t < split) inc = Math.max(inc, amp(i));
    else if (t >= from && t < end) ref = Math.max(ref, amp(i));
  }
  if (sim.time < end) return { inc, ref: NaN };
  return { inc, ref };
}

export const edge: Experiment = {
  id: "absorbing-edge",
  title: "How good is the absorbing edge?",
  level: "research",
  minutes: 25,
  summary: "A finite grid needs boundaries that swallow waves. Measure the reflection coefficient of the graded damping edge against its thickness and the frequency.",
  goals: ["Measure a reflection coefficient with a probe", "Graded absorbers reflect less when they are thicker or the wave shorter", "Why perfectly matched layers exist"],
  graph: "points",
  params: [
    { id: "edge", label: "Edge thickness", min: 4, max: 160, step: 2, value: 64, unit: " cells", help: "The ring i cells from the border gets d = 1 − g((T − i)/T)², g = min(0.5, 12/T): a gentle damping that starts without a kink." },
    { id: "level", label: "Source level (frequency)", min: 15, max: 200, step: 1, value: 60, help: "λ is shown in the readout." },
  ],
  setup(sim, p) {
    const s = new Scene(AW, AH);
    s.edge = p.edge;
    // detach right after the pulse, so the echo passes the source line without being pulled back towards zero
    const detach = Math.round(6 * period(p.level) + 10);
    sim.load(s, [lineSource(A_SRC, 0, A_SRC, AH - 1, p.level, { mode: "pulsed", shape: "gaussian", onCycles: 6, offCycles: 1_000_000, detach: true, detachAfterSteps: detach })],
      [{ kind: "point", x: A_PROBE, y: AH / 2, x2: 0, y2: 0, measurement: "amplitude" }]);
    sim.annotations.labels.push({ x: AW - p.edge - 10, y: 30, text: "edge →", color: "#ffd84a" });
    sim.viewMode = "field";
    sim.brightness.field = 9;
    sim.prepareSpeed = 16;
    const v = groupVelocity(omegaOfLevel(p.level), 1);
    sim.runUntil(Math.ceil(3 * period(p.level) + (2 * (AW - A_SRC) + (A_SRC - A_PROBE)) / v + 6 * period(p.level) + 420));
  },
  steps: [
    {
      title: "Why boundaries matter",
      html: `<p>The simulated region is finite, but the waves in it should behave as if space went on for ever. Anything reaching the border must disappear without coming back: an <b>absorbing boundary</b>.</p>
             <p>Wave Dude uses a graded damping layer: the velocity term is multiplied by d = 1 − g((T − i)/T)² (T = thickness, g = min(0.5, 12/T)): 1 at the inner side, a little less towards the border. A sudden change in d would act like a wall and reflect; a gradual one without a kink reflects far less. (The Windows app uses d = √(i/T), which has a kink where the edge begins and reflects 3–8 times more.)</p>
             <p>A single pulse leaves the source line (at x = ${A_SRC}) to the right, enters the edge and partly comes back. Probe P1 (x = ${A_PROBE}) records the direct pulse and then the echo.</p>`,
    },
    {
      title: "Measure the reflection",
      html: `<p>The reflection coefficient is the echo's amplitude divided by the incoming amplitude, R = A<sub>echo</sub> / A<sub>in</sub>, often given in decibels: 20 log₁₀ R.</p>
             <p>The readout below takes both amplitudes from P1's record once the echo has passed. Change the <b>edge thickness</b> and the <b>frequency</b> (each change restarts the pulse) and note how R behaves.</p>`,
      readout: (sim, p) => {
        const r = reflection(sim, p);
        const l = lam(p.level);
        if (!r || !Number.isFinite(r.ref)) return `λ = ${f1(l)} cells · edge = ${f2(p.edge / l)} λ thick · <i>waiting for the echo…</i>`;
        const R = r.ref / r.inc;
        return `λ = ${f1(l)} cells · edge = ${f2(p.edge / l)} λ thick<br>R = <b>${(R * 100).toFixed(2)}%</b> (${(20 * Math.log10(R)).toFixed(1)} dB)` +
          `<div class="muted small">Both amplitudes are taken at the pulse's own frequency; below about 0.4% the faint wake the pulse leaves behind sets the limit.</div>`;
      },
    },
    {
      title: "What to look for",
      html: `<ul><li>R falls as the layer gets thicker <i>compared with the wavelength</i>: what matters is how gradually d changes over one wavelength.</li>
             <li>Long waves (low levels) see a more abrupt layer and reflect more for the same thickness in cells.</li>
             <li>A pulse hitting the edge at a slant (try it in the Sandbox) is absorbed differently: the layer is not angle-independent.</li></ul>
             <p>The modern answer is the <b>perfectly matched layer</b> (Bérenger, 1994): an absorbing layer whose impedance matches the interior at every angle and frequency in the continuum limit, leaving only small discretization reflections. Implementing one needs auxiliary fields — a good project for this code base.</p>`,
    },
  ],
};
