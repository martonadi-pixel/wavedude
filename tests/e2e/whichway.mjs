// The double slit's puzzle: single particles (dots drawn by Born's rule) make the stripes; a which-way detector that
// kicks the lower slit's phase by up to a whole turn removes them, by up to half a turn leaves |sinc| ≈ 0.64.
import { start, check } from "./lib.mjs";

const t = await start();
const contrast = async () => {
  const text = await t.readout();
  const m = text.match(/contrast ([\d.]+)/);
  return { c: m ? parseFloat(m[1]) : NaN, dots: Number((text.match(/screen: ([\d,]+)/)?.[1] ?? "0").replace(/,/g, "")), text: text.slice(0, 160) };
};
/** Waits until the screen has this many dots (running fast), then reads the stripes' contrast. */
const collect = async n => {
  // the first step runs ahead to a step and stops there: run on, fast
  await t.ev(() => { const s = window.waveDude; s.stepsPerFrame = 16; s.play(); });
  await t.page.waitForFunction(n => { const m = (document.querySelector("#step-readout")?.textContent ?? "").match(/screen: ([\d,]+)/); return m && Number(m[1].replace(/,/g, "")) >= n; }, n, { timeout: 180000 });
  await t.page.waitForTimeout(400);
  return contrast();
};

await t.goto("#/experiment/double-slit", 600);
await t.play();
await t.step(5);
const plain = await collect(6000);
check(plain.c > 0.6, "one particle at a time: the dots make clear stripes", plain);
await t.step(6);
const watched = await collect(12000);
check(watched.c < 0.2, "with the which-way detector: no stripes", watched);
await t.step(7);
await t.page.locator(".step-actions button", { hasText: "Gentle" }).click();
await t.page.waitForTimeout(300);
const gentle = await collect(12000);
check(gentle.c > 0.45 && gentle.c < 0.8, "a gentle look (½ turn): the stripes fade to about |sinc(π/2)| = 0.64", gentle);
await t.done();
