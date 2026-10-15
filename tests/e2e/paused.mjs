// Every page opens paused, with the Run button glowing, and starts on Run, on a step's button or on the space bar.
import { start, check } from "./lib.mjs";

const t = await start();
const state = () => t.ev(() => { const s = window.waveDude; return { time: s.time, running: s.running, held: s.held, waiting: document.querySelector("button.run").classList.contains("waiting") }; });
for (const hash of ["#/experiments", "#/experiment/splash", "#/experiment/arago-spot", "#/experiment/wave-logic", "#/sandbox"]) {
  await t.goto(hash, 1200);
  const s = await state();
  check(s.time === 0 && !s.running && s.held && s.waiting, `${hash} waits, paused, with Run glowing`, s);
}
await t.page.locator("button.run").click(); await t.page.waitForTimeout(800);
let s = await state();
check(s.running && s.time > 0 && !s.waiting, "the sandbox runs after Run", s);

await t.goto("#/experiment/wave-logic", 800);
await t.page.locator(".step-actions button", { hasText: "A =" }).first().click();
await t.page.waitForTimeout(800);
s = await state();
check(s.running && s.time > 0, "a step's button starts the run (wave-logic: A)", s);

await t.goto("#/experiment/splash", 500);
await t.page.keyboard.press("Space"); await t.page.waitForTimeout(800);
s = await state();
check(s.running && s.time > 0, "the space bar starts the run", s);
await t.done();
