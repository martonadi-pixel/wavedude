// Wave circuits in the sandbox (replaces the old sbxlogic test): a ready-made OR/AND gate from the Scene tab answers
// its inputs (one flipped on the picture), a circuit built with the Logic tools works, with a transistor too, and a
// project keeps the circuit.
import { start, check } from "./lib.mjs";

const t = await start({ downloads: true });
const { ev, page } = t;
const state = () => ev(() => { const c = window.waveDude.logic; return { ins: c.switches.map(s => `${s.label}=${s.bit}`).join(" "), outs: Object.fromEntries(c.detectors.map(d => [d.id, d.bit])) }; });
const run = n => ev(n => { const s = window.waveDude; s.running = false; s.logic.run(n); }, n);

await t.goto("#/sandbox", 800);
await t.startFrom("c-andor");
await run(1600);
let s = await state();
check(Object.values(s.outs).every(b => b === 0), "OR/AND, inputs off: every LED off", s);
await ev(() => { const c = window.waveDude.logic; c.toggle(c.get("A").id); });
await run(1600);
s = await state();
check(s.outs.or === 1 && s.outs.and === 0, "A = 1: OR on, AND off", s);
// B flipped by a click on its emitter with the hand tool
await page.keyboard.press("v");
const pos = await ev(() => { const s = window.waveDude, src = s.logic.get("B").sources[0]; return s.view.toScreen(src.x + 0.5, src.y + 2.5); });
const box = await page.locator("#view canvas").last().boundingBox();
await page.mouse.click(box.x + pos.x, box.y + pos.y); await page.waitForTimeout(100);
await run(1600);
s = await state();
check(s.ins.includes("B=1") && s.outs.or === 1 && s.outs.and === 1, "B clicked on the picture: OR and AND on", s);

// built by hand: a light guide, an input at its start, a detector at its end
await t.startFrom("empty");
const built = await ev(() => {
  const s = window.waveDude, T = (tool, ph, a, b) => { s.view.tool = tool; s.view.onTool(tool, ph, a, b ?? a); };
  const y = 200;
  T("guide", "down", { x: 90, y }); T("guide", "move", { x: 500, y: y + 2 }, { x: 90, y }); T("guide", "up", { x: 500, y: y + 2 }, { x: 90, y });
  T("bit", "down", { x: 130, y: y + 3 });
  T("detector", "down", { x: 440, y: y - 2 });
  return { n: s.scene.n[y * s.scene.width + 300], switches: s.logic.switches.length, detectors: s.logic.detectors.length };
});
check(built.n > 1.2 && built.switches === 1 && built.detectors === 1, "a guide, an input and a detector", built);
await ev(() => { const s = window.waveDude; s.logic.toggle(s.logic.switches[0].id); });
await run(2000);
s = await state();
check(Object.values(s.outs)[0] === 1, "input on: the detector lights", s);
// a transistor that looks at that detector and shines into a second guide with its own detector
await ev(() => {
  const s = window.waveDude, T = (tool, ph, a, b) => { s.view.tool = tool; s.view.onTool(tool, ph, a, b ?? a); };
  T("guide", "down", { x: 300, y: 300 }); T("guide", "up", { x: 600, y: 300 }, { x: 300, y: 300 });
  const d = s.logic.detectors[0].areas[0];
  T("transistor", "down", { x: d.x + 1, y: d.y + 1 });
  T("transistor", "down", { x: 340, y: 301 });
  T("detector", "down", { x: 560, y: 300 });
});
await run(2000);
const tr = () => ev(() => window.waveDude.logic.transistors.map(x => x.on));
s = await state();
check((await tr()).join() === "true" && Object.values(s.outs).every(b => b === 1), "the transistor switches the second guide on", { ...s, transistor: await tr() });
await ev(() => { const s = window.waveDude; s.logic.toggle(s.logic.switches[0].id); });
await run(2500);
s = await state();
check((await tr()).join() === "false" && Object.values(s.outs).every(b => b === 0), "input off: both go dark", { ...s, transistor: await tr() });

const before = await ev(() => JSON.stringify(window.waveDude.logic.toJSON(window.waveDude.sources)));
await t.saveAndOpen("logic-project.zip");
const after = await ev(() => window.waveDude.logic ? JSON.stringify(window.waveDude.logic.toJSON(window.waveDude.sources)) : "none");
check(before === after, "save + open keeps the circuit", after.length);
await ev(() => { const s = window.waveDude; s.running = false; s.logic.toggle(s.logic.switches[0].id); s.logic.run(4500); });
s = await state();
check(Object.values(s.outs).every(b => b === 1), "reopened, input on: it works", s);
await t.done();
