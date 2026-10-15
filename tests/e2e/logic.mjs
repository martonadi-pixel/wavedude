// Wave logic: the OR/AND combiner answers within a few seconds of each flip, and fills in its truth table.
import { start, check } from "./lib.mjs";

const t = await start();
const bits = () => t.ev(() => Object.fromEntries(window.waveDude.logic.detectors.map(d => [d.id, d.bit])));
await t.goto("#/experiment/wave-logic", 500);
await t.page.locator(".nav .primary").click(); await t.play(); await t.settle(60000);
check(JSON.stringify(await bits()) === JSON.stringify({ or: 0, and: 0 }), "A = 0, B = 0: OR 0, AND 0", await bits());
const expect = [["A", { or: 1, and: 0 }], ["B", { or: 1, and: 1 }], ["A", { or: 1, and: 0 }]];
let state = "";
for (const [input, want] of expect) {
  const t0 = Date.now();
  await t.page.locator(".step-actions button", { hasText: `${input} =` }).click(); await t.settle(60000);
  state = state ? `${state}, flip ${input}` : `flip ${input}`;
  const got = await bits(), s = (Date.now() - t0) / 1000;
  check(JSON.stringify(got) === JSON.stringify(want) && s < 15, `${state}: OR ${want.or}, AND ${want.and} (in ${s.toFixed(1)} s)`, got);
}
const table = await t.page.locator("#step-readout table.tt").innerText();
check((table.match(/\?/g) ?? []).length <= 2, "the truth table fills in as the inputs are tried", table.replace(/\s+/g, " "));
await t.done();
