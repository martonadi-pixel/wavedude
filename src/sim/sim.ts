// Wave Dude 2D web - one running simulation: the engine, its view, the scene and the objects in it (sources, probes,
// shapes, optical elements, a wave circuit), the selection, undo, and the frame loop. The experiments and the sandbox
// both drive this. Tools, selection, the overlay and undo live in the files next to this one.
// GPL-3.0-or-later.

import { WaveEngine, type Quantity, type DisplayOptions } from "../engine/engine";
import { Scene } from "../core/scene";
import { type SourceSpec, elementsOf, newSource, movingElements, motionPosition } from "../core/sources";
import { type OpticSpec, newOptic, drawOptic, opticBounds, opticHit, type Housing, drawHousing, housingBounds } from "../core/optics";
import { type ShapeSpec, drawShape, shapeBounds } from "../core/shapes";
import { Viewport, type Pt, emptyOverlay, type Overlay } from "../view/viewport";
import { type Stencil, continuumWavelength, continuumSpeed, omegaOfLevel } from "../core/physics";
import type { PaintShape } from "../core/paint";
import { type SceneInfo, type ProjectMeta, newSceneInfo, newMeta } from "../project/project";
import { Circuit, type LogicJSON } from "../circuits/circuit";
import { Selector, type Selection } from "./selection";
import { ToolActions, type PaintTool } from "./tools";
import { History } from "./history";
import { buildOverlay } from "./overlay";

export type { PaintTool } from "./tools";
export type { Selection, SelKind } from "./selection";

/** What a probe measures (ProbeMeasurement): the field u, the averaged intensity, or the intensity added up over the steps. */
export type Measurement = "amplitude" | "intensity" | "integrated";

export interface ProbeSpec {
  id: number;
  kind: "point" | "line";
  x: number; y: number; x2: number; y2: number;
  measurement: Measurement;
  /** Integrated probes only add up from this step on (-1 = from the start). */
  startAfter?: number;
  /** Inactive probes are kept (and saved) but not measured. */
  active?: boolean;
  /** Placed by the reader during an experiment (kept after the experiment's own probes when it sets them again). */
  mine?: boolean;
  /** Settings of the Windows app this version does not use (graph box, scale), kept for saving. */
  extra?: Record<string, unknown>;
  color: string;
  label: string;
}

/** A probe to set: without an id it is a new one; with the id of a probe already there it keeps its colour, label and record. */
export type NewProbe = Omit<ProbeSpec, "id" | "color" | "label"> & Partial<Pick<ProbeSpec, "id" | "color" | "label">>;

export interface ColorSchemeInfo { file: string; name: string; type: "field" | "intensity"; colors?: number[][] }

const PROBE_COLORS = ["#ffd84a", "#4ade80", "#f472b6", "#60a5fa", "#fb923c", "#a78bfa", "#2dd4bf", "#f87171"];
/** Each source gets its own colour on the canvas and in the sources list (shades apart from the probes'). */
const SOURCE_COLORS = ["#38bdf8", "#ff8a3d", "#b5f23d", "#e879f9", "#ffe066", "#9b8cff", "#ff6b9a", "#34e3c0", "#c08457", "#e2e8f0"];
const HISTORY_KEEP = 6000;

/** New scenes start at this % of their full brightness, and at speed 1x (a calm first look). */
export const DEFAULT_BRIGHTNESS_PCT = 30;

export class Sim {
  readonly engine: WaveEngine;
  readonly view: Viewport;
  scene: Scene;
  sources: SourceSpec[] = [];
  probes: ProbeSpec[] = [];
  /** Point probe values (one array per point probe, in the order of `probes`) and the step of their first value. */
  history: number[][] = [];
  historyStart = 0;
  profiles: Float32Array[] = [];
  private running_ = false;
  /**
   * A new page or scene waits for the reader: while held, the scene's own code cannot start the run (`running = true`
   * is ignored, a runUntil target waits). The ▶ Run button, the space bar or an action of the reader (play) starts it.
   */
  held = false;
  get running(): boolean { return this.running_; }
  set running(on: boolean) { if (on && this.held) return; this.running_ = on; }
  /** Pauses and holds: what is set up next stays paused until the reader starts it. */
  hold(): void { this.held = true; this.running_ = false; }
  /** The reader starts the run (also any runUntil that was waiting). */
  play(): void { this.held = false; this.running_ = true; }
  /** The reader did something that needs the waves (an action button): later starts are allowed again. */
  release(): void { this.held = false; }
  /** Simulation steps per screen frame; below 1 is slow motion (one step every few frames). */
  stepsPerFrame = 1;
  /**
   * Steps per frame while a run towards a step target (runUntil) is going: an experiment fast-forwards to its steady
   * state at this speed and then carries on at the chosen speed. 0 = no fast-forward.
   */
  prepareSpeed = 0;
  /**
   * Called before every simulation step with the step number (an experiment that moves or switches its sources
   * during the run). The frame loop then steps one at a time. Cleared by `load`.
   */
  stepHook: ((time: number) => void) | null = null;
  /** The wave circuit running with this scene (switches, detectors, transistors), if any. Cleared by `load`. */
  logic: Circuit | null = null;
  /** True while fast-forwarding to a runUntil target faster than the chosen speed. */
  get preparing(): boolean { return this.running && !!this.stepTarget && this.prepareSpeed > this.stepsPerFrame; }
  private stepCarry = 0;
  view_: Quantity = "field";
  /** Full brightness per view (what the scene was tuned for; 100% on the toolbar's slider). */
  brightness: Record<Quantity, number> = { field: 2, intensity: 2 };
  /** How bright the picture is shown, in % of `brightness` (the toolbar's ☀ slider). New scenes start at 30%. */
  brightnessPct = DEFAULT_BRIGHTNESS_PCT;
  /** ColorLut black level per view: lifts (positive) or lowers (negative) the darkest colours. */
  blackLevel: Record<Quantity, number> = { field: 0, intensity: 0 };
  /** SceneSettings.UseObjectSources: off = the object sources are kept but do not drive the field. */
  useObjectSources = true;
  /** Stop running at this step (SimulationSettings.Steps); 0 = never. */
  stopAt = 0;
  /** Where the scene came from and the project it belongs to (for saving in the Windows format). */
  sceneInfo: SceneInfo = newSceneInfo();
  project: ProjectMeta = newMeta();
  showMaterial = true;
  showSources = true;
  /** Outline every material boundary (remembered in this browser). */
  showOutlines = (() => { try { return localStorage.getItem("waveDude.outlines") !== "0"; } catch { return true; } })();
  setOutlines(on: boolean): void {
    this.showOutlines = on;
    try { localStorage.setItem("waveDude.outlines", on ? "1" : "0"); } catch { /* storage blocked */ }
  }
  schemes: ColorSchemeInfo[] = [];
  scheme: Record<Quantity, string> = { field: "Default_Field.json", intensity: "Default_Intensity.json" };
  /** The brightness was chosen on purpose (an opened project): the sandbox does not adjust it by itself. */
  keepBrightness = false;
  /** Which page set up the current scene, so the sandbox knows whether to keep it. */
  owner: "experiment" | "sandbox" | "colors" | "" = "";
  /** Extra things an experiment draws (labels, arrows). */
  annotations: Overlay = emptyOverlay();

  /** The selected object (one at a time): what the inspector shows, Delete removes and the arrow keys move. */
  selection: Selection | null = null;
  select(sel: Selection | null): void {
    if (sel === this.selection || (sel && this.selection && sel.kind === this.selection.kind && sel.id === this.selection.id)) return;
    this.selection = sel;
    this.notify();
  }
  /** The selected source's id (null when the selection is something else). */
  get selectedSource(): number | null { return this.selection?.kind === "source" ? Number(this.selection.id) : null; }
  set selectedSource(id: number | null) { if (id !== null) this.selection = { kind: "source", id }; else if (this.selection?.kind === "source") this.selection = null; }
  get selectedOptic(): number | null { return this.selection?.kind === "optic" ? Number(this.selection.id) : null; }
  set selectedOptic(id: number | null) { if (id !== null) this.selection = { kind: "optic", id }; else if (this.selection?.kind === "optic") this.selection = null; }
  /** In an experiment: the reader moved or deleted something of the experiment's own (its measurements assume the original layout). */
  layoutChanged = false;
  readonly selector: Selector = new Selector(this);
  readonly tools: ToolActions = new ToolActions(this);
  readonly undo: History = new History(this);

  // sandbox painting
  /** Brush radius (half the stroke thickness) per paint tool; absorbers need to be thick to absorb without echo. */
  brushes: Record<PaintTool, number> = { glass: 6, barrier: 6, absorber: 20, erase: 10 };
  /** The paint tool the brush size applies to: the selected one, else the last one used. */
  private paintTool: PaintTool = "glass";
  get brushTool(): PaintTool { const t = this.view.tool; if (t === "glass" || t === "barrier" || t === "absorber" || t === "erase") this.paintTool = t; return this.paintTool; }
  get brush(): number { return this.brushes[this.brushTool]; }
  set brush(r: number) { this.brushes[this.brushTool] = r; }
  glassIndex = 1.5;
  /** Template for new sources made with the source tools. */
  sourceTemplate: SourceSpec = newSource({ name: "template" });

  private frameListeners: (() => void)[] = [];
  private stepTarget: { step: number; done: () => void } | null = null;
  private lutCache = new Map<string, number[][]>();
  private lastStats = { t: performance.now(), steps: 0, frames: 0 };
  stats = { fps: 0, stepsPerSec: 0 };

  constructor(host: HTMLElement) {
    const canvas = document.createElement("canvas");
    canvas.className = "sim";
    host.append(canvas);
    this.engine = new WaveEngine(canvas);
    this.view = new Viewport(host, this.engine);
    this.scene = new Scene(400, 300);
    this.engine.setScene(this.scene);
    this.view.onTool = (tool, phase, cell, start) => this.tools.act(tool, phase, cell, start);
    // the hand tool picks up anything; a placing tool the objects of its own kind (see Selector.hit)
    this.view.canGrab = cell => !!this.selector.hit(cell);
    this.view.onGrab = (phase, cell, start) => this.selector.grab(phase, cell, start);
    this.view.onTap = () => this.select(null);
    // the GPU can drop the context (driver reset, a crashed video decoder...): ask for it back and rebuild
    canvas.addEventListener("webglcontextlost", e => {
      e.preventDefault();
      this.contextLost = true;
      setTimeout(() => { if (this.contextLost) for (const f of this.lostListeners) f(); }, 4000);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      this.engine.restore();
      this.contextLost = false;
      for (const h of this.history) h.length = 0;
      this.historyStart = 0;
      for (const f of this.restoredListeners) f();
    });
    requestAnimationFrame(t => this.frame(t));
  }

  // ------------------------------------------------------------------------------------------ setup

  /**
   * Loads a new scene with these sources and probes, clears the field, and fits the view. keepLogic: the wave circuit
   * stays (the same sources on a new or reloaded scene); otherwise it goes.
   */
  load(scene: Scene, sources: SourceSpec[] = [], probes: NewProbe[] = [], optics: OpticSpec[] = [], keepLogic = false): void {
    // the scene as loaded or painted is the base layer; shapes and optical elements are drawn on top of a copy of it
    this.shapes = scene.shapes;
    scene.shapes = [];
    this.baseScene = scene.clone();
    this.stepHook = null;
    if (!keepLogic) this.logic = null;
    this.optics = optics;
    this.selection = null;
    this.layoutChanged = false;
    this.tools.cancel();
    this.undo.clear();
    const all = { x0: 0, y0: 0, x1: scene.width - 1, y1: scene.height - 1 };
    for (const s of this.shapes) drawShape(scene, s, all);
    for (const o of optics) drawOptic(scene, o, all);
    this.housingsDrawn = this.housings(sources);
    for (const hs of this.housingsDrawn) drawHousing(scene, hs, all);
    this.scene = scene;
    this.sources = sources;
    // drawing changes dBase only; the damping the simulation uses (d) is dBase plus the edge
    scene.applyEdge();
    this.engine.setScene(scene);
    this.annotations = emptyOverlay();
    this.view.measure = { ruler: null, protractor: null };
    this.setOwnProbes(probes);
    this.refreshSources();
    this.logic?.attach();
    this.view.fit();
  }

  /**
   * How far the objects reach from the middle of the scene, left-right and up-down (in cells, with a margin): a scene
   * at least twice this size holds them all.
   */
  contentReach(margin = 24): { x: number; y: number } {
    const cx = this.scene.width / 2, cy = this.scene.height / 2;
    let rx = 0, ry = 0;
    const box = (x0: number, y0: number, x1: number, y1: number) => {
      rx = Math.max(rx, Math.abs(x0 - cx), Math.abs(x1 - cx));
      ry = Math.max(ry, Math.abs(y0 - cy), Math.abs(y1 - cy));
    };
    for (const s of this.sources) {
      const r = s.kind === "array" ? Math.max(s.countX * s.spacingX, s.countY * s.spacingY) / 2 : 0;
      box(Math.min(s.x, s.x2) - r, Math.min(s.y, s.y2) - r, Math.max(s.x, s.x2) + r, Math.max(s.y, s.y2) + r);
    }
    for (const s of this.shapes) { const b = shapeBounds(s); box(b.x0, b.y0, b.x1, b.y1); }
    for (const o of this.optics) { const b = opticBounds(o); box(b.x0, b.y0, b.x1, b.y1); }
    for (const p of this.probes) box(Math.min(p.x, p.x2), Math.min(p.y, p.y2), Math.max(p.x, p.x2), Math.max(p.y, p.y2));
    for (const d of this.logic?.detectors ?? []) for (const a of d.areas) box(a.x, a.y, a.x + a.w, a.y + a.h);
    return { x: rx ? rx + margin : 0, y: ry ? ry + margin : 0 };
  }

  /**
   * Gives the scene a new size, keeping what is in it centred and the waves running (the Sandbox's "Fit window" scenes
   * follow the window). Cells beyond the old border get what was at the border. Undo steps from before are dropped:
   * they refer to the old cells.
   */
  resizeScene(w: number, h: number): void {
    const old = this.scene, ob = this.baseScene, W0 = old.width, H0 = old.height;
    w = Math.max(64, Math.round(w)); h = Math.max(64, Math.round(h));
    if (w === W0 && h === H0) return;
    const dx = Math.round((w - W0) / 2), dy = Math.round((h - H0) / 2);
    const field = this.engine.readState(), time = this.engine.time, sel = this.selection, running = this.running;
    const base = new Scene(w, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const ox = x - dx, oy = y - dy, sx = Math.max(0, Math.min(W0 - 1, ox)), sy = Math.max(0, Math.min(H0 - 1, oy));
        const i = y * w + x, j = sy * W0 + sx;
        base.n[i] = ob.n[j]; base.c2[i] = ob.c2[j]; base.dBase[i] = ob.dBase[j];
        if (ox === sx && oy === sy) base.imageLevel[i] = ob.imageLevel[j];
      }
    base.edge = old.edge;
    base.edgeOn = old.edgeOn;
    for (const s of this.sources) {
      s.x += dx; s.y += dy; s.x2 += dx; s.y2 += dy;
      if (s.baked) s.baked = s.baked.map(e => ({ ...e, x: e.x + dx, y: e.y + dy }));
    }
    for (const s of this.shapes) { s.x += dx; s.y += dy; }
    for (const o of this.optics) { o.x += dx; o.y += dy; }
    this.logic?.shift(dx, dy);
    const probes = this.probeList().map(p => ({ ...p, x: p.x + dx, y: p.y + dy, x2: p.x2 + dx, y2: p.y2 + dy }));
    const m = this.view.measure, mv = (p: Pt) => ({ x: p.x + dx, y: p.y + dy });
    const measure = { ruler: m.ruler && { a: mv(m.ruler.a), b: mv(m.ruler.b) }, protractor: m.protractor && { v: mv(m.protractor.v), a: mv(m.protractor.a), b: mv(m.protractor.b) } };
    base.shapes = this.shapes;
    this.load(base, this.sources, probes, this.optics, true);
    this.engine.writeState(field, W0, H0, dx, dy);
    this.engine.time = time;
    this.view.measure = measure;
    this.selection = sel;
    if (running) this.running = true;
    this.notify();
  }

  /** Loads the same scene again (base layer, sources, probes, optics), e.g. after a setting that needs a restart. */
  reload(): void {
    const base = this.baseScene.clone();
    base.edge = this.scene.edge;
    base.edgeOn = this.scene.edgeOn;
    base.shapes = this.shapes;
    this.load(base, this.sources, this.probeList(), this.optics, true);
  }

  // ------------------------------------------------------------------------------------------ optical elements

  /** Lenses, mirrors, prisms... drawn on top of the base layer (see optics.ts). */
  optics: OpticSpec[] = [];
  /** Walls, glass and absorbers as objects (see shapes.ts), drawn on top of the base layer, under the optics. */
  shapes: ShapeSpec[] = [];
  /** The element the Optics tool places next. */
  opticTemplate: OpticSpec = newOptic("convex");
  /** The scene without the shapes and optical elements: what painting changes. */
  baseScene: Scene = new Scene(1, 1);

  /** Redraws one rectangle: the base layer, then every element that reaches into it; then sends it to the GPU. */
  rasterize(rx0: number, ry0: number, rx1: number, ry1: number): void {
    const s = this.scene, b = this.baseScene, W = s.width;
    const x0 = Math.max(0, Math.floor(rx0)), y0 = Math.max(0, Math.floor(ry0));
    const x1 = Math.min(W - 1, Math.ceil(rx1)), y1 = Math.min(s.height - 1, Math.ceil(ry1));
    if (x0 > x1 || y0 > y1) return;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x;
        s.n[i] = b.n[i]; s.c2[i] = b.c2[i]; s.dBase[i] = b.dBase[i];
      }
    const clip = { x0, y0, x1, y1 };
    for (const sh of this.shapes) {
      const sb = shapeBounds(sh);
      if (sb.x1 >= x0 && sb.x0 <= x1 && sb.y1 >= y0 && sb.y0 <= y1) drawShape(s, sh, clip);
    }
    for (const o of this.optics) {
      const ob = opticBounds(o);
      if (ob.x1 >= x0 && ob.x0 <= x1 && ob.y1 >= y0 && ob.y0 <= y1) drawOptic(s, o, clip);
    }
    for (const hs of this.housingsDrawn) {
      const hb = housingBounds(hs);
      if (hb.x1 >= x0 && hb.x0 <= x1 && hb.y1 >= y0 && hb.y0 <= y1) drawHousing(s, hs, clip);
    }
    s.applyEdgeRect(x0, y0, x1, y1);
    this.engine.updateMaterial(x0, y0, x1, y1);
    this.sceneInfo.dirty = true;
  }

  private redrawOptic(o: OpticSpec, before?: { x0: number; y0: number; x1: number; y1: number }): void {
    const a = opticBounds(o), b = before ?? a;
    this.rasterize(Math.min(a.x0, b.x0), Math.min(a.y0, b.y0), Math.max(a.x1, b.x1), Math.max(a.y1, b.y1));
  }

  addOptic(o: OpticSpec): void {
    this.optics.push(o);
    this.selection = { kind: "optic", id: o.id };
    this.redrawOptic(o);
    this.notify();
  }

  // ------------------------------------------------------------------------------------------ shapes

  addShape(s: ShapeSpec): void {
    this.shapes.push(s);
    this.selection = { kind: "shape", id: s.id };
    this.updateShape(s);
    this.notify();
  }

  /** Call after changing a shape; `before` = its bounds before the change. */
  updateShape(s: ShapeSpec, before?: { x0: number; y0: number; x1: number; y1: number }): void {
    const a = shapeBounds(s), b = before ?? a;
    this.rasterize(Math.min(a.x0, b.x0), Math.min(a.y0, b.y0), Math.max(a.x1, b.x1), Math.max(a.y1, b.y1));
  }

  removeShape(id: number): void {
    const s = this.shapes.find(e => e.id === id);
    if (!s) return;
    this.shapes = this.shapes.filter(e => e !== s);
    if (this.selection?.kind === "shape" && this.selection.id === id) this.selection = null;
    this.updateShape(s);
    this.notify();
  }

  /** Call after changing an element's settings; `before` = its bounds before the change. */
  updateOptic(o: OpticSpec, before: { x0: number; y0: number; x1: number; y1: number }): void {
    this.redrawOptic(o, before);
  }

  removeOptic(id: number): void {
    const o = this.optics.find(e => e.id === id);
    if (!o) return;
    this.optics = this.optics.filter(e => e !== o);
    if (this.selectedOptic === id) this.selection = null;
    this.redrawOptic(o);
    this.notify();
  }

  /** The housings of the lasers among these sources. */
  private housings(sources: SourceSpec[]): Housing[] {
    return sources.filter(s => s.kind === "laser" && s.enabled && s.hasPosition)
      .map(s => ({ x: s.x, y: s.y, angleDeg: s.angleDeg, halfWidth: Math.ceil(1.8 * Math.max(2, s.beamWidth)) }));
  }

  /** The housings now drawn in the scene (compared on every source change, so moved lasers take theirs along). */
  private housingsDrawn: Housing[] = [];

  /** Sends the current sources to the engine (after any change to `sources`). The field is kept. */
  refreshSources(): void {
    const now = this.housings(this.sources);
    if (JSON.stringify(now) !== JSON.stringify(this.housingsDrawn)) {
      const old = this.housingsDrawn;
      this.housingsDrawn = now;
      for (const hs of [...old, ...now]) { const b = housingBounds(hs); this.rasterize(b.x0, b.y0, b.x1, b.y1); }
    }
    this.engine.setSources(this.useObjectSources ? this.sources.flatMap(elementsOf) : []);
    this.moveSources(this.engine.time);
  }

  // ------------------------------------------------------------------------------------------ moving sources

  /** Point sources that move (the Doppler effect). */
  get movingSources(): SourceSpec[] {
    return this.useObjectSources ? this.sources.filter(s => s.enabled && s.hasPosition && s.kind === "point" && !!s.motion) : [];
  }

  /** Wave speed in empty space, cells per step (what a moving source's Mach number is measured against). */
  get waveSpeed(): number { return continuumSpeed(1, this.stencil); }

  /** Where a source is now (a moving one is not at its starting point). */
  sourcePos(s: SourceSpec, t = this.engine.time): Pt {
    return s.motion && s.kind === "point" ? motionPosition(s, t, this.waveSpeed, this.scene.width, this.scene.height) : { x: s.x, y: s.y };
  }

  /** Puts the moving sources where they are at step t. */
  private moveSources(t: number, list = this.movingSources): void {
    this.engine.setMovingSources(list.flatMap(s => movingElements(s, t, this.waveSpeed, this.scene.width, this.scene.height)));
  }

  /**
   * Runs n steps with everything that happens between steps: the step hook (wave circuits, experiments) and the moving
   * sources. Without either, the engine takes all n at once.
   */
  advance(n: number): void {
    const moving = this.movingSources;
    if (!this.stepHook && !moving.length) { this.engine.step(n); return; }
    for (let k = 0; k < n; k++) {
      this.stepHook?.(this.engine.time);
      if (moving.length) this.moveSources(this.engine.time, moving);
      this.engine.step(1);
    }
  }

  /**
   * Sets the probes. A probe given with the id of one already there keeps its colour, its label and (if it measures
   * the same thing at the same place) its record; new ones get the first free colour and number.
   */
  /**
   * Sets all the probes. A probe whose id is already there keeps its id, colour, label and record; one that comes back
   * (undo) gets its old id, colour and label again when they are free; a new one gets the next free ones.
   */
  setProbes(probes: NewProbe[]): void {
    const old = new Map(this.probes.map(p => [p.id, p]));
    const kept = probes.map(p => (p.id !== undefined ? old.get(p.id) : undefined));
    const ids = new Set(kept.filter(Boolean).map(p => p!.id));
    const colors = new Set(kept.filter(Boolean).map(p => p!.color));
    const labels = new Set(kept.filter(Boolean).map(p => p!.label));
    const take = <T>(set: Set<T>, v: T | undefined) => (v !== undefined && !set.has(v) ? (set.add(v), v) : undefined);
    const free = (prefix: string) => { for (let n = 1; ; n++) if (!labels.has(`${prefix}${n}`)) { labels.add(`${prefix}${n}`); return `${prefix}${n}`; } };
    const freeColor = () => { const c = PROBE_COLORS.find(x => !colors.has(x)) ?? PROBE_COLORS[colors.size % PROBE_COLORS.length]; colors.add(c); return c; };
    const before = new Map(this.probes.map(p => [p.id, p]));
    this.probes = probes.map((p, i) => {
      const k = kept[i];
      if (k) return { ...p, id: k.id, color: k.color, label: k.label };
      const id = take(ids, p.id) ?? this.nextProbeId++;
      this.nextProbeId = Math.max(this.nextProbeId, id + 1);
      return { ...p, id, color: take(colors, p.color) ?? freeColor(), label: take(labels, p.label) ?? free(p.kind === "point" ? "P" : "L") };
    });
    this.applyProbes(before);
  }

  /** An experiment sets its own probes: during an experiment the probes the reader placed stay. */
  setOwnProbes(probes: NewProbe[]): void {
    this.setProbes(this.keepMine ? [...probes.filter(p => !p.mine), ...this.probeList().filter(p => p.mine)] : probes);
  }
  private nextProbeId = 1;

  /** The probes that are measured, in engine order: the active point probes, then the active line probes. */
  get pointProbes(): ProbeSpec[] { return this.probes.filter(p => p.kind === "point" && p.active !== false); }
  get lineProbes(): ProbeSpec[] { return this.probes.filter(p => p.kind === "line" && p.active !== false); }

  private records = new Map<number, { h: number[]; total: number }>();

  /** Sends the probes to the engine. Records of point probes that still measure the same thing at the same place stay. */
  private applyProbes(before = new Map<number, ProbeSpec>()): void {
    const pts = this.pointProbes, lns = this.lineProbes;
    this.engine.setProbes(
      pts.map(p => ({ x: p.x, y: p.y, quantity: p.measurement === "amplitude" ? "field" : "intensity" })),
      lns.map(p => ({ x0: p.x, y0: p.y, x1: p.x2, y1: p.y2, quantity: p.measurement === "amplitude" ? "field" : "intensity",
        integrate: p.measurement === "integrated", startAfter: p.startAfter ?? -1 })),
    );
    const same = (p: ProbeSpec) => { const b = before.get(p.id); return !!b && b.x === p.x && b.y === p.y && b.measurement === p.measurement && b.active !== false && b.startAfter === p.startAfter; };
    const keep = pts.filter(same);
    if (!keep.length) {
      this.historyStart = this.engine.time;
      this.records = new Map(pts.map(p => [p.id, { h: [], total: 0 }]));
    } else {
      // a new probe's record starts with gaps, so every record lines up with historyStart
      const len = this.records.get(keep[0].id)?.h.length ?? 0;
      this.records = new Map(pts.map(p => [p.id, same(p) && this.records.has(p.id) ? this.records.get(p.id)! : { h: new Array<number>(len).fill(NaN), total: 0 }]));
    }
    this.history = pts.map(p => this.records.get(p.id)!.h);
    this.profiles = [];
  }

  /** Experiments keep the probes the reader places (see `mine`). */
  keepMine = false;

  /** Removes the probes the reader placed during an experiment. */
  clearMine(): void {
    if (!this.probes.some(p => p.mine)) return;
    this.setProbes(this.probeList().filter(p => !p.mine));
    this.notify();
  }

  /** Adds a probe; returns its id. */
  addProbe(p: NewProbe): number {
    this.setProbes([...this.probeList(), p]);
    this.notify();
    return this.probes[this.probes.length - 1].id;
  }

  /** The probes as they are (with their ids), for setProbes. */
  probeList(): NewProbe[] {
    return this.probes.map(p => ({ ...p }));
  }

  removeProbe(id: number): void {
    this.setProbes(this.probeList().filter(p => p.id !== id));
    if (this.selection?.kind === "probe" && this.selection.id === id) this.selection = null;
    this.notify();
  }

  /**
   * Removes sources from the scene together with their light: the waves are cleared at once (they would otherwise
   * travel on, and bounce around glass and walls, for a long time) and the remaining sources start shining again.
   */
  removeSources(gone: SourceSpec[]): void {
    if (!gone.length) return;
    this.sources = this.sources.filter(s => !gone.includes(s));
    if (this.selectedSource !== null && gone.some(s => s.id === this.selectedSource)) this.selection = null;
    this.logic?.prune(this.sources);
    this.refreshSources();
    this.engine.clearField();
    this.notify();
  }

  reset(): void {
    this.engine.reset();
    this.moveSources(0);
    for (const r of this.records.values()) { r.h.length = 0; r.total = 0; }
    this.historyStart = 0;
    this.profiles = [];
  }

  set stencil(s: Stencil) { this.engine.settings.stencil = s; }
  get stencil(): Stencil { return this.engine.settings.stencil; }
  get time(): number { return this.engine.time; }

  get viewMode(): Quantity { return this.view_; }
  set viewMode(q: Quantity) { this.view_ = q; void this.applyScheme(); }

  async loadSchemeList(): Promise<void> {
    try {
      this.schemes = await (await fetch("colorschemes/index.json")).json();
    } catch { this.schemes = []; }
    await this.applyScheme();
  }

  async setScheme(q: Quantity, file: string): Promise<void> {
    this.scheme[q] = file;
    await this.applyScheme();
  }

  setBlackLevel(q: Quantity, v: number): void {
    this.blackLevel[q] = v;
    void this.applyScheme();
  }

  /** The scheme file for a scheme name as the Windows app stores it (names are matched ignoring case). */
  schemeFile(name: string): string | undefined {
    const n = name.toLowerCase();
    return this.schemes.find(s => s.name.toLowerCase() === n || s.file.toLowerCase() === n || s.file.toLowerCase() === `${n}.json`)?.file;
  }

  /** Adds or replaces a scheme made in the colour editor (kept in memory; the editor stores it in the browser). */
  putScheme(info: ColorSchemeInfo & { colors: number[][] }): void {
    this.schemes = [...this.schemes.filter(s => s.file !== info.file), info];
    this.lutCache.set(info.file, info.colors);
    void this.applyScheme();
  }

  async schemeColors(file: string, q: Quantity = this.view_): Promise<number[][]> {
    let colors = this.lutCache.get(file);
    if (!colors) {
      try {
        colors = (await (await fetch(`colorschemes/${file}`)).json()).colors as number[][];
      } catch {
        colors = defaultLut(q);
      }
      this.lutCache.set(file, colors);
    }
    return colors;
  }

  private async applyScheme(): Promise<void> {
    const q = this.view_, file = this.scheme[q];
    const colors = await this.schemeColors(file, q);
    if (this.scheme[this.view_] === file && this.view_ === q) this.engine.setColorScheme(colors, this.blackLevel[q]);
  }

  /** Runs until the simulation reaches this step (at the normal speed), then calls done. */
  runUntil(step: number, done: () => void = () => {}): void {
    this.stepTarget = { step, done };
    this.running = true;
  }

  onFrame(f: () => void): () => void {
    this.frameListeners.push(f);
    return () => { this.frameListeners = this.frameListeners.filter(g => g !== f); };
  }

  // ------------------------------------------------------------------------------------------ frame loop

  /** The GPU context is gone for the moment; nothing is drawn until the browser gives it back. */
  contextLost = false;
  restoredListeners: (() => void)[] = [];
  /** Called when the context stays lost (the browser did not give it back). */
  lostListeners: (() => void)[] = [];

  /** True while a video is being recorded: the normal frame loop then leaves the engine alone. */
  exporting = false;

  displayBase(): Omit<DisplayOptions, "offsetX" | "offsetY" | "cellsPerPx"> {
    return { mode: this.view_, brightness: (this.brightness[this.view_] * this.brightnessPct) / 100, showMaterial: this.showMaterial,
      showSources: this.showSources, outlines: this.showOutlines, background: [0.07, 0.07, 0.08] };
  }

  /** "3d": the field drawn as a surface you can turn around (view only; the simulation is the same). */
  dim: "2d" | "3d" = "2d";
  /** 3D view: wave height (units of half the scene's longest side) and mesh vertices along the longest side. */
  waveHeight = 0.12;
  meshDetail = 640;

  /** White light: eight colours at once, in true colour (see core/spectrum.ts); glass disperses them. */
  get whiteLight(): boolean { return this.engine.whiteLight; }
  /** How much stronger than real glass the dispersion is in white light (1 = real crown glass). */
  get dispersion(): number { return this.engine.dispersion; }

  /** Switches white light on or off (the waves start again), with this much dispersion. */
  setWhiteLight(on: boolean, dispersion = this.engine.dispersion): void {
    if (on === this.whiteLight && dispersion === this.engine.dispersion) return;
    this.engine.setWhiteLight(on, dispersion);
    // the 3D surface shows one wave: white light is seen flat
    if (on && this.dim === "3d") this.dim = "2d";
    this.historyStart = this.engine.time;
    this.notify();
  }

  /** Draws the simulation and the overlay as the view shows them. */
  renderView(): void {
    if (this.dim === "3d" && this.whiteLight) this.dim = "2d";
    this.view.mode3d = this.dim === "3d";
    if (this.dim === "3d") {
      const cam = this.view.camera();
      this.engine.render3D({ ...this.displayBase(), mvp: cam.mvp, eye: cam.eye, amp: this.waveHeight, detail: this.meshDetail });
      this.view.clearOverlay(this.exporting ? "" : "3D view — drag to turn, right-drag to move, wheel to zoom");
      return;
    }
    this.view.overlay = this.buildOverlay();
    this.view.display(this.displayBase());
  }

  private frame(now: number): void {
    if (this.exporting || this.contextLost) { requestAnimationFrame(t => this.frame(t)); return; }
    if (this.running) {
      // fractional speeds: carry the remainder over to the next frames
      this.stepCarry += this.preparing ? this.prepareSpeed : this.stepsPerFrame;
      let n = Math.floor(this.stepCarry);
      this.stepCarry -= n;
      if (this.stepTarget) n = Math.min(n, Math.max(0, this.stepTarget.step - this.engine.time));
      if (this.stopAt > 0) n = Math.min(n, Math.max(0, this.stopAt - this.engine.time));
      this.advance(n);
      this.lastStats.steps += n;
      if (this.stopAt > 0 && this.engine.time >= this.stopAt) this.running = false;
      if (this.stepTarget && this.engine.time >= this.stepTarget.step) {
        const d = this.stepTarget.done;
        this.stepTarget = null;
        this.running = false;
        d();
      }
    }
    if (this.brightnessFade) {
      const f = this.brightnessFade, k = Math.min(1, (now - f.t0) / f.ms), e = k * k * (3 - 2 * k);
      // fade on a log scale (equal steps look equal)
      this.brightness[f.q] = f.from * (f.to / f.from) ** e;
      if (k >= 1) this.brightnessFade = null;
    }
    this.collectProbes();
    this.renderView();
    this.lastStats.frames++;
    if (now - this.lastStats.t > 500) {
      const dt = (now - this.lastStats.t) / 1000;
      this.stats = { fps: this.lastStats.frames / dt, stepsPerSec: this.lastStats.steps / dt };
      this.lastStats = { t: now, steps: 0, frames: 0 };
    }
    for (const f of this.frameListeners) f();
    requestAnimationFrame(t => this.frame(t));
  }

  private collectProbes(): void {
    if (!this.probes.length) return;
    const samples = this.engine.takeSamples();
    const pts = this.pointProbes;
    samples.forEach((s, i) => {
      const p = pts[i], r = p && this.records.get(p.id);
      if (!r) return;
      if (p.measurement === "integrated") {
        // a running total of the intensity (ProbeCollector), from "start after step" on
        const first = this.engine.time - s.length + 1, start = p.startAfter ?? -1;
        s.forEach((v, k) => { if (first + k > start) r.total += v; r.h.push(r.total); });
      } else for (const v of s) r.h.push(v);
    });
    const over = (this.history[0]?.length ?? 0) - HISTORY_KEEP;
    if (over > 0) {
      for (const h of this.history) h.splice(0, over);
      this.historyStart += over;
    }
    if (this.lineProbes.length) this.profiles = this.engine.readProfiles();
  }

  private sourceColors = new Map<number, string>();

  /** A source's own colour: the first one of the palette no other current source has, kept for as long as it lives. */
  sourceColor(s: SourceSpec): string {
    let c = this.sourceColors.get(s.id);
    if (!c) {
      const used = new Set(this.sources.filter(o => o !== s).map(o => this.sourceColors.get(o.id)));
      c = SOURCE_COLORS.find(x => !used.has(x)) ?? SOURCE_COLORS[(s.id - 1) % SOURCE_COLORS.length];
      this.sourceColors.set(s.id, c);
    }
    return c;
  }

  // ------------------------------------------------------------------------------------------ objects as a whole

  /** Every object (sources, probes, shapes, optical elements, the wave circuit) as JSON: an undo step. */
  objectsJSON(): string {
    return JSON.stringify({ sources: this.sources, probes: this.probeList(), shapes: this.shapes, optics: this.optics, logic: this.logic && !this.logic.empty ? this.logic.toJSON(this.sources) : null });
  }

  /** Puts the objects back as objectsJSON recorded them (undo, redo). The waves are kept. */
  applyObjects(json: string): void {
    const d = JSON.parse(json) as { sources: SourceSpec[]; probes: NewProbe[]; shapes: ShapeSpec[]; optics: OpticSpec[]; logic: LogicJSON | null };
    const gone = [...this.shapes.map(shapeBounds), ...this.optics.map(opticBounds)];
    this.sources = d.sources;
    this.shapes = d.shapes;
    this.optics = d.optics;
    const boxes = boxes4(this);
    for (const b of [...gone, ...boxes]) this.rasterize(b.x0, b.y0, b.x1, b.y1);
    this.setProbes(d.probes);
    const showBoxes = this.logic?.showBoxes ?? false;
    if (d.logic) {
      const c = Circuit.fromJSON(this, d.logic, this.sources);
      c.showBoxes = showBoxes;
      c.attach();
    } else if (this.logic) { this.logic = null; this.stepHook = null; }
    this.refreshSources();
    const sel = this.selection;
    if (sel && !this.exists(sel)) this.selection = null;
    this.notify();
  }

  /** Is the selected thing still there? */
  exists(sel: Selection): boolean {
    switch (sel.kind) {
      case "source": return this.sources.some(s => s.id === sel.id);
      case "probe": return this.probes.some(p => p.id === sel.id);
      case "shape": return this.shapes.some(s => s.id === sel.id);
      case "optic": return this.optics.some(o => o.id === sel.id);
      case "switch": return !!this.logic?.switches.some(s => s.id === sel.id);
      case "detector": return !!this.logic?.detectors.some(s => s.id === sel.id);
      case "transistor": return !!this.logic?.transistors.some(s => s.id === sel.id);
    }
  }

  private buildOverlay(): Overlay { return buildOverlay(this); }

  /** The probe under the cell (a point probe, a line probe's end or its line), or -1. */
  probeNear(cell: Pt): number {
    const hit = this.selector.hit(cell, "pointProbe");
    return hit ? this.probes.findIndex(p => p.id === hit.id) : -1;
  }

  opticNear(cell: Pt): OpticSpec | undefined {
    const slack = Math.max(3, 6 * this.view.scale);
    for (let i = this.optics.length - 1; i >= 0; i--) if (opticHit(this.optics[i], cell.x, cell.y, slack)) return this.optics[i];
    return undefined;
  }

  /** Listeners for changes the sandbox panel shows (sources, probes, selection). */
  changed: (() => void)[] = [];
  notify(): void { for (const f of this.changed) f(); }

  sourceNear(cell: Pt): SourceSpec | undefined {
    const r = Math.max(4, 8 * this.view.scale);
    return this.sources.find(s => { const p = this.sourcePos(s); return Math.hypot(p.x + 0.5 - cell.x, p.y + 0.5 - cell.y) <= r; });
  }

  /** How the paint tools draw: freehand, a straight line, a box outline or a filled box. */
  paintShape: PaintShape = "free";

  /**
   * Sets the brightness of these views (default: the one shown) so that the strongest 0.5% of the cells just reach
   * full colour. Cells close to a source (always strong) do not count, and the field view uses the wave's envelope
   * (from the averaged intensity), so the result does not depend on the moment in the wave's cycle. fade: change
   * smoothly instead of at once.
   */
  autoBrightness(views: Quantity[] = [this.view_], fade = false): void {
    if (this.whiteLight) return this.autoColourBrightness(views, fade);
    const st = this.engine.readState();
    const scale = this.engine.settings.intensityScale;
    const W = this.scene.width, n = W * this.scene.height, stride = Math.max(1, Math.floor(n / 200000));
    // keep out about one and a half wavelengths around every source
    const near = this.sources.filter(s => s.enabled && s.hasPosition).map(s => {
      const r = Math.max(6, 1.5 * continuumWavelength(omegaOfLevel(s.level, this.engine.settings.frequencyScale), 1));
      return s.kind === "line" ? { x0: s.x, y0: s.y, x1: s.x2, y1: s.y2, r } : { x0: s.x, y0: s.y, x1: s.x, y1: s.y, r: r + Math.max(s.countX * s.spacingX, s.countY * s.spacingY) / 2 };
    });
    const isNear = (x: number, y: number) => near.some(q => {
      const dx = q.x1 - q.x0, dy = q.y1 - q.y0, l2 = dx * dx + dy * dy;
      const t = l2 ? Math.max(0, Math.min(1, ((x - q.x0) * dx + (y - q.y0) * dy) / l2)) : 0;
      return (x - q.x0 - t * dx) ** 2 + (y - q.y0 - t * dy) ** 2 < q.r * q.r;
    });
    const vals: Record<Quantity, number[]> = { field: [], intensity: [] };
    for (let i = 0; i < n; i += stride) {
      if (near.length && isNear(i % W, Math.floor(i / W))) continue;
      const mean2 = Math.max(0, (st[i * 4 + 2] + st[i * 4 + 3]) * 0.5);
      // amplitude envelope: a sine of amplitude A has a mean square of A² / 2
      const f = Math.max(Math.abs(st[i * 4]), Math.sqrt(2 * mean2)), v = Math.sqrt(mean2 * scale);
      if (f > 0) vals.field.push(f);
      if (v > 0) vals.intensity.push(v);
    }
    for (const q of views) {
      const list = vals[q];
      if (list.length < 10) continue;
      list.sort((a, b) => a - b);
      const p = list[Math.floor(list.length * 0.995)];
      if (!(p > 0)) continue;
      const b = Math.min(1000, Math.max(0.1, 0.9 / p));
      if (fade) this.fadeBrightness(q, b, 500); else this.brightness[q] = b;
    }
  }

  /**
   * White light: the brightest 0.5% of the cells (by their strongest colour) just reach full colour. The picture shows
   * linear light × brightness², and the field view's light now peaks at twice its average.
   */
  private autoColourBrightness(views: Quantity[], fade: boolean): void {
    const c = this.engine.readColour();
    if (!c) return;
    const n = c.length / 4, stride = Math.max(1, Math.floor(n / 200000)), vals: number[] = [];
    for (let i = 0; i < n; i += stride) { const v = Math.max(c[i * 4], c[i * 4 + 1], c[i * 4 + 2]); if (v > 0) vals.push(v); }
    if (vals.length < 10) return;
    vals.sort((a, b) => a - b);
    const p = vals[Math.floor(vals.length * 0.995)];
    if (!(p > 0)) return;
    for (const q of views) {
      const b = Math.min(1000, Math.max(0.1, Math.sqrt(0.9 / (q === "field" ? 2 * p : p))));
      if (fade) this.fadeBrightness(q, b, 500); else this.brightness[q] = b;
    }
  }

  /** The Auto button: the shown view to full colour at 100%, fading from exactly what is on screen now. */
  autoExposure(): void {
    const q = this.view_;
    // fold the % into the base value first, so switching the % to 100 changes nothing on screen
    for (const v of ["field", "intensity"] as Quantity[]) this.brightness[v] = (this.brightness[v] * this.brightnessPct) / 100;
    this.brightnessPct = 100;
    this.autoBrightness([q], true);
  }

  /**
   * Chooses the brightness of a new scene before it is shown: runs its first steps unseen, measures both views, and
   * starts again from step 0. (Measuring while it runs would make the picture jump once the waves have spread.)
   */
  calibrateBrightness(steps = 400): void {
    if (!this.sources.some(s => s.enabled) && !this.scene.imageLevel.some(v => v > 0)) return;
    this.advance(steps);
    this.autoBrightness(["field", "intensity"]);
    this.reset();
  }

  private brightnessFade: { q: Quantity; from: number; to: number; t0: number; ms: number } | null = null;

  /** Changes a view's brightness smoothly (over `ms`), for scenes that can only measure it once they have run a while. */
  fadeBrightness(q: Quantity, to: number, ms = 700): void {
    this.brightnessFade = { q, from: this.brightness[q], to, t0: performance.now(), ms };
  }

  /** Saves what is on screen as a PNG. */
  screenshot(name = "wave-dude.png"): void {
    const c = document.createElement("canvas");
    c.width = this.engine.canvas.width;
    c.height = this.engine.canvas.height;
    const g = c.getContext("2d")!;
    g.drawImage(this.engine.canvas, 0, 0);
    g.drawImage(this.view.overlayCanvas, 0, 0);
    c.toBlob(b => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  }
}

/** Bounds of the shapes and optical elements now in the sim. */
function boxes4(sim: Sim): { x0: number; y0: number; x1: number; y1: number }[] {
  return [...sim.shapes.map(shapeBounds), ...sim.optics.map(opticBounds)];
}

/** Gray scale, used when the colour scheme files cannot be loaded. */
function defaultLut(q: Quantity): number[][] {
  return Array.from({ length: 255 }, (_, i) => {
    const v = q === "field" ? Math.round(Math.abs(i - 127) * 2) : i;
    return [v, v, v];
  });
}
