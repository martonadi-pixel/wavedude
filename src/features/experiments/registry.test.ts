import { describe, expect, it } from "vitest";
import { EXPERIMENTS } from "./index";
import { CATEGORIES } from "../learn/index";

describe("experiments", () => {
  it("have unique ids", () => {
    const ids = EXPERIMENTS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("live in catalog/, one file each, named after their id", () => {
    const files = Object.keys(import.meta.glob("./catalog/*.ts"));
    for (const e of EXPERIMENTS) expect(files, e.id).toContain(`./catalog/${e.id}.ts`);
  });

  it("start every slider inside its range", () => {
    for (const e of EXPERIMENTS) for (const p of e.params ?? []) {
      expect(p.value, `${e.id}.${p.id}`).toBeGreaterThanOrEqual(p.min);
      expect(p.value, `${e.id}.${p.id}`).toBeLessThanOrEqual(p.max);
    }
  });

  it("link only to Learn pages that exist, and Learn links only to experiments that exist", () => {
    const pages = new Set(CATEGORIES.flatMap(c => c.pages.map(p => `${c.id}/${p.id}`)));
    for (const e of EXPERIMENTS) for (const r of e.readMore ?? []) expect(pages.has(r.page), `${e.id} → ${r.page}`).toBe(true);
    const ids = new Set(EXPERIMENTS.map(e => e.id));
    for (const c of CATEGORIES) for (const p of c.pages) for (const t of p.tryIt ?? []) expect(ids.has(t.experiment), `${p.id} → ${t.experiment}`).toBe(true);
  });
});
