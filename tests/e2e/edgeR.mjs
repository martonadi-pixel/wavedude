// The damping edge: its reflection falls as it gets thicker compared with the wavelength (64 cells: below 1% for
// λ ≈ 30 cells, below 0.5% for λ ≈ 15).
import { start, check, num } from "./lib.mjs";

const t = await start();
const run = async (i, v) => { await t.setParam(i, v); await t.page.waitForTimeout(500); await t.idle(); await t.page.waitForTimeout(400); };
await t.goto("#/experiment/absorbing-edge", 600);
await t.step(1); await t.play(); await t.idle(); await t.page.waitForTimeout(400);
const R = {};
for (const [edge, level] of [[16, 60], [64, 60], [64, 30]]) {
  await run(1, level); await run(0, edge);
  R[`${edge}@${level}`] = num(await t.readout(), "R =");
}
check(Object.values(R).every(Number.isFinite), "every setting gives a reflection", R);
check(R["16@60"] > R["64@60"], "a thicker edge reflects less", R);
check(R["64@60"] < 0.5 && R["64@30"] < 1, "64 cells: below 0.5% at λ 15, below 1% at λ 30", R);
await t.done();
