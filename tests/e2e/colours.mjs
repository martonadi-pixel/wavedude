// Colours from white light: a soap film reflects each colour as thin-film theory says (and looks the colour of what
// it reflects), a prism sends red above violet, and Newton's second prism makes the light white again.
import { start, check } from "./lib.mjs";

const t = await start();
const NM = [410, 450, 490, 530, 570, 610, 650, 690];

// ---- the soap film, 200 nm: R per colour against the formula (35°, the field along the film, water n 1.33)
await t.goto("#/experiment/thin-film", 600);
await t.step(4);
await t.play();
await t.setParam(0, 8);
await t.page.waitForTimeout(500);
await t.page.waitForFunction(() => /Reflected by/.test(document.querySelector("#step-readout")?.textContent ?? ""), null, { timeout: 120000 });
const film = await t.ev(() => ({
  bars: [...document.querySelectorAll("#step-readout svg text")].map(e => e.textContent).filter(s => s.endsWith("%")).map(parseFloat),
  colour: document.querySelector("#step-readout .film-dot")?.style.getPropertyValue("--c") ?? "",
  white: window.waveDude.whiteLight,
}));
const theory = NM.map(nm => {
  const um = nm / 1000, n = 1 + 0.33 * (1 + (0.0042 / 0.5168) * (1 / (um * um) - 1 / (0.589 * 0.589)));
  const th = (35 * Math.PI) / 180, ct = Math.sqrt(1 - Math.sin(th) ** 2 / (n * n)), r = (Math.cos(th) - n * ct) / (Math.cos(th) + n * ct), r2 = r * r;
  const d = 2 * ((2 * Math.PI) / (nm / 25)) * n * 8 * ct;
  return (100 * 2 * r2 * (1 - Math.cos(d))) / (1 + r2 * r2 - 2 * r2 * Math.cos(d));
});
check(film.white && film.bars.length === 8, "soap film: white light, eight colours measured", film);
check(film.bars.every((v, i) => Math.abs(v - theory[i]) < 2.5), "soap film 200 nm: each colour's reflection within 2.5% of thin-film theory",
  { measured: film.bars.join(" "), theory: theory.map(v => v.toFixed(1)).join(" ") });
const [r, g, b] = (film.colour.match(/\d+/g) ?? []).map(Number);
check(r > g && g > b, "soap film 200 nm looks orange (red > green > blue)", film.colour);

// ---- the prism: red leaves above violet; with the second prism the light is white again
const fanAt = () => t.ev(() => {
  const s = window.waveDude, c = s.engine.readColour(), W = s.scene.width, H = s.scene.height, X = 880;
  let yr = 0, yb = 0, br = 0, bb = 0;
  for (let y = 0; y < H; y++) { const i = (y * W + X) * 4; if (c[i] > br) { br = c[i]; yr = y; } if (c[i + 2] > bb) { bb = c[i + 2]; yb = y; } }
  return { red: yr, blue: yb };
});
await t.goto("#/experiment/prism", 600);
await t.step(1);
await t.play();
await t.page.waitForFunction(() => window.waveDude.time >= 2400, null, { timeout: 120000 });
const fan = await fanAt();
check(fan.blue - fan.red > 30, "prism (×10): red leaves above violet, the fan has spread", fan);
await t.step(3);
await t.page.locator(".actions button, .step-actions button").first().click();
await t.page.waitForTimeout(300);
await t.play();
await t.page.waitForFunction(() => window.waveDude.time >= 2400, null, { timeout: 120000 });
const out = await t.ev(() => {
  // the brightest spot on a line across the beam that leaves the second prism: its colour
  const s = window.waveDude, c = s.engine.readColour(), W = s.scene.width, H = s.scene.height, X = 880;
  let best = 0, at = 0;
  for (let y = 0; y < H; y++) { const i = (y * W + X) * 4, v = c[i] + c[i + 1] + c[i + 2]; if (v > best) { best = v; at = y; } }
  const i = (at * W + X) * 4;
  return { y: at, rgb: [c[i], c[i + 1], c[i + 2]].map(v => +(v / Math.max(c[i], c[i + 1], c[i + 2])).toFixed(2)), prisms: s.optics.length };
});
check(out.prisms === 2 && Math.min(...out.rgb) > 0.6, "two prisms: the light comes out white again (red, green and blue within 40%)", out);
await t.done();
