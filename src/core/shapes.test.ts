import { describe, expect, it } from "vitest";
import { Scene } from "./scene";
import { copyShape, drawShape, newShape, setShapeEnds, shapeBounds, shapeEnds, shapeHit, slitCentres } from "./shapes";

const all = { x0: 0, y0: 0, x1: 9999, y1: 9999 };
const wallAt = (s: Scene, x: number, y: number) => s.dBase[y * s.width + x] === 0;

describe("shapes", () => {
  it("draws a turned wall line where it should be", () => {
    const sc = new Scene(200, 200);
    drawShape(sc, newShape("line", { x: 100, y: 100, length: 100, thickness: 6, angleDeg: 90 }), all);
    expect(wallAt(sc, 100, 60)).toBe(true);
    expect(wallAt(sc, 100, 140)).toBe(true);
    expect(wallAt(sc, 110, 100)).toBe(false);
    expect(wallAt(sc, 100, 160)).toBe(false);
  });

  it("leaves the openings of a slit wall empty", () => {
    const sc = new Scene(200, 400);
    const s = newShape("slits", { x: 100, y: 200, length: 300, thickness: 8, width: 12, count: 2, spacing: 60 });
    drawShape(sc, s, all);
    expect(slitCentres(s)).toEqual([-30, 30]);
    // upright wall (angle 90): its length runs down, so the openings are at y = 170 and 230
    expect(wallAt(sc, 100, 170)).toBe(false);
    expect(wallAt(sc, 100, 230)).toBe(false);
    expect(wallAt(sc, 100, 200)).toBe(true);
    expect(wallAt(sc, 100, 100)).toBe(true);
  });

  it("draws a box outline or a filled box, and glass with its index", () => {
    const sc = new Scene(300, 300);
    drawShape(sc, newShape("box", { x: 150, y: 150, length: 100, width: 60, thickness: 4, filled: false }), all);
    expect(wallAt(sc, 150, 120)).toBe(true);
    expect(wallAt(sc, 150, 150)).toBe(false);
    drawShape(sc, newShape("ellipse", { x: 60, y: 60, length: 40, width: 40, material: "glass", n: 1.6 }), all);
    expect(sc.n[60 * 300 + 60]).toBeCloseTo(1.6);
  });

  it("finds a click on a shape, and its bounds hold it whatever its angle", () => {
    const s = newShape("box", { x: 50, y: 50, length: 80, width: 20, angleDeg: 30, filled: true });
    expect(shapeHit(s, 50, 50, 0)).toBe(true);
    expect(shapeHit(s, 50, 90, 2)).toBe(false);
    const b = shapeBounds(s);
    const sc = new Scene(200, 200);
    drawShape(sc, s, all);
    for (let y = 0; y < 200; y++) for (let x = 0; x < 200; x++)
      if (wallAt(sc, x, y)) expect(x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1).toBe(true);
  });

  it("moves a line by its ends and copies with a new id", () => {
    const s = newShape("line", { x: 0, y: 0, length: 10 });
    setShapeEnds(s, { x: 10, y: 10 }, { x: 10, y: 50 });
    expect(s.x).toBe(10);
    expect(s.length).toBe(40);
    expect(shapeEnds(s)[1].y).toBeCloseTo(50);
    const c = copyShape(s, 5, 0);
    expect(c.id).not.toBe(s.id);
    expect(c.x).toBe(15);
  });
});
