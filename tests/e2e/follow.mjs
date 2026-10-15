// A Sandbox "Fit window" scene follows the window (waves kept, content centred); a zoomed experiment keeps its zoom.
import { chromium } from "playwright-core";
const base = (process.env.E2E_BASE ?? process.argv[2] ?? "http://localhost:4173/").replace(/\/?$/, "/");
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
let fails = 0; const ok = (c, msg) => { console.log((c ? "ok   " : "FAIL ") + msg); if (!c) fails++; };
const st = () => page.evaluate(() => {
  const s = window.waveDude, v = s.view, W = s.scene.width, H = s.scene.height;
  const f = s.engine.readState(); let e = 0; for (let i = 0; i < f.length; i += 4) e += f[i] * f[i];
  const src = s.sources.filter(q => q.enabled).map(q => [q.x, q.y]);
  return { scene: [W, H], host: [Math.round(v.cssW), Math.round(v.cssH)], time: s.time, energy: e, src, centreOff: src.length ? [src[0][0] - W / 2, src[0][1] - H / 2] : null };
});
// from an experiment (graphs shown) to the sandbox: the scene must end up the size of the picture
await page.goto(base + "#/experiment/double-slit"); await page.waitForTimeout(700);
await page.goto(base + "#/sandbox"); await page.waitForTimeout(1200);
let a = await st();
ok(Math.abs(a.scene[0] - a.host[0]) <= 2 && Math.abs(a.scene[1] - a.host[1]) <= 2, `opened from an experiment: scene ${a.scene} · picture ${a.host}`);
await page.evaluate(() => { const s = window.waveDude; s.play(); s.stepsPerFrame = 4; });
await page.waitForTimeout(1500);
a = await st();
for (const [w, h] of [[1920, 1080], [1024, 700], [1600, 900]]) {
  await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(700);
  const b = await st();
  const inside = b.src.every(([x, y]) => x >= 0 && y >= 0 && x < b.scene[0] && y < b.scene[1]);
  ok(inside && b.scene[0] >= b.host[0] - 2 && b.scene[1] >= b.host[1] - 2 && (Math.abs(b.scene[0] - b.host[0]) <= 2 || Math.abs(b.scene[1] - b.host[1]) <= 2 || b.scene[0] > b.host[0]), `${w}x${h}: scene ${b.scene} · picture ${b.host} · sources inside: ${inside}`);
  ok(b.time >= a.time && b.energy > 0.2 * a.energy, `  waves kept: step ${a.time} → ${b.time}, energy ${a.energy.toFixed(1)} → ${b.energy.toFixed(1)}`);
  ok(b.centreOff && a.centreOff && Math.abs(b.centreOff[0] - a.centreOff[0]) <= 1.5 && Math.abs(b.centreOff[1] - a.centreOff[1]) <= 1.5, `  stays centred: source offset from centre ${a.centreOff} → ${b.centreOff}`);
  a = b;
}
// an experiment, zoomed in: the zoom is kept relative to the window
await page.setViewportSize({ width: 1366, height: 768 });
await page.goto(base + "#/experiment/double-slit"); await page.waitForTimeout(800);
const rel = () => page.evaluate(() => { const v = window.waveDude.view, s = window.waveDude.scene; const fit = Math.max(s.width / (v.cssW * 0.98), s.height / (v.cssH * 0.98)); return { zoom: +(fit / v.scale).toFixed(3), centre: [Math.round(v.offX + v.cssW / 2 * v.scale), Math.round(v.offY + v.cssH / 2 * v.scale)] }; });
await page.evaluate(() => window.waveDude.view.zoomBy(2, 300, 150));
const z0 = await rel();
await page.setViewportSize({ width: 1700, height: 950 }); await page.waitForTimeout(400);
const z1 = await rel();
ok(Math.abs(z1.zoom - z0.zoom) < 0.01 && Math.abs(z1.centre[0] - z0.centre[0]) <= 2 && Math.abs(z1.centre[1] - z0.centre[1]) <= 2, `experiment zoom kept: ${JSON.stringify(z0)} → ${JSON.stringify(z1)}`);
console.log("errors:", JSON.stringify(errors));
await browser.close();
process.exit(fails || errors.length ? 1 : 0);
