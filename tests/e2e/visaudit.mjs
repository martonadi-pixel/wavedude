// Exposure of every step of every experiment at the default 30%: the waves must be visible (the brightest 1% of the
// picture at least 0.3 of full colour) without the picture saturating (the brightest 10% below 1.2).
import { start, check } from "./lib.mjs";

const t = await start();
await t.goto("#/experiments", 800);
const ids = await t.ev(() => [...document.querySelectorAll(".exp-card")].map(c => c.querySelector("b").textContent));
const measure = () => t.ev(() => {
  const s = window.waveDude, W = s.scene.width, H = s.scene.height, q = s.viewMode;
  const g = s.brightness[q] * s.brightnessPct / 100, sc = s.engine.settings.intensityScale, e = s.scene.edgeOn ? s.scene.edge : 0;
  // white light: the colour picture (linear light × brightness²), as an amplitude like the one-wave views
  const white = s.whiteLight, st = white ? s.engine.readColour() : s.engine.readState();
  const v = [];
  for (let y = e; y < H - e; y += 2) for (let x = e; x < W - e; x += 2) {
    const i = (y * W + x) * 4;
    if (white) { v.push(Math.sqrt(Math.max(0, st[i], st[i + 1], st[i + 2])) * g); continue; }
    v.push(q === "field" ? Math.abs(st[i]) * g : Math.sqrt(Math.max(0, (st[i + 2] + st[i + 3]) * 0.5 * sc)) * g);
  }
  v.sort((a, b) => a - b);
  const pick = f => v[Math.floor(v.length * f)];
  return { view: q, time: s.time, p90: +pick(0.9).toFixed(2), p99: +pick(0.99).toFixed(2) };
});
/** Steps that are dark on purpose when measured: a burst or pulse that has passed, or a circuit with every input off. */
const DARK = {
  "thin-film": { steps: [1, 2, 3], why: "the burst has passed" },
  "absorbing-edge": { steps: [1, 2, 3], why: "the pulse has gone into the edge" },
  "grid-dispersion": { steps: [4, 5], why: "the pulse has passed" },
  "wave-logic": { steps: [1, 2, 3, 5, 6], why: "every input is off (step 4's NOT shines)" },
  "wave-memory": { steps: [1, 2], why: "every input is off" },
};
/** Steps that are bright on purpose: what they are about is faint next to the light that makes it. */
const BRIGHT = {
  "thin-film": { steps: [4, 5, 6], why: "the white beam is over-exposed so the film's faint reflection shows its colour" },
};
const EXPS = await t.ev(() => [...document.querySelectorAll(".exp-card")].length);
check(EXPS === 19, "19 experiments on the list", ids.length);
const hrefs = ["splash", "echoes", "wavelength", "refraction", "prism", "single-slit", "double-slit", "total-internal-reflection", "doppler", "arago-spot", "thin-film", "wave-logic",
  "phased-array", "michelson", "bragg", "compton", "wave-memory", "grid-dispersion", "absorbing-edge"];
for (const id of hrefs) {
  await t.goto("#/experiment/" + id, 500);
  const n = await t.page.locator(".dots .dot").count();
  const bad = [], all = [];
  for (let k = 0; k < n; k++) {
    await t.step(k);
    await t.play();
    await t.page.waitForTimeout(300);
    await t.page.waitForFunction(() => !window.waveDude.preparing, null, { timeout: 60000 }).catch(() => {});
    // at least 700 steps in, so the waves have spread
    await t.ev(() => { const s = window.waveDude; if (s.time < 700) { s.running = false; s.engine.step(700 - s.time); } });
    const m = await measure();
    const dark = DARK[id]?.steps.includes(k + 1), bright = BRIGHT[id]?.steps.includes(k + 1);
    all.push(`${k + 1}:${m.view[0]} ${m.p90}/${m.p99}${dark ? " (dark: ok)" : bright ? " (bright: ok)" : ""}`);
    if ((m.p90 > 1.2 && !bright) || (m.p99 < 0.3 && !dark)) bad.push({ step: k + 1, ...m });
  }
  const notes = [DARK[id] && `dark steps: ${DARK[id].why}`, BRIGHT[id] && `bright steps: ${BRIGHT[id].why}`].filter(Boolean).join("; ");
  check(bad.length === 0, `${id}: every step well exposed${notes ? ` (${notes})` : ""}`, bad.length ? bad : all.join(" "));
}
await t.done();
