// In an experiment the reader's own probes can be removed one at a time (the experiment's own probes stay), the
// others keep their label and colour, and the last one goes too; undo brings it back.
import { start, check } from "./lib.mjs";

const t = await start();
const { page, ev } = t;
const probes = () => ev(() => window.waveDude.probes.map(p => ({ label: p.label, color: p.color, mine: !!p.mine, x: p.x, y: p.y })));
await t.goto("#/experiment/echoes", 600);
const own = (await probes()).filter(p => !p.mine);
check(own.length === 1, "the experiment has its own probe (the ear)", own);
await ev(() => { const s = window.waveDude; s.view.tool = "pointProbe"; for (const [x, y] of [[400, 200], [500, 250], [600, 300]]) s.view.onTool("pointProbe", "down", { x, y }, { x, y }); });
await page.waitForTimeout(200);
const three = (await probes()).filter(p => p.mine);
check(three.length === 3 && await page.locator(".mine-probes").isVisible(), "three probes of the reader's own, listed under the steps", three.map(p => p.label));
check(await page.locator(".mine-probes .mine-probe").count() === 3 && await page.locator(".mine-probes button", { hasText: "Remove all" }).count() === 1, "each with its own ✕, and Remove all");

await page.locator(".mine-probes .mine-probe", { hasText: three[1].label }).locator("button").click(); await page.waitForTimeout(150);
const two = await probes();
check(two.filter(p => p.mine).map(p => p.label).join() === [three[0].label, three[2].label].join() && two.filter(p => !p.mine).length === 1, `✕ on ${three[1].label} removes only it`, two);
check(two.find(p => p.label === three[2].label)?.color === three[2].color, "the others keep their colour");
check(!(await page.locator(".layout-note").isVisible()), "removing your own probe is not a change to the experiment's layout");

await page.locator(".mine-probes .mine-probe", { hasText: three[0].label }).locator("button").click(); await page.waitForTimeout(150);
await page.locator(".mine-probes .mine-probe", { hasText: three[2].label }).locator("button").click(); await page.waitForTimeout(150);
const none = await probes();
check(none.filter(p => p.mine).length === 0 && none.length === 1 && !(await page.locator(".mine-probes").isVisible()), "the last one goes too; the ear stays", none);

await page.keyboard.press("Control+z"); await page.waitForTimeout(150);
const back = (await probes()).filter(p => p.mine);
// (it comes back where it was; Sim.setProbes gives a probe it no longer has the first free label, not its old one)
check(back.length === 1 && back[0].x === three[2].x && back[0].y === three[2].y, "Ctrl+Z brings the last one back", back);
await t.done();
