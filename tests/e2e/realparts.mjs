// SR latch, SET and RESET together: with perfect parts it flickers for ever; with "real parts" (one transistor a
// little less sensitive) it settles into 0 or 1.
import { start, check } from "./lib.mjs";

const t = await start();
await t.goto("#/experiment/wave-memory", 500);
await t.step(/together/i);
await t.settle();
for (let k = 1; k <= 2; k++) {
  const t0 = Date.now();
  await t.page.locator(".step-actions button", { hasText: "real parts" }).click(); await t.settle();
  const ro = await t.readout();
  check(/settled: Q = [01]/.test(ro), `real parts #${k}: the latch settles (${((Date.now() - t0) / 1000).toFixed(0)} s)`, ro.slice(0, 120));
}
await t.page.locator(".step-actions button", { hasText: "perfect parts" }).click(); await t.settle();
await t.page.waitForTimeout(3000);
const ro = await t.readout();
check(/flickering/.test(ro), "perfect parts: it flickers", ro.slice(0, 120));
await t.done();
