// White light: a prism fans the eight colours out by Snell's law with each colour's own index (violet most, red
// least), and without dispersion they leave together.
import { start, check } from "./lib.mjs";

const t = await start({ width: 1366, height: 768 });
const NM = [410, 450, 490, 530, 570, 610, 650, 690];
/** Each colour's direction after the prism (degrees, down positive): beam centres on two lines 200 cells apart. */
async function fan(ex) {
  await t.goto("#/sandbox", 800);
  await t.startFrom("empty");
  return t.ev(EX => {
    const s = window.waveDude;
    s.setWhiteLight(true, EX);
    const CX = 330, CY = 260, H = 120;
    Object.assign(s.opticTemplate, { kind: "prism", size: 2 * H, radius: 60, n: 1.5, angleDeg: 0, thickness: 24 });
    s.tools.act("optic", "down", { x: CX + 0.5, y: CY + 0.5 }, { x: CX + 0.5, y: CY + 0.5 });
    // a white beam onto the left face at minimum deviation for n 1.517 (incidence 49.3°)
    const a = (-19.3 * Math.PI) / 180, fx = CX - H * Math.tan(Math.PI / 6), sx = fx - 190 * Math.cos(a), sy = CY - 190 * Math.sin(a);
    Object.assign(s.sourceTemplate, { angleDeg: -19.3, beamWidth: 70, level: 40, amplitudePct: 100, mode: "continuous" });
    s.tools.act("laser", "down", { x: sx, y: sy }, { x: sx, y: sy });
    s.tools.act("laser", "up", { x: sx, y: sy }, { x: sx, y: sy });
    s.running = false;
    s.advance(1800);
    const Hh = s.scene.height, lines = [600, 800], acc = lines.map(() => new Float64Array(8 * Hh));
    for (let k = 0; k < 300; k++) {
      s.advance(3);
      lines.forEach((X, j) => { const f = s.engine.readSpectrum(X, 0, 1, Hh); for (let i = 0; i < 8 * Hh; i++) acc[j][i] += f[i] * f[i]; });
    }
    const centre = (A, c) => {
      let mx = 0; for (let y = 0; y < Hh; y++) mx = Math.max(mx, A[y * 8 + c]);
      let m = 0, w = 0; for (let y = 0; y < Hh; y++) { const v = A[y * 8 + c]; if (v >= 0.2 * mx) { m += y * v; w += v; } }
      return m / w;
    };
    return Array.from({ length: 8 }, (_, c) => (Math.atan2(centre(acc[1], c) - centre(acc[0], c), lines[1] - lines[0]) * 180) / Math.PI);
  }, ex);
}
/** Snell's law at both faces of the 60° prism, n = 1 + 0.5 × the crown-glass dispersion factor × ex. */
const snell = ex => NM.map(nm => {
  const um = nm / 1000, n = 1 + 0.5 * (1 + ex * (0.0042 / 0.5168) * (1 / (um * um) - 1 / (0.589 * 0.589)));
  const r1 = Math.asin(Math.sin((49.3 * Math.PI) / 180) / n);
  return -30 + (Math.asin(Math.min(1, n * Math.sin(Math.PI / 3 - r1))) * 180) / Math.PI;
});
const f = v => v.map(x => x.toFixed(1)).join(" ");

const none = await fan(0);
check(Math.max(...none) - Math.min(...none) < 1.2, "without dispersion every colour leaves the prism together", f(none));
const ten = await fan(10), th = snell(10);
check(ten.every((v, i) => i === 0 || v < ten[i - 1]), "violet bends most, red least", f(ten));
check(ten.every((v, i) => Math.abs(v - th[i]) < 1.5), "each colour within 1.5° of Snell's law with its own index", { measured: f(ten), snell: f(th) });
await t.done();
