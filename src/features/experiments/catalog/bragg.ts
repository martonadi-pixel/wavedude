// Wave Dude 2D web - "X-rays and crystals: Bragg's law" (university, 1913), with Davisson-Germer's electrons (1927).
// GPL-3.0-or-later.
//
// Measured in the engine (square lattice d = 14 of weak atoms, n = 1.25, radius 2; level 60): a single clear reflection
// peak at 30° glancing angle. Bragg's law alone gives 32.2°; with the refraction of the crystal's average index
// (eps_eff = 1 + f (n^2 - 1)) it predicts 29.9° — the same correction X-ray crystallographers apply.

import { Scene } from "../../../core/scene";
import { deg, mean, rad } from "../../../core/math";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { beam, f1, f2, lam, lineProbe, look, need, within } from "../helpers";
import { Recorder } from "../record";

const W = 1500, H = 1150, TOP = 560, HX = 850, D = 14, ATOM_N = 1.25, ATOM_R = 2, RUN = 3200;
/** One angle scan per wavelength. */
const scans = new Map<number, Recorder>();
let fill = 0.064;

function scanOf(level: number): Recorder {
  let r = scans.get(level);
  if (!r) scans.set(level, (r = new Recorder()));
  return r;
}

/** Records the detector for this angle once its run is done (the mean light along the detector line). */
function capture(sim: Sim, p: Values): Recorder {
  const rec = scanOf(p.level);
  rec.capture(p.theta, sim.time >= RUN, () => mean(sim.profiles[0]));
  return rec;
}

function prediction(level: number): { bragg: number; corrected: number } {
  const l = lam(level);
  const nEff = Math.sqrt(1 + fill * (ATOM_N ** 2 - 1));
  const s = l / (2 * D);
  const sIn = l / (2 * D * nEff);
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
  readMore: [
    { page: "maths-of-waves/interference-diffraction", label: "Interference and diffraction formulas" },
    { page: "light-and-optics/resolution-diffraction-limit", label: "Resolution and the diffraction limit" },
  ],
  params: [
    { id: "theta", label: "Glancing angle of the beam θ", min: 16, max: 50, step: 1, value: 22, unit: "°", help: "Angle between the beam and the rows of atoms. Each setting is a fresh run." },
    { id: "level", label: "Wavelength (frequency level)", min: 45, max: 90, step: 1, value: 60, help: "Higher level = shorter wavelength." },
  ],
  open() { scans.clear(); },
  setup(sim, p) {
    const s = new Scene(W, H);
    for (let y = TOP + D / 2; y < H - 70; y += D) for (let x = 500; x < 1300; x += D) s.disc(x, y, ATOM_R, { n: ATOM_N });
    // the crystal's filling fraction, for the refraction correction
    let atoms = 0, cells = 0;
    for (let y = TOP; y < H - 70; y++) for (let x = 500; x < 1300; x++) { cells++; if (s.n[y * W + x] > 1.01) atoms++; }
    fill = atoms / cells;
    // the beam comes down at the glancing angle towards (HX, TOP); the detector sits where a mirror would send it
    const t = rad(p.theta), b = beam({ x: HX, y: TOP }, { x: Math.cos(t), y: Math.sin(t) }, 400, 100, p.level, { name: "X-ray beam" });
    const rx = Math.cos(t), ry = -Math.sin(t);
    const dx = HX + 260 * rx, dy = TOP + 260 * ry, ex = Math.sin(t), ey = Math.cos(t);
    sim.load(s, [b.source], [lineProbe(Math.round(dx - ex * 70), Math.round(dy - ey * 70), Math.round(dx + ex * 70), Math.round(dy + ey * 70))]);
    sim.annotations.arrows.push({ x0: b.x, y0: b.y, x1: HX - 20 * Math.cos(t), y1: TOP - 20 * Math.sin(t), color: "#ffd84a" },
      { x0: 480, y0: TOP, x1: 1320, y1: TOP, color: "#ffffff44", dashed: true });
    sim.annotations.labels.push({ x: dx + 20, y: dy - 10, text: "detector", color: "#ffd84a" }, { x: 1000, y: TOP + 30, text: "crystal: rows of atoms, 14 cells apart" });
    look(sim, { view: "intensity", intensity: 9.6, field: 4.8, prepare: 48, runTo: RUN });
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
        const rec = capture(sim, p);
        return (rec.has(p.theta) ? `Detector at θ = ${p.theta}°: measured.` : "Measuring…") +
          rec.chart({ xLabel: "glancing angle θ (°)", yLabel: "detector", xMin: 16, xMax: 50, current: p.theta });
      },
      task: {
        prompt: "At which angle is the reflection strongest?",
        input: { label: "Angle of the peak (°)", placeholder: "e.g. 30" },
        check(m, p) {
          const rec = scans.get(p.level);
          if (!rec || rec.size < 8) return need("Scan at least 8 angles first.");
          if (m.input === null) return need("Type the angle of the peak.");
          const pr = prediction(p.level);
          const r = within(m.input, pr.corrected, 2.5, "Bragg angle", "°");
          r.message += ` (Bragg's law alone: ${f1(pr.bragg)}°; with the crystal's refraction: ${f1(pr.corrected)}°.)`;
          return r;
        },
      },
    },
    {
      title: "Bragg's law",
      html: (p: Values) => {
        const pr = prediction(p.level), l = lam(p.level);
        return `<p>Two neighbouring rows, d apart. The wave reflected by the lower row travels an extra 2 d sin θ. The reflections add up when that is a whole number of wavelengths:</p>
               <p class="formula">2 d sin θ = m λ</p>
               <p>Here d = ${D} cells and λ = ${f1(l)} cells, so sin θ = ${f2(l / (2 * D))} and θ = ${f1(pr.bragg)}°.</p>
               <p><b>The small correction.</b> Inside the crystal the wave is slightly slower (its average index is ${f2(Math.sqrt(1 + fill * (ATOM_N ** 2 - 1)))}), so it bends a little as it enters. The peak you measure outside is at ${f1(pr.corrected)}°. Real X-ray work applies the same correction — for X-rays the index differs from 1 by only about a millionth, so it is tiny there.</p>
               <p>Knowing λ, the peak angle gives d: the spacing of atoms. The Braggs measured the structure of salt this way and shared the 1915 Nobel Prize; the same method later revealed the double helix of DNA.</p>`;
      },
    },
    {
      title: "Electrons are waves too",
      html: `<p>In 1924 Louis de Broglie suggested that particles have a wavelength, λ = h / p (Planck's constant over momentum). In 1927 Clinton Davisson and Lester Germer fired electrons at a nickel crystal and found a strong reflection at a special angle, just like X-rays: 54 eV electrons have λ = 0.167 nm, and the peak sat where the nickel atom spacing (0.215 nm) predicted. George Paget Thomson saw electron diffraction rings the same year.</p>
             <p>Try it here: change the <b>wavelength</b> slider (faster electrons = shorter wavelength) and scan again. The peak moves exactly as Bragg's law says — the maths does not care whether the wave is light or matter.</p>
             <p class="aside">This simulator solves the classical wave equation, not Schrödinger's equation for electrons. The diffraction geometry — where the peaks are — is the same for both, which is what this step shows.</p>`,
      readout: (sim, p) => {
        const rec = capture(sim, p), pr = prediction(p.level);
        return `λ = ${f1(lam(p.level))} cells: predicted peak at ${f1(pr.corrected)}°.` +
          rec.chart({ xLabel: "glancing angle θ (°)", yLabel: "detector", xMin: 16, xMax: 50, current: p.theta, marks: [{ x: pr.corrected, label: "predicted", color: "#c084fc" }] });
      },
    },
  ],
};
