// Wave Dude 2D web - the sandbox: free experimenting with every tool, projects in the Windows format, video.
// GPL-3.0-or-later.

import { Scene, BARRIER, glass } from "../engine/scene";
import { SourceSpec, newSource, elementsOf, newMotion } from "../engine/sources";
import { levelColor } from "../engine/physics";
import { OpticSpec, OPTIC_KINDS, newOptic, opticBounds, opticInfo } from "../engine/optics";
import type { Quantity } from "../engine/engine";
import { DEFAULT_BRIGHTNESS_PCT, type Measurement } from "../sim";
import { openProject, applyProject, saveProject, decodeImage, newMeta, newSceneInfo } from "../project/project";
import { h, help, slider, select, check, numberInput, segmented, fold, setFold, refreshSummaries, filterFolds } from "./dom";
import type { Shell } from "./shell";
import { logicSection } from "./logicPanel";

interface Demo { id: string; label: string; build: (w: number, h: number) => { scene: Scene; sources: SourceSpec[]; optics?: OpticSpec[] } }

const DEMOS: Demo[] = [
  { id: "empty", label: "Empty", build: (w, hh) => ({ scene: new Scene(w, hh, background), sources: [] }) },
  {
    id: "lens", label: "Lens", build: (w, hh) => {
      const s = new Scene(w, hh);
      // a fat lens left of centre, so its focus (about 0.78 H behind it) is well inside a wide window
      s.ellipse(w * 0.32, hh / 2, Math.max(20, hh * 0.14), hh * 0.36, glass(1.5));
      return { scene: s, sources: [newSource({ name: "Wave maker", kind: "line", x: Math.round(w * 0.12), y: Math.round(hh * 0.15), x2: Math.round(w * 0.12), y2: Math.round(hh * 0.85), level: 60 })] };
    },
  },
  {
    id: "slit", label: "Double slit", build: (w, hh) => {
      const s = new Scene(w, hh), x = Math.round(w * 0.35), cy = hh / 2;
      s.rect(x, 0, 8, hh, BARRIER);
      s.rect(x, cy - 37, 8, 14, { absorb: 0 });
      s.rect(x, cy + 23, 8, 14, { absorb: 0 });
      return { scene: s, sources: [newSource({ name: "Wave maker", kind: "line", x: Math.round(w * 0.12), y: 0, x2: Math.round(w * 0.12), y2: hh - 1, level: 60 })] };
    },
  },
  {
    id: "fiber", label: "Light guide (total internal reflection)", build: (w, hh) => {
      const s = new Scene(w, hh), cy = hh / 2;
      const mid = (x: number) => cy + Math.sin((x / w) * Math.PI * 1.5) * hh * 0.18;
      s.fill(0, 0, w, hh, (x, y) => Math.abs(y - mid(x)) < 18 && x > w * 0.08, glass(1.6));
      // the source sits inside the guide, on its centre line
      const sx = Math.round(w * 0.1);
      return { scene: s, sources: [newSource({ name: "Source", kind: "point", x: sx, y: Math.round(mid(sx)), level: 70 })] };
    },
  },
  {
    id: "bench", label: "Optics bench: laser and lens", build: (w, hh) => {
      const s = new Scene(w, hh), cy = Math.round(hh / 2);
      return {
        scene: s,
        // a wide beam and a strong lens: a tight focus in the middle of the picture, then the beam spreads again
        sources: [newSource({ name: "Laser", kind: "laser", x: Math.round(w * 0.12), y: cy, level: 60, beamWidth: Math.max(20, Math.round(hh * 0.15)) })],
        optics: [newOptic("convex", { x: Math.round(w * 0.38), y: cy, size: Math.round(hh * 0.62), radius: Math.round(hh * 0.36) })],
      };
    },
  },
  {
    id: "corner", label: "Corner reflector", build: (w, hh) => {
      const s = new Scene(w, hh);
      s.segment(w * 0.75, hh * 0.15, w * 0.95, hh * 0.5, 8, BARRIER);
      s.segment(w * 0.95, hh * 0.5, w * 0.75, hh * 0.85, 8, BARRIER);
      return { scene: s, sources: [newSource({ name: "Pulse", kind: "point", x: Math.round(w * 0.3), y: Math.round(hh * 0.4), level: 60, mode: "pulsed", onCycles: 3, offCycles: 60 })] };
    },
  },
];

const SIZES: [string, string][] = [["fit", "Fit window"], ["960x540", "960 × 540"], ["1280x720", "1280 × 720"], ["1920x1080", "1920 × 1080"], ["2560x1440", "2560 × 1440"], ["3840x2160", "3840 × 2160"]];

let size = "fit";
let demo = "lens";
let background = 1;
/** A message to show at the top of the panel after it is drawn again (e.g. after opening a project). */
let flash: { msg: string; kind: "ok" | "no" | "" } | null = null;
const video = { frames: 300, stepsPerFrame: 4, fps: 60, quality: 70, area: "scene" as "scene" | "view", overlay: true };

export function openSandbox(shell: Shell): void {
  const { sim } = shell;
  shell.showStage(true);
  shell.setTools(["source", "line", "laser", "optic", "glass", "barrier", "absorber", "erase", "pointProbe", "lineProbe"]);
  sim.view.tool = "pan";
  shell.setGraph("auto");
  sim.view.onMeasure = () => {};
  sim.grabbable = true;
  sim.keepMine = false;
  if (sim.logic) { sim.logic.showBoxes = true; sim.logic.drawLabels(); }
  if (sim.owner !== "sandbox") {
    // coming from an experiment: start a fresh project with a demo scene
    sim.owner = "sandbox";
    sim.project = newMeta();
    sim.brightness = { field: 2, intensity: 2 };
    sim.brightnessPct = DEFAULT_BRIGHTNESS_PCT;
    sim.prepareSpeed = 0;
    sim.blackLevel = { field: 0, intensity: 0 };
    sim.stopAt = 0;
    sim.useObjectSources = true;
    sim.stepsPerFrame = 1;
    loadDemo(sim);
  }
  renderPanel(shell);
}

function dims(sim: Shell["sim"]): [number, number] {
  if (size !== "fit") return size.split("x").map(Number) as [number, number];
  return [Math.max(64, Math.round(sim.view.cssW)), Math.max(64, Math.round(sim.view.cssH))];
}

function loadDemo(sim: Shell["sim"]): void {
  const [w, hh] = dims(sim);
  const d = DEMOS.find(x => x.id === demo) ?? DEMOS[0];
  const { scene, sources, optics } = d.build(w, hh);
  scene.edgeOn = sim.scene.edgeOn;
  scene.edge = sim.scene.edge;
  sim.sceneInfo = { ...newSceneInfo(), background, mode: d.id === "empty" ? "user_defined" : "image", dirty: d.id !== "empty" };
  sim.load(scene, sources, [], optics ?? []);
  sim.keepBrightness = false;
  // a good brightness from the first frame on
  sim.calibrateBrightness();
  // a new scene waits for ▶ Run
  sim.hold();
}

/** What the "Find a setting" box holds (kept while the panel is drawn again). */
let query = "";

const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const KIND: Record<SourceSpec["kind"], string> = { point: "point", line: "line", array: "array", laser: "laser" };
const MEASUREMENTS: [Measurement, string][] = [["amplitude", "Field"], ["intensity", "Intensity"], ["integrated", "Integrated"]];

function renderPanel(shell: Shell): void {
  const { sim, panel } = shell;
  const rerender = () => { const top = panel.scrollTop; renderPanel(shell); panel.scrollTop = top; };
  const status = h("p", { class: "status", role: "status" });
  const say = (msg: string, kind: "ok" | "no" | "" = "") => { status.className = `status ${kind}`; status.textContent = msg; };
  if (flash) { say(flash.msg, flash.kind); flash = null; }
  // everything of this drawing of the panel lives in `root` (listeners on it go away with it)
  const root = h("div", { class: "sbx" });

  // ---- project
  const openFiles = h("input", { type: "file", accept: ".zip,.json,image/*", multiple: true, hidden: true });
  const openFolder = h("input", { type: "file", hidden: true });
  openFolder.setAttribute("webkitdirectory", "");
  const doOpen = async (list: FileList | null) => {
    if (!list?.length) return;
    try {
      say("Opening…");
      const p = await openProject([...list]);
      applyProject(sim, p);
      sim.owner = "sandbox";
      sim.hold();
      flash = { msg: `Opened “${p.meta.name}”.${p.warnings.length ? " " + p.warnings.join(" ") : ""}`, kind: p.warnings.length ? "" : "ok" };
      rerender();
    } catch (e) { say((e as Error).message, "no"); }
    openFiles.value = ""; openFolder.value = "";
  };
  openFiles.addEventListener("change", () => void doOpen(openFiles.files));
  openFolder.addEventListener("change", () => void doOpen(openFolder.files));
  const doSave = async () => {
    try {
      say("Saving…");
      const { blob, fileName } = await saveProject(sim);
      download(blob, fileName);
      say(`Saved ${fileName}. Unzip it into your Windows projects folder to open it there.`, "ok");
    } catch (e) { say((e as Error).message, "no"); }
  };
  const nameIn = h("input", { type: "text", class: "proj-name", value: sim.project.name, placeholder: "Untitled", "aria-label": "Project name", spellcheck: "false" });
  nameIn.addEventListener("change", () => { sim.project.name = nameIn.value.trim() || "Untitled"; });
  const descIn = h("textarea", { rows: 2, "aria-label": "Project description", placeholder: "What is this project about?" }, sim.project.description);
  descIn.addEventListener("change", () => { sim.project.description = descIn.value; });

  // ---- scene image
  const imgIn = h("input", { type: "file", accept: "image/*" });
  imgIn.addEventListener("change", async () => {
    const f = imgIn.files?.[0];
    if (!f) return;
    try {
      const d = await decodeImage(f);
      const scene = Scene.fromImage(d.rgba, d.width, d.height, sim.sceneInfo.useSources);
      scene.edgeOn = sim.scene.edgeOn;
      scene.edge = sim.scene.edge;
      sim.sceneInfo = { ...newSceneInfo(), mode: "image", imagePath: `scene_images/${f.name}`, imageBlob: f, useSources: sim.sceneInfo.useSources };
      sim.load(scene, sim.sources, sim.probeList(), [], true);
      if (!sim.keepBrightness) sim.calibrateBrightness();
      sim.hold();
      rerender();
    } catch (e) { say((e as Error).message, "no"); }
  });

  // ---- sources and probes (drawn again whenever the simulation adds, moves or selects one)
  const sourcesBox = h("div", { class: "list src-list" });
  const opticsBox = h("div", { class: "list src-list optics-list" });
  const probesBox = h("div", { class: "list probe-list" });
  let shownSelection = sim.selectedSource;

  function renderLists(): void {
    // sources deleted here or erased on the picture leave the wave circuit too
    if (sim.logic?.prune(sim.sources)) logic.relist();
    sourcesBox.replaceChildren();
    if (!sim.sources.length)
      sourcesBox.append(h("p", { class: "empty" }, "No sources yet. Pick ", h("b", {}, "◉ Source"), " or ", h("b", {}, "━ Line source"), " under the picture and click on the simulation."));
    let selItem: HTMLElement | null = null;
    for (const s of sim.sources) {
      const sel = s.id === sim.selectedSource;
      const toggle = () => { sim.selectedSource = sel ? null : s.id; shownSelection = sim.selectedSource; renderLists(); };
      const kind = s.kind === "array" ? `${s.countX}×${s.countY} array` : KIND[s.kind];
      // emitters of the wave circuit are switched by its inputs and transistors
      const owner = sim.logic?.ownerOf(s);
      const ownerText = owner ? ("input" in owner ? `transistor ${owner.label}` : `input ${owner.label}`) : "";
      const row = h("div", {
        class: `row ${sel ? "sel" : ""}`, role: "button", tabindex: 0, "aria-expanded": String(sel), style: `box-shadow: inset 3px 0 0 ${sim.sourceColor(s)}`,
        "aria-label": `${s.name}, ${kind}${sel ? ", selected" : ""}`, onclick: toggle,
        onkeydown: (e: Event) => { const k = (e as KeyboardEvent).key; if ((k === "Enter" || k === " ") && e.target === row) { e.preventDefault(); toggle(); } },
      },
        // the source's own colour (as on the canvas), with a dot in the colour of its frequency
        h("span", { class: "swatch src-swatch", style: `background:${sim.sourceColor(s)};--freq:${levelColor(s.level)}`, title: `Its colour on the picture · frequency ${Math.round(s.level)}` }),
        h("span", { class: "grow" }, h("span", { class: "nm" }, s.name),
          h("small", {}, ` ${kind} · f ${Math.round(s.level)}${s.mode === "pulsed" ? " · pulsed" : ""}${s.detach ? " · detaches" : ""}${s.motion && s.kind === "point" ? ` · moves ${s.motion.mach.toFixed(2)}×` : ""}${ownerText ? ` · ${ownerText}` : ""}`)),
        h("input", { type: "checkbox", class: "switch", checked: s.enabled, disabled: !!owner, title: owner ? `Switched by ${ownerText} (Logic)` : "On / off", "aria-label": `${s.name} on`,
          onclick: (e: Event) => e.stopPropagation(), onkeydown: (e: Event) => e.stopPropagation(),
          onchange: (e: Event) => { s.enabled = (e.target as HTMLInputElement).checked; sim.refreshSources(); renderLists(); } }),
        h("button", { class: "icon del", title: "Delete", "aria-label": `Delete ${s.name}`, onclick: (e: Event) => {
          e.stopPropagation();
          // its light goes with it
          sim.removeSources([s]);
          renderLists();
        } }, "✕"));
      const item = h("div", { class: `src-item ${sel ? "sel" : ""} ${s.enabled ? "" : "off"}` }, row,
        sel ? sourceEditor(s, () => sim.refreshSources(), true, renderLists) : null);
      if (sel) selItem = item;
      sourcesBox.append(item);
    }
    // a source picked on the simulation: bring it into view in the list
    if (sim.selectedSource !== shownSelection) {
      shownSelection = sim.selectedSource;
      if (selItem && !secSources.querySelector<HTMLElement>(".fold-b")!.hidden) requestAnimationFrame(() => selItem!.scrollIntoView({ block: "nearest" }));
    }

    opticsBox.replaceChildren();
    if (!sim.optics.length) opticsBox.append(h("p", { class: "empty" }, "No elements yet. Choose one above, then click on the simulation."));
    for (const o of sim.optics) {
      const sel = o.id === sim.selectedOptic;
      const toggle = () => { sim.selectedOptic = sel ? null : o.id; renderLists(); };
      const row = h("div", {
        class: `row ${sel ? "sel" : ""}`, role: "button", tabindex: 0, "aria-expanded": String(sel), "aria-label": `${o.name}${sel ? ", selected" : ""}`, onclick: toggle,
        onkeydown: (e: Event) => { const k = (e as KeyboardEvent).key; if ((k === "Enter" || k === " ") && e.target === row) { e.preventDefault(); toggle(); } },
      },
        h("span", { class: "optic-ic", "aria-hidden": "true" }, OPTIC_KINDS.find(k => k.kind === o.kind)?.icon ?? "◐"),
        h("span", { class: "grow" }, h("span", { class: "nm" }, o.name), h("small", {}, ` n ${o.n.toFixed(2)} · ${Math.round(o.angleDeg)}°`)),
        h("button", { class: "icon del", title: "Delete", "aria-label": `Delete ${o.name}`, onclick: (e: Event) => { e.stopPropagation(); sim.removeOptic(o.id); } }, "✕"));
      opticsBox.append(h("div", { class: `src-item ${sel ? "sel" : ""}` }, row, sel ? opticEditor(sim, o, true, renderLists) : null));
    }

    probesBox.replaceChildren();
    if (!sim.probes.length)
      probesBox.append(h("p", { class: "empty" }, "No probes yet. Pick ", h("b", {}, "⊕ Probe"), " or ", h("b", {}, "⟷ Line probe"), " under the picture: the graph appears below it."));
    sim.probes.forEach((p, idx) => {
      const update = (change: Partial<typeof p>) => {
        const list = sim.probeList();
        list[idx] = { ...list[idx], ...change };
        sim.setProbes(list);
        renderLists();
      };
      const start = h("input", { type: "number", min: -1, step: 1, value: p.startAfter ?? -1, "aria-label": "Start adding up after step" });
      start.addEventListener("change", () => update({ startAfter: Math.max(-1, Math.round(+start.value)) }));
      const where = p.kind === "point" ? `(${p.x}, ${p.y})` : `(${p.x}, ${p.y}) → (${p.x2}, ${p.y2})`;
      probesBox.append(h("div", { class: `probe ${p.active === false ? "off" : ""}` },
        h("div", { class: "row" },
          h("span", { class: "swatch", style: `background:${p.color}` }),
          h("span", { class: "grow" }, h("span", { class: "nm" }, p.label), h("small", {}, ` ${p.kind === "point" ? "point" : "line"} ${where}`)),
          h("input", { type: "checkbox", class: "switch", checked: p.active !== false, title: "Measure (active)", "aria-label": `${p.label} measuring`,
            onchange: (e: Event) => update({ active: (e.target as HTMLInputElement).checked }) }),
          h("button", { class: "icon del", title: "Delete", "aria-label": `Delete ${p.label}`, onclick: () => { sim.removeProbe(p.id); renderLists(); } }, "✕")),
        h("div", { class: "row sub" },
          segmented({ options: MEASUREMENTS, value: p.measurement, small: true, label: undefined, onChange: v => update({ measurement: v as Measurement }) }),
          p.measurement === "integrated"
            ? h("label", { class: "inline", "data-help": "Integrated: start adding up after this step (−1 = from the start)" }, "from step", start) : null)));
    });
    refreshSummaries(root);
    if (query) filterFolds(root, query);
  }
  const logic = logicSection(shell, rerender);
  sim.changed = [renderLists, logic.relist];

  const schemeOpts = (t: Quantity) => sim.schemes.filter(s => s.type === t && s.file !== "custom:(editing)").map(s => [s.file, s.name.replace(/_/g, " ")] as [string, string]);
  const schemeName = (t: Quantity) => (sim.schemes.find(s => s.file === sim.scheme[t])?.name ?? sim.scheme[t].replace(/\.json$/i, "")).replace(/_/g, " ");
  const logB = (q: Quantity) => slider({
    label: q === "field" ? "Field brightness" : "Intensity brightness", min: -1, max: 2.5, step: 0.01, value: Math.log10(sim.brightness[q]),
    format: v => `×${(10 ** v).toPrecision(2)}`, help: "The full brightness (100% on the ☀ slider under the picture). Display gain only — it does not change the physics. Same as Brightness in the Windows app.",
    onInput: v => { sim.brightness[q] = 10 ** v; },
  });
  const blackL = (q: Quantity) => slider({
    label: q === "field" ? "Field black level" : "Intensity black level", min: -0.5, max: 0.5, step: 0.01, value: sim.blackLevel[q],
    help: "Lifts (positive) or lowers (negative) the darkest colours of the scheme: colour × (1 − b) + b. The Windows app's default for the field is −0.05.",
    onInput: v => sim.setBlackLevel(q, v),
  });

  const recBox = h("div", {});
  renderVideo(sim, recBox);

  const e = sim.engine.settings;
  const demoLabel = DEMOS.find(d => d.id === demo)?.label ?? "Scene";
  const imageName = sim.sceneInfo.mode === "image" && sim.sceneInfo.imagePath ? sim.sceneInfo.imagePath.split("/").pop()! : "";

  const secScene = fold({ id: "sbx-scene", title: "Scene", icon: "🌊", summary: () => `${imageName || demoLabel} · ${sim.scene.width} × ${sim.scene.height}` },
    select({ label: "Start from", options: DEMOS.map(d => [d.id, d.label]), value: demo, onChange: v => { demo = v; loadDemo(sim); rerender(); } }),
    select({ label: "Size (cells)", options: SIZES, value: size, help: "Number of grid cells. Bigger shows finer detail but is slower. “Fit window” uses one cell per screen pixel.", onChange: v => { size = v; loadDemo(sim); rerender(); } }),
    demo === "empty" ? slider({ label: "Background refractive index", min: 1, max: 2.55, step: 0.01, value: background, help: "Index of the empty scene (the Windows app allows 1.00–2.55).", onInput: v => { background = v; }, onChange: () => { loadDemo(sim); } }) : null,
    check({ label: "Damping edge", value: sim.scene.edgeOn, help: "An absorbing border so waves leave the picture instead of bouncing back off the edges.", onChange: v => { sim.scene.edgeOn = v; sim.scene.applyEdge(); sim.engine.updateMaterial(); } }),
    slider({ label: "Edge thickness", min: 1, max: 160, step: 1, value: sim.scene.edge, unit: " cells", onInput: v => { sim.scene.edge = v; }, onChange: () => { sim.scene.applyEdge(); sim.engine.updateMaterial(); } }),
    fold({ id: "sbx-image", title: "Scene image", sub: true, open: false, summary: () => imageName || "load your own" },
      h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Load a scene image"),
        help("Same format as the Windows app: red = refractive index × 100 (150 = glass n 1.5), green > 0 = a source with that frequency, blue = damping (255 = absorbs fully).")), imgIn),
      sim.sceneInfo.mode === "image" && !sim.sceneInfo.dirty ? h("p", { class: "muted small" }, `Image: ${sim.sceneInfo.imagePath} (${sim.scene.width} × ${sim.scene.height})`) : null,
      check({ label: "Use the image's sources (green)", value: sim.sceneInfo.useSources, help: "Green pixels of the scene image drive the field (SceneSettings “use sources”).",
        onChange: v => {
          sim.sceneInfo.useSources = v;
          if (sim.sceneInfo.imageBlob) void decodeImage(sim.sceneInfo.imageBlob).then(d => {
            const s = Scene.fromImage(d.rgba, d.width, d.height, v);
            s.edgeOn = sim.scene.edgeOn; s.edge = sim.scene.edge;
            sim.load(s, sim.sources, sim.probeList(), sim.optics, true);
          });
        } }),
      slider({ label: "Image source amplitude", min: 0, max: 5, step: 0.05, value: e.imageSourceAmplitude, help: "Strength of the image's sources (image source scale; 1 = the Python code).",
        onInput: v => { e.imageSourceAmplitude = v; }, onChange: () => sim.reload() })),
  );
  secScene.dataset.keywords = "image demo";

  const secPaint = fold({ id: "sbx-paint", title: "Draw & paint", icon: "🖌", summary: () => `${{ free: "freehand", line: "line", box: "box", filledBox: "filled box" }[sim.paintShape]} · ${sim.brush} cells · glass n ${sim.glassIndex.toFixed(2)}` },
    h("div", { class: "tool-picks" }, ...([["glass", "⬭ Glass"], ["barrier", "▮ Wall"], ["absorber", "░ Absorber"], ["erase", "⌫ Erase"]] as const).map(([tool, label]) =>
      h("button", { type: "button", class: `pick ${sim.view.tool === tool ? "on" : ""}`, onclick: () => { shell.selectTool(tool); rerender(); } }, label))),
    segmented({ label: "Shape", options: [["free", "✎ Freehand"], ["line", "╱ Line"], ["box", "▭ Box"], ["filledBox", "■ Filled"]], value: sim.paintShape,
      help: "Freehand: paint as you drag. Line: drag from one end to the other (snaps to straight and 45° when close). Box: drag from corner to corner, an outline or filled.",
      onChange: v => { sim.paintShape = v as typeof sim.paintShape; } }),
    h("p", { class: "hint" }, "Pick a material, then drag on the simulation."),
    slider({ label: `Thickness of ${{ glass: "glass", barrier: "walls", absorber: "absorbers", erase: "the eraser" }[sim.brushTool]} (radius)`, min: 1, max: 60, step: 1, value: sim.brush, unit: " cells",
      help: "Half the width of a stroke, a line or a box's outline; each material keeps its own. Absorbers soak up waves gradually from their edge inwards, so they need to be thick (20+ cells, the default): a thin one lets part of the wave through.", onInput: v => { sim.brush = v; } }),
    slider({ label: "Glass refractive index", min: 1.05, max: 2.55, step: 0.05, value: sim.glassIndex, help: "n: how many times slower waves travel in what the Glass tool paints. Scene images store n × 100 in the red channel, so 2.55 is the most a project can hold.", onInput: v => { sim.glassIndex = v; } }),
  );
  secPaint.dataset.keywords = "painting wall barrier absorber erase";

  const t = sim.sourceTemplate;
  const secSources = fold({ id: "sbx-sources", title: "Sources", icon: "◉",
    summary: () => sim.sources.length ? `${plural(sim.sources.length, "source")}${sim.useObjectSources ? "" : " · off"}` : "none" },
    h("div", { class: "tool-picks" },
      ...([["source", "◉ Point"], ["line", "━ Line"], ["laser", "⇶ Laser"]] as const).map(([tool, label]) =>
        h("button", { type: "button", class: `pick ${sim.view.tool === tool ? "on" : ""}`, "data-help": tool === "laser" ? "A narrow beam that shines one way. Click to place it, drag while placing to aim it." : tool === "line" ? "Drag a line of sources: a straight wave front." : "Click to place a point source.",
          onclick: () => { shell.selectTool(tool); rerender(); } }, label))),
    check({ label: "Use object sources", value: sim.useObjectSources, help: "Off: the sources below are kept (and saved) but do not drive the field (SceneSettings “use object sources”).", onChange: v => { sim.useObjectSources = v; sim.refreshSources(); } }),
    sourcesBox,
    fold({ id: "sbx-newsrc", title: "Settings for new sources", sub: true, open: false, class: "tpl",
      summary: () => `f ${Math.round(t.level)} · ${t.amplitudePct}%${t.mode === "pulsed" ? " · pulsed" : ""}${t.countX * t.countY > 1 ? ` · ${t.countX}×${t.countY}` : ""}` },
      h("p", { class: "hint" }, "Used by the next source you place with the Source or Line tool. Its ring is coloured by frequency: red = low, violet = high."),
      sourceEditor(t, () => {}, false, () => {})),
  );
  secSources.dataset.keywords = "source";

  const tplKind = sim.opticTemplate.kind;
  const secOptics = fold({ id: "sbx-optics", title: "Optics", icon: "◐",
    summary: () => sim.optics.length ? plural(sim.optics.length, "element") : "lenses, mirrors, prisms" },
    h("p", { class: "hint" }, "Choose an element, then click on the simulation to place it. Drag an element to move it."),
    h("div", { class: "optic-grid" }, ...OPTIC_KINDS.map(k => h("button", {
      type: "button", class: `optic-btn ${tplKind === k.kind && sim.view.tool === "optic" ? "on" : ""}`, "data-help": k.help,
      onclick: () => {
        const prev = sim.opticTemplate;
        // keep the glass and rotation the user chose; take the new shape's own sizes
        sim.opticTemplate = newOptic(k.kind, k.kind === "mirror" || k.kind === "parabolic" || k.kind === "splitter" ? {} : { n: prev.kind === "mirror" || prev.kind === "parabolic" || prev.kind === "splitter" ? 1.5 : prev.n });
        shell.selectTool("optic");
        rerender();
      },
    }, h("span", { class: "ic", "aria-hidden": "true" }, k.icon), h("span", {}, k.label)))),
    fold({ id: "sbx-optic-tpl", title: `Settings for the next ${OPTIC_KINDS.find(k => k.kind === tplKind)!.label.toLowerCase()}`, sub: true, open: false, class: "tpl",
      summary: () => opticInfo(sim.opticTemplate) }, opticEditor(sim, sim.opticTemplate, false, () => {})),
    opticsBox,
  );
  secOptics.dataset.keywords = "lens lenses mirror prism optics splitter grin focus";

  const secProbes = fold({ id: "sbx-probes", title: "Probes", icon: "⊕", summary: () => sim.probes.length ? plural(sim.probes.length, "probe") : "none" }, probesBox);
  secProbes.dataset.keywords = "measuring graph";

  const secDisplay = fold({ id: "sbx-display", title: "Display", icon: "🎨", open: false, summary: () => `${schemeName("field")} · ${schemeName("intensity")}` },
    select({ label: "Field colours", options: schemeOpts("field"), value: sim.scheme.field, onChange: v => void sim.setScheme("field", v) }),
    select({ label: "Intensity colours", options: schemeOpts("intensity"), value: sim.scheme.intensity, onChange: v => void sim.setScheme("intensity", v) }),
    h("a", { class: "btn small filter-item", href: "#/colors" }, "🎨 Edit colour schemes…"),
    logB("field"), logB("intensity"),
    fold({ id: "sbx-black", title: "Black levels", sub: true, open: false, summary: () => `${sim.blackLevel.field} · ${sim.blackLevel.intensity}` }, blackL("field"), blackL("intensity")),
    h("div", { class: "grid2" },
      check({ label: "Show materials", value: sim.showMaterial, help: "Tint glass blue-ish and walls grey.", onChange: v => { sim.showMaterial = v; } }),
      check({ label: "Show sources", value: sim.showSources, onChange: v => { sim.showSources = v; } })),
    check({ label: "Outline lenses, glass, mirrors and walls", value: sim.showOutlines, help: "A line around every material boundary, so objects stay visible whatever the waves are doing. Also on the toolbar (◇ Outlines) and the O key.",
      onChange: v => { sim.setOutlines(v); document.querySelectorAll<HTMLElement>("#toolbar .tool").forEach(b => { if (b.textContent?.includes("Outlines")) { b.classList.toggle("on", v); b.setAttribute("aria-pressed", String(v)); } }); } }),
  );
  secDisplay.dataset.keywords = "colors scheme";

  const secSim = fold({ id: "sbx-sim", title: "Simulation", icon: "⚙", open: false,
    summary: () => `${sim.stencil === "4th" ? "4th order" : "3×3"} · ${sim.stopAt ? `stops at ${sim.stopAt.toLocaleString()}` : "no stop"}` },
    select({ label: "Laplacian", options: [["3x3", "3×3 kernel (original)"], ["4th", "4th order cross"]], value: sim.stencil,
      help: "How the curvature of the field is computed. The 4th-order stencil has much less numerical dispersion (short waves keep their speed) and uses sub-steps to stay stable; waves travel at the same speed with both. Unlike the Windows app, where the 4th-order waves run 1.78× faster.", onChange: v => { sim.stencil = v as "3x3" | "4th"; } }),
    numberInput({ label: "Stop after step (0 = never)", value: sim.stopAt, min: 0, help: "Runs stop at this step, like the Steps setting of the Windows app.", onChange: v => { sim.stopAt = Math.max(0, Math.round(v)); } }),
    slider({ label: "Source frequency scale", min: 0.25, max: 8, step: 0.05, value: e.frequencyScale, help: "Angular frequency = level / 255 × 0.5 × this (radians per step). The Windows default is 2.",
      onInput: v => { e.frequencyScale = v; }, onChange: () => sim.reload() }),
    slider({ label: "Intensity decay factor", min: 1, max: 100, step: 1, value: e.timeDecayFactor,
      help: "How long the intensity view averages (TimeDecayFactor). Higher = smoother but slower to react.", onInput: v => { e.timeDecayFactor = v; } }),
    slider({ label: "Intensity scale", min: -2, max: 2, step: 0.05, value: Math.log10(e.intensityScale), format: v => `×${(10 ** v).toPrecision(2)}`,
      help: "Multiplies the intensity values themselves (also what probes measure), unlike brightness.", onInput: v => { e.intensityScale = 10 ** v; } }),
  );
  secSim.dataset.keywords = "stencil";

  const secVideo = fold({ id: "sbx-video", title: "Video", icon: "🎬", summary: () => `${video.frames} frames · ${video.fps} fps` }, recBox);
  secVideo.dataset.keywords = "mp4 record export movie";

  const sections = [secScene, secPaint, secOptics, secSources, secProbes, logic.section, secDisplay, secSim, secVideo];

  // ---- find a setting, open / close all
  const find = h("input", { type: "search", placeholder: "Find a setting…", value: query, "aria-label": "Find a setting in the sandbox panel" });
  const noHits = h("p", { class: "empty no-hits", hidden: true }, "No setting matches. Try “brush”, “frequency” or “colour”.");
  const allBtn = h("button", { type: "button", class: "icon all-toggle" });
  const syncAll = () => {
    const anyClosed = sections.some(s => !s.classList.contains("open"));
    allBtn.textContent = anyClosed ? "⊞" : "⊟";
    allBtn.title = anyClosed ? "Open all sections" : "Close all sections";
    allBtn.setAttribute("aria-label", allBtn.title);
    allBtn.disabled = !!query;
  };
  allBtn.addEventListener("click", () => {
    const open = sections.some(s => !s.classList.contains("open"));
    for (const s of sections) setFold(s, open);
    syncAll();
  });
  const findTop = h("div", { class: "find-top" });
  const applyFind = () => {
    const was = query.trim();
    query = find.value;
    // show the results from their start (the search box stays on top)
    if (query.trim() !== was && findTop.isConnected && findTop.getBoundingClientRect().top < panel.getBoundingClientRect().top) findTop.scrollIntoView({ block: "start" });
    const n = filterFolds(root, query);
    noHits.hidden = !query.trim() || n > 0;
    root.classList.toggle("finding", !!query.trim());
    syncAll();
  };
  find.addEventListener("input", applyFind);
  find.addEventListener("keydown", ev => { if (ev.key === "Escape" && find.value) { ev.stopPropagation(); find.value = ""; applyFind(); } });
  for (const s of sections) s.querySelector(".fold-h")!.addEventListener("click", syncAll);

  root.append(
    h("div", { class: "page-head" },
      h("h2", {}, "Sandbox"),
      h("p", { class: "muted" }, "Build anything: paint glass and walls, place sources and probes, measure. ",
        help("Mouse wheel zooms, right-drag or the ✋ hand tool pans. With the hand tool, drag a source or a probe to move it."))),
    h("div", { class: "project box" },
      h("div", { class: "proj-head" },
        h("div", { class: "proj-title" }, h("div", { class: "eyebrow" }, "Project"), nameIn),
        h("button", { class: "primary", onclick: () => void doSave(), "data-help": "Download the project as a .zip in the Windows app's format (configuration.json + scene image)." }, "💾 Save .zip")),
      h("div", { class: "btns" },
        h("button", { onclick: () => openFiles.click(), "data-help": "Open a project: a .zip of a project folder, or its configuration.json together with the scene image." }, "📂 Open…"),
        h("button", { onclick: () => openFolder.click(), "data-help": "Open a project folder of the Windows app directly." }, "Open folder…")),
      fold({ id: "sbx-desc", title: "Description", sub: true, open: false, summary: () => sim.project.description.trim() ? sim.project.description.trim() : "none" }, descIn),
      openFiles, openFolder),
    status,
    findTop,
    h("div", { class: "sbx-tools" }, h("span", { class: "find" }, find), allBtn),
    noHits,
    ...sections,
  );
  // keep the section summaries in step with the controls
  root.addEventListener("input", () => refreshSummaries(root));
  root.addEventListener("change", () => refreshSummaries(root));
  panel.replaceChildren(root);
  renderLists();
  syncAll();
  if (query) applyFind();
}

function renderVideo(sim: Shell["sim"], box: HTMLElement): void {
  if (typeof VideoEncoder === "undefined") {
    box.replaceChildren(h("p", { class: "muted" }, "This browser cannot encode video (WebCodecs is missing). Chrome, Edge and recent Safari and Firefox can."));
    return;
  }
  const bar = h("progress", { max: video.frames, value: 0, hidden: true });
  const out = h("div", {});
  let abort: AbortController | null = null;
  const rec = h("button", { class: "primary" }, "⏺ Record MP4");
  const cancel = h("button", { hidden: true }, "Cancel");
  rec.addEventListener("click", async () => {
    abort = new AbortController();
    rec.disabled = true; cancel.hidden = false; bar.hidden = false; bar.max = video.frames; bar.value = 0;
    out.replaceChildren(h("p", { class: "muted" }, `Rendering ${video.frames} frames…`));
    try {
      // the encoder library is only loaded when a video is made
      const { recordVideo } = await import("../view/video");
      const blob = await recordVideo(sim, { ...video }, f => { bar.value = f; }, abort.signal);
      const url = URL.createObjectURL(blob);
      const name = `${(sim.project.name || "wave-dude").replace(/[^\w.-]+/g, "_")}.mp4`;
      // the preview is only made on request: some GPU drivers' video decoders upset the WebGL context
      const show = h("button", {}, "▶ Preview");
      show.addEventListener("click", () => show.replaceWith(h("video", { src: url, controls: true, autoplay: true, loop: true, class: "preview" })));
      out.replaceChildren(
        h("div", { class: "btns" }, h("a", { class: "btn primary", href: url, download: name }, `⬇ Download ${name} (${(blob.size / 1e6).toFixed(1)} MB)`), show));
    } catch (e) {
      out.replaceChildren(h("p", { class: "status no" }, (e as Error).name === "AbortError" ? "Recording cancelled." : (e as Error).message));
    } finally {
      rec.disabled = false; cancel.hidden = true; bar.hidden = true;
    }
  });
  cancel.addEventListener("click", () => abort?.abort());
  const overlay = check({ label: "Include sources, probes and measurements", value: video.overlay, help: "Only for “What you see”.", onChange: v => { video.overlay = v; } });
  overlay.classList.toggle("dim", video.area !== "view");
  box.replaceChildren(
    h("p", { class: "hint" }, "Renders frame by frame from the current state (not in real time), then gives you an MP4."),
    h("div", { class: "grid2" },
      numberInput({ label: "Frames", value: video.frames, min: 1, max: 100000, onChange: v => { video.frames = Math.max(1, Math.round(v)); } }),
      numberInput({ label: "Frames per second", value: video.fps, min: 1, max: 240, onChange: v => { video.fps = Math.min(240, Math.max(1, Math.round(v))); } })),
    numberInput({ label: "Steps between frames", value: video.stepsPerFrame, min: 1, max: 1000, help: "Visualize every N steps, as in the Windows app.", onChange: v => { video.stepsPerFrame = Math.max(1, Math.round(v)); } }),
    slider({ label: "Quality", min: 1, max: 100, step: 1, value: video.quality, onInput: v => { video.quality = v; } }),
    select({ label: "Picture", options: [["scene", "Whole scene, 1 pixel per cell"], ["view", "What you see (zoom, overlay)"]], value: video.area,
      onChange: v => { video.area = v as "scene" | "view"; overlay.classList.toggle("dim", video.area !== "view"); } }),
    overlay,
    h("div", { class: "btns rec" }, rec, cancel), bar, out);
}

function download(blob: Blob, name: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** The settings under "More options" that differ from a plain source, for the section's summary. */
function moreSummary(s: SourceSpec): string {
  const on: string[] = [];
  if (s.countX * s.countY > 1) on.push(`${s.countX}×${s.countY} array`);
  if (s.phaseStepXDeg || s.phaseStepYDeg) on.push("phase steps");
  if (s.randomize && s.countX * s.countY > 1) on.push("randomized");
  if (s.detach) on.push(`detach @ ${s.detachAfterSteps}`);
  return on.length ? on.join(" · ") : s.kind === "line" ? "phase step, detach" : s.kind === "laser" ? "detach" : "array, detach";
}

/** Edits a source's settings; `existing` = it is already in the simulation (shows name, position and the element count). */
function sourceEditor(s: SourceSpec, changed: () => void, existing: boolean, relist: () => void): HTMLElement {
  const box = h("div", { class: "editor" });
  const draw = () => {
    // any change regenerates the elements (a loaded project's fixed elements are replaced)
    const c = () => { if (s.baked) { s.baked = undefined; draw(); } changed(); };
    const swatch = h("span", { class: "swatch big", style: `background:${levelColor(s.level)}` });
    const isArray = s.kind === "array" || (!existing && s.countX * s.countY > 1);
    const nameIn = h("input", { type: "text", value: s.name });
    nameIn.addEventListener("change", () => { s.name = nameIn.value; relist(); });
    const more = fold({ id: existing ? "src-more" : "tpl-more", title: "More options", sub: true, open: false, summary: () => moreSummary(s) },
      s.kind !== "line" && s.kind !== "laser" ? h("div", { class: "grid2" },
        numberInput({ label: "Array X", value: s.countX, min: 1, max: 256, help: "A grid of sources (a composite source in the Windows app), centred on the position.", onChange: v => { s.countX = Math.max(1, Math.round(v)); if (existing) s.kind = s.countX * s.countY > 1 ? "array" : "point"; c(); draw(); if (existing) relist(); } }),
        numberInput({ label: "Array Y", value: s.countY, min: 1, max: 256, onChange: v => { s.countY = Math.max(1, Math.round(v)); if (existing) s.kind = s.countX * s.countY > 1 ? "array" : "point"; c(); draw(); if (existing) relist(); } }),
        numberInput({ label: "Spacing X", value: s.spacingX, min: 1, max: 500, onChange: v => { s.spacingX = v; c(); } }),
        numberInput({ label: "Spacing Y", value: s.spacingY, min: 1, max: 500, onChange: v => { s.spacingY = v; c(); } }),
      ) : null,
      s.kind !== "point" && s.kind !== "laser" ? slider({ label: s.kind === "line" ? "Phase step along line" : "Phase step X", min: -180, max: 180, step: 5, value: s.phaseStepXDeg, unit: "°",
        help: "Extra phase for each next element. A steady phase step steers the beam (see the phased-array experiment).", onInput: v => { s.phaseStepXDeg = v; c(); } }) : null,
      isArray ? slider({ label: "Phase step Y", min: -180, max: 180, step: 5, value: s.phaseStepYDeg, unit: "°", onInput: v => { s.phaseStepYDeg = v; c(); } }) : null,
      isArray ? check({ label: "Randomize the elements", value: s.randomize, help: "Composite “inherit + randomize”: every element gets random offsets within ± the amounts below (fixed per seed).", onChange: v => { s.randomize = v; c(); draw(); } }) : null,
      isArray && s.randomize ? h("div", { class: "grid2" },
        numberInput({ label: "± frequency", value: s.randFrequency, min: 0, max: 254, onChange: v => { s.randFrequency = Math.max(0, Math.round(v)); c(); } }),
        numberInput({ label: "± phase (°)", value: s.randPhase, min: 0, max: 180, onChange: v => { s.randPhase = Math.max(0, Math.round(v)); c(); } }),
        numberInput({ label: "± off-width", value: s.randOffWidth, min: 0, max: 1000, onChange: v => { s.randOffWidth = Math.max(0, Math.round(v)); c(); } }),
        numberInput({ label: "± position", value: s.randPosition, min: 0, max: 1000, onChange: v => { s.randPosition = Math.max(0, Math.round(v)); c(); } })) : null,
      isArray && s.randomize ? h("button", { class: "filter-item", onclick: () => { s.seed = Math.floor(Math.random() * 2 ** 31); c(); }, "data-help": "New random numbers for the elements." }, "🎲 Re-roll") : null,
      check({ label: "Detach after some steps", value: s.detach, help: "The source fades out over 30 steps and stops holding the field, so waves pass through it.", onChange: v => { s.detach = v; c(); draw(); } }),
      s.detach ? numberInput({ label: "Detach after step", value: s.detachAfterSteps, min: 0, onChange: v => { s.detachAfterSteps = v; c(); } }) : null,
    );
    // a point source can move: in a line or round a circle (the Doppler effect)
    const canMove = existing ? s.kind === "point" : s.countX * s.countY <= 1;
    const m = s.motion;
    const motion = canMove ? fold({ id: existing ? "src-motion" : "tpl-motion", title: "Motion", sub: true, open: !!m,
      summary: () => (s.motion ? `${s.motion.kind === "circle" ? "circle" : "line"} · ${s.motion.mach.toFixed(2)}× wave speed` : "still") },
      segmented({ label: "Moves", options: [["still", "Still"], ["line", "→ Straight"], ["circle", "↻ Circle"]], value: m ? m.kind : "still",
        help: "A moving source squeezes its waves together ahead of it and stretches them behind (the Doppler effect). Faster than its own waves (above 1×) it drags a cone behind it.",
        onChange: v => { s.motion = v === "still" ? null : newMotion({ ...(s.motion ?? {}), kind: v as "line" | "circle" }); c(); draw(); if (existing) relist(); } }),
      m ? slider({ label: "Speed", min: 0, max: 2, step: 0.05, value: m.mach, format: v => `${v.toFixed(2)}× wave speed`,
        help: "As a multiple of the speed of the waves in empty space. Below about 0.75× the squeezed waves ahead stay long enough for the grid; 1× and faster makes a shock cone.",
        onInput: v => { m.mach = v; c(); }, onChange: () => relist() }) : null,
      m?.kind === "line" ? slider({ label: "Direction", min: -180, max: 180, step: 1, value: m.angleDeg, unit: "°", help: "0° = to the right, 90° = down.", onInput: v => { m.angleDeg = v; c(); } }) : null,
      m?.kind === "line" ? numberInput({ label: "Stops after (cells, 0 = at the edge)", value: m.distance, min: 0, onChange: v => { m.distance = Math.max(0, Math.round(v)); c(); } }) : null,
      m?.kind === "circle" ? slider({ label: "Radius", min: 5, max: 400, step: 1, value: m.radius, unit: " cells", help: "The circle is centred where the source was placed.", onInput: v => { m.radius = v; c(); } }) : null,
      m?.kind === "circle" ? check({ label: "Clockwise", value: m.clockwise, onChange: v => { m.clockwise = v; c(); } }) : null,
      m ? h("p", { class: "hint" }, "It starts from its place at step 0: press ⟲ Reset to watch it set off again.") : null,
    ) : null;
    const parts: (Node | null)[] = [
      existing ? h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Name")), nameIn) : null,
      existing ? h("div", { class: "grid2" },
        numberInput({ label: "X", value: s.x, onChange: v => { const dx = Math.round(v) - s.x; s.x += dx; s.x2 += dx; c(); } }),
        numberInput({ label: "Y", value: s.y, onChange: v => { const dy = Math.round(v) - s.y; s.y += dy; s.y2 += dy; c(); } })) : null,
      existing && s.baked ? h("p", { class: "note" }, `Loaded from a project: ${s.baked.length} fixed element${s.baked.length === 1 ? "" : "s"}. Changing a setting regenerates them.`) : null,
      h("div", { class: "freq" }, swatch, slider({ label: "Frequency", min: 1, max: 255, step: 1, value: s.level,
        help: "The source level 1–255 (the green value). Higher = faster oscillation = shorter waves. The colour shows it: red = low, violet = high.",
        onInput: v => { s.level = v; swatch.style.background = levelColor(v); c(); }, onChange: () => relist() })),
      slider({ label: "Amplitude", min: 0, max: 100, step: 1, value: s.amplitudePct, unit: "%", onInput: v => { s.amplitudePct = v; c(); } }),
      slider({ label: "Phase", min: -180, max: 180, step: 5, value: s.phaseDeg, unit: "°", help: "Where in its cycle the source starts. Two sources 180° apart push in opposite directions.", onInput: v => { s.phaseDeg = v; c(); } }),
      segmented({ label: "Mode", options: [["continuous", "Continuous"], ["pulsed", "Pulsed"]], value: s.mode, help: "Continuous: a steady wave. Pulsed: bursts of a few cycles, on and off.",
        onChange: v => { s.mode = v as SourceSpec["mode"]; c(); draw(); if (existing) relist(); } }),
      s.kind === "laser" || !existing ? h("div", { class: "pulse" },
        !existing ? h("p", { class: "hint" }, "Laser (⇶ tool):") : null,
        slider({ label: "Beam direction", min: -180, max: 180, step: 1, value: s.angleDeg, unit: "°", help: "0° = to the right, 90° = down. You can also aim while placing a laser by dragging.", onInput: v => { s.angleDeg = v; c(); } }),
        slider({ label: "Beam width", min: 3, max: 80, step: 1, value: s.beamWidth, unit: " cells", help: "Half-width of the Gaussian beam profile (where the amplitude has fallen to 1/e). A narrow beam spreads out faster (diffraction).", onInput: v => { s.beamWidth = v; c(); } })) : null,
      s.mode === "pulsed" ? h("div", { class: "pulse" },
        select({ label: "Pulse shape", options: [["gaussian", "Gaussian"], ["square", "Smoothed square"]], value: s.shape, onChange: v => { s.shape = v as SourceSpec["shape"]; c(); } }),
        slider({ label: "On (cycles)", min: 1, max: 50, step: 1, value: s.onCycles, onInput: v => { s.onCycles = v; c(); } }),
        slider({ label: "Off (cycles)", min: 1, max: 300, step: 1, value: s.offCycles, onInput: v => { s.offCycles = v; c(); } })) : null,
      motion,
      more,
      existing ? h("p", { class: "muted small cells" }, `${elementsOf({ ...s, enabled: true, hasPosition: true }).length} driven cells`) : null,
    ];
    box.replaceChildren(...parts.filter((x): x is Node => x !== null));
  };
  draw();
  return box;
}

/** Edits an optical element (the one about to be placed when `existing` is false). */
function opticEditor(sim: Shell["sim"], o: OpticSpec, existing: boolean, relist: () => void): HTMLElement {
  const box = h("div", { class: "editor" });
  const info = h("p", { class: "muted small cells" }, opticInfo(o));
  // every change redraws the element where it was and where it is now
  const ch = (f: () => void) => { const before = opticBounds(o); f(); if (existing) sim.updateOptic(o, before); info.textContent = opticInfo(o); };
  const lens = ["convex", "concave", "planoConvex", "planoConcave", "meniscus"].includes(o.kind);
  const mirror = o.kind === "mirror" || o.kind === "parabolic";
  const nameIn = h("input", { type: "text", value: o.name });
  nameIn.addEventListener("change", () => { o.name = nameIn.value; relist(); });
  const parts: (Node | null)[] = [
    existing ? h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Name")), nameIn) : null,
    existing ? h("div", { class: "grid2" },
      numberInput({ label: "X", value: o.x, onChange: v => ch(() => { o.x = Math.round(v); }) }),
      numberInput({ label: "Y", value: o.y, onChange: v => ch(() => { o.y = Math.round(v); }) })) : null,
    slider({ label: "Rotation", min: -180, max: 180, step: 1, value: o.angleDeg, unit: "°", help: "0° = the light travels left to right through it.", onInput: v => ch(() => { o.angleDeg = v; }) }),
    mirror ? null : slider({ label: o.kind === "grin" ? "Index in the middle" : "Refractive index n", min: 1.05, max: 2.55, step: 0.01, value: Math.min(2.55, o.n),
      help: "How many times slower waves travel in the glass (scene images can hold up to 2.55).", onInput: v => ch(() => { o.n = v; }) }),
    slider({ label: o.kind === "ball" ? "Diameter" : o.kind === "prism" ? "Height" : "Size (aperture)", min: 20, max: 700, step: 2, value: o.size, unit: " cells", onInput: v => ch(() => { o.size = v; }) }),
    lens ? slider({ label: "Radius of curvature R", min: 30, max: 1500, step: 5, value: o.radius, unit: " cells", help: "Smaller R = more strongly curved faces = shorter focal length.", onInput: v => ch(() => { o.radius = v; }) }) : null,
    o.kind === "parabolic" ? slider({ label: "Focal length", min: 30, max: 800, step: 5, value: o.radius, unit: " cells", onInput: v => ch(() => { o.radius = v; }) }) : null,
    o.kind === "prism" ? slider({ label: "Apex angle", min: 10, max: 120, step: 1, value: o.radius, unit: "°", onInput: v => ch(() => { o.radius = v; }) }) : null,
    o.kind === "ball" || o.kind === "prism" ? null : slider({ label: "Thickness", min: 1, max: 240, step: 1, value: o.thickness, unit: " cells",
      help: lens ? "Thickness in the middle (a converging lens is made at least thick enough to keep 2 cells at its rim)." : undefined, onInput: v => ch(() => { o.thickness = v; }) }),
    info,
  ];
  box.replaceChildren(...parts.filter((x): x is Node => x !== null));
  return box;
}
