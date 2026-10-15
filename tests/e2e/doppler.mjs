// A moving source: both ears hear the source's own pitch while it stands still; moving at half the wave speed, the
// ear ahead hears 2× and the ear behind 2/3×; faster than its waves it stops when the cone is clear; it can go round.
import { start, check, near } from "./lib.mjs";

const t = await start();
await t.goto("#/experiment/doppler", 600);
const settle = async () => { await t.page.waitForTimeout(400); await t.page.waitForFunction(() => !window.waveDude.running || !window.waveDude.preparing, null, { timeout: 180000 }); await t.page.waitForTimeout(800); };
const step = async i => { await t.step(i); await t.play(); await settle(); };
const pitch = async () => {
  const ro = await t.readout();
  return { ahead: +(ro.match(/ahead 👂\s*([\d.]+)×/)?.[1] ?? NaN), behind: +(ro.match(/behind 👂\s*([\d.]+)×/)?.[1] ?? NaN) };
};
await t.play(); await settle();
const still = await pitch();
check(near(still.ahead, 1, 0.02) && near(still.behind, 1, 0.02), "standing still: both ears hear 1.00×", still);

await step(1);
const moving = await pitch();
check(near(moving.ahead, 2, 0.08) && near(moving.behind, 2 / 3, 0.03), "at 0.5× the wave speed: 2× ahead, 0.67× behind", moving);
const moved = await t.ev(() => { const s = window.waveDude, src = s.sources[0]; return s.sourcePos(src).x - src.x; });
check(moved > 100, "the source moved", moved);

await step(2);
const cone = await t.ev(() => ({ running: window.waveDude.running, time: window.waveDude.time, mach: window.waveDude.sources[0].motion?.mach }));
check(!cone.running && cone.mach >= 1.5 && cone.time > 0, "faster than its waves (≥ 1.5×): the picture stops with the cone", cone);

await t.step(3); await t.play(); await t.page.waitForTimeout(1500);
check(await t.ev(() => window.waveDude.sources[0].motion?.kind) === "circle", "going round: the source moves in a circle");
await t.done();
