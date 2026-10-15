// Compton scattering: the probes measure the scattered wavelength as Compton's law predicts, for visible light
// (unchanged), X-rays (a few % longer backwards) and gamma rays (more than 3 times longer backwards).
import { start, check } from "./lib.mjs";

const t = await start();
await t.goto("#/experiment/compton", 500); await t.play();
const rows = () => t.page.locator("#step-readout table tr").evaluateAll(trs => trs.slice(1).map(tr => [...tr.cells].map(c => c.innerText)));
for (const [light, name] of [[1, "visible light"], [2, "X-rays"], [3, "gamma rays"]]) {
  await t.setParam(0, light);
  await t.page.waitForTimeout(400); await t.idle(); await t.page.waitForTimeout(500);
  const r = await rows();
  // measured λ′/λ against Compton's law at each probe (90°, 135°, 180°)
  // (gamma rays: the electron recoils at 0.56 of the wave speed and moves while it radiates; 90° reads ~3% high)
  const err = r.map(c => Math.abs(+c[2] / +c[3] - 1)), tol = light === 3 ? 0.04 : 0.02;
  check(r.length === 3 && err.every(e => e < tol), `${name}: measured λ′/λ follows Compton's law within ${tol * 100}%`, r.map(c => `${c[1]} ${c[2]} vs ${c[3]}`).join(", "));
  if (light === 3) check(+r[2][2] > 3, "gamma rays come back more than 3 times longer", r[2][2]);
}
await t.done();
