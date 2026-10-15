import { describe, expect, it } from "vitest";
import { Scene, BARRIER } from "./scene";
import { ABSORBER_STRENGTH, paintStamp, snapAngle, stampDepth } from "./paint";

const absorbAt = (s: Scene, x: number, y: number) => 1 - s.dBase[y * s.width + x];

describe("paint stamps", () => {
  it("measures how deep a point lies inside a segment, a box outline and a filled box", () => {
    expect(stampDepth({ kind: "segment", x0: 0, y0: 0, x1: 10, y1: 0, r: 3 }, 5, 1).depth).toBeCloseTo(2);
    expect(stampDepth({ kind: "box", x0: 0, y0: 0, x1: 10, y1: 10, r: 2 }, 5, 5).depth).toBeLessThan(0);
    expect(stampDepth({ kind: "filledBox", x0: 0, y0: 0, x1: 10, y1: 10 }, 5, 4)).toEqual({ depth: 4, max: 5 });
  });

  it("paints a wall line where the stroke covers a cell's centre", () => {
    const s = new Scene(40, 40);
    paintStamp(s, { kind: "segment", x0: 5.5, y0: 20.5, x1: 35.5, y1: 20.5, r: 2 }, BARRIER);
    expect(absorbAt(s, 20, 20)).toBe(1);
    expect(absorbAt(s, 20, 25)).toBe(0);
  });

  it("grows an absorber from nothing at its edge to full strength inside (no sudden edge to reflect from)", () => {
    // 100 cells wide and tall: full strength from 30 cells inside its border
    const s = new Scene(200, 200);
    paintStamp(s, { kind: "filledBox", x0: 50, y0: 50, x1: 150, y1: 150 }, "absorber");
    expect(absorbAt(s, 50, 100)).toBeLessThan(0.01);
    expect(absorbAt(s, 65, 100)).toBeGreaterThan(0.01);
    expect(absorbAt(s, 65, 100)).toBeLessThan(ABSORBER_STRENGTH);
    expect(absorbAt(s, 100, 100)).toBeCloseTo(ABSORBER_STRENGTH, 2);
  });

  it("never weakens an absorber already there", () => {
    const s = new Scene(100, 20);
    paintStamp(s, { kind: "filledBox", x0: 0, y0: 0, x1: 100, y1: 20 }, { absorb: 0.5 });
    paintStamp(s, { kind: "disc", x: 50, y: 10, r: 8 }, "absorber");
    expect(absorbAt(s, 50, 10)).toBeCloseTo(0.5);
  });

  it("snaps a nearly straight line to straight, and leaves a slanted one alone", () => {
    const p = snapAngle({ x: 0, y: 0 }, { x: 100, y: 3 });
    expect(p.y).toBeCloseTo(0);
    expect(snapAngle({ x: 0, y: 0 }, { x: 100, y: 30 })).toEqual({ x: 100, y: 30 });
  });
});
