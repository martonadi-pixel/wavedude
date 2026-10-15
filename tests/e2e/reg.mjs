// The 4-bit register of waves stores the numbers written to it (right after the step opens, too).
import { start, check } from "./lib.mjs";

const t = await start();
await t.goto("#/experiment/wave-memory", 500);
await t.step(/register/i);
await t.settle(90000);
for (const v of [5, 10]) {
  await t.page.locator(".step-actions button", { hasText: new RegExp(`^Write ${v} `) }).click();
  await t.settle(90000);
  // let the set/reset light finish its trip and the latches hold on their own
  await t.page.waitForFunction(() => !/writing/.test(document.getElementById("step-readout")?.textContent ?? ""), null, { timeout: 90000 });
  const ro = await t.readout();
  const m = ro.match(/([01]{4}) = (\d+)/);
  check(m && +m[2] === v && parseInt(m[1], 2) === v, `write ${v}: the register holds ${v}`, ro.slice(0, 80));
}
await t.done();
