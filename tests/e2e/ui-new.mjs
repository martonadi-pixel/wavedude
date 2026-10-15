// The sandbox's interface: the tool rail and the settings bar, keys, selecting on the picture and in the list, delete
// and undo, nudge, duplicate, the tabs, the project menu, the shortcuts, the layout at 1366×768 and at phone width.
import { start, check } from "./lib.mjs";

const t = await start({ width: 1366, height: 768 });
const { page, ev } = t;
const txt = async sel => (await page.locator(sel).first().innerText().catch(() => "")).replace(/\s+/g, " ");
await t.goto("#/sandbox", 1000);

const rail = await txt("#rail");
check(["Select", "Measure", "Sources", "Draw", "Optics", "Probes", "Logic"].every(w => rail.includes(w)), "the rail has every group", rail);
const header = await txt("#header-tools");
check(header.includes("Save") && header.includes("Open"), "the project is in the header", header);
check(/Objects\s*\d/.test(await txt(".tabs")) && (await txt(".tabs")).includes("Scene") && (await txt(".tabs")).includes("Settings"), "three tabs, Objects with a count", await txt(".tabs"));
const layout = await ev(() => { const v = document.getElementById("view").getBoundingClientRect(); return { w: Math.round(v.width), h: Math.round(v.height), pct: Math.round(100 * v.height / innerHeight) }; });
check(layout.pct >= 70, "at 1366×768 the picture takes most of the height", layout);

await page.locator(".rail-btn", { hasText: "Draw" }).click(); await page.waitForTimeout(200);
check(await ev(() => window.waveDude.view.tool) === "barrier" && (await txt("#tool-options")).includes("Thickness"), "Draw: the Wall tool and its settings", await txt("#tool-options"));
await page.keyboard.press("s"); await page.waitForTimeout(100); const t1 = await ev(() => window.waveDude.view.tool);
await page.keyboard.press("s"); await page.waitForTimeout(100); const t2 = await ev(() => window.waveDude.view.tool);
check(t1 !== t2 && /source/.test(t1 + t2) && (await txt("#tool-options")).includes("Frequency"), "S, S: the next source tool each time", [t1, t2]);

// the lens: select it by clicking it on the picture
await page.keyboard.press("v");
const pos = await ev(() => { const s = window.waveDude, sh = s.shapes[0]; return s.view.toScreen(sh.x, sh.y); });
const box = await page.locator("#view canvas").last().boundingBox();
await page.mouse.click(box.x + pos.x, box.y + pos.y); await page.waitForTimeout(250);
check(await ev(() => window.waveDude.selection?.kind) === "shape" && (await txt(".inspector .insp-head")).includes("Lens"), "clicking the lens selects it", await txt(".inspector .insp-head"));
await page.keyboard.press("Delete"); await page.waitForTimeout(200);
check(await ev(() => window.waveDude.shapes.length) === 0, "Delete removes it");
await page.keyboard.press("Control+z"); await page.waitForTimeout(250);
check(await ev(() => window.waveDude.shapes.length) === 1, "Ctrl+Z brings it back");

await page.locator(".obj-list .row", { hasText: "Lens" }).click(); await page.waitForTimeout(150);
const x0 = await ev(() => window.waveDude.shapes[0].x);
await page.keyboard.press("ArrowRight"); await page.keyboard.press("Shift+ArrowRight"); await page.waitForTimeout(150);
const x1 = await ev(() => window.waveDude.shapes[0].x);
check(Math.abs(x1 - x0 - 11) < 1e-9, "selected from the list, the arrows nudge it (1 + 10 cells)", [x0, x1]);
await page.keyboard.press("Control+d"); await page.waitForTimeout(150);
check(await ev(() => window.waveDude.shapes.length) === 2, "Ctrl+D duplicates it");
await page.keyboard.press("Escape"); await page.waitForTimeout(100);
check(await ev(() => window.waveDude.selection) === null, "Esc deselects");

await page.locator(".tab", { hasText: "Scene" }).click(); await page.waitForTimeout(150);
check((await txt(".tab-body")).includes("Start from"), "the Scene tab");
await page.locator(".tab", { hasText: "Settings" }).click(); await page.waitForTimeout(150);
check((await txt(".tab-body")).includes("Display"), "the Settings tab");
await page.locator("#header-tools button", { hasText: "Open" }).click(); await page.waitForTimeout(100);
check((await txt(".menu")).includes("Open a project"), "the Open menu", await txt(".menu"));
await page.keyboard.press("Escape");
await page.keyboard.press("?"); await page.waitForTimeout(100);
check((await txt(".shortcuts")).includes("Keyboard shortcuts"), "? shows the shortcuts");
await page.keyboard.press("Escape");

await t.goto("#/experiment/splash", 800);
const expRail = await txt("#rail");
check(expRail.includes("Select") && expRail.includes("Probes") && !expRail.includes("Draw"), "an experiment offers only its tools and probes", expRail);
check((await txt("#header-tools")) === "", "no project in the header on an experiment");

await page.setViewportSize({ width: 390, height: 844 });
await t.goto("#/sandbox", 800);
const phone = await ev(() => ({ scroll: document.documentElement.scrollWidth, view: Math.round(document.getElementById("view").getBoundingClientRect().height) }));
check(phone.scroll <= 390, "390 px wide: no sideways scrolling", phone);
await t.done();
