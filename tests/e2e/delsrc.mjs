// Deleting a source from the objects list takes its waves with it at once.
import { start, check } from "./lib.mjs";

const t = await start();
const field = () => t.ev(() => { const s = window.waveDude, st = s.engine.readState(); let m = 0; for (let i = 0; i < st.length; i += 4) m = Math.max(m, Math.abs(st[i])); return { time: s.time, sources: s.sources.length, max: m }; });
await t.goto("#/sandbox");
await t.page.locator("button.run").click();
await t.page.waitForFunction(() => window.waveDude.time > 600, null, { timeout: 60000 });
const before = await field();
check(before.sources >= 1 && before.max > 0.05, "the demo's source makes waves", before);
const n = before.sources;
await t.page.locator(".obj-list .row", { hasText: "Wave maker" }).locator(".icon.del").click();
await t.page.waitForTimeout(50);
const after = await field();
check(after.sources === n - 1, "the source is gone", after);
if (after.sources === 0) check(after.max < 1e-6, "its waves went with it", after);
await t.done();
