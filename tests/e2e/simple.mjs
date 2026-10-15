// Simple mode: the Sandbox's rail and panels shrink to the basics, and come back.
import { chromium } from "playwright-core";
const base = (process.env.E2E_BASE ?? process.argv[2] ?? "http://localhost:4173/").replace(/\/?$/, "/");
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
let fails = 0; const ok = (c, msg) => { console.log((c ? "ok   " : "FAIL ") + msg); if (!c) fails++; };
const state = () => page.evaluate(() => ({
  rail: [...document.querySelectorAll(".rail-btn .rl")].map(e => e.textContent),
  tabs: [...document.querySelectorAll(".tab")].filter(e => e.offsetParent).map(e => e.dataset.tab),
  hud: !!document.querySelector("#hud")?.offsetParent,
  bright: [...document.querySelectorAll("#toolbar input[aria-label=Brightness]")].some(e => e.offsetParent),
  simple: document.documentElement.classList.contains("simple"),
}));
await page.goto(base + "#/sandbox"); await page.waitForTimeout(800);
await page.evaluate(() => { try { localStorage.removeItem("waveDude.simple"); } catch { /* no storage */ } });
const full = await state();
ok(!full.simple && full.rail.includes("Logic") && full.tabs.includes("settings") && full.hud && full.bright, `full: rail ${full.rail.join(",")} · tabs ${full.tabs}`);
// open the settings tab, then switch Simple on: the tab goes, the rail shrinks
await page.click('.tab[data-tab="settings"]');
await page.keyboard.press("l"); // optics tool (not in simple)
await page.click(".simple-toggle");
await page.waitForTimeout(150);
const s1 = await state();
ok(s1.simple && !s1.rail.includes("Logic") && !s1.rail.includes("Optics") && !s1.rail.includes("Measure"), `simple rail: ${s1.rail.join(",")}`);
ok(!s1.tabs.includes("settings") && !s1.hud && !s1.bright, `simple: tabs ${s1.tabs} · hud ${s1.hud} · brightness ${s1.bright}`);
ok(await page.evaluate(() => window.waveDude.view.tool) === "pan", "a tool Simple mode leaves out falls back to Select");
ok(await page.evaluate(() => [...document.querySelectorAll(".tab")].find(e => e.classList.contains("on"))?.dataset.tab) === "objects", "Settings tab was open → Objects");
// keys for left-out tools do nothing
await page.keyboard.press("g");
ok(await page.evaluate(() => window.waveDude.view.tool) === "pan", "G (logic) ignored in Simple mode");
// still remembered after reload
await page.reload(); await page.waitForTimeout(800);
const s2 = await state();
ok(s2.simple && !s2.rail.includes("Logic"), "Simple mode is remembered");
// experiments keep their own tools
await page.goto(base + "#/experiment/double-slit"); await page.waitForTimeout(800);
const ex = await state();
ok(ex.rail.includes("Probes"), `experiment rail in Simple mode: ${ex.rail.join(",")}`);
await page.goto(base + "#/sandbox"); await page.waitForTimeout(600);
await page.click(".simple-toggle"); await page.waitForTimeout(150);
const s3 = await state();
ok(!s3.simple && s3.rail.includes("Logic") && s3.tabs.includes("settings"), "off again: everything back");
console.log("errors:", JSON.stringify(errors));
await browser.close();
process.exit(fails || errors.length ? 1 : 0);
