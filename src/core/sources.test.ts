import { describe, expect, it } from "vitest";
import { elementsOf, motionPosition, movingElements, newMotion, newSource, SOFT_GAIN } from "./sources";

describe("sources", () => {
  it("makes one element for a point source and a centred grid for an array", () => {
    expect(elementsOf(newSource({ kind: "point", x: 10, y: 20 }))).toHaveLength(1);
    const arr = elementsOf(newSource({ kind: "array", x: 50, y: 50, countX: 3, countY: 2, spacingX: 10, spacingY: 10 }));
    expect(arr).toHaveLength(6);
    expect(Math.min(...arr.map(e => e.x))).toBe(40);
  });

  it("draws a line source cell by cell without repeating cells", () => {
    const els = elementsOf(newSource({ kind: "line", x: 0, y: 0, x2: 20, y2: 0 }));
    expect(els).toHaveLength(21);
    expect(new Set(els.map(e => e.x)).size).toBe(21);
  });

  it("a switched-off or moving source has no fixed elements", () => {
    expect(elementsOf(newSource({ enabled: false }))).toHaveLength(0);
    expect(elementsOf(newSource({ motion: newMotion() }))).toHaveLength(0);
  });

  it("moves along a line at mach × c and stops at its distance", () => {
    const s = newSource({ x: 100, y: 50, motion: newMotion({ kind: "line", mach: 0.5, distance: 40 }) });
    expect(motionPosition(s, 100, 0.5, 1000, 500).x).toBeCloseTo(125);
    expect(motionPosition(s, 10_000, 0.5, 1000, 500).x).toBeCloseTo(140);
  });

  it("stops before the edge of the scene when no distance is set", () => {
    const s = newSource({ x: 100, y: 50, motion: newMotion({ kind: "line", mach: 1, distance: 0 }) });
    expect(motionPosition(s, 1e6, 1, 300, 200).x).toBeCloseTo(300 - 1 - 70);
  });

  it("goes round a circle centred on its place", () => {
    const s = newSource({ x: 200, y: 200, motion: newMotion({ kind: "circle", mach: 1, radius: 50, angleDeg: 0 }) });
    const quarter = (Math.PI / 2) * 50;
    const p = motionPosition(s, quarter, 1, 1000, 1000);
    expect(Math.hypot(p.x - 200, p.y - 200)).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(150);
  });

  it("spreads a moving source over the four cells around it, weights adding up to its amplitude", () => {
    const s = newSource({ x: 10, y: 10, amplitudePct: 80, motion: newMotion({ kind: "line", mach: 1, distance: 0.25 }) });
    const els = movingElements(s, 1e6, 1, 100, 100);
    expect(els.every(e => e.soft === SOFT_GAIN)).toBe(true);
    expect(els.reduce((a, e) => a + e.amplitude, 0)).toBeCloseTo(0.8);
    expect(els.map(e => e.x).sort()).toEqual([10, 11]);
  });
});
