// Wave Dude 2D web - opening and saving projects in the format of the Windows app: a folder with configuration.json
// (ProjectConfig.vb) and the scene image in scene_images/. In the browser a project travels as a .zip of that folder.
// Keys this version does not know are kept and written back, as the Windows app does.
// GPL-3.0-or-later.

import { Scene } from "../engine/scene";
import { SourceSpec, SourceElement, SourceMotion, newSource, newMotion, elementsOf } from "../engine/sources";
import type { Sim, NewProbe, Measurement } from "../sim";
import { readZip, writeZip, ZipEntry } from "./zip";
import { Circuit, LogicJSON } from "../logic/circuit";

type Dict = Record<string, unknown>;

export interface SceneInfo {
  mode: "image" | "user_defined";
  /** Path of the scene image inside the project folder, e.g. "scene_images/lens.png". */
  imagePath: string;
  /** The original image file, saved back unchanged unless the scene was painted on. */
  imageBlob: Blob | null;
  /** Painted on in the browser: the image is regenerated from the cells when saving. */
  dirty: boolean;
  background: number;
  useSources: boolean;
}

export interface ProjectMeta {
  name: string;
  description: string;
  created: string;
  /** The whole configuration.json as loaded (null for a project made here). */
  raw: Dict | null;
}

export const newSceneInfo = (): SceneInfo => ({ mode: "user_defined", imagePath: "", imageBlob: null, dirty: false, background: 1, useSources: true });
export const newMeta = (): ProjectMeta => ({ name: "Untitled", description: "", created: stamp(), raw: null });

/** ProjectConfig.Timestamp: UTC, yyyy-MM-ddTHH:mm:ssZ. */
function stamp(d = new Date()): string {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// ------------------------------------------------------------------------------------------ reading values

const sec = (d: Dict, k: string): Dict => (d[k] && typeof d[k] === "object" && !Array.isArray(d[k]) ? (d[k] as Dict) : {});
const num = (d: Dict, k: string, def: number, lo = -Infinity, hi = Infinity): number => {
  const v = typeof d[k] === "number" ? (d[k] as number) : typeof d[k] === "string" ? parseFloat(d[k] as string) : NaN;
  return Number.isFinite(v) && v >= lo && v <= hi ? v : def;
};
const int = (d: Dict, k: string, def: number, lo = -Infinity, hi = Infinity): number => Math.round(num(d, k, def, lo, hi));
const bool = (d: Dict, k: string, def: boolean): boolean => (typeof d[k] === "boolean" ? (d[k] as boolean) : def);
const text = (d: Dict, k: string, def: string): string => (typeof d[k] === "string" ? (d[k] as string) : def);

// ------------------------------------------------------------------------------------------ images

/** Exact pixel values of an image file: no colour management, no premultiplied alpha (the colours are data). */
export async function decodeImage(blob: Blob): Promise<{ rgba: Uint8ClampedArray; width: number; height: number }> {
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const c = document.createElement("canvas");
  c.width = bmp.width;
  c.height = bmp.height;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0);
  return { rgba: g.getImageData(0, 0, bmp.width, bmp.height).data, width: bmp.width, height: bmp.height };
}

/** The scene as a scene image (red = index x 100, green = image source level, blue = damping x 255). */
export async function encodeScene(s: Scene): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = s.width;
  c.height = s.height;
  const g = c.getContext("2d")!;
  const img = g.createImageData(s.width, s.height);
  for (let i = 0; i < s.width * s.height; i++) {
    img.data[i * 4] = Math.min(255, Math.round(s.n[i] * 100));
    img.data[i * 4 + 1] = s.imageLevel[i];
    img.data[i * 4 + 2] = Math.min(255, Math.max(0, Math.round((1 - s.dBase[i]) * 255)));
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return new Promise((ok, fail) => c.toBlob(b => (b ? ok(b) : fail(new Error("Could not make the PNG."))), "image/png"));
}

// ------------------------------------------------------------------------------------------ open

export interface LoadedProject {
  meta: ProjectMeta;
  sceneInfo: SceneInfo;
  scene: Scene;
  sources: SourceSpec[];
  probes: NewProbe[];
  sim: Dict;
  warnings: string[];
}

/** Opens a project from a .zip of the project folder, the files of the folder, or a configuration.json plus image. */
export async function openProject(files: File[]): Promise<LoadedProject> {
  let entries: { path: string; blob: Blob }[] = [];
  for (const f of files) {
    if (/\.zip$/i.test(f.name)) {
      for (const e of await readZip(await f.arrayBuffer())) entries.push({ path: e.name, blob: new Blob([e.data as BlobPart]) });
    } else {
      entries.push({ path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name, blob: f });
    }
  }
  entries = entries.map(e => ({ ...e, path: e.path.replace(/\\/g, "/") }));
  const configs = entries.filter(e => /(^|\/)configuration\.json$/i.test(e.path)).sort((a, b) => a.path.length - b.path.length);
  if (!configs.length) throw new Error("No configuration.json found. Choose a project folder, a .zip of one, or its configuration.json.");
  const cfgEntry = configs[0];
  const root = cfgEntry.path.slice(0, cfgEntry.path.length - "configuration.json".length);
  const json = (await cfgEntry.blob.text()).replace(/^\uFEFF/, "");
  const raw = JSON.parse(json) as Dict;
  const warnings: string[] = [];
  if (int(raw, "format_version", 1) > 1) warnings.push("This project was saved by a newer version; unknown settings are kept as they are.");

  const meta: ProjectMeta = {
    name: text(raw, "project_name", root.split("/").filter(Boolean).pop() ?? "Project"),
    description: text(raw, "description", ""),
    created: text(raw, "created", stamp()),
    raw,
  };

  // ---- scene
  const sc = sec(raw, "scene");
  const info: SceneInfo = {
    mode: text(sc, "mode", "user_defined") === "image" ? "image" : "user_defined",
    imagePath: text(sc, "image_file", ""),
    imageBlob: null,
    dirty: false,
    background: num(sc, "background_refractive_index", 1, 1, 2.55),
    useSources: bool(sc, "use_sources", false),
  };
  let scene: Scene;
  if (info.mode === "image") {
    const want = (root + info.imagePath).replace(/\\/g, "/").toLowerCase();
    const base = info.imagePath.replace(/\\/g, "/").split("/").pop()!.toLowerCase();
    const img = entries.find(e => e.path.toLowerCase() === want)
      ?? entries.find(e => e.path.toLowerCase().endsWith("/" + base) || e.path.toLowerCase() === base);
    if (!img) throw new Error(`The scene image “${info.imagePath}” is not in what you opened. Open the whole project folder or a .zip of it.`);
    info.imageBlob = img.blob;
    const d = await decodeImage(img.blob);
    checkSize(d.width, d.height);
    scene = Scene.fromImage(d.rgba, d.width, d.height, info.useSources);
  } else {
    const w = int(sc, "user_width", 1920, 8, 16384), h = int(sc, "user_height", 1080, 8, 16384);
    checkSize(w, h);
    scene = new Scene(w, h, info.background);
  }
  scene.edgeOn = bool(sc, "damping_edge_enabled", false);
  scene.edge = int(sc, "damping_edge_size_px", 64, 1, 8192);
  scene.applyEdge();

  // ---- object sources
  const sources: SourceSpec[] = [];
  const items = sec(raw, "object_sources").items;
  if (Array.isArray(items))
    for (const it of items as Dict[]) {
      const composite = text(it, "main_type", "single") === "composite";
      const s = newSource({
        name: text(it, "name", "Source"),
        kind: (text(it, "web_kind", "") as SourceSpec["kind"]) || (composite ? "array" : "point"),
        x: int(it, "x", 100), y: int(it, "y", 100),
        x2: int(it, "web_x2", int(it, "x", 100)), y2: int(it, "web_y2", int(it, "y", 100)),
        hasPosition: bool(it, "has_position", true),
        enabled: bool(it, "source_on", true),
        detach: bool(it, "detach_source", false),
        detachAfterSteps: int(it, "detach_after_steps", 1000, 0),
        level: int(it, "frequency", 100, 1, 255),
        amplitudePct: int(it, "amplitude", 100, 0, 100),
        phaseDeg: int(it, "phase_deg", 0, -180, 180),
        mode: text(it, "mode", "continuous") === "pulsed" ? "pulsed" : "continuous",
        shape: text(it, "pulse_shape", "gaussian") === "smoothed_square" ? "square" : "gaussian",
        onCycles: int(it, "pulse_width_cycles", 10, 1),
        offCycles: int(it, "off_state_cycles", 10, 1),
        countX: int(it, "array_size_x", 1, 1), countY: int(it, "array_size_y", 1, 1),
        spacingX: int(it, "spacing_x", 10), spacingY: int(it, "spacing_y", 10),
        randomize: text(it, "composite_mode", "inherit") === "randomize",
        randFrequency: bool(it, "randomize_frequency", false) ? int(it, "randomize_frequency_amount", 0, 0) : 0,
        randPhase: bool(it, "randomize_phase", false) ? int(it, "randomize_phase_amount", 0, 0) : 0,
        randOffWidth: bool(it, "randomize_off_width", false) ? int(it, "randomize_off_width_amount", 0, 0) : 0,
        randPosition: bool(it, "randomize_position", false) ? int(it, "randomize_position_amount", 0, 0) : 0,
        phaseStepXDeg: num(it, "web_phase_step_x", 0), phaseStepYDeg: num(it, "web_phase_step_y", 0),
        angleDeg: num(it, "web_angle", 0), beamWidth: num(it, "web_beam_width", 16, 2),
        lineSpacing: num(it, "web_line_spacing", 1, 1),
        seed: int(it, "web_seed", Math.floor(Math.random() * 2 ** 31)),
      });
      if (!composite && s.kind === "array") s.kind = "point";
      // a moving point source (web only)
      const mo = it.web_motion;
      if (mo && typeof mo === "object" && s.kind === "point") {
        const d = mo as Dict;
        s.motion = newMotion({
          kind: text(d, "kind", "line") === "circle" ? "circle" : "line", mach: num(d, "mach", 0.5, 0, 10),
          angleDeg: num(d, "angleDeg", 0), distance: num(d, "distance", 0, 0), radius: num(d, "radius", 80, 1), clockwise: bool(d, "clockwise", false),
        } satisfies Partial<SourceMotion>);
      }
      const els = it.elements;
      if (Array.isArray(els) && els.length) {
        // the saved elements are what the Windows app runs (randomized once, then fixed)
        s.baked = (els as Dict[]).map((e): SourceElement => ({
          x: int(e, "x", 0), y: int(e, "y", 0),
          level: int(e, "level", 100, 1, 255),
          amplitude: num(e, "amplitude", 0.5, 0, 1),
          phase: num(e, "phase_rad", 0),
          mode: text(e, "mode", "continuous") === "pulsed" ? "pulsed" : "continuous",
          shape: text(e, "pulse_shape", "gaussian") === "smoothed_square" ? "square" : "gaussian",
          onCycles: int(e, "on_width_cycles", 10, 1),
          offCycles: int(e, "off_width_cycles", 10, 1),
          offWidthBase: int(e, "off_width_base", int(e, "off_width_cycles", 10, 1), 1),
          randomizeOffWidthAmount: int(e, "randomize_off_width_amount", 0, 0),
          detachStep: int(e, "detach_after_step", -1, -1),
        }));
        if (s.baked.some(e => (e.randomizeOffWidthAmount ?? 0) > 0))
          warnings.push(`“${s.name}” re-randomizes its off-width during a run in the Windows app; here each element keeps its first off-width.`);
      }
      sources.push(s);
    }

  // ---- probes
  const probes: NewProbe[] = [];
  const pitems = sec(raw, "probes").items;
  if (Array.isArray(pitems))
    for (const it of pitems as Dict[]) {
      const m = text(it, "measurement", "amplitude");
      const kind = text(it, "probe_type", "point") === "line" ? "line" : "point";
      const { active: _a, measurement: _m, probe_type: _t, ax: _ax, ay: _ay, bx: _bx, by: _by, use_start_after_step: _u, start_after_step: _s, ...extra } = it;
      probes.push({
        kind, x: int(it, "ax", 100, 0), y: int(it, "ay", 100, 0), x2: int(it, "bx", 300, 0), y2: int(it, "by", 100, 0),
        measurement: (m === "integrated_intensity" ? "integrated" : m === "intensity" ? "intensity" : "amplitude") as Measurement,
        startAfter: bool(it, "use_start_after_step", false) ? int(it, "start_after_step", 0, 0) : -1,
        active: bool(it, "active", true),
        extra,
      });
    }

  return { meta, sceneInfo: info, scene, sources, probes, sim: sec(raw, "simulation"), warnings };
}

function checkSize(w: number, h: number): void {
  // six full-size float textures (state x 2, material, sources x 2, plus headroom): keep it within a GPU's reach
  if (w * h > 8192 * 4096) throw new Error(`The scene is ${w} × ${h} cells — too large for a browser (at most about 33 million cells).`);
}

/** Puts an opened project into the simulation. */
export function applyProject(sim: Sim, p: LoadedProject): void {
  const s = p.sim;
  sim.project = p.meta;
  sim.sceneInfo = p.sceneInfo;
  const e = sim.engine.settings;
  e.imageSourceAmplitude = num(sec(p.meta.raw ?? {}, "scene"), "image_source_scale", 1, 0, 1000);
  e.frequencyScale = num(s, "source_frequency_scale", 2, 0, 1000);
  e.stencil = bool(s, "use_4th_order_laplacian", false) ? "4th" : "3x3";
  e.timeDecayFactor = num(s, "time_decay_factor", 10, 1, 100);
  e.intensityScale = num(s, "intensity_scale", 1, 1e-7, 1e6);
  sim.useObjectSources = bool(sec(p.meta.raw ?? {}, "scene"), "use_object_sources", false);
  sim.brightness = { field: num(s, "field_brightness", 30, 1e-4, 1e5), intensity: num(s, "intensity_brightness", 30, 1e-4, 1e5) };
  // a project's brightness is what it was saved with: shown as it is
  sim.brightnessPct = 100;
  sim.prepareSpeed = 0;
  sim.blackLevel = { field: num(s, "field_black_level", -0.05, -10, 1), intensity: num(s, "intensity_black_level", 0, -10, 1) };
  sim.stepsPerFrame = Math.min(64, int(s, "visualize_every", 2, 1, 1000));
  sim.stopAt = int(s, "steps", 2500, 1, 10_000_000);
  for (const [q, key] of [["field", "field_color_scheme"], ["intensity", "intensity_color_scheme"]] as const) {
    const f = sim.schemeFile(text(s, key, q === "field" ? "Default_Field" : "Default_Intensity"));
    if (f) sim.scheme[q] = f;
  }
  sim.load(p.scene, p.sources, p.probes);
  // a wave circuit built in the sandbox (web only: the Windows app keeps the key but runs the sources as they are)
  const logic = p.meta.raw?.web_logic;
  if (logic && typeof logic === "object") {
    const c = Circuit.fromJSON(sim, logic as LogicJSON, p.sources);
    c.showBoxes = true;
    c.attach();
    sim.refreshSources();
  }
  sim.keepBrightness = true;
  void sim.setScheme(sim.viewMode, sim.scheme[sim.viewMode]);
}

// ------------------------------------------------------------------------------------------ save

const safeName = (s: string) => s.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim() || "Project";

/** The project as a .zip of its folder, readable by the Windows app. */
export async function saveProject(sim: Sim): Promise<{ blob: Blob; fileName: string }> {
  const meta = sim.project, info = sim.sceneInfo, scene = sim.scene, e = sim.engine.settings;
  const cfg: Dict = structuredClone(meta.raw ?? {});
  const folder = safeName(meta.name);
  cfg.format_version = 1;
  cfg.project_name = meta.name;
  cfg.created = meta.created;
  cfg.modified = stamp();
  cfg.description = meta.description;

  const files: ZipEntry[] = [];
  const enc = new TextEncoder();
  const sc = { ...sec(cfg, "scene") };
  const anySource = scene.imageLevel.some(v => v > 0);
  if (info.mode === "image" && info.imageBlob && !info.dirty) {
    sc.mode = "image";
    sc.image_file = info.imagePath;
    // the config keeps the path as written (the Windows app may use backslashes); zip entries use forward slashes
    files.push({ name: `${folder}/${info.imagePath.replace(/\\/g, "/")}`, data: new Uint8Array(await info.imageBlob.arrayBuffer()) });
  } else if (info.mode === "user_defined" && !info.dirty) {
    sc.mode = "user_defined";
    sc.user_width = scene.width;
    sc.user_height = scene.height;
    sc.background_refractive_index = info.background;
  } else {
    // painted in the browser (or a demo scene): save the cells as a new scene image
    const name = `scene_images/${safeName(meta.name)}_scene.png`;
    sc.mode = "image";
    sc.image_file = name;
    files.push({ name: `${folder}/${name}`, data: new Uint8Array(await (await encodeScene(scene)).arrayBuffer()) });
  }
  sc.damping_edge_enabled = scene.edgeOn;
  sc.damping_edge_size_px = Math.max(1, Math.round(scene.edge));
  sc.use_sources = info.mode === "image" ? info.useSources || (info.dirty && anySource) : false;
  sc.image_source_scale = e.imageSourceAmplitude;
  sc.use_object_sources = sim.useObjectSources;
  if (sc.background_refractive_index === undefined) sc.background_refractive_index = info.background;
  cfg.scene = sc;

  const si = { ...sec(cfg, "simulation") };
  Object.assign(si, {
    steps: sim.stopAt > 0 ? sim.stopAt : int(si, "steps", 2500),
    visualize_every: Math.max(1, Math.round(sim.stepsPerFrame)),  // the Windows app wants a whole number
    field_color_scheme: schemeName(sim, "field"),
    intensity_color_scheme: schemeName(sim, "intensity"),
    field_brightness: (sim.brightness.field * sim.brightnessPct) / 100,
    intensity_brightness: (sim.brightness.intensity * sim.brightnessPct) / 100,
    field_black_level: sim.blackLevel.field,
    intensity_black_level: sim.blackLevel.intensity,
    source_frequency_scale: e.frequencyScale,
    use_4th_order_laplacian: e.stencil === "4th",
    time_decay_factor: e.timeDecayFactor,
    intensity_scale: e.intensityScale,
  });
  for (const [k, v] of [["export_field", false], ["export_intensity", false], ["preview_field", true], ["preview_intensity", true],
    ["video_fps", 60], ["video_quality", 70], ["use_gpu", true], ["wave_speed_c", 0.563]] as const)
    if (si[k] === undefined) si[k] = v;
  cfg.simulation = si;

  cfg.object_sources = { count: sim.sources.length, items: sim.sources.map(sourceItem) };
  const probeItems = sim.probes.map(p => ({
    // defaults of ProbeSettings, then whatever the Windows app had stored, then what this version edits
    place_on: "field", box_size: "medium", box_x: 450, box_y: 20, scale_mode: "running", auto_scale_x: true, auto_scale_y: true,
    y_min: -1, y_max: 1, running_window: 500,
    ...(p.extra ?? {}),
    active: p.active !== false,
    measurement: p.measurement === "integrated" ? "integrated_intensity" : p.measurement,
    probe_type: p.kind,
    ax: Math.round(p.x), ay: Math.round(p.y), bx: Math.round(p.x2), by: Math.round(p.y2),
    use_start_after_step: (p.startAfter ?? -1) >= 0,
    start_after_step: Math.max(0, p.startAfter ?? 0),
  }));
  cfg.probes = { ...sec(cfg, "probes"), count: probeItems.length, items: probeItems };
  if (sim.logic && !sim.logic.empty) cfg.web_logic = sim.logic.toJSON(sim.sources);
  else delete cfg.web_logic;

  files.unshift({ name: `${folder}/configuration.json`, data: enc.encode(JSON.stringify(cfg, null, 2)) });
  for (const d of ["assets/", "output_frames/", "output_video/", "scene_images/"]) files.push({ name: `${folder}/${d}`, data: new Uint8Array(0) });
  return { blob: await writeZip(files), fileName: `${folder}.zip` };
}

function schemeName(sim: Sim, q: "field" | "intensity"): string {
  const file = sim.scheme[q];
  // keep the name exactly as the project had it when it still means the same scheme (e.g. "Default_intensity")
  const old = text(sec(sim.project.raw ?? {}, "simulation"), `${q}_color_scheme`, "");
  if (old && sim.schemeFile(old) === file) return old;
  return sim.schemes.find(s => s.file === file)?.name ?? file.replace(/\.json$/i, "");
}

/** SourceSettings.ToDictionary, with the web-only settings in extra "web_" keys. */
function sourceItem(s: SourceSpec): Dict {
  const els = elementsOf({ ...s, enabled: true, hasPosition: true });
  return {
    name: s.name,
    main_type: s.kind === "point" ? "single" : "composite",
    x: Math.round(s.x), y: Math.round(s.y),
    has_position: s.hasPosition,
    source_on: s.enabled,
    detach_source: s.detach,
    detach_after_steps: Math.max(0, Math.round(s.detachAfterSteps)),
    frequency: Math.round(s.level),
    amplitude: Math.min(100, Math.max(0, Math.round(s.amplitudePct))),
    phase_deg: Math.max(-180, Math.min(180, Math.round(s.phaseDeg))),
    mode: s.mode,
    pulse_shape: s.shape === "square" ? "smoothed_square" : "gaussian",
    pulse_width_cycles: Math.max(1, Math.round(s.onCycles)),
    off_state_cycles: Math.max(1, Math.round(s.offCycles)),
    array_size_x: s.kind === "line" ? els.length : s.countX,
    array_size_y: s.kind === "line" ? 1 : s.countY,
    spacing_x: Math.round(s.kind === "line" ? s.lineSpacing : s.spacingX),
    spacing_y: Math.round(s.spacingY),
    composite_mode: s.randomize ? "randomize" : "inherit",
    randomize_frequency: s.randFrequency > 0, randomize_frequency_amount: s.randFrequency,
    randomize_phase: s.randPhase > 0, randomize_phase_amount: s.randPhase,
    randomize_off_width: s.randOffWidth > 0, randomize_off_width_amount: s.randOffWidth,
    randomize_position: s.randPosition > 0, randomize_position_amount: s.randPosition,
    web_kind: s.kind, web_x2: s.x2, web_y2: s.y2, web_phase_step_x: s.phaseStepXDeg, web_phase_step_y: s.phaseStepYDeg,
    web_line_spacing: s.lineSpacing, web_seed: s.seed, web_angle: s.angleDeg, web_beam_width: s.beamWidth,
    web_motion: s.kind === "point" && s.motion ? { ...s.motion } : null,
    elements: els.map(e => ({
      x: e.x, y: e.y, level: e.level, amplitude: Math.min(1, Math.max(0, e.amplitude)), phase_rad: e.phase,
      mode: e.mode, pulse_shape: e.shape === "square" ? "smoothed_square" : "gaussian",
      on_width_cycles: Math.max(1, e.onCycles), off_width_cycles: Math.max(1, e.offCycles),
      off_width_base: Math.max(1, e.offWidthBase ?? e.offCycles), randomize_off_width_amount: e.randomizeOffWidthAmount ?? 0,
      detach_after_step: e.detachStep,
    })),
  };
}
