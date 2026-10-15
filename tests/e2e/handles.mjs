// Turn and resize handles, the right-click / long-press menu, the hover halo and the brush circle.
import { chromium } from "playwright-core";
const base = (process.env.E2E_BASE ?? process.argv[2] ?? "http://localhost:4173/").replace(/\/?$/, "/");
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
let fails = 0; const ok = (c, msg) => { console.log((c ? "ok   " : "FAIL ") + msg); if (!c) fails++; };
await page.goto(base + "#/sandbox"); await page.waitForTimeout(900);
// clear the scene: select all objects and delete? simpler: count before
const scr = (x, y) => page.evaluate(([x, y]) => { const v = window.waveDude.view, r = v.overlayCanvas.getBoundingClientRect(), p = v.toScreen(x, y); return { x: r.left + p.x, y: r.top + p.y }; }, [x, y]);
const drag = async (a, b) => { await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 4 }); await page.mouse.move(b.x, b.y, { steps: 4 }); await page.mouse.up(); };
// draw a wall box
await page.keyboard.press("b");
await page.click('#tool-options button:has-text("Box")');
const W = await page.evaluate(() => [window.waveDude.scene.width, window.waveDude.scene.height]);
const nShapes0 = await page.evaluate(() => window.waveDude.shapes.length);
await drag(await scr(W[0] * 0.3, W[1] * 0.3), await scr(W[0] * 0.45, W[1] * 0.45));
const sh = await page.evaluate(() => { const s = window.waveDude; return { n: s.shapes.length, sel: s.selection, last: s.shapes.at(-1) }; });
ok(sh.n === nShapes0 + 1 && sh.sel?.kind === "shape", `box drawn and selected (${JSON.stringify(sh.sel)})`);
// handles
const hs = await page.evaluate(() => window.waveDude.selector.handles().map(([k, p]) => [k, p]));
ok(["len", "wid", "rot"].every(k => hs.some(h => h[0] === k)), `box handles: ${hs.map(h => h[0]).join(",")}`);
await page.keyboard.press("v");
// turn by dragging the knob to the right of the centre (that is +90°)
const rot = hs.find(h => h[0] === "rot")[1], last = sh.last;
await drag(await scr(rot.x, rot.y), await scr(last.x + 80, last.y));
let s1 = await page.evaluate(() => window.waveDude.shapes.at(-1));
ok(Math.abs(s1.angleDeg - 90) < 0.5, `turn knob → angle ${s1.angleDeg} (want 90)`);
// resize: the len handle (now pointing down) dragged further out
const hs2 = await page.evaluate(() => window.waveDude.selector.handles());
const len = hs2.find(h => h[0] === "len")[1];
await drag(await scr(len.x, len.y), await scr(len.x, len.y + 30));
let s2 = await page.evaluate(() => window.waveDude.shapes.at(-1));
ok(Math.abs(s2.length - (s1.length + 60)) <= 2, `len handle: ${s1.length} → ${s2.length} (want +60)`);
// undo returns the length
await page.keyboard.press("Control+z");
let s3 = await page.evaluate(() => window.waveDude.shapes.at(-1));
ok(Math.abs(s3.length - s1.length) < 0.5, `undo resize → ${s3.length}`);
// keyboard turn
await page.keyboard.press(".");
let s4 = await page.evaluate(() => window.waveDude.shapes.at(-1));
ok(Math.abs(s4.angleDeg - 105) < 0.5, `"." turns 15° → ${s4.angleDeg}`);
// hover halo over the shape when nothing is selected
await page.keyboard.press("Escape");

const edge = await page.evaluate(() => { const s = window.waveDude.shapes.at(-1), a = s.angleDeg * Math.PI / 180; return { x: s.x + Math.cos(a) * s.length / 2, y: s.y + Math.sin(a) * s.length / 2 }; });
await page.mouse.move((await scr(edge.x, edge.y)).x, (await scr(edge.x, edge.y)).y);
await page.waitForTimeout(150);
ok(await page.evaluate(() => window.waveDude.view.overlay.paths.some(p => p.color === "#ffffff70")), "hover halo drawn");
// right-click on the shape: menu, turn 90° right
await page.mouse.click((await scr(edge.x, edge.y)).x, (await scr(edge.x, edge.y)).y, { button: "right" });
await page.waitForTimeout(100);
const items = await page.$$eval(".menu button", bs => bs.map(b => b.textContent));
ok(items.some(t => t.includes("Turn 90° right")) && items.some(t => t.includes("Delete")), `menu: ${items.join(" | ")}`);
await page.click('.menu button:has-text("Turn 90° right")');
let s5 = await page.evaluate(() => window.waveDude.shapes.at(-1));
ok(Math.abs(((s5.angleDeg - s4.angleDeg + 540) % 360) - 180 - 90) < 0.5, `menu turn → ${s5.angleDeg}`);
// right-click on an empty spot: add an element there, then its handles
const empty = await scr(W[0] * 0.75, W[1] * 0.6);
await page.mouse.click(empty.x, empty.y, { button: "right" });
await page.waitForTimeout(100);
const items2 = await page.$$eval(".menu button", bs => bs.map(b => b.textContent));
ok(items2.some(t => t.includes("Add a source")), `empty-spot menu: ${items2.join(" | ")}`);
const nOpt = await page.evaluate(() => window.waveDude.optics.length);
if (items2.some(t => t.includes("Add an element"))) {
  await page.click('.menu button:has-text("Add an element")');
  const o = await page.evaluate(() => ({ n: window.waveDude.optics.length, sel: window.waveDude.selection, o: window.waveDude.optics.at(-1), hs: window.waveDude.selector.handles() }));
  ok(o.n === nOpt + 1 && o.sel?.kind === "optic", "element added from the menu and selected");
  ok(o.hs.some(h => h[0] === "size") && o.hs.some(h => h[0] === "rot"), `optic handles: ${o.hs.map(h => h[0])}`);
  const sz = o.hs.find(h => h[0] === "size")[1];
  await drag(await scr(sz.x, sz.y), await scr(sz.x, sz.y + 20));
  const o2 = await page.evaluate(() => window.waveDude.optics.at(-1));
  ok(Math.abs(o2.size - (o.o.size + 40)) <= 2, `optic size ${o.o.size} → ${o2.size}`);
} else ok(false, "no 'Add an element' item");
// brush circle with the freehand wall
await page.keyboard.press("b");
await page.click('#tool-options button:has-text("Freehand")');
await page.mouse.move(empty.x - 40, empty.y - 40); await page.mouse.move(empty.x - 30, empty.y - 30);
await page.waitForTimeout(150);
const br = await page.evaluate(() => { const s = window.waveDude, p = s.view.overlay.paths.find(q => q.solid && q.closed && q.pts.length === 32); if (!p) return null; const cx = p.pts.reduce((a, q) => a + q.x, 0) / 32; return Math.hypot(p.pts[0].x - cx, p.pts[0].y - p.pts.reduce((a, q) => a + q.y, 0) / 32); });
ok(br !== null && Math.abs(br - await page.evaluate(() => window.waveDude.brush)) < 0.6, `brush circle radius ${br}`);
// long press with a finger on the shape opens the menu
await page.keyboard.press("v");
await page.evaluate(() => document.querySelector(".menu")?.remove());
const ep = await scr(edge.x, edge.y);
const lp = await page.evaluate(async ([x, y]) => {
  const cv = window.waveDude.view.overlayCanvas, o = { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: x, clientY: y, button: 0, buttons: 1, bubbles: true };
  cv.dispatchEvent(new PointerEvent("pointerdown", o));
  await new Promise(r => setTimeout(r, 750));
  const open = !!document.querySelector(".menu");
  cv.dispatchEvent(new PointerEvent("pointerup", { ...o, buttons: 0 }));
  return open;
}, [ep.x, ep.y]);
ok(lp, "long press opens the menu");
console.log("errors:", JSON.stringify(errors));
await browser.close();
process.exit(fails || errors.length ? 1 : 0);
