// Wave Dude 2D web - "Compton scattering: light as particles" (university, 1923).
// GPL-3.0-or-later.
//
// The wave equation knows nothing about photons, but Compton's law has an exact wave picture: in the frame that moves
// with the centre of momentum of photon + electron (speed beta = E / (E + m c^2) along the beam) the scattering is
// plain wave scattering with no change of wavelength; seen from the lab, the electron recedes at beta and the Doppler
// effect gives lambda' / lambda = (1 - beta cos theta) / (1 - beta) = 1 + (E / m c^2)(1 - cos theta), Compton's law.
// So the "electron" here is a tiny antenna that re-radiates the wave it receives (with the phase it receives) while it
// recedes at beta times the wave speed, and three probes measure the scattered wavelength at 90, 135 and 180 degrees.
// Visible light: beta = 5e-6, nothing changes. Compton's X-rays: beta = 0.033 (a few % longer backwards).
// Gamma rays from caesium-137: beta = 0.56 (3.6 times longer backwards).

import { Scene } from "../../../core/scene";
import { elementsOf } from "../../../core/sources";
import { groupVelocity, omegaOfLevel, wavelength } from "../../../core/physics";
import { deg, rad, spectralPeak } from "../../../core/math";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { f1, f2, lam, lineSource, look, need, period, pointProbe, within } from "../helpers";

const W = 1400, H = 800, EX = 720, EY = 400, LEVEL = 60, SRC_X = EX - 330, R = 300, GAIN = 20;
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

/** The three probes: angle from the beam direction, and position at distance R from the electron's start. */
const PROBES = [90, 135, 180].map(a => ({ a, x: Math.round(EX + R * Math.cos(rad(a))), y: Math.round(EY - R * Math.sin(rad(a))) }));

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
  const w = omegaOfLevel(LEVEL), L = lam(LEVEL), k = (2 * Math.PI) / L, T = period(LEVEL);
  const vph = w / k, vg = groupVelocity(w, 1), beta = betaOf(lamPm), v = beta * vph;
  // the incoming burst (Gaussian, sigma = cycles / 6) leaves the wave maker centred at t = cycles / 2 periods. A long
  // burst has a sharp frequency, so the probes read the wavelength to a few 0.1%; the fast gamma-ray recoil needs a
  // short one (the electron would otherwise travel far while it radiates)
  const cycles = beta > 0.2 ? 6 : 18, sigma = (cycles / 6) * T;
  const tc = (cycles / 2) * T + (EX - SRC_X) / vg;
  const ts = tc - 3 * sigma;
  const xe = (t: number) => EX + v * (Math.max(t, ts) - tc);
  const env = (t: number) => Math.exp(-0.5 * ((t - (cycles / 2) * T - (xe(t) - SRC_X) / vg) / sigma) ** 2);
  const sigmaE = sigma / (1 - v / vg);
  // where the electron is when it radiates most (for the angles the formula is compared with)
  let tPeak = tc;
  for (let t = ts, best = 0; t < tc + 8 * sigmaE; t += 1) { const e = env(t); if (e > best) { best = e; tPeak = t; } }
  const end = Math.round(tc + R / (0.9 * vg) + 4 * sigmaE * (1 + beta) + 60);
  return { w, L, k, T, vg, beta, v, cycles, tc, ts, xe, env, tPeak, xPeak: xe(tPeak), end };
}

/** Angular frequency of the burst in h[from, to): where its spectrum peaks (a scan, then refined); NaN if empty. */
function burstOmega(h: number[], from: number, to: number, guess: number): number {
  to = Math.min(to, h.length);
  if (to - from < 8) return NaN;
  return spectralPeak(h, from, to, 0.15 * guess, 1.3 * guess, 0.005 * guess, 1e-6 * guess);
}

/** Wavelength of the scattered burst at each probe (from its frequency), and what Compton's law predicts there. */
function comptonMeasure(sim: Sim, p: Values) {
  const light = lightOf(p), run = comptonRun(light.lamPm);
  if (sim.time < run.end) return null;
  const E = HC / light.lamPm;
  return PROBES.map((pr, i) => {
    const h = sim.history[i] ?? [];
    const dist = Math.hypot(pr.x - EX, pr.y - EY);
    // between the incoming burst passing and the scattered one arriving
    const split = Math.max(0, Math.round(run.tc + (0.5 * dist) / run.vg) - sim.historyStart);
    const wOut = burstOmega(h, split, h.length, run.w);
    const angle = deg(Math.atan2(EY - pr.y, pr.x - run.xPeak));
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
  return `${head}<table class="ro-table wide">` +
    `<tr><th>probe</th><th>angle</th><th>measured λ′ ÷ λ</th><th>Compton's law</th><th>λ′</th></tr>` +
    q.map((r, i) => `<tr><td class="p-${i + 1}">P${i + 1}</td><td>${Math.round(r.angle)}°</td><td><b>${cell(r.ratio)}</b></td><td>${cell(r.predicted)}</td><td>${real(r.ratio)}</td></tr>`).join("") +
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
  return `<svg viewBox="0 0 340 220" class="rec-chart wide">
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
  readMore: [
    { page: "light-and-optics/is-light-a-wave", label: "Is light a wave?" },
    { page: "waves-around-us/sound-and-light-spectrum", label: "Spectra of sound and light" },
  ],
  graph: "points",
  params: [
    { id: "light", label: "Light", min: 1, max: LIGHTS.length, step: 1, value: 1, format: v => LIGHTS[Math.round(v) - 1].name,
      help: "Visible light, Compton's X-rays (70.9 pm) or gamma rays from caesium-137 (1.87 pm). On screen every kind is drawn with the same wavelength; what changes is how hard each photon kicks the electron. Each change is a fresh run." },
    { id: "theta", label: "Calculator: scattering angle θ", min: 0, max: 180, step: 1, value: 90, unit: "°", help: "Used by the photon calculator (steps 3–4), not by the wave simulation.", live: () => {} },
  ],
  setup(sim, p) {
    const light = lightOf(p), run = comptonRun(light.lamPm);
    const s = new Scene(W, H);
    const burst = lineSource(SRC_X, 0, SRC_X, H - 1, LEVEL, { name: "Light", mode: "pulsed", shape: "gaussian", onCycles: run.cycles, offCycles: 1_000_000, detach: true, detachAfterSteps: Math.round(run.cycles * run.T + 10) });
    sim.load(s, [burst], PROBES.map(q => pointProbe(q.x, q.y)));
    const lineEls = elementsOf(burst);
    const start = { x: run.xe(0), y: EY };
    const track = { x0: start.x, y0: EY, x1: start.x, y1: EY, color: "#fbbf24" };
    const label = { x: start.x + 10, y: EY - 12, text: "electron", color: "#fbbf24" };
    sim.annotations.arrows.push(track);
    sim.annotations.labels.push(label, ...PROBES.map(q => ({ x: q.x + 8, y: q.y + 16, text: `${q.a}°`, color: "#ffffffaa" })));
    // the burst first, then the electron: a tiny antenna that re-radiates what it receives while it recoils
    let shown: "line" | "electron" | "none" = "line";
    const lineEnd = Math.round(run.cycles * run.T + 50);
    sim.stepHook = t => {
      const x = run.xe(t);
      track.x1 = x; label.x = x + 10;
      if (t < lineEnd) { if (shown !== "line") { sim.engine.setSources(lineEls); shown = "line"; } return; }
      const e = run.env(t);
      if (e < 1e-3) { if (shown !== "none") { sim.engine.setSources([]); shown = "none"; } return; }
      const x0 = Math.floor(x), f = x - x0, phase = -run.k * (x - SRC_X);
      const el = (cx: number, amp: number) => ({ x: cx, y: EY, level: LEVEL, amplitude: amp, phase, mode: "continuous" as const, shape: "gaussian" as const, onCycles: 1, offCycles: 0, detachStep: -1 });
      // a single cell radiates weakly: drive it hard so the scattered wave is clear on screen and at the probes
      sim.engine.setSources([el(x0, GAIN * (1 - f) * e), el(x0 + 1, GAIN * f * e)]);
      shown = "electron";
    };
    look(sim, { view: "field", field: 9, prepare: 6, runTo: run.end });
  },
  steps: [
    {
      title: "Light meets an electron",
      html: `<p>A short burst of light (from the left) sweeps over an electron. The electron is shaken by the wave and sends out a new wave in all directions: it <b>scatters</b> the light.</p>
             <p>Three probes measure the scattered wave: <b class="p-1">P1</b> to the side (90°), <b class="p-2">P2</b> half-way back (135°) and <b class="p-3">P3</b> straight back (180°). The graph shows what they pick up: first the passing burst, later the scattered wave.</p>`,
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
          `<table class="ro-table"><tr><td>wavelength in / out</td><td>${L(lamIn)} → <b>${L(c.lamOut)}</b> (Δλ = ${f2(c.dl)} pm)</td></tr>` +
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
