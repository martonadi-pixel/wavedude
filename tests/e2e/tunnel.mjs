// Frustrated total internal reflection: beyond the critical angle light still crosses a thin air gap into a second
// block, falling off steeply with the gap, as the wave formula says.
import { start, check } from "./lib.mjs";

const t = await start();
await t.goto("#/experiment/total-internal-reflection", 600);
await t.step(4);
await t.play();
await t.setParam(0, 50);
const across = async gap => {
  await t.setParam(1, gap);
  await t.page.waitForTimeout(500);
  await t.page.waitForFunction(() => /Across a/.test(document.querySelector("#step-readout")?.textContent ?? ""), null, { timeout: 120000 });
  const text = await t.readout();
  return { measured: parseFloat(text.match(/gap: ([\d.]+)%/)?.[1] ?? "NaN"), formula: parseFloat(text.match(/gap: ([\d.]+)%/)?.[1] ? text.match(/formula for this angle and gap: ([\d.]+)%/)?.[1] ?? "NaN" : "NaN"), text: text.slice(0, 140) };
};
const g4 = await across(4), g8 = await across(8);
check(Math.abs(g4.measured - g4.formula) < 8, "4 cells of air: about half the light gets across, as the formula says", g4);
check(Math.abs(g8.measured - g8.formula) < 5 && g8.measured < g4.measured / 2.5, "8 cells: much less (it falls off steeply)", g8);
await t.done();
