// Wave Dude 2D web - "How good is the absorbing edge?" (research): the reflection coefficient of the graded damping
// edge against its thickness and the frequency.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { groupVelocity, omegaOfLevel } from "../../../core/physics";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { f1, f2, lam, lineSource, look, period, pointProbe } from "../helpers";

const W = 1400, H = 800, SRC_X = 1100, PROBE_X = 900;

/** Incident and reflected pulse amplitude at the probe, from its recorded field. */
function reflection(sim: Sim, p: Values): { inc: number; ref: number } | null {
  const h = sim.history[0];
  if (!h || !h.length) return null;
  const v = groupVelocity(omegaOfLevel(p.level), 1);
  const T = period(p.level), t0 = 3 * T;
  // the direct pulse arrives after (source - probe) / v. The echo comes back from somewhere in the layer: between a
  // bounce at its inner side and one at the border. Only that time is searched: the two ends of the source line (in
  // the top and bottom edges) send a faint wave of their own that reaches the probe earlier and would pass for an echo.
  const direct = t0 + (SRC_X - PROBE_X) / v;
  const echoFrom = t0 + (2 * (W - p.edge - SRC_X) + (SRC_X - PROBE_X)) / v - 3 * T;
  const echoTo = t0 + (2 * (W - SRC_X) + (SRC_X - PROBE_X)) / v + 9 * T;
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
  readMore: [
    { page: "how-it-computes/absorbing-boundaries", label: "Boundaries and absorbing layers" },
    { page: "how-waves-behave/absorption-and-damping", label: "Absorption and damping" },
  ],
  graph: "points",
  params: [
    { id: "edge", label: "Edge thickness", min: 4, max: 160, step: 2, value: 64, unit: " cells", help: "The ring i cells from the border gets d = 1 − g((T − i)/T)², g = min(0.5, 12/T): a gentle damping that starts without a kink." },
    { id: "level", label: "Source level (frequency)", min: 15, max: 200, step: 1, value: 60, help: "λ is shown in the readout." },
  ],
  setup(sim, p) {
    const s = new Scene(W, H);
    s.edge = p.edge;
    // detach right after the pulse, so the echo passes the source line without being pulled back towards zero
    const detach = Math.round(6 * period(p.level) + 10);
    sim.load(s, [lineSource(SRC_X, 0, SRC_X, H - 1, p.level, { mode: "pulsed", shape: "gaussian", onCycles: 6, offCycles: 1_000_000, detach: true, detachAfterSteps: detach })],
      [pointProbe(PROBE_X, H / 2)]);
    sim.annotations.labels.push({ x: W - p.edge - 10, y: 30, text: "edge →", color: "#ffd84a" });
    const v = groupVelocity(omegaOfLevel(p.level), 1);
    look(sim, { view: "field", field: 9, prepare: 16, runTo: Math.ceil(3 * period(p.level) + (2 * (W - SRC_X) + (SRC_X - PROBE_X)) / v + 6 * period(p.level) + 420) });
  },
  steps: [
    {
      title: "Why boundaries matter",
      html: `<p>The simulated region is finite, but the waves in it should behave as if space went on for ever. Anything reaching the border must disappear without coming back: an <b>absorbing boundary</b>.</p>
             <p>Wave Dude uses a graded damping layer: the velocity term is multiplied by d = 1 − g((T − i)/T)² (T = thickness, g = min(0.5, 12/T)): 1 at the inner side, a little less towards the border. A sudden change in d would act like a wall and reflect; a gradual one without a kink reflects far less. (The Windows app uses d = √(i/T), which has a kink where the edge begins and reflects 3–8 times more.)</p>
             <p>A single pulse leaves the source line (at x = ${SRC_X}) to the right, enters the edge and partly comes back. Probe P1 (x = ${PROBE_X}) records the direct pulse and then the echo.</p>`,
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
