// Measuring with the mouse (replaces the old interact test): a ruler dragged across 5 wavelengths passes the
// wavelength check, the wheel zooms, and sources, glass and probes are placed on the picture with the rail's tools.
import { start, check, near } from "./lib.mjs";

const t = await start();
const { page, ev } = t;
/** Screen position of a scene cell. */
const at = (x, y) => ev(([x, y]) => { const v = window.waveDude.view, r = v.overlayCanvas.getBoundingClientRect(), p = v.toScreen(x, y); return [r.left + p.x, r.top + p.y]; }, [x, y]);

await t.goto("#/experiment/wavelength", 400);
await ev(() => { const s = window.waveDude; s.running = false; s.engine.step(1100); });
await page.locator(".nav .primary").click(); await page.waitForTimeout(300);
check(await ev(() => window.waveDude.view.tool) === "ruler", "the measuring step picks the ruler");
// the crests along a row, from the simulation itself
const row = await ev(() => { const s = window.waveDude, W = s.scene.width, st = s.engine.readState(), y = 280; return Array.from({ length: 550 }, (_, i) => st[(y * W + 150 + i) * 4]); });
const crests = [];
for (let i = 1; i < row.length - 1; i++) if (row[i] > row[i - 1] && row[i] >= row[i + 1] && row[i] > 0) crests.push(150 + i);
const a = await at(crests[0] + 0.5, 280), b = await at(crests[5] + 0.5, 280);
await page.mouse.move(a[0], a[1]); await page.mouse.down(); await page.mouse.move(b[0], b[1], { steps: 8 }); await page.mouse.up();
const ruler = await ev(() => { const r = window.waveDude.view.measure.ruler; return r && Math.hypot(r.b.x - r.a.x, r.b.y - r.a.y); });
check(near(ruler, crests[5] - crests[0], 2), "the ruler spans the 5 waves", { ruler, crests: crests.slice(0, 6) });
const fb = await t.answer(5);
check(fb.ok, "5 waves: the wavelength check passes", fb.text);

const before = await ev(() => window.waveDude.view.scale);
await page.mouse.move(800, 400); await page.mouse.wheel(0, -600); await page.waitForTimeout(200);
const after = await ev(() => window.waveDude.view.scale);
check(after < before * 0.8, "the mouse wheel zooms in", { before, after });

// the sandbox: a source, a glass stroke and a probe, placed with the mouse
await t.goto("#/sandbox", 800);
await t.startFrom("empty");
await page.locator(".rail-btn", { hasText: "Sources" }).click();
let p = await at(300, 280); await page.mouse.click(p[0], p[1]);
await ev(() => { window.waveDude.view.tool = "glass"; window.waveDude.paintShape = "free"; });
p = await at(600, 200); const q = await at(600, 400);
await page.mouse.move(p[0], p[1]); await page.mouse.down(); await page.mouse.move(q[0], q[1], { steps: 10 }); await page.mouse.up();
await page.locator(".rail-btn", { hasText: "Probes" }).click();
p = await at(800, 280); await page.mouse.click(p[0], p[1]);
await t.play(); await page.waitForTimeout(2000);
const st = await ev(() => { const s = window.waveDude; return { sources: s.sources.length, probes: s.probes.length, glass: Array.from(s.scene.n).filter(n => n > 1.4).length, record: s.history[0]?.length ?? 0 }; });
check(st.sources === 1 && st.probes === 1 && st.glass > 1000 && st.record > 20, "a source, a glass stroke and a recording probe", st);
check(await page.locator(".obj-list .row").count() === 2, "both are in the objects list");
await t.done();
