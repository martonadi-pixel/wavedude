// The famous experiments measure what history says: Arago's bright centre line, Michelson's fringe every λ/2, the
// Bragg peak near 30°, the strongest soap film at a quarter wavelength, and Compton's unchanged visible light.
import { start, check, near, num } from "./lib.mjs";

const t = await start();
const next = async () => { await t.page.locator(".nav .primary").click(); await t.page.waitForTimeout(300); };
/** Sets a slider and waits for the fresh run it starts to finish. */
const setRun = async (i, v) => { await t.setParam(i, v); await t.page.waitForTimeout(400); await t.idle(); await t.page.waitForTimeout(400); };
const detector = () => t.ev(() => { const p = window.waveDude.profiles[0]; let s = 0; for (const v of p) s += v; return s / p.length; });

// Arago: the centre line is brighter than the dark band beside it
await t.goto("#/experiment/arago-spot", 500); await t.play(); await next();
await t.page.waitForFunction(() => window.waveDude.time >= 4600, null, { timeout: 120000 }); await t.page.waitForTimeout(600);
const arago = await t.readout();
check(num(arago, "The centre gets") >= 1.5, "Arago: the centre gets more light than the dark band beside it", arago.slice(0, 160));

// Michelson: dark readings λ/2 = 7.5 cells of mirror travel apart
await t.goto("#/experiment/michelson", 500); await t.play(); await next();
const mich = [];
for (let d = 0; d <= 16; d++) { await setRun(0, d); mich.push(await detector()); }
const mx = Math.max(...mich), minima = mich.map((v, i) => i).filter(i => i > 0 && i < mich.length - 1 && mich[i] < mich[i - 1] && mich[i] <= mich[i + 1]);
check(minima.length >= 2 && near(minima[1] - minima[0], 7.5, 1.5) && Math.min(...mich) < 0.2 * mx, "Michelson: dark every λ/2 of mirror travel", { percent: mich.map(v => Math.round(100 * v / mx)).join(" "), minima });
check((await t.answer(7.5)).ok, "Michelson: 7.5 cells is accepted");

// Bragg: the reflection peaks near 30°
await t.goto("#/experiment/bragg", 500); await t.play(); await next();
const br = [];
for (let th = 20; th <= 42; th += 2) { await setRun(0, th); br.push([th, await detector()]); }
const peak = br.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
check(peak >= 28 && peak <= 32, "Bragg: the peak is near 30°", { peak, scan: br.map(([a, v]) => `${a}:${Math.round(100 * v / Math.max(...br.map(b => b[1])))}`).join(" ") });
check((await t.answer(peak)).ok, "Bragg: the measured peak is accepted");

// thin film: the thinnest strongest reflection is near a quarter wavelength in the film (4.2 cells; about a cell more on the grid)
await t.goto("#/experiment/thin-film", 500); await t.play(); await next();
const film = [];
for (let th = 1; th <= 10; th++) { await setRun(0, th); film.push([th, num(await t.readout(), "Reflected:")]); }
const best = film.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
check(best >= 4 && best <= 6 && film.every(f => Number.isFinite(f[1])), "thin film: strongest at 4–6 cells", film.map(f => f.join(":")).join(" "));
check((await t.answer(4)).ok, "thin film: 4 cells is accepted");

// Compton: visible light keeps its wavelength at every probe; the calculator gives 2.43 pm at 90°
await t.goto("#/experiment/compton", 500); await t.play(); await t.idle();
await t.page.waitForTimeout(500);
const ratios = await t.page.locator("#step-readout table tr td:nth-child(3)").allInnerTexts();
check(ratios.length === 3 && ratios.every(r => near(+r, 1, 0.01)), "Compton: visible light comes back unchanged", ratios);
await next(); await next();
check(/Δλ = 2\.43 pm/.test(await t.readout()), "Compton: the calculator gives Δλ = 2.43 pm at 90°");
await next();
check((await t.answer(2.43)).ok, "Compton: 2.43 pm is accepted");
await t.done();
