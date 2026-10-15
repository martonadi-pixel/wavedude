// Wave Dude 2D web - one running simulation: the engine, its view, the scene, the sources, the probes and the
// frame loop. The experiments and the sandbox both drive this.
// GPL-3.0-or-later.

import { WaveEngine, type Quantity, type DisplayOptions } from "./engine/engine";
import { Scene, type Material, BARRIER, VACUUM } from "./engine/scene";
import { type SourceSpec, elementsOf, newSource, movingElements, motionPosition } from "./engine/sources";
import { type OpticSpec, newOptic, drawOptic, opticBounds, opticHit, type Housing, drawHousing, housingBounds } from "./engine/optics";
import { Viewport, type Tool, type Pt, emptyOverlay, type Overlay } from "./view/viewport";
import { type Stencil, continuumWavelength, continuumSpeed, omegaOfLevel } from "./engine/physics";
import { type Stamp, type PaintShape, paintStamp, stampBounds, stampDepth, snapAngle } from "./engine/paint";
import { type SceneInfo, type ProjectMeta, newSceneInfo, newMeta } from "./project/project";
import type { Circuit, Detector } from "./logic/circuit";
import { isLogicTool, logicTool, logicOverlay } from "./logic/editor";

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

export type NewProbe = Omit<ProbeSpec, "id" | "color" | "label">;

/** The tools that paint material. */
export type PaintTool = "glass" | "barrier" | "absorber" | "erase";

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
  selectedSource: number | null = null;

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
  private lineDraft: SourceSpec | null = null;
  private probeDraft: ProbeSpec | null = null;
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
    this.view.onTool = (tool, phase, cell, start) => this.toolAction(tool, phase, cell, start);
    // the reader's own probes can always be moved, even where the experiment's things stay put
    // and the input switches of a wave circuit can always be flipped with a click
    this.view.canGrab = cell => this.grabbable ? !!this.sourceNear(cell) || this.probeNear(cell) >= 0 || !!this.detectorNear(cell) || !!this.opticNear(cell)
      : !!this.probes[this.probeNear(cell)]?.mine || !!this.logic?.switchAt(cell, this.grabRadius());
    this.view.onGrab = (phase, cell, start) => this.grab(phase, cell, start);
    // the GPU can drop the context (driver reset, a crashed video decoder...): ask for it back and rebuild
    canvas.addEventListener("webglcontextlost", e => {
      e.preventDefault();
      this.contextLost = true;
      setTimeout(() => { if (this.contextLost) for (const f of this.lostListeners) f(); }, 4000);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      this.engine.restore();
      this.contextLost = false;
      this.history = this.history.map(() => []);
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
    // the scene as loaded or painted is the base layer; optical elements are drawn on top of a copy of it
    this.baseScene = scene.clone();
    this.stepHook = null;
    if (!keepLogic) this.logic = null;
    this.optics = optics;
    this.selectedOptic = null;
    const all = { x0: 0, y0: 0, x1: scene.width - 1, y1: scene.height - 1 };
    for (const o of optics) drawOptic(scene, o, all);
    this.housingsDrawn = this.housings(sources);
    for (const hs of this.housingsDrawn) drawHousing(scene, hs, all);
    this.scene = scene;
    this.sources = sources;
    this.selectedSource = null;
    // drawing changes dBase only; the damping the simulation uses (d) is dBase plus the edge
    scene.applyEdge();
    this.engine.setScene(scene);
    this.annotations = emptyOverlay();
    this.view.measure = { ruler: null, protractor: null };
    this.setProbes(probes);
    this.refreshSources();
    this.logic?.attach();
    this.view.fit();
  }

  /** Loads the same scene again (base layer, sources, probes, optics), e.g. after a setting that needs a restart. */
  reload(): void {
    const base = this.baseScene.clone();
    base.edge = this.scene.edge;
    base.edgeOn = this.scene.edgeOn;
    this.load(base, this.sources, this.probeList(), this.optics, true);
  }

  // ------------------------------------------------------------------------------------------ optical elements

  /** Lenses, mirrors, prisms... drawn on top of the base layer (see optics.ts). */
  optics: OpticSpec[] = [];
  selectedOptic: number | null = null;
  /** The element the Optics tool places next. */
  opticTemplate: OpticSpec = newOptic("convex");
  /** The scene without the optical elements: what painting changes. */
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
    this.selectedOptic = o.id;
    this.redrawOptic(o);
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
    if (this.selectedOptic === id) this.selectedOptic = null;
    this.redrawOptic(o);
    this.notify();
  }

  opticNear(cell: Pt): OpticSpec | undefined {
    const slack = Math.max(3, 6 * this.view.scale);
    for (let i = this.optics.length - 1; i >= 0; i--) if (opticHit(this.optics[i], cell.x, cell.y, slack)) return this.optics[i];
    return undefined;
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

  setProbes(probes: NewProbe[]): void {
    // during an experiment the reader's own probes stay when the experiment sets its probes again
    if (this.keepMine && !probes.some(p => p.mine)) probes = [...probes, ...this.probeList().filter(p => p.mine)];
    let points = 0, lines = 0;
    this.probes = probes.map((p, i) => ({
      ...p, id: i + 1, color: PROBE_COLORS[i % PROBE_COLORS.length],
      label: p.kind === "point" ? `P${++points}` : `L${++lines}`,
    }));
    this.applyProbes();
  }

  /** The probes that are measured, in engine order: the active point probes, then the active line probes. */
  get pointProbes(): ProbeSpec[] { return this.probes.filter(p => p.kind === "point" && p.active !== false); }
  get lineProbes(): ProbeSpec[] { return this.probes.filter(p => p.kind === "line" && p.active !== false); }

  private applyProbes(): void {
    const pts = this.pointProbes, lns = this.lineProbes;
    this.engine.setProbes(
      pts.map(p => ({ x: p.x, y: p.y, quantity: p.measurement === "amplitude" ? "field" : "intensity" })),
      lns.map(p => ({ x0: p.x, y0: p.y, x1: p.x2, y1: p.y2, quantity: p.measurement === "amplitude" ? "field" : "intensity",
        integrate: p.measurement === "integrated", startAfter: p.startAfter ?? -1 })),
    );
    this.runningTotals = pts.map(() => 0);
    this.history = pts.map(() => []);
    this.historyStart = this.engine.time;
    this.profiles = [];
  }

  /** Experiments keep the probes the reader places (see `mine`). */
  keepMine = false;

  /** Removes the probes the reader placed during an experiment. */
  clearMine(): void {
    if (!this.probes.some(p => p.mine)) return;
    const keep = this.keepMine;
    this.keepMine = false;
    this.setProbes(this.probeList().filter(p => !p.mine));
    this.keepMine = keep;
    this.notify();
  }

  addProbe(p: NewProbe): void {
    this.setProbes([...this.probeList(), p]);
  }

  /** The probes without their display fields, for setProbes. */
  probeList(): NewProbe[] {
    return this.probes.map(({ id: _i, color: _c, label: _l, ...rest }) => rest);
  }

  removeProbe(id: number): void {
    this.setProbes(this.probes.filter(p => p.id !== id).map(({ id: _i, color: _c, label: _l, ...rest }) => rest));
  }

  /**
   * Removes sources from the scene together with their light: the waves are cleared at once (they would otherwise
   * travel on, and bounce around glass and walls, for a long time) and the remaining sources start shining again.
   */
  removeSources(gone: SourceSpec[]): void {
    if (!gone.length) return;
    this.sources = this.sources.filter(s => !gone.includes(s));
    if (this.selectedSource !== null && gone.some(s => s.id === this.selectedSource)) this.selectedSource = null;
    this.logic?.prune(this.sources);
    this.refreshSources();
    this.engine.clearField();
    this.notify();
  }

  reset(): void {
    this.engine.reset();
    this.moveSources(0);
    this.history = this.history.map(() => []);
    this.runningTotals = this.runningTotals.map(() => 0);
    this.historyStart = 0;
    this.profiles = [];
  }

  private runningTotals: number[] = [];

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

  /** Draws the simulation and the overlay as the view shows them. */
  renderView(): void {
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
      const h = this.history[i];
      if (!h) return;
      const p = pts[i];
      if (p?.measurement === "integrated") {
        // a running total of the intensity (ProbeCollector), from "start after step" on
        const first = this.engine.time - s.length + 1, start = p.startAfter ?? -1;
        s.forEach((v, k) => { if (first + k > start) this.runningTotals[i] += v; h.push(this.runningTotals[i]); });
      } else for (const v of s) h.push(v);
    });
    const over = (this.history[0]?.length ?? 0) - HISTORY_KEEP;
    if (over > 0) {
      for (const h of this.history) h.splice(0, over);
      this.historyStart += over;
    }
    if (this.lineProbes.length) this.profiles = this.engine.readProfiles();
  }

  private sourceColors = new WeakMap<SourceSpec, string>();

  /** A source's own colour: the first one of the palette no other current source has, kept for as long as it lives. */
  sourceColor(s: SourceSpec): string {
    let c = this.sourceColors.get(s);
    if (!c) {
      const used = new Set(this.sources.filter(o => o !== s).map(o => this.sourceColors.get(o)));
      c = SOURCE_COLORS.find(x => !used.has(x)) ?? SOURCE_COLORS[(s.id - 1) % SOURCE_COLORS.length];
      this.sourceColors.set(s, c);
    }
    return c;
  }

  private buildOverlay(): Overlay {
    const o = emptyOverlay();
    if (this.showSources) {
      // in the sandbox each source carries its name on the canvas; experiments label their own scenes
      const named = this.owner === "sandbox";
      for (const s of this.sources) {
        if (!s.enabled) continue;
        const color = this.sourceColor(s), selected = s.id === this.selectedSource;
        const label = [named ? s.name : "", s.kind === "array" ? `${s.countX}×${s.countY}` : ""].filter(Boolean).join(" · ") || undefined;
        if (s.motion && s.kind === "point") { this.motionOverlay(o, s, color, selected, label); continue; }
        if (s.kind === "line") o.sources.push({ x: s.x, y: s.y, x2: s.x2, y2: s.y2, level: s.level, selected, color, label });
        else if (s.kind === "laser") this.laserOverlay(o, s, selected);
        else o.sources.push({ x: s.x, y: s.y, level: s.level, selected, color, label });
      }
      if (!this.useObjectSources) o.sources.length = 0;
      if (this.lineDraft) o.sources.push({ x: this.lineDraft.x, y: this.lineDraft.y, x2: this.lineDraft.x2, y2: this.lineDraft.y2, level: this.lineDraft.level });
      if (this.laserDraft) this.laserOverlay(o, this.laserDraft, true);
    }
    for (const p of [...this.probes.filter(q => q.active !== false), ...(this.probeDraft ? [this.probeDraft] : [])]) {
      if (p.kind === "point") o.pointProbes.push({ x: p.x, y: p.y, color: p.color, label: p.label });
      else o.lineProbes.push({ x0: p.x, y0: p.y, x1: p.x2, y1: p.y2, color: p.color, label: p.label });
    }
    if (this.showOutlines)
      for (const e of this.optics) {
        if (e.id === this.selectedOptic) continue;
        const b = opticBounds(e);
        o.labels.push({ x: e.x - 30, y: b.y0 - 6, text: e.name, color: "#9fe3ffcc" });
      }
    const so = this.optics.find(e => e.id === this.selectedOptic);
    if (so) {
      const b = opticBounds(so);
      o.labels.push({ x: so.x - 30, y: b.y0 - 6, text: `◆ ${so.name}`, color: "#7df9ff" });
    }
    o.labels.push(...this.annotations.labels);
    o.arrows.push(...this.annotations.arrows);
    o.boxes.push(...this.annotations.boxes);
    this.shapeOverlay(o);
    logicOverlay(this, o);
    return o;
  }

  /** The straight line or box being dragged out with a paint tool, as it will be painted. */
  private shapeOverlay(o: Overlay): void {
    const d = this.shapeDraft, st = this.draftStamp();
    if (!d || !st) return;
    const color = d.erase ? "#f87171" : this.view.tool === "glass" ? "#7dd3fc" : this.view.tool === "absorber" ? "#c4b5fd" : "#e2e8f0";
    if (st.kind === "disc") return;
    if (st.kind === "segment") o.paths.push({ pts: [{ x: st.x0, y: st.y0 }, { x: st.x1, y: st.y1 }], width: 2 * st.r, color });
    else {
      const pts = [{ x: st.x0, y: st.y0 }, { x: st.x1, y: st.y0 }, { x: st.x1, y: st.y1 }, { x: st.x0, y: st.y1 }];
      o.paths.push(st.kind === "box" ? { pts, closed: true, width: 2 * st.r, color } : { pts, closed: true, fill: true, color });
    }
    const len = st.kind === "segment" ? `${Math.round(Math.hypot(st.x1 - st.x0, st.y1 - st.y0))} cells` : `${Math.round(Math.abs(st.x1 - st.x0))} × ${Math.round(Math.abs(st.y1 - st.y0))}`;
    o.labels.push({ x: d.b.x + 10, y: d.b.y - 10, text: len, color });
  }

  /** A moving source: where it is now, and the path it follows (faint, dashed). */
  private motionOverlay(o: Overlay, s: SourceSpec, color: string, selected: boolean, label?: string): void {
    const m = s.motion!, p = this.sourcePos(s);
    if (m.kind === "circle") {
      const r = Math.max(1, m.radius), n = Math.max(24, Math.min(120, Math.round(r)));
      o.paths.push({ pts: Array.from({ length: n }, (_, k) => ({ x: s.x + 0.5 + r * Math.cos((2 * Math.PI * k) / n), y: s.y + 0.5 + r * Math.sin((2 * Math.PI * k) / n) })), closed: true, color: `${color}88` });
    } else {
      const end = motionPosition(s, 1e9, this.waveSpeed, this.scene.width, this.scene.height);
      o.paths.push({ pts: [{ x: s.x + 0.5, y: s.y + 0.5 }, { x: end.x + 0.5, y: end.y + 0.5 }], color: `${color}88` });
    }
    o.sources.push({ x: Math.round(p.x), y: Math.round(p.y), level: s.level, selected, color, label: label ? `${label} → ${m.mach.toFixed(2)}× wave speed` : undefined });
  }

  /** A laser: its emitting aperture as a line, and an arrow along the beam. */
  private laserOverlay(o: Overlay, s: SourceSpec, selected: boolean): void {
    const a = (s.angleDeg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), half = 1.8 * s.beamWidth;
    o.sources.push({ x: Math.round(s.x + dy * half), y: Math.round(s.y - dx * half), x2: Math.round(s.x - dy * half), y2: Math.round(s.y + dx * half), level: s.level, selected,
      color: this.sourceColor(s), label: this.owner === "sandbox" ? s.name : undefined });
    o.arrows.push({ x0: s.x, y0: s.y, x1: s.x + dx * 50, y1: s.y + dy * 50, color: selected ? "#ffffff" : "#ffffffaa" });
  }

  private laserDraft: SourceSpec | null = null;

  // ------------------------------------------------------------------------------------------ tools

  private toolAction(tool: Tool, phase: "down" | "move" | "up", cell: Pt, start: Pt): void {
    const x = Math.floor(cell.x), y = Math.floor(cell.y);
    const inside = x >= 0 && y >= 0 && x < this.scene.width && y < this.scene.height;
    if (isLogicTool(tool)) return logicTool(this, tool, phase, cell, start);
    switch (tool) {
      case "glass": return this.stroke(phase, cell, { n: this.glassIndex });
      case "barrier": return this.stroke(phase, cell, BARRIER);
      case "absorber": return this.stroke(phase, cell, "absorber");
      case "erase": return this.stroke(phase, cell, VACUUM, true);
      case "source":
        if (phase === "down" && inside) {
          const near = this.sourceNear(cell);
          if (near) { this.selectedSource = near.id; this.notify(); return; }
          const s = newSource({ ...this.template(), x, y, kind: this.sourceTemplate.countX * this.sourceTemplate.countY > 1 ? "array" : "point" });
          s.name = `Source ${s.id}`;
          this.sources.push(s);
          this.selectedSource = s.id;
          this.refreshSources();
          this.notify();
        }
        return;
      case "line":
        if (phase === "down") this.lineDraft = newSource({ ...this.template(), kind: "line", x: Math.floor(start.x), y: Math.floor(start.y), x2: x, y2: y });
        else if (this.lineDraft) { this.lineDraft.x2 = x; this.lineDraft.y2 = y; }
        if (phase === "up" && this.lineDraft) {
          const s = this.lineDraft;
          this.lineDraft = null;
          s.name = `Line ${s.id}`;
          this.sources.push(s);
          this.selectedSource = s.id;
          this.refreshSources();
          this.notify();
        }
        return;
      case "optic":
        if (phase === "down" && inside) {
          const near = this.opticNear(cell);
          if (near) { this.selectedOptic = near.id; this.notify(); return; }
          const { id: _id, name: _name, ...tpl } = this.opticTemplate;
          this.addOptic(newOptic(tpl.kind, { ...tpl, x, y }));
        }
        return;
      case "laser":
        if (phase === "down") {
          if (!inside) return;
          this.laserDraft = newSource({ ...this.template(), kind: "laser", x, y, x2: x, y2: y, angleDeg: this.sourceTemplate.angleDeg, beamWidth: this.sourceTemplate.beamWidth });
        } else if (this.laserDraft && Math.hypot(cell.x - start.x, cell.y - start.y) > 4) {
          // drag to aim
          this.laserDraft.angleDeg = Math.round((Math.atan2(cell.y - start.y, cell.x - start.x) * 180) / Math.PI);
        }
        if (phase === "up" && this.laserDraft) {
          const l = this.laserDraft;
          this.laserDraft = null;
          l.name = `Laser ${l.id}`;
          this.sources.push(l);
          this.selectedSource = l.id;
          this.refreshSources();
          this.notify();
        }
        return;
      case "pointProbe":
        if (phase === "down" && inside) { this.addProbe({ kind: "point", x, y, x2: x, y2: y, measurement: this.view_ === "field" ? "amplitude" : "intensity", mine: this.keepMine || undefined }); this.notify(); }
        return;
      case "lineProbe":
        if (phase === "down") this.probeDraft = { id: 0, kind: "line", x: Math.floor(start.x), y: Math.floor(start.y), x2: x, y2: y, measurement: "intensity", color: "#fff", label: "" };
        else if (this.probeDraft) { this.probeDraft.x2 = clampInt(x, 0, this.scene.width - 1); this.probeDraft.y2 = clampInt(y, 0, this.scene.height - 1); }
        if (phase === "up" && this.probeDraft) {
          const p = this.probeDraft;
          this.probeDraft = null;
          if (Math.hypot(p.x2 - p.x, p.y2 - p.y) >= 2) { this.addProbe({ kind: "line", x: p.x, y: p.y, x2: p.x2, y2: p.y2, measurement: "intensity", mine: this.keepMine || undefined }); this.notify(); }
        }
        return;
    }
  }

  /** The source template without its id and name, for making a new source from it. */
  private template(): Partial<SourceSpec> {
    const { id: _id, name: _name, ...rest } = this.sourceTemplate;
    // its own copy of the motion, so the new source and the template do not share one
    return { ...rest, motion: rest.motion ? { ...rest.motion } : null };
  }

  /** Sources and probes can be dragged with the Pan tool (the sandbox and the kids' experiments). */
  grabbable = false;
  private grabbed:
    | { kind: "source"; s: SourceSpec; x: number; y: number; x2: number; y2: number; baked?: SourceSpec["baked"] }
    | { kind: "probe"; index: number; x: number; y: number; x2: number; y2: number }
    | { kind: "optic"; o: OpticSpec; x: number; y: number; x2: number; y2: number }
    | { kind: "detector"; d: Detector; dx: number; dy: number }
    | { kind: "toggle"; id: string }
    | null = null;

  private grabRadius(): number { return Math.max(4, 8 * this.view.scale); }

  /** A detector of the wave circuit under the cell. */
  detectorNear(cell: Pt): Detector | undefined { return this.logic?.detectorNear(cell, Math.max(1, 3 * this.view.scale)); }

  /** The probe under the cell (a point probe, a line probe's end or its line), or -1. */
  probeNear(cell: Pt): number {
    const r = Math.max(4, 8 * this.view.scale);
    return this.probes.findIndex(p => {
      if (p.kind === "point") return Math.hypot(p.x + 0.5 - cell.x, p.y + 0.5 - cell.y) <= r;
      const dx = p.x2 - p.x, dy = p.y2 - p.y, l2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((cell.x - p.x) * dx + (cell.y - p.y) * dy) / l2));
      return Math.hypot(p.x + t * dx - cell.x, p.y + t * dy - cell.y) <= r * 0.6;
    });
  }

  /** Drags a source (with its line end or its fixed elements) or a probe by whole cells. */
  private grab(phase: "down" | "move" | "up", cell: Pt, start: Pt): void {
    if (phase === "down") {
      if (!this.grabbable) {
        const i = this.probeNear(cell), p = this.probes[i];
        if (p?.mine) { this.grabbed = { kind: "probe", index: i, x: p.x, y: p.y, x2: p.x2, y2: p.y2 }; return; }
        const sw = this.logic?.switchAt(cell, this.grabRadius());
        if (sw) this.grabbed = { kind: "toggle", id: sw.id };
        return;
      }
      const s = this.sourceNear(cell);
      if (s) {
        this.grabbed = { kind: "source", s, x: s.x, y: s.y, x2: s.x2, y2: s.y2, baked: s.baked };
        this.selectedSource = s.id;
        this.notify();
        return;
      }
      const i = this.probeNear(cell);
      if (i >= 0) { const p = this.probes[i]; this.grabbed = { kind: "probe", index: i, x: p.x, y: p.y, x2: p.x2, y2: p.y2 }; return; }
      const d = this.detectorNear(cell);
      if (d) { this.grabbed = { kind: "detector", d, dx: 0, dy: 0 }; return; }
      const o = this.opticNear(cell);
      if (o) { this.grabbed = { kind: "optic", o, x: o.x, y: o.y, x2: o.x, y2: o.y }; this.selectedOptic = o.id; this.notify(); }
      return;
    }
    if (this.grabbed?.kind === "toggle") {
      // a click on an input switch flips it
      if (phase === "up") { this.release(); this.logic?.toggle(this.grabbed.id); this.running = true; this.grabbed = null; this.notify(); }
      return;
    }
    if (this.grabbed?.kind === "detector") {
      const g = this.grabbed, dx = Math.round(cell.x - start.x), dy = Math.round(cell.y - start.y);
      if (dx !== g.dx || dy !== g.dy) { this.logic?.moveDetector(g.d, dx - g.dx, dy - g.dy); g.dx = dx; g.dy = dy; }
      if (phase === "up") { this.grabbed = null; this.notify(); }
      return;
    }
    if (this.grabbed?.kind === "optic") {
      const g = this.grabbed, before = opticBounds(g.o);
      g.o.x = Math.max(0, Math.min(this.scene.width - 1, g.x + Math.round(cell.x - start.x)));
      g.o.y = Math.max(0, Math.min(this.scene.height - 1, g.y + Math.round(cell.y - start.y)));
      this.updateOptic(g.o, before);
      if (phase === "up") { this.grabbed = null; this.notify(); }
      return;
    }
    const g = this.grabbed;
    if (!g) return;
    const W = this.scene.width - 1, H = this.scene.height - 1;
    // keep the whole object inside the scene
    const dx = Math.max(-Math.min(g.x, g.x2), Math.min(W - Math.max(g.x, g.x2), Math.round(cell.x - start.x)));
    const dy = Math.max(-Math.min(g.y, g.y2), Math.min(H - Math.max(g.y, g.y2), Math.round(cell.y - start.y)));
    if (g.kind === "source") {
      const s = g.s;
      s.x = g.x + dx; s.y = g.y + dy; s.x2 = g.x2 + dx; s.y2 = g.y2 + dy;
      if (g.baked) s.baked = g.baked.map(e => ({ ...e, x: e.x + dx, y: e.y + dy }));
      this.refreshSources();
      this.logic?.drawLabels();
      // a click (no drag) on an input switch's emitter flips it
      const sw = this.logic?.switches.find(q => q.sources.includes(s));
      if (phase === "up" && sw && dx === 0 && dy === 0) { this.release(); this.logic!.toggle(sw.id); this.running = true; }
    } else if (phase === "up") {
      const list = this.probeList();
      list[g.index] = { ...list[g.index], x: g.x + dx, y: g.y + dy, x2: g.x2 + dx, y2: g.y2 + dy };
      this.setProbes(list);
    } else {
      // show the probe moving; it is measured again from where it is dropped
      const p = this.probes[g.index];
      p.x = g.x + dx; p.y = g.y + dy; p.x2 = g.x2 + dx; p.y2 = g.y2 + dy;
    }
    if (phase === "up") { this.grabbed = null; this.notify(); }
  }

  /** Listeners for changes the sandbox panel shows (sources, probes, selection). */
  changed: (() => void)[] = [];
  notify(): void { for (const f of this.changed) f(); }

  sourceNear(cell: Pt): SourceSpec | undefined {
    const r = Math.max(4, 8 * this.view.scale);
    return this.sources.find(s => { const p = this.sourcePos(s); return Math.hypot(p.x + 0.5 - cell.x, p.y + 0.5 - cell.y) <= r; });
  }

  private lastPaint: Pt | null = null;
  /** How the paint tools draw: freehand, a straight line, a box outline or a filled box. */
  paintShape: PaintShape = "free";
  /** A straight line or box being dragged out (painted when the mouse is let go). */
  private shapeDraft: { a: Pt; b: Pt; erase: boolean } | null = null;

  /** Paint tools: freehand dabs close enough together along the pointer path that there are no gaps, or a shape. */
  private stroke(phase: "down" | "move" | "up", cell: Pt, m: Material | "absorber", erase = false): void {
    if (this.paintShape !== "free") return this.shapeStroke(phase, cell, m, erase);
    if (phase === "up") { this.lastPaint = null; return; }
    const from = phase === "down" || !this.lastPaint ? cell : this.lastPaint;
    const dist = Math.hypot(cell.x - from.x, cell.y - from.y);
    const n = Math.max(1, Math.ceil(dist / Math.max(0.5, this.brush * 0.5)));
    for (let k = phase === "down" ? 0 : 1; k <= n; k++) {
      const p = { x: from.x + ((cell.x - from.x) * k) / n, y: from.y + ((cell.y - from.y) * k) / n };
      this.applyStamp({ kind: "disc", x: Math.floor(p.x) + 0.5, y: Math.floor(p.y) + 0.5, r: this.brush }, m, erase);
    }
    this.lastPaint = cell;
  }

  private shapeStroke(phase: "down" | "move" | "up", cell: Pt, m: Material | "absorber", erase: boolean): void {
    const p = { x: Math.floor(cell.x) + 0.5, y: Math.floor(cell.y) + 0.5 };
    if (phase === "down") { this.shapeDraft = { a: p, b: p, erase }; return; }
    const d = this.shapeDraft;
    if (!d) return;
    d.b = this.paintShape === "line" ? snapAngle(d.a, p) : p;
    if (phase !== "up") return;
    const st = this.draftStamp();
    this.shapeDraft = null;
    if (st) this.applyStamp(st, m, erase);
  }

  private draftStamp(): Stamp | null {
    const d = this.shapeDraft;
    if (!d) return null;
    const { a, b } = d, r = this.brush;
    if (this.paintShape === "line") return { kind: "segment", x0: a.x, y0: a.y, x1: b.x, y1: b.y, r };
    if (Math.abs(b.x - a.x) < 1 || Math.abs(b.y - a.y) < 1) return null;
    return this.paintShape === "box" ? { kind: "box", x0: a.x, y0: a.y, x1: b.x, y1: b.y, r } : { kind: "filledBox", x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  }

  /** Paints into the base layer, redraws (optical elements stay on top); the eraser also takes sources away. */
  private applyStamp(st: Stamp, m: Material | "absorber", erase: boolean): void {
    paintStamp(this.baseScene, st, m);
    const b = stampBounds(st);
    this.rasterize(b.x0 - 1, b.y0 - 1, b.x1 + 1, b.y1 + 1);
    if (!erase) return;
    const s = this.scene, W = s.width;
    let removed = false;
    for (let y = Math.max(0, Math.floor(b.y0)); y <= Math.min(s.height - 1, Math.ceil(b.y1)); y++)
      for (let x = Math.max(0, Math.floor(b.x0)); x <= Math.min(W - 1, Math.ceil(b.x1)); x++)
        if (s.imageLevel[y * W + x] && stampDepth(st, x + 0.5, y + 0.5).depth >= 0) { s.imageLevel[y * W + x] = 0; removed = true; }
    const gone = this.sources.filter(src => src.kind !== "line" && stampDepth(st, src.x + 0.5, src.y + 0.5).depth >= 0);
    if (gone.length) this.removeSources(gone);
    else if (removed) { this.refreshSources(); this.notify(); }
  }

  /**
   * Sets the brightness of these views (default: the one shown) so that the strongest 0.5% of the cells just reach
   * full colour. Cells close to a source (always strong) do not count, and the field view uses the wave's envelope
   * (from the averaged intensity), so the result does not depend on the moment in the wave's cycle. fade: change
   * smoothly instead of at once.
   */
  autoBrightness(views: Quantity[] = [this.view_], fade = false): void {
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

function clampInt(v: number, a: number, b: number): number { return Math.max(a, Math.min(b, v)); }

/** Gray scale, used when the colour scheme files cannot be loaded. */
function defaultLut(q: Quantity): number[][] {
  return Array.from({ length: 255 }, (_, i) => {
    const v = q === "field" ? Math.round(Math.abs(i - 127) * 2) : i;
    return [v, v, v];
  });
}
