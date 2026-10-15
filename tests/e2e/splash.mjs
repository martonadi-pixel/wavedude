// Splash (kids; replaces the old kids test): the readout counts the finger's taps per second, fewer when it taps
// slower and fewer still in slow motion.
import { start, check } from "./lib.mjs";

const t = await start();
const taps = async () => {
  const ro = await t.readout();
  const n = ro.match(/about (\d+) times/)?.[1], every = ro.match(/once every (\d+) seconds/)?.[1];
  return { ro, perSec: n ? +n : /about once per second/.test(ro) ? 1 : every ? 1 / +every : NaN };
};
await t.goto("#/experiment/splash", 500);
check(/Paused/.test(await t.readout()), "paused: the readout says so");
await t.page.click("button.run"); await t.page.waitForTimeout(2500);
const fast = await taps();
// (how many depends on the frame rate: about 2 at 60 frames a second, fewer in a headless browser)
check(fast.perSec >= 0.75, "running at 1×: taps every second or more often", fast.ro);
await t.setParam(0, 5); await t.page.waitForTimeout(1500);
const slow = await taps();
check(slow.perSec < fast.perSec, "tapping slower: fewer taps", slow.ro);
await t.page.locator("#toolbar input[type=range][aria-label=Speed]").evaluate(el => { el.value = "0"; el.dispatchEvent(new Event("input", { bubbles: true })); });
await t.page.waitForTimeout(2500);
const motion = await taps();
check(await t.ev(() => window.waveDude.stepsPerFrame) < 1 && motion.perSec < slow.perSec, "slow motion: fewer still", motion.ro);
await t.done();
