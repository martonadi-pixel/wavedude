// A new scene's brightness is chosen before its first frame (no jump once it runs), again after Reset, and loading a
// big scene stays quick.
import { start, check } from "./lib.mjs";

const t = await start();
const b = () => t.ev(() => { const s = window.waveDude; return { time: s.time, field: +s.brightness.field.toFixed(3), intensity: +s.brightness.intensity.toFixed(3) }; });
await t.goto("#/sandbox", 300);
const first = await b();
check(first.field > 0 && first.intensity > 0, "brightness set before the first frame", first);
await t.play();
await t.page.waitForFunction(() => window.waveDude.time > 700, null, { timeout: 60000 });
const later = await b();
check(later.field === first.field && later.intensity === first.intensity, "unchanged after 700 steps (no jump)", later);
await t.page.locator("button", { hasText: "⟲ Reset" }).click();
await t.page.waitForFunction(() => window.waveDude.time > 600, null, { timeout: 60000 });
const reset = await b();
check(reset.field === first.field, "the same after Reset", reset);
await t.page.locator(".tab", { hasText: "Scene" }).click();
const size = t.page.locator("select").filter({ has: t.page.locator('option[value="1920x1080"]') }).first();
const t0 = Date.now();
await size.selectOption("1920x1080");
await t.ev(() => window.waveDude.engine.readCell(0, 0));
const ms = Date.now() - t0;
const big = await t.ev(() => [window.waveDude.scene.width, window.waveDude.scene.height]);
check(big[0] === 1920 && big[1] === 1080 && ms < 8000, "a 1920×1080 scene loads and calibrates quickly", `${ms} ms`);
await t.done();
