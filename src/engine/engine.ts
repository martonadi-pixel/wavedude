// Wave Dude 2D web - the wave simulation on the GPU with WebGL2 (GpuWaveSimulator.vb / WaveSimulator.vb).
// GPL-3.0-or-later. Simulation core based on WaveSimulator2D by 0x23.

import { DISPLAY_FS, MESH_FS, MESH_VS, PROBE_LINE_FS, PROBE_POINT_FS, STEP_FS, VS } from "./shaders";
import { type Scene } from "../core/scene";
import { type SourceElement } from "../core/sources";
import { FREQUENCY_SCALE, omegaOfLevel, type Stencil, subStepsFor } from "../core/physics";

export type Quantity = "field" | "intensity";
export interface PointProbe { x: number; y: number; quantity: Quantity }
/** integrate: the running total of the intensity over the steps (from step startAfter on, -1 = from the start). */
export interface LineProbe { x0: number; y0: number; x1: number; y1: number; quantity: Quantity; integrate?: boolean; startAfter?: number }

export interface DisplayOptions {
  mode: Quantity;
  brightness: number;
  showMaterial: boolean;
  showSources: boolean;
  /** Draw a line wherever the material changes (lenses, glass, mirrors, walls). */
  outlines?: boolean;
  /** Cell coordinate at the top-left corner of the canvas, and cells per device pixel. */
  offsetX: number;
  offsetY: number;
  cellsPerPx: number;
  background: [number, number, number];
}

/** The 3D view: what DisplayOptions has, plus the camera and how tall the waves are drawn. */
export interface Display3DOptions extends Omit<DisplayOptions, "offsetX" | "offsetY" | "cellsPerPx"> {
  mvp: Float32Array;
  eye: [number, number, number];
  /** Height of a full-brightness wave, in units of half the scene's longest side. */
  amp: number;
  /** Mesh vertices along the longest side (the scene is sampled at this resolution). */
  detail: number;
}

export interface EngineSettings {
  stencil: Stencil;
  /** SimulationSettings.TimeDecayFactor: the intensity averaging time, in units scaled by the slowest source. */
  timeDecayFactor: number;
  intensityScale: number;
  /** Amplitude of the image sources (SceneSettings.ImageSourceScale; 1 = the Python code). */
  imageSourceAmplitude: number;
  /** SimulationSettings.SourceFrequencyScale: angular frequency = level / 255 * 0.5 * this. */
  frequencyScale: number;
}

const MAX_POINT_PROBES = 8;
const MAX_LINE_PROBES = 4;
const HISTORY = 1024;      // point probe values kept on the GPU before they are read back
const MAX_LINE_CELLS = 4096;

interface Program { pr: WebGLProgram; u: Record<string, WebGLUniformLocation> }

/** The engine settings experiments are written for (the Sandbox and projects may change them). */
export const defaultSettings = (): EngineSettings =>
  ({ stencil: "3x3", timeDecayFactor: 10, intensityScale: 1, imageSourceAmplitude: 1, frequencyScale: FREQUENCY_SCALE });

export class WaveEngine {
  readonly gl: WebGL2RenderingContext;
  width = 0;
  height = 0;
  /** Steps done since the last reset. */
  time = 0;
  settings: EngineSettings = defaultSettings();

  private stepP!: Program;
  private pointP!: Program;
  private lineP!: Program;
  private showP!: Program;
  private meshP!: Program;
  private meshIdx: { key: string; buf: WebGLBuffer; count: number; n: number; m: number } | null = null;
  private state: WebGLTexture[] = [];
  private fbo: WebGLFramebuffer[] = [];
  private cur = 0;
  private matTex: WebGLTexture | null = null;
  private srcATex: WebGLTexture | null = null;
  private srcBTex: WebGLTexture | null = null;
  private lutTex!: WebGLTexture;
  private lut: { colors: number[][]; blackLevel: number } | null = null;
  private matData = new Float32Array(0);
  private srcA = new Float32Array(0);
  private srcB = new Float32Array(0);
  private scene: Scene | null = null;
  private elements: SourceElement[] = [];
  /** Cells of moving sources (rewritten every step, kept apart so that only their few cells are uploaded). */
  private moving: SourceElement[] = [];
  /** The still elements by cell, to put back what a moving source passed over. */
  private elementAt = new Map<number, SourceElement>();
  private maxC2 = 1;
  private minLevel = 100;
  private imageMinLevel = 0;

  private pointProbes: PointProbe[] = [];
  private lineProbes: LineProbe[] = [];
  private histTex!: WebGLTexture;
  private histFbo!: WebGLFramebuffer;
  private lineTex!: WebGLTexture;
  private lineFbo!: WebGLFramebuffer;
  private accTex!: WebGLTexture[];
  private accFbo!: WebGLFramebuffer[];
  private accCur = 0;
  private histFill = 0;
  private pending: number[][] = [];

  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error("This browser does not support WebGL2.");
    this.gl = gl;
    this.initGL();
  }

  /** Programs and the fixed-size textures (again after the GPU context was lost and restored). */
  private initGL(): void {
    const gl = this.gl;
    // extensions have to be enabled again on a restored context
    if (!gl.getExtension("EXT_color_buffer_float")) throw new Error("This GPU/browser cannot render to float textures (EXT_color_buffer_float).");
    this.stepP = this.program(STEP_FS);
    this.pointP = this.program(PROBE_POINT_FS);
    this.lineP = this.program(PROBE_LINE_FS);
    this.showP = this.program(DISPLAY_FS);
    this.meshP = this.program(MESH_FS, MESH_VS);
    this.meshIdx = null;
    gl.bindVertexArray(gl.createVertexArray());
    this.lutTex = this.texture(256, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this.histTex = this.texture(HISTORY, MAX_POINT_PROBES, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
    this.histFbo = this.framebuffer(this.histTex);
    this.lineTex = this.texture(MAX_LINE_CELLS, MAX_LINE_PROBES, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
    this.lineFbo = this.framebuffer(this.lineTex);
    this.accTex = [0, 1].map(() => this.texture(MAX_LINE_CELLS, MAX_LINE_PROBES, gl.RGBA32F, gl.RGBA, gl.FLOAT, null));
    this.accFbo = this.accTex.map(t => this.framebuffer(t));
  }

  /**
   * After the browser restored a lost GPU context: rebuilds everything on the GPU from the scene, the sources, the
   * probes and the colour table kept here. The field itself was on the GPU and is gone, so the run starts again.
   */
  restore(): void {
    this.initGL();
    const scene = this.scene, elements = this.elements, points = this.pointProbes, lines = this.lineProbes;
    this.width = this.height = 0;
    this.state = [];
    this.fbo = [];
    this.matTex = this.srcATex = this.srcBTex = null;
    if (this.lut) this.setColorScheme(this.lut.colors, this.lut.blackLevel);
    if (!scene) return;
    this.setScene(scene);
    const moving = this.moving;
    this.setSources(elements);
    this.setMovingSources(moving);
    this.setProbes(points, lines);
  }

  // ------------------------------------------------------------------------------------------ scene and sources

  /** Starts a new simulation of this scene (the field is cleared). */
  setScene(scene: Scene): void {
    const gl = this.gl;
    const sizeChanged = scene.width !== this.width || scene.height !== this.height;
    this.scene = scene;
    this.width = scene.width;
    this.height = scene.height;
    const n = scene.width * scene.height;
    if (sizeChanged) {
      for (const t of [...this.state, this.matTex, this.srcATex, this.srcBTex]) if (t) gl.deleteTexture(t);
      for (const f of this.fbo) gl.deleteFramebuffer(f);
      this.state = [0, 1].map(() => this.texture(scene.width, scene.height, gl.RGBA32F, gl.RGBA, gl.FLOAT, null));
      this.fbo = this.state.map(t => this.framebuffer(t));
      this.matData = new Float32Array(n * 4);
      this.srcA = new Float32Array(n * 4);
      this.srcB = new Float32Array(n * 4);
      this.matTex = this.texture(scene.width, scene.height, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
      this.srcATex = this.texture(scene.width, scene.height, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
      this.srcBTex = this.texture(scene.width, scene.height, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
    }
    this.updateMaterial();
    this.elements = [];
    this.moving = [];
    this.rebuildSources();
    this.reset();
  }

  /** Uploads the scene's materials again, all or one rectangle (after painting). The field is kept. */
  updateMaterial(x0 = 0, y0 = 0, x1 = this.width - 1, y1 = this.height - 1): void {
    const s = this.scene!;
    const w = this.width;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = y * w + x;
        this.matData[i * 4] = s.c2[i];
        this.matData[i * 4 + 1] = s.d[i];
        this.matData[i * 4 + 2] = s.n[i];
        this.matData[i * 4 + 3] = 1 - s.dBase[i];
      }
    this.upload(this.matTex!, this.matData, x0, y0, x1, y1);
    this.maxC2 = s.maxC2();
  }

  /** Replaces the object sources (the image sources of the scene stay). The field is kept. */
  setSources(elements: SourceElement[]): void {
    const old = this.elements;
    this.elements = elements.filter(e => e.x >= 0 && e.y >= 0 && e.x < this.width && e.y < this.height);
    // only the cells of the old and the new elements change: restore the old ones, write the new ones, and upload
    // the rectangle around both (a slider drag would otherwise re-upload the whole scene every frame)
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (const e of [...old, ...this.elements]) {
      x0 = Math.min(x0, e.x); y0 = Math.min(y0, e.y); x1 = Math.max(x1, e.x); y1 = Math.max(y1, e.y);
    }
    for (const e of old) this.writeImageSource(e.y * this.width + e.x);
    this.writeElements();
    if (x1 >= 0) {
      this.upload(this.srcATex!, this.srcA, x0, y0, x1, y1);
      this.upload(this.srcBTex!, this.srcB, x0, y0, x1, y1);
    }
  }

  private rebuildSources(): void {
    this.srcA.fill(0);
    this.srcB.fill(0);
    const lv = this.scene!.imageLevel;
    this.imageMinLevel = 0;
    for (let i = 0; i < lv.length; i++)
      if (lv[i]) {
        this.writeImageSource(i);
        if (this.imageMinLevel === 0 || lv[i] < this.imageMinLevel) this.imageMinLevel = lv[i];
      }
    this.writeElements();
    this.upload(this.srcATex!, this.srcA);
    this.upload(this.srcBTex!, this.srcB);
  }

  /** Cell i as the scene image defines it: an image source or no source. */
  private writeImageSource(i: number): void {
    const lv = this.scene!.imageLevel[i], k = i * 4;
    this.srcA[k] = lv ? omegaOfLevel(lv, this.settings.frequencyScale) : 0;
    this.srcA[k + 1] = lv ? this.settings.imageSourceAmplitude : 0;
    this.srcA[k + 2] = 0;
    this.srcA[k + 3] = lv ? 1 : 0;
    this.srcB[k] = 0;
    this.srcB[k + 1] = 0;
    this.srcB[k + 2] = -1;
    this.srcB[k + 3] = 0;
  }

  private writeElements(): void {
    let minLevel = this.imageMinLevel;
    this.elementAt.clear();
    for (const e of [...this.elements, ...this.moving]) {
      this.writeElement(e);
      if (minLevel === 0 || e.level < minLevel) minLevel = e.level;
    }
    for (const e of this.elements) this.elementAt.set(e.y * this.width + e.x, e);
    this.minLevel = minLevel || 100;
  }

  private writeElement(e: SourceElement): void {
    const { srcA, srcB } = this, i = (e.y * this.width + e.x) * 4;
    srcA[i] = omegaOfLevel(e.level, this.settings.frequencyScale);
    srcA[i + 1] = e.amplitude;
    srcA[i + 2] = e.phase;
    srcA[i + 3] = e.mode === "continuous" ? 1 : e.shape === "gaussian" ? 2 : 3;
    srcB[i] = e.onCycles;
    srcB[i + 1] = e.offCycles;
    srcB[i + 2] = e.detachStep;
    srcB[i + 3] = e.soft ?? 0;
  }

  /**
   * The cells of the moving sources now (called every step while they move): the cells they left get back what was
   * there, the new ones are written, and only the small rectangle around both is uploaded.
   */
  setMovingSources(elements: SourceElement[]): void {
    const old = this.moving;
    if (!old.length && !elements.length) return;
    this.moving = elements.filter(e => e.x >= 0 && e.y >= 0 && e.x < this.width && e.y < this.height);
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (const e of [...old, ...this.moving]) {
      x0 = Math.min(x0, e.x); y0 = Math.min(y0, e.y); x1 = Math.max(x1, e.x); y1 = Math.max(y1, e.y);
    }
    for (const e of old) {
      const i = e.y * this.width + e.x;
      this.writeImageSource(i);
      const still = this.elementAt.get(i);
      if (still) this.writeElement(still);
    }
    for (const e of this.moving) this.writeElement(e);
    if (old.length !== this.moving.length || this.moving.some((e, k) => e.level !== old[k]?.level)) {
      let minLevel = this.imageMinLevel;
      for (const e of [...this.elements, ...this.moving]) if (minLevel === 0 || e.level < minLevel) minLevel = e.level;
      this.minLevel = minLevel || 100;
    }
    if (x1 >= 0) {
      this.upload(this.srcATex!, this.srcA, x0, y0, x1, y1);
      this.upload(this.srcBTex!, this.srcB, x0, y0, x1, y1);
    }
  }

  /** Clears the field and the intensity but keeps counting steps (the sources go on in step with their phase). */
  clearField(): void {
    const gl = this.gl;
    for (const f of this.fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  /** Clears the field and the intensity and starts again at step 0. */
  reset(): void {
    const gl = this.gl;
    for (const f of this.fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.time = 0;
    this.histFill = 0;
    this.pending = this.pointProbes.map(() => []);
    this.clearTotals();
  }

  private clearTotals(): void {
    const gl = this.gl;
    for (const f of this.accFbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  /** The colour table, with the black level of ColorLut.Build: c * (1 - b) + b, limited to 0..1, truncated. */
  setColorScheme(colors: number[][], blackLevel = 0): void {
    this.lut = { colors, blackLevel };
    const d = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) {
      const c = colors[Math.min(i, colors.length - 1)];
      for (let k = 0; k < 3; k++) {
        const v = Math.min(1, Math.max(0, (c[k] / 255) * (1 - blackLevel) + blackLevel));
        d[i * 4 + k] = Math.min(255, Math.trunc(v * 255));
      }
      d[i * 4 + 3] = 255;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.lutTex);
    this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, 256, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, d);
  }

  // ------------------------------------------------------------------------------------------ stepping

  /** The intensity filter's per-step factor: time constant scaled by the slowest source (WaveSimulator constructor). */
  private intensityAlpha(): number {
    // in source periods, whatever the frequency scale (2 = the Windows default, where this is TDF * 100 / level)
    const tau = Math.max(1, (this.settings.timeDecayFactor * 100 * 2) / (this.minLevel * this.settings.frequencyScale));
    return Math.exp(-1 / tau);
  }

  get subSteps(): number {
    return subStepsFor(this.maxC2, this.settings.stencil);
  }

  /** Advances the simulation n steps (sources, field and intensity; point probes sampled every step). */
  step(n: number): void {
    if (!this.scene) return;
    const gl = this.gl, P = this.stepP, sub = this.subSteps;
    gl.useProgram(P.pr);
    gl.uniform2i(P.u.size, this.width, this.height);
    gl.uniform1i(P.u.state, 0);
    gl.uniform1i(P.u.mat, 1);
    gl.uniform1i(P.u.srcA, 2);
    gl.uniform1i(P.u.srcB, 3);
    gl.uniform1f(P.u.c2Scale, 1 / (sub * sub));
    gl.uniform1f(P.u.dPow, 1 / sub);
    gl.uniform1f(P.u.alpha, this.intensityAlpha());
    gl.uniform1f(P.u.use4th, this.settings.stencil === "4th" ? 1 : 0);
    // the sources act on the first sub-step only: their pull is shared out so it does not grow with the sub-steps
    gl.uniform1f(P.u.srcBlend, 0.1 / sub);
    this.bind(1, this.matTex!);
    this.bind(2, this.srcATex!);
    this.bind(3, this.srcBTex!);
    gl.viewport(0, 0, this.width, this.height);
    for (let k = 0; k < n; k++) {
      gl.useProgram(P.pr);
      gl.uniform1f(P.u.t, this.time);
      // AdvanceOneStep: sources once, then `sub` field updates, the intensity on the last one
      for (let s = 0; s < sub; s++) {
        gl.uniform1f(P.u.applySrc, s === 0 ? 1 : 0);
        gl.uniform1f(P.u.track, s === sub - 1 ? 1 : 0);
        this.bind(0, this.state[this.cur]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[1 - this.cur]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        this.cur = 1 - this.cur;
      }
      this.time++;
      if (this.pointProbes.length) this.samplePoints();
      if (this.lineProbes.some(l => l.integrate)) this.accumulateLines();
    }
  }

  // ------------------------------------------------------------------------------------------ probes

  setProbes(points: PointProbe[], lines: LineProbe[]): void {
    this.flushPoints();
    this.pointProbes = points.slice(0, MAX_POINT_PROBES);
    this.lineProbes = lines.slice(0, MAX_LINE_PROBES);
    this.pending = this.pointProbes.map(() => []);
    this.clearTotals();
  }

  private samplePoints(): void {
    const gl = this.gl, P = this.pointP;
    if (this.histFill >= HISTORY) this.flushPoints();
    gl.useProgram(P.pr);
    gl.uniform1i(P.u.state, 0);
    gl.uniform1f(P.u.intensityScale, this.settings.intensityScale);
    const pos = new Int32Array(MAX_POINT_PROBES * 2), q = new Int32Array(MAX_POINT_PROBES);
    this.pointProbes.forEach((p, i) => {
      pos[i * 2] = clamp(Math.round(p.x), 0, this.width - 1);
      pos[i * 2 + 1] = clamp(Math.round(p.y), 0, this.height - 1);
      q[i] = p.quantity === "field" ? 0 : 1;
    });
    gl.uniform2iv(P.u["pos[0]"], pos);
    gl.uniform1iv(P.u["quantity[0]"], q);
    this.bind(0, this.state[this.cur]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.histFbo);
    gl.viewport(this.histFill, 0, 1, this.pointProbes.length);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.stepP.pr);
    this.histFill++;
  }

  private flushPoints(): void {
    if (this.histFill === 0 || this.pointProbes.length === 0) { this.histFill = 0; return; }
    const gl = this.gl, n = this.histFill, rows = this.pointProbes.length;
    const buf = new Float32Array(n * rows * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.histFbo);
    gl.readPixels(0, 0, n, rows, gl.RGBA, gl.FLOAT, buf);
    for (let p = 0; p < rows; p++) {
      const out = this.pending[p] ?? (this.pending[p] = []);
      for (let k = 0; k < n; k++) out.push(buf[(p * n + k) * 4]);
    }
    this.histFill = 0;
  }

  /** The point probe values of every step since the last call, one array per probe. */
  takeSamples(): number[][] {
    this.flushPoints();
    const out = this.pending;
    this.pending = this.pointProbes.map(() => []);
    return out;
  }

  /** Number of cells along a line probe: one per step of the longer axis (as the Bresenham line of ProbeSampling). */
  private lineCount(l: LineProbe): number {
    return Math.min(MAX_LINE_CELLS, Math.max(Math.abs(Math.round(l.x1) - Math.round(l.x0)), Math.abs(Math.round(l.y1) - Math.round(l.y0))) + 1);
  }

  /** Draws the line probe pass: mode 0 reads the values, mode 1 adds this step's intensity to the totals. */
  private linePass(mode: 0 | 1, target: WebGLFramebuffer, width: number): void {
    const gl = this.gl, P = this.lineP, L = this.lineProbes;
    const lines = new Float32Array(MAX_LINE_PROBES * 4), count = new Int32Array(MAX_LINE_PROBES);
    const q = new Int32Array(MAX_LINE_PROBES), integ = new Int32Array(MAX_LINE_PROBES), rec = new Int32Array(MAX_LINE_PROBES);
    L.forEach((l, i) => {
      lines.set([Math.round(l.x0), Math.round(l.y0), Math.round(l.x1), Math.round(l.y1)], i * 4);
      count[i] = this.lineCount(l);
      q[i] = l.quantity === "field" ? 0 : 1;
      integ[i] = l.integrate ? 1 : 0;
      // ProbeSampling: before "start after step" the totals are not added to
      rec[i] = l.integrate && (l.startAfter ?? -1) < this.time ? 1 : 0;
    });
    gl.useProgram(P.pr);
    gl.uniform1i(P.u.state, 0);
    gl.uniform1i(P.u.acc, 1);
    gl.uniform1i(P.u.mode, mode);
    gl.uniform1f(P.u.intensityScale, this.settings.intensityScale);
    gl.uniform4fv(P.u["lines[0]"], lines);
    gl.uniform1iv(P.u["count[0]"], count);
    gl.uniform1iv(P.u["quantity[0]"], q);
    gl.uniform1iv(P.u["integ[0]"], integ);
    gl.uniform1iv(P.u["recording[0]"], rec);
    this.bind(0, this.state[this.cur]);
    this.bind(1, this.accTex[this.accCur]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.viewport(0, 0, width, L.length);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.viewport(0, 0, this.width, this.height);
  }

  private accumulateLines(): void {
    const width = Math.max(...this.lineProbes.map(l => this.lineCount(l)));
    this.linePass(1, this.accFbo[1 - this.accCur], width);
    this.accCur = 1 - this.accCur;
    this.gl.useProgram(this.stepP.pr);
    this.bind(1, this.matTex!);
  }

  /** The values along every line probe now (running totals for the integrating ones). */
  readProfiles(): Float32Array[] {
    const gl = this.gl, L = this.lineProbes;
    if (!L.length || !this.scene) return [];
    const counts = L.map(l => this.lineCount(l));
    const maxCount = Math.max(1, ...counts);
    this.linePass(0, this.lineFbo, maxCount);
    const buf = new Float32Array(maxCount * L.length * 4);
    gl.readPixels(0, 0, maxCount, L.length, gl.RGBA, gl.FLOAT, buf);
    return L.map((_, i) => {
      const out = new Float32Array(counts[i]);
      for (let k = 0; k < counts[i]; k++) out[k] = buf[(i * maxCount + k) * 4];
      return out;
    });
  }

  /** The whole state (u, previous u, intensity stages) read back from the GPU. Slow: for occasional use only. */
  readState(): Float32Array {
    const gl = this.gl, buf = new Float32Array(this.width * this.height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[this.cur]);
    gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.FLOAT, buf);
    return buf;
  }

  /** The intensity of a rectangle of cells, row by row from y (one read back from the GPU; use sparingly). */
  readIntensity(x: number, y: number, w: number, h: number): Float32Array {
    const gl = this.gl;
    x = clamp(x, 0, this.width - 1); y = clamp(y, 0, this.height - 1);
    w = Math.max(1, Math.min(w, this.width - x)); h = Math.max(1, Math.min(h, this.height - y));
    const buf = new Float32Array(w * h * 4), out = new Float32Array(w * h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[this.cur]);
    gl.readPixels(x, y, w, h, gl.RGBA, gl.FLOAT, buf);
    for (let i = 0; i < w * h; i++) out[i] = (buf[i * 4 + 2] * 0.5 + buf[i * 4 + 3] * 0.5) * this.settings.intensityScale;
    return out;
  }

  /** The field value u at one cell (reads back from the GPU; use sparingly). */
  readCell(x: number, y: number): number[] {
    const gl = this.gl, buf = new Float32Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[this.cur]);
    gl.readPixels(clamp(x, 0, this.width - 1), clamp(y, 0, this.height - 1), 1, 1, gl.RGBA, gl.FLOAT, buf);
    return [buf[0], (buf[2] * 0.5 + buf[3] * 0.5) * this.settings.intensityScale];
  }

  // ------------------------------------------------------------------------------------------ display

  render(o: DisplayOptions): void {
    const gl = this.gl, P = this.showP;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (!this.scene) {
      gl.clearColor(o.background[0], o.background[1], o.background[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    gl.useProgram(P.pr);
    gl.uniform1i(P.u.state, 0);
    gl.uniform1i(P.u.mat, 1);
    gl.uniform1i(P.u.srcA, 2);
    gl.uniform1i(P.u.lut, 3);
    gl.uniform2i(P.u.size, this.width, this.height);
    gl.uniform1f(P.u.mode, o.mode === "field" ? 0 : 1);
    gl.uniform1f(P.u.brightness, o.brightness);
    gl.uniform1f(P.u.intensityScale, this.settings.intensityScale);
    gl.uniform1f(P.u.showMaterial, o.showMaterial ? 1 : 0);
    gl.uniform1f(P.u.showSources, o.showSources ? 1 : 0);
    gl.uniform1f(P.u.outlines, o.outlines ? 1 : 0);
    gl.uniform1f(P.u.freqScale, this.settings.frequencyScale);
    gl.uniform2f(P.u.offset, o.offsetX, o.offsetY);
    gl.uniform1f(P.u.cellsPerPx, o.cellsPerPx);
    gl.uniform1f(P.u.canvasH, this.canvas.height);
    gl.uniform3f(P.u.background, ...o.background);
    this.bind(0, this.state[this.cur]);
    this.bind(1, this.matTex!);
    this.bind(2, this.srcATex!);
    this.bind(3, this.lutTex);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** The 3D view: the field as a lit surface seen through the camera matrix. */
  render3D(o: Display3DOptions): void {
    const gl = this.gl, P = this.meshP;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(o.background[0], o.background[1], o.background[2], 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!this.scene) return;
    // mesh resolution: at most one vertex per cell, `detail` along the longest side
    const longest = Math.max(this.width, this.height);
    const k = Math.min(1, o.detail / longest);
    const n = Math.max(2, Math.round(this.width * k)), m = Math.max(2, Math.round(this.height * k));
    const key = `${n}x${m}`;
    if (!this.meshIdx || this.meshIdx.key !== key) {
      if (this.meshIdx) gl.deleteBuffer(this.meshIdx.buf);
      const idx = new Uint32Array((n - 1) * (m - 1) * 6);
      let t = 0;
      for (let y = 0; y < m - 1; y++)
        for (let x = 0; x < n - 1; x++) {
          const a = y * n + x, b = a + 1, c = a + n, d = c + 1;
          idx[t++] = a; idx[t++] = c; idx[t++] = b;
          idx[t++] = b; idx[t++] = c; idx[t++] = d;
        }
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      this.meshIdx = { key, buf, count: idx.length, n, m };
    }
    gl.useProgram(P.pr);
    gl.uniform1i(P.u.state, 0);
    gl.uniform1i(P.u.mat, 1);
    gl.uniform1i(P.u.srcA, 2);
    gl.uniform1i(P.u.lut, 3);
    gl.uniform2i(P.u.size, this.width, this.height);
    gl.uniform2i(P.u.mesh, n, m);
    gl.uniform2f(P.u.world, this.width / longest, this.height / longest);
    gl.uniform1f(P.u.mode, o.mode === "field" ? 0 : 1);
    gl.uniform1f(P.u.brightness, o.brightness);
    gl.uniform1f(P.u.intensityScale, this.settings.intensityScale);
    gl.uniform1f(P.u.amp, o.amp);
    gl.uniform1f(P.u.wallH, Math.max(0.04, o.amp * 0.8));
    gl.uniform1f(P.u.showMaterial, o.showMaterial ? 1 : 0);
    gl.uniform1f(P.u.showSources, o.showSources ? 1 : 0);
    gl.uniform1f(P.u.outlines, o.outlines ? 1 : 0);
    gl.uniform1f(P.u.freqScale, this.settings.frequencyScale);
    gl.uniformMatrix4fv(P.u.mvp, false, o.mvp);
    gl.uniform3f(P.u.eye, ...o.eye);
    this.bind(0, this.state[this.cur]);
    this.bind(1, this.matTex!);
    this.bind(2, this.srcATex!);
    this.bind(3, this.lutTex);
    gl.enable(gl.DEPTH_TEST);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.meshIdx.buf);
    gl.drawElements(gl.TRIANGLES, this.meshIdx.count, gl.UNSIGNED_INT, 0);
    gl.disable(gl.DEPTH_TEST);
  }

  // ------------------------------------------------------------------------------------------ GL helpers

  private program(fs: string, vs = VS): Program {
    const gl = this.gl;
    const pr = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
      gl.attachShader(pr, s);
    }
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) ?? "link error");
    const u: Record<string, WebGLUniformLocation> = {};
    const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i++) {
      const a = gl.getActiveUniform(pr, i)!;
      u[a.name] = gl.getUniformLocation(pr, a.name)!;
    }
    return { pr, u };
  }

  private texture(w: number, h: number, internal: number, format: number, type: number, data: ArrayBufferView | null): WebGLTexture {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  private framebuffer(t: WebGLTexture): WebGLFramebuffer {
    const gl = this.gl;
    const f = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return f;
  }

  private bind(unit: number, t: WebGLTexture): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, t);
  }

  /** Uploads one rectangle of a full-size RGBA float array. */
  private upload(t: WebGLTexture, data: Float32Array, x0 = 0, y0 = 0, x1 = this.width - 1, y1 = this.height - 1): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, this.width);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, x0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1, gl.RGBA, gl.FLOAT, data);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
  }
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}
