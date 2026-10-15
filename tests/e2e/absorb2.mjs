// Walls reflect everything; absorbers soak waves up gradually, and the thicker they are the less comes back or gets
// through. A box drawn with the Wall tool is an outline.
import { start, check } from "./lib.mjs";

const t = await start();
await t.goto("#/sandbox", 800);
const measure = (tool, r) => t.ev(([tool, r]) => {
  const s = window.waveDude, Scene = s.scene.constructor;
  const W = 1400, H = 900, X0 = 700, sc = new Scene(W, H);
  const src = { ...s.sourceTemplate, id: 9999, name: "w", kind: "line", x: 200, y: 0, x2: 200, y2: H - 1, level: 60, enabled: true, hasPosition: true, mode: "continuous", amplitudePct: 100, countX: 1, countY: 1, baked: undefined };
  s.load(sc, [src], []); s.running = false;
  if (tool !== "none") {
    s.paintShape = "line"; s.brush = r; s.view.tool = tool;
    s.view.onTool(tool, "down", { x: X0 + r, y: 0 }, { x: X0 + r, y: 0 });
    s.view.onTool(tool, "move", { x: X0 + r, y: H - 1 }, { x: X0 + r, y: 0 });
    s.view.onTool(tool, "up", { x: X0 + r, y: H - 1 }, { x: X0 + r, y: 0 });
  }
  const grade = [0, r / 2, r].map(d => +(1 - s.scene.dBase[450 * W + Math.floor(X0 + d)]).toFixed(3));
  s.engine.step(2600);
  const st = s.engine.readState(), y = H / 2;
  const amp = x => Math.sqrt(2 * Math.max(0, (st[(y * W + x) * 4 + 2] + st[(y * W + x) * 4 + 3]) * 0.5));
  let mx = 0, mn = 1e9;
  for (let x = X0 - 50; x < X0 - 10; x++) { const v = amp(x); mx = Math.max(mx, v); mn = Math.min(mn, v); }
  // the standing-wave ratio in front gives the reflection; the amplitude behind, what gets through
  return { grade, reflects: +((mx - mn) / (mx + mn)).toFixed(3), through: +(amp(X0 + 2 * r + 40) / ((mx + mn) / 2)).toFixed(3) };
}, [tool, r]);

const none = await measure("none", 0);
check(none.reflects < 0.05 && none.through > 0.9, "open space: nothing comes back", none);
const wall = await measure("barrier", 6);
// (the time-averaged picture never quite reaches zero at the nodes: total reflection reads about 0.8 here)
check(wall.reflects > 0.7 && wall.through < 0.005, "a 12-cell wall reflects, nothing gets through", wall);
const thin = await measure("absorber", 6), mid = await measure("absorber", 15), thick = await measure("absorber", 30);
check(thin.grade[0] < thin.grade[1] && thin.grade[1] <= thin.grade[2], "an absorber is graded from its edge inwards", thin.grade);
check(thick.reflects < mid.reflects + 0.01 && thick.through < thin.through, "thicker absorbers let less through", { thin, mid, thick });
check(thick.reflects < 0.1 && thick.through < 0.05, "a 60-cell absorber: little back, almost nothing through", thick);

const box = await t.ev(() => {
  const s = window.waveDude; s.paintShape = "box"; s.brush = 3; s.view.tool = "barrier";
  s.view.onTool("barrier", "down", { x: 100, y: 100 }, { x: 100, y: 100 });
  s.view.onTool("barrier", "move", { x: 300, y: 250 }, { x: 100, y: 100 });
  s.view.onTool("barrier", "up", { x: 300, y: 250 }, { x: 100, y: 100 });
  const W = s.scene.width, wall = (x, y) => s.scene.dBase[y * W + x] === 0;
  return { edges: [wall(100, 100), wall(300, 175), wall(200, 250)], inside: wall(200, 175) };
});
check(box.edges.every(Boolean) && !box.inside, "a Wall box is an outline", box);
await t.done();
