// Objects in the sandbox: a wall drawn as a line is an object that moves, undoes, duplicates and deletes; freehand
// paint undoes; probes keep their label, colour and record; a project keeps shapes and lenses as objects.
import { start, check } from "./lib.mjs";

const t = await start({ downloads: true });
const { ev } = t;
await t.goto("#/sandbox", 800);
await t.startFrom("empty");
const wallAt = (x, y) => ev(([x, y]) => { const s = window.waveDude; return s.scene.dBase[y * s.scene.width + x] === 0; }, [x, y]);

// 1. a wall drawn with the Wall tool in Line mode is a shape
const made = await ev(() => {
  const s = window.waveDude; s.paintShape = "line"; s.brushes.barrier = 4; s.view.tool = "barrier";
  const T = (ph, a, b) => s.view.onTool("barrier", ph, a, b);
  T("down", { x: 200, y: 100 }, { x: 200, y: 100 }); T("move", { x: 200, y: 300 }, { x: 200, y: 100 }); T("up", { x: 200, y: 300 }, { x: 200, y: 100 });
  const sh = s.shapes[0];
  return { shapes: s.shapes.length, selected: s.selection?.kind, x: sh?.x, length: Math.round(sh?.length), angle: Math.round(sh?.angleDeg) };
});
check(made.shapes === 1 && made.selected === "shape" && made.length === 200 && Math.abs(made.angle) === 90, "a wall line becomes a selected shape", made);
check(await wallAt(200, 200), "it is a wall in the scene");

// 2. drag it
await ev(() => { const s = window.waveDude; s.view.tool = "pan"; const a = { x: 200.5, y: 200 }; s.selector.grab("down", a, a); s.selector.grab("move", { x: 260.5, y: 200 }, a); s.selector.grab("up", { x: 260.5, y: 200 }, a); });
check(!(await wallAt(200, 200)) && (await wallAt(260, 200)), "dragged 60 cells: nothing left behind");

// 3. undo / redo
await ev(() => window.waveDude.undo.undo());
check((await wallAt(200, 200)) && !(await wallAt(260, 200)), "undo puts it back");
await ev(() => window.waveDude.undo.redo());
check(!(await wallAt(200, 200)) && (await wallAt(260, 200)), "redo moves it again");

// 4. duplicate, delete, undo the delete
const dup = await ev(() => { const s = window.waveDude; s.selector.duplicate(); return { shapes: s.shapes.length, sel: s.selection?.kind }; });
check(dup.shapes === 2 && dup.sel === "shape", "duplicate makes a selected copy", dup);
const del = await ev(() => { const s = window.waveDude; s.selector.deleteSelection(); return { shapes: s.shapes.length, sel: s.selection }; });
check(del.shapes === 1 && del.sel === null, "delete removes it", del);
check(await ev(() => { const s = window.waveDude; s.undo.undo(); return s.shapes.length; }) === 2, "undo brings it back");

// 5. freehand paint undoes
const paint = await ev(() => {
  const s = window.waveDude; s.paintShape = "free"; s.view.tool = "glass"; const W = s.scene.width;
  s.view.onTool("glass", "down", { x: 500, y: 200 }, { x: 500, y: 200 }); s.view.onTool("glass", "up", { x: 500, y: 200 }, { x: 500, y: 200 });
  const a = s.scene.n[200 * W + 500]; s.undo.undo(); return { painted: a, undone: s.scene.n[200 * W + 500] };
});
check(paint.painted > 1.1 && paint.undone === 1, "freehand glass, then undo", paint);

// 6. probes keep their label, colour and record when another one goes
await ev(() => { const s = window.waveDude; s.view.tool = "source"; s.view.onTool("source", "down", { x: 100, y: 200 }, { x: 100, y: 200 }); });
await ev(() => { const s = window.waveDude; s.view.tool = "pointProbe"; s.view.onTool("pointProbe", "down", { x: 150, y: 200 }, { x: 150, y: 200 }); s.view.onTool("pointProbe", "down", { x: 170, y: 220 }, { x: 170, y: 220 }); s.play(); });
await t.page.waitForTimeout(1500);
const probes = () => ev(() => window.waveDude.probes.map((p, i) => ({ label: p.label, color: p.color, n: (window.waveDude.history[i] ?? []).length })));
const two = await probes();
check(two.length === 2 && two.every(p => p.n > 20), "two probes record", two);
await ev(() => { const s = window.waveDude; s.removeProbe(s.probes[0].id); });
const one = await probes();
check(one.length === 1 && one[0].label === two[1].label && one[0].color === two[1].color && one[0].n >= two[1].n, "deleting P1 leaves P2 as it was", one);
await ev(() => { const s = window.waveDude; s.view.onTool("pointProbe", "down", { x: 190, y: 240 }, { x: 190, y: 240 }); });
await t.page.waitForTimeout(400);
const again = await probes();
check(again.length === 2 && again[0].label === two[1].label && again[1].label === two[0].label && again[1].color === two[0].color, "a new probe takes the free label and colour", again);
check(await ev(() => Number.isNaN(window.waveDude.history[1][0])), "its record starts with gaps, lined up with the others");

// 7. a saved project keeps shapes and a lens as objects
await ev(() => { const s = window.waveDude; s.opticTemplate.kind = "convex"; s.view.tool = "optic"; s.view.onTool("optic", "down", { x: 600, y: 300 }, { x: 600, y: 300 }); });
const count = () => ev(() => ({ shapes: window.waveDude.shapes.length, optics: window.waveDude.optics.length }));
const before = await count();
await t.saveAndOpen("objects-project.zip");
const after = await count();
check(before.shapes === 2 && before.optics === 1 && after.shapes === before.shapes && after.optics === before.optics, "save + open keeps the objects", { before, after });
check(await wallAt(260, 200), "and the wall is where it was");
await t.done();
