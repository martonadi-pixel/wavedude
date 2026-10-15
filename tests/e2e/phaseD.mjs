// Experiments are built of objects: the double slit is one slit wall with two 12-row openings; moving it shows the
// "original layout" notice, which puts it back. The other scenes have their walls, glass and mirrors as objects.
import { start, check } from "./lib.mjs";

const t = await start();
const { ev } = t;
await t.goto("#/experiment/double-slit", 800);
const slit = await ev(() => {
  const s = window.waveDude, W = s.scene.width, H = s.scene.height, sh = s.shapes[0];
  let x0 = W, x1 = -1;
  for (let x = 0; x < W; x++) if (s.scene.dBase[(H >> 1) * W + x] === 0 || s.scene.dBase[10 * W + x] === 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  const open = []; for (let y = 0; y < H; y++) if (s.scene.dBase[y * W + x0] !== 0) open.push(y);
  const runs = []; for (const y of open) { const r = runs[runs.length - 1]; if (r && r[1] === y - 1) r[1] = y; else runs.push([y, y]); }
  return { shapes: s.shapes.length, kind: sh.kind, x0, x1, openings: runs.map(r => [r[0], r[1] - r[0] + 1]) };
});
check(slit.shapes === 1 && slit.kind === "slits" && slit.x0 === 360 && slit.x1 === 367, "one slit wall, 8 cells thick at x 360", slit);
check(slit.openings.length === 2 && slit.openings.every(o => o[1] === 12) && slit.openings[1][0] - slit.openings[0][0] === 60, "two 12-row openings 60 apart", slit.openings);

const start0 = await ev(() => { const s = window.waveDude, sh = s.shapes[0]; s.view.tool = "pan"; return { x: sh.x, y: sh.y + 100 }; });
await ev(st => { const s = window.waveDude; s.selector.grab("down", st, st); s.selector.grab("move", { x: st.x + 80, y: st.y }, st); s.selector.grab("up", { x: st.x + 80, y: st.y }, st); }, start0);
await t.page.waitForTimeout(200);
const moved = await ev(() => Math.round(window.waveDude.shapes[0].x));
check(moved === Math.round(start0.x + 80) && await t.page.locator(".layout-note").isVisible(), "dragging the wall shows the notice", moved);
await t.page.locator(".layout-note button").click(); await t.page.waitForTimeout(500);
const back = await ev(() => Math.round(window.waveDude.shapes[0].x));
check(back === Math.round(start0.x) && !(await t.page.locator(".layout-note").isVisible()), "“Original layout” puts it back", back);

const expect = {
  "single-slit": ["Slit"], "refraction": ["Glass"], "total-internal-reflection": ["Glass"], "arago-spot": ["Obstacle"],
  "michelson": ["Beam splitter", "Mirror 1", "Mirror 2"], "thin-film": ["Soap film"], "echoes": ["Wall"],
};
for (const [id, names] of Object.entries(expect)) {
  await t.goto("#/experiment/" + id, 600);
  const got = await ev(() => window.waveDude.shapes.map(q => q.name));
  check(JSON.stringify(got) === JSON.stringify(names), `${id}: its parts are objects`, got);
}
await t.step(2);
check(await ev(() => window.waveDude.optics.map(o => o.name).join()) === "Dish", "echoes: the dish is an optical element");
await t.done();
