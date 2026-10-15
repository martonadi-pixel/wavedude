// A source made to go round in a circle from the inspector's Motion editor moves, and keeps its motion in a project.
import { start, check } from "./lib.mjs";

const t = await start({ downloads: true });
await t.goto("#/sandbox", 800);
await t.startFrom("empty");
await t.ev(() => { const s = window.waveDude; s.view.tool = "source"; s.view.onTool("source", "down", { x: 400, y: 300 }, { x: 400, y: 300 }); });
await t.page.waitForTimeout(200);
await t.page.locator(".inspector .fold-h", { hasText: "Motion" }).click({ timeout: 5000 }); await t.page.waitForTimeout(150);
await t.page.locator(".inspector button", { hasText: "Circle" }).click({ timeout: 5000 }); await t.page.waitForTimeout(200);
await t.play();
await t.page.waitForTimeout(1500);
const st = () => t.ev(() => { const s = window.waveDude, src = s.sources[0], p = s.sourcePos(src); return { time: s.time, home: [src.x, src.y], now: [+p.x.toFixed(1), +p.y.toFixed(1)], motion: src.motion }; });
const a = await st();
check(a.motion?.kind === "circle" && a.time > 20 && Math.hypot(a.now[0] - a.home[0], a.now[1] - a.home[1]) > 1, "the source goes round", a);
const row = (await t.page.locator(".obj-list .row").first().innerText()).replace(/\s+/g, " ");
check(/moves/.test(row), "the objects list says it moves", row);
await t.saveAndOpen("motion-project.zip");
const b = await st();
check(JSON.stringify(b.motion) === JSON.stringify(a.motion) && b.home[0] === a.home[0] && b.home[1] === a.home[1], "the motion is kept in the project", b);
await t.done();
