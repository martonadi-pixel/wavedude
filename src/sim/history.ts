// Wave Dude 2D web - undo and redo. Each step keeps the objects as they were before (sources, probes, shapes, optical
// elements, the wave circuit) and, for painting, only the 64 x 64 tiles of the base layer that the brush touched.
// GPL-3.0-or-later.

import type { Sim } from "./sim";

const TILE = 64;
const KEEP = 60;

interface Tile { n: Float32Array; c2: Float32Array; dBase: Float32Array }
interface Entry { label: string; objects: string; tiles: Map<number, Tile> }

export class History {
  private undos: Entry[] = [];
  private redos: Entry[] = [];
  private open: Entry | null = null;
  private timer = 0;
  /** Called when what can be undone or redone changes (to grey out buttons). */
  changed: () => void = () => {};

  constructor(private sim: Sim) {}

  get canUndo(): boolean { return this.undos.length > 0 || !!this.open; }
  get canRedo(): boolean { return this.redos.length > 0; }
  get undoLabel(): string { return (this.open ?? this.undos[this.undos.length - 1])?.label ?? ""; }
  get redoLabel(): string { return this.redos[this.redos.length - 1]?.label ?? ""; }

  /** Starts an undo step (before an edit). Nested calls join the step already open. */
  begin(label: string): void {
    if (this.open) return;
    this.open = { label, objects: this.sim.objectsJSON(), tiles: new Map() };
  }

  /** For edits that come in many small changes (a slider, arrow keys): one step until they pause for half a second. */
  touch(label: string): void {
    this.begin(label);
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.commit(), 500);
  }

  /** Before the cells of the base layer in this rectangle are painted: keeps the tiles as they were. */
  beforePaint(x0: number, y0: number, x1: number, y1: number): void {
    const e = this.open;
    if (!e) return;
    const b = this.sim.baseScene;
    for (let ty = Math.max(0, Math.floor(y0 / TILE)); ty <= Math.min(Math.floor((b.height - 1) / TILE), Math.floor(y1 / TILE)); ty++)
      for (let tx = Math.max(0, Math.floor(x0 / TILE)); tx <= Math.min(Math.floor((b.width - 1) / TILE), Math.floor(x1 / TILE)); tx++) {
        const key = ty * 65536 + tx;
        if (!e.tiles.has(key)) e.tiles.set(key, this.readTile(key));
      }
  }

  /** Ends the open step; a step that changed nothing is dropped. */
  commit(): void {
    clearTimeout(this.timer);
    const e = this.open;
    this.open = null;
    if (!e) return;
    if (!e.tiles.size && e.objects === this.sim.objectsJSON()) return;
    this.undos.push(e);
    if (this.undos.length > KEEP) this.undos.shift();
    this.redos = [];
    this.changed();
  }

  undo(): boolean { return this.swap(this.undos, this.redos); }
  redo(): boolean { return this.swap(this.redos, this.undos); }

  /** Forgets everything (a new scene). */
  clear(): void {
    clearTimeout(this.timer);
    this.open = null;
    this.undos = [];
    this.redos = [];
    this.changed();
  }

  private swap(from: Entry[], to: Entry[]): boolean {
    this.commit();
    const e = from.pop();
    if (!e) return false;
    // the state now, so the step can be done again the other way
    const back: Entry = { label: e.label, objects: this.sim.objectsJSON(), tiles: new Map([...e.tiles.keys()].map(k => [k, this.readTile(k)])) };
    for (const [key, t] of e.tiles) this.writeTile(key, t);
    this.sim.applyObjects(e.objects);
    to.push(back);
    this.changed();
    return true;
  }

  private rect(key: number): { x0: number; y0: number; x1: number; y1: number } {
    const b = this.sim.baseScene, tx = key % 65536, ty = Math.floor(key / 65536);
    return { x0: tx * TILE, y0: ty * TILE, x1: Math.min(b.width, (tx + 1) * TILE) - 1, y1: Math.min(b.height, (ty + 1) * TILE) - 1 };
  }

  private readTile(key: number): Tile {
    const b = this.sim.baseScene, r = this.rect(key), w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1;
    const t: Tile = { n: new Float32Array(w * h), c2: new Float32Array(w * h), dBase: new Float32Array(w * h) };
    for (let y = 0; y < h; y++) {
      const i = (r.y0 + y) * b.width + r.x0;
      t.n.set(b.n.subarray(i, i + w), y * w);
      t.c2.set(b.c2.subarray(i, i + w), y * w);
      t.dBase.set(b.dBase.subarray(i, i + w), y * w);
    }
    return t;
  }

  private writeTile(key: number, t: Tile): void {
    const b = this.sim.baseScene, r = this.rect(key), w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1;
    for (let y = 0; y < h; y++) {
      const i = (r.y0 + y) * b.width + r.x0;
      b.n.set(t.n.subarray(y * w, (y + 1) * w), i);
      b.c2.set(t.c2.subarray(y * w, (y + 1) * w), i);
      b.dBase.set(t.dBase.subarray(y * w, (y + 1) * w), i);
    }
    this.sim.rasterize(r.x0, r.y0, r.x1, r.y1);
  }
}
