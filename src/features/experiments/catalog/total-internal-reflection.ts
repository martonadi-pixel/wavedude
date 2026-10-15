// Wave Dude 2D web - "Trapped light: total internal reflection" (school): a beam inside glass meets the surface;
// beyond the critical angle none of it escapes — unless a second block of glass comes within a few cells (frustrated
// total internal reflection, Newton's puzzle and the wave picture of quantum tunnelling).
// GPL-3.0-or-later.
//
// Measured (prototype, θ 50°): across the gap passes 81% at 2 cells, 47% at 4, 25% at 6, 12% at 8, 3.5% at 12; the
// formula below (s-polarisation, with the grid's wavelengths) gives 50% at 4 and 12% at 8.

import { Scene } from "../../../core/scene";
import { deg, rad } from "../../../core/math";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { beam, box, f1, lam, lineProbe, look, need, within } from "../helpers";
import { Recorder } from "../record";

const W = 1100, H = 800, SURF = 300, HIT = { x: 550, y: SURF }, LEVEL = 50, N = 1.5, RUN = 2600;
const rec = new Recorder();

/**
 * The share of the beam that crosses an air gap g cells wide into a second glass block (frustrated total internal
 * reflection, the field along the surfaces): 1 / (1 + ((kz² + κ²)² / (4 kz² κ²)) sinh²(κ g)), where kz is the beam's
 * wavenumber across the surface in the glass and κ how fast the evanescent wave fades in the air.
 */
function crossing(theta: number, g: number): number {
  const k0 = (2 * Math.PI) / lam(LEVEL, 1), k1 = (2 * Math.PI) / lam(LEVEL, N), t = rad(theta);
  const kx = k1 * Math.sin(t), kz = k1 * Math.cos(t), kappa2 = kx * kx - k0 * k0;
  if (kappa2 <= 0) return NaN;
  const kappa = Math.sqrt(kappa2), sh = Math.sinh(kappa * g);
  return 1 / (1 + ((kz * kz + kappa2) ** 2 / (4 * kz * kz * kappa2)) * sh * sh);
}

/**
 * The light that crossed the gap, as a share of the beam that came in: probes across the reflected beam (in the lower
 * glass) and across the beam that went on (in the second block), at the same angle in the same glass. Nothing is
 * absorbed, so the share is T = I_across / (I_across + I_reflected); a probe across the incoming beam would pass too
 * close to the line of sources that makes it.
 */
function measured(sim: Sim): number | null {
  const [refl, out] = sim.profiles;
  if (!refl || !out) return null;
  const sum = (a: Float32Array) => a.reduce((x, y) => x + y, 0);
  const r = sum(refl), t = sum(out);
  return r + t > 0 ? t / (r + t) : null;
}

/** The critical angle in the model: sin θc = (wave speed in glass) / (wave speed in air) = λ_glass / λ_air. */
function criticalDeg(): number {
  return deg(Math.asin(lam(LEVEL, N) / lam(LEVEL, 1)));
}

export const tir: Experiment = {
  id: "total-internal-reflection",
  title: "Trapped light: total internal reflection",
  level: "school",
  minutes: 20,
  summary: "A beam inside glass meets the surface. Tilt it far enough and none of it escapes — the trick behind optical fibres. Then bring a second glass close, and light jumps a gap it cannot cross: tunnelling.",
  goals: ["Leaving glass, a beam bends away from the normal", "Beyond the critical angle all of it is reflected", "sin θc = n₂ / n₁", "A wave leaks across a thin gap that no beam can cross (frustrated total internal reflection, tunnelling)"],
  readMore: [
    { page: "light-and-optics/total-internal-reflection-and-fibres", label: "Total internal reflection and optical fibres" },
    { page: "how-waves-behave/refraction", label: "Refraction: why waves bend" },
  ],
  params: [
    { id: "theta", label: "Angle of the beam θ", min: 20, max: 70, step: 1, value: 30, unit: "°", help: "Angle between the beam and the normal (the dashed line)." },
    { id: "gap", label: "Second glass block above: gap", min: 0, max: 20, step: 1, value: 0, format: v => (v === 0 ? "no block" : `${v} cells of air`),
      help: "A second block of the same glass above the surface, with a thin layer of air between. 0: no second block." },
  ],
  open() { rec.clear(); },
  setup(sim, p) {
    const s = new Scene(W, H).add(box(0, SURF, W, H - SURF, "glass", { n: N, name: "Glass" }));
    // the second block reaches the top edge, so the light that crosses into it leaves the picture
    if (p.gap > 0) s.add(box(0, 0, W, SURF - p.gap, "glass", { n: N, name: "Second block" }));
    // the beam goes up from the bottom left towards the hit point
    const t = rad(p.theta), b = beam(HIT, { x: Math.sin(t), y: -Math.cos(t) }, 320, 100, LEVEL, {}, -1);
    // with the second block: across the reflected beam and across the beam that went on (both right of the hit point, in glass)
    const y1 = SURF + 120, y2 = SURF - p.gap - 120;
    sim.load(s, [b.source], p.gap > 0 ? [lineProbe(HIT.x, y1, W - 1, y1), lineProbe(HIT.x, y2, W - 1, y2)] : []);
    sim.annotations.arrows.push(
      { x0: HIT.x, y0: HIT.y + 220, x1: HIT.x, y1: HIT.y - 200, color: "#ffffffaa", dashed: true },
      { x0: b.x, y0: b.y, x1: HIT.x - Math.sin(t) * 18, y1: HIT.y + Math.cos(t) * 18, color: "#ffd84a" },
    );
    sim.annotations.labels.push(
      { x: 100, y: SURF - 14, text: "air  n = 1.0" },
      { x: 100, y: SURF + 28, text: `glass  n = ${N}`, color: "#9fe3ff" },
      { x: HIT.x + 8, y: HIT.y - 180, text: "normal" },
    );
    if (p.gap > 0) sim.annotations.labels.push({ x: 100, y: SURF - p.gap - 14, text: `second glass block, ${p.gap} cells of air below it`, color: "#9fe3ff" });
    look(sim, { view: "intensity", field: 3.8, intensity: 6.2 });
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
             <p class="formula">sin θc = n₂ / n₁ = 1 / ${N}  →  θc = ${f1(deg(Math.asin(1 / N)))}°</p>
             <p>In this model the speed ratio for this wavelength gives θc = ${f1(criticalDeg())}°.</p>
             <p>Set the angle above θc and look closely at the surface in the <b>Field</b> view: the wave pokes a little way into the air but does not travel. That is the <b>evanescent wave</b>.</p>
             <p><b>Optical fibres</b> carry internet data this way: the light bounces along inside the glass, always beyond the critical angle. Try the “Light guide” scene in the Sandbox.</p>`,
    },
    {
      title: "Newton's puzzle: light that jumps a gap",
      html: (p: Values) => `<p>In 1704 Isaac Newton noticed something strange. Light that was totally reflected inside a prism got out after all when he pressed a second piece of glass against it — even where the two did not quite touch.</p>
             <p>Try it. Set the <b>angle</b> above the critical angle (${f1(criticalDeg())}°), say 50°, so that nothing comes out into the air. Then use the second slider to bring a <b>second block of glass</b> close above the surface: a gap of a few cells of air.</p>
             <p>Light crosses the gap, although no beam can travel in the air at this angle! The evanescent wave that pokes into the air reaches the second block and starts a new beam there. The thinner the gap, the more gets across. Measure several gaps: each is a fresh run.</p>${p.theta < criticalDeg() ? `<p class="note">The angle is ${p.theta}°, below the critical angle: light gets out anyway. Set it above ${f1(criticalDeg())}°.</p>` : ""}`,
      readout: (sim, p) => {
        if (p.gap === 0) return `<div class="muted">Move the second slider to bring the second block close.</div>`;
        if (p.theta >= criticalDeg()) rec.capture(p.gap, sim.time >= RUN, () => measured(sim));
        const r = rec.get(p.gap), th = crossing(p.theta, p.gap);
        return (r !== undefined ? `Across a ${p.gap}-cell gap: <b>${(100 * r).toFixed(1)}%</b> of the light` : sim.time < RUN ? "Measuring…" : "") +
          (Number.isFinite(th) ? `<div class="muted small">The wave formula for this angle and gap: ${(100 * th).toFixed(1)}%</div>` : "") +
          rec.chart({ xLabel: "gap (cells)", yLabel: "light across", xMin: 0, xMax: 20, current: p.gap });
      },
      enter(sim) { sim.runUntil(RUN); },
    },
    {
      title: "Tunnelling",
      html: `<p>A particle could never do this: at this angle it would bounce back from the surface every time, gap or no gap. A <b>wave</b> leaks a little way past the surface, and if there is somewhere to go before the leak has faded, part of it gets through.</p>
             <p>In quantum physics every particle has a wave, so particles can do it too: an electron can cross a thin barrier it does not have the energy to climb. This is called <b>tunnelling</b>, and the numbers follow the same rule you just measured — the share that gets through falls off steeply (exponentially) with the width of the barrier.</p>
             <ul><li><b>Scanning tunnelling microscopes</b> see single atoms by measuring how many electrons tunnel from a needle tip across a gap of a few atoms: a tiny change of the gap changes the current a lot.</li>
             <li><b>Flash memory</b> in phones and USB sticks stores bits by tunnelling electrons through a thin insulating layer.</li>
             <li>The <b>Sun</b> shines because hydrogen nuclei tunnel through the electric wall that keeps them apart, often enough to fuse.</li></ul>
             <p>Fingerprint readers and some touch screens use the optical version: where a finger touches the glass, it frustrates the total internal reflection.</p>`,
    },
  ],
};
