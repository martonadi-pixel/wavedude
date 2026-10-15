// Wave Dude 2D web - the Sandbox: build anything. The tool rail left of the picture places and draws; the bar above
// it holds the settings of the active tool. The side panel has three tabs: Objects (the selected object's inspector
// and a list of everything), Scene (what the scene starts from, its size and edge, a scene image) and Settings
// (display, simulation, video). The project (name, save, open) is in the header.
// GPL-3.0-or-later.

import { defaultSettings } from "../../engine/engine";
import type { Quantity } from "../../engine/engine";
import { Scene } from "../../core/scene";
import { DEFAULT_BRIGHTNESS_PCT, type Sim } from "../../sim/sim";
import type { Tool } from "../../view/viewport";
import { decodeImage, newMeta, newSceneInfo } from "../../project/project";
import { h, adv, help, slider, select, check, numberInput, fold, refreshSummaries, filterFolds, tabs, isSimple, onSimpleChange } from "../../components";
import type { Shell } from "../../app/shell";
import { DEMOS, CIRCUITS } from "./demos";
import { projectBar, toast } from "./project-bar";
import { inspector } from "./inspector";
import { objectList } from "./objects";
import { sandboxToolOptions } from "./tool-options";
import { renderVideo } from "./video-panel";
import type { Live } from "./logic-editors";

const TOOLS: Tool[] = ["source", "line", "laser", "barrier", "glass", "absorber", "erase", "optic", "pointProbe", "lineProbe", "guide", "bit", "detector", "transistor"];
const SIZES: [string, string][] = [["fit", "Fit window"], ["960x540", "960 × 540"], ["1280x720", "1280 × 720"], ["1920x1080", "1920 × 1080"], ["2560x1440", "2560 × 1440"], ["3840x2160", "3840 × 2160"]];
const fmtSettle = (v: number) => (v <= 0 ? "off" : `${v.toLocaleString()} steps`);

let size = "fit";
let start = "lens";
let background = 1;
/** What the "find a setting" box holds (kept while the panel is drawn again). */
let query = "";
/** The shell the Sandbox was last opened in (for redrawing it when Simple mode is switched). */
let shown: Shell | null = null;
let followsWindow = false;

/** A "Fit window" scene follows the picture's size (a moment after the window or the panels stop changing). */
function followWindow(sim: Sim): void {
  if (followsWindow) return;
  followsWindow = true;
  let timer = 0;
  sim.view.resizeListeners.push(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (sim.owner !== "sandbox" || !sim.sceneInfo.fit || size !== "fit" || sim.view.mode3d) return;
      // never smaller than what holds the objects (the view then zooms out a little instead of cutting them off)
      const reach = sim.contentReach(), [fw, fh] = dims(sim);
      const w = Math.max(fw, Math.ceil(2 * reach.x)), hh = Math.max(fh, Math.ceil(2 * reach.y));
      if (Math.abs(w - sim.scene.width) > 2 || Math.abs(hh - sim.scene.height) > 2) sim.resizeScene(w, hh);
    }, 250);
  });
}
onSimpleChange(() => { if (shown && shown.sim.owner === "sandbox" && document.getElementById("panel")?.querySelector(".sandbox-tabs")) render(shown); });

export function openSandbox(shell: Shell): void {
  const { sim } = shell;
  shell.showStage(true);
  if (sim.owner !== "sandbox") prepare(sim);
  shell.setTools(TOOLS);
  shell.selectTool("pan");
  shell.setGraph("auto");
  sim.view.onMeasure = () => {};
  sim.keepMine = false;
  if (sim.logic) { sim.logic.showBoxes = true; sim.logic.drawLabels(); }
  shell.setHeader(projectBar(sim, () => render(shell)));
  shell.setToolOptions(sandboxToolOptions(sim, () => shell.refreshToolOptions()));
  shown = shell;
  followWindow(sim);
  render(shell);
}

/** Coming from another page: a fresh project with a demo scene and the default settings. */
function prepare(sim: Sim): void {
  sim.owner = "sandbox";
  Object.assign(sim.engine.settings, defaultSettings());
  sim.setWhiteLight(false);
  sim.project = newMeta();
  sim.brightness = { field: 2, intensity: 2 };
  sim.brightnessPct = DEFAULT_BRIGHTNESS_PCT;
  sim.prepareSpeed = 0;
  sim.blackLevel = { field: 0, intensity: 0 };
  sim.stopAt = 0;
  sim.useObjectSources = true;
  sim.stepsPerFrame = 1;
  loadStart(sim);
}

function dims(sim: Sim): [number, number] {
  if (size !== "fit") return size.split("x").map(Number) as [number, number];
  return [Math.max(64, Math.round(sim.view.cssW)), Math.max(64, Math.round(sim.view.cssH))];
}

/** Loads what the scene starts from: a demo (sized to the window or the chosen size) or a ready-made circuit. */
function loadStart(sim: Sim): void {
  const circuit = CIRCUITS.find(c => c.id === start);
  if (circuit) {
    circuit.build(sim);
    sim.logic!.showBoxes = true;
    sim.logic!.drawLabels();
    sim.sceneInfo = { ...newSceneInfo(), mode: "image", dirty: true };
    // the brightness the computing experiments use (most inputs start off, so measuring would pick too bright)
    sim.brightness = { field: 12, intensity: 18 };
    sim.keepBrightness = true;
    sim.hold();
    return;
  }
  const [w, hh] = dims(sim);
  const d = DEMOS.find(x => x.id === start) ?? DEMOS[0];
  const { scene, sources, optics } = d.build(w, hh, background);
  scene.edgeOn = sim.scene.edgeOn;
  scene.edge = sim.scene.edge;
  sim.sceneInfo = { ...newSceneInfo(), background, mode: d.id === "empty" ? "user_defined" : "image", dirty: d.id !== "empty", fit: size === "fit" };
  sim.load(scene, sources, [], optics ?? []);
  if (d.white) sim.setWhiteLight(true, d.white);
  sim.keepBrightness = false;
  // a good brightness from the first frame on
  sim.calibrateBrightness();
  // a new scene waits for ▶ Run
  sim.hold();
}

function render(shell: Shell): void {
  const { sim, panel } = shell;
  const rerender = () => { const top = panel.scrollTop; render(shell); panel.scrollTop = top; };
  let live: Live = [];
  const pick = (t: Tool) => shell.selectTool(t);

  // ---- Objects: the selected object's inspector, then the list of everything
  const objects = () => {
    live = [];
    const list = objectList(sim, live);
    const box = h("div", { class: "objects-tab" }, inspector(sim, live, pick, () => objectsTab.refresh()) ??
      h("p", { class: "hint insp-none" }, "Click an object on the picture (with ✋ Select) or in the list to see and change its settings."), list.el);
    return box;
  };

  // ---- Scene: what it starts from, size, edge, scene image
  const scene = () => {
    const startSel = h("select", { "aria-label": "Start from" },
      h("optgroup", { label: "Scenes" }, ...DEMOS.map(d => h("option", { value: d.id, selected: d.id === start }, d.label))),
      h("optgroup", { label: "Ready-made wave circuits" }, ...CIRCUITS.map(c => h("option", { value: c.id, selected: c.id === start }, c.label))));
    startSel.addEventListener("change", () => { start = startSel.value; loadStart(sim); rerender(); });
    const imgIn = h("input", { type: "file", accept: "image/*" });
    imgIn.addEventListener("change", async () => {
      const f = imgIn.files?.[0];
      if (!f) return;
      try {
        const d = await decodeImage(f);
        const s = Scene.fromImage(d.rgba, d.width, d.height, sim.sceneInfo.useSources);
        s.edgeOn = sim.scene.edgeOn; s.edge = sim.scene.edge;
        sim.sceneInfo = { ...newSceneInfo(), mode: "image", imagePath: `scene_images/${f.name}`, imageBlob: f, useSources: sim.sceneInfo.useSources };
        sim.load(s, sim.sources, sim.probeList(), [], true);
        if (!sim.keepBrightness) sim.calibrateBrightness();
        sim.hold();
        rerender();
      } catch (e) { toast((e as Error).message, "no"); }
    });
    const e = sim.engine.settings;
    const imageName = sim.sceneInfo.mode === "image" && sim.sceneInfo.imagePath ? sim.sceneInfo.imagePath.split("/").pop()! : "";
    return h("div", {},
      h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Start from"),
        help("Replaces the scene. The demos are made of objects you can select, move and change; the circuits are ready-made computers of light.")), startSel),
      CIRCUITS.some(c => c.id === start) ? null : adv(select({ label: "Size (cells)", options: SIZES, value: size,
        help: "Number of grid cells. Bigger shows finer detail but is slower. “Fit window” uses one cell per screen pixel and follows the window's size.", onChange: v => { size = v; loadStart(sim); rerender(); } })),
      start === "empty" ? adv(slider({ label: "Background refractive index", min: 1, max: 2.55, step: 0.01, value: background, help: "Index of the empty scene (the Windows app allows 1.00–2.55).",
        onInput: v => { background = v; }, onChange: () => { loadStart(sim); } })) : null,
      check({ label: "🌈 White light: all colours at once", value: sim.whiteLight,
        help: "Every source sends eight colours, from violet to deep red, and the picture shows their real mix. Glass slows violet more than red (dispersion): a prism makes a rainbow, a thin film shows colours. Probes and graphs measure single-colour light only. Uses more of the graphics card's memory.",
        onChange: v => { sim.setWhiteLight(v); if (v && !sim.keepBrightness) sim.calibrateBrightness(); rerender(); } }),
      sim.whiteLight ? slider({ label: "Glass dispersion", min: 1, max: 20, step: 1, value: sim.dispersion, format: v => (v === 1 ? "real glass" : `${v} × real glass`),
        help: "How much more glass slows violet than red, compared with ordinary crown glass. Real glass spreads the colours only slightly, too little to see in a picture a few hundredths of a millimetre wide.",
        onInput: () => {}, onChange: v => sim.setWhiteLight(true, v) }) : null,
      check({ label: "Damping edge", value: sim.scene.edgeOn, help: "An absorbing border so waves leave the picture instead of bouncing back off the edges.",
        onChange: v => { sim.scene.edgeOn = v; sim.scene.applyEdge(); sim.engine.updateMaterial(); } }),
      adv(slider({ label: "Edge thickness", min: 1, max: 160, step: 1, value: sim.scene.edge, unit: " cells", help: "Thicker absorbs long waves better.",
        onInput: v => { sim.scene.edge = v; }, onChange: () => { sim.scene.applyEdge(); sim.engine.updateMaterial(); } })),
      adv(fold({ id: "sbx-image", title: "Scene image", sub: true, open: false, summary: () => imageName || "load your own" },
        h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Load a scene image"),
          help("Same format as the Windows app: red = refractive index × 100 (150 = glass n 1.5), green > 0 = a source with that frequency, blue = damping (255 = absorbs fully).")), imgIn),
        sim.sceneInfo.mode === "image" && !sim.sceneInfo.dirty ? h("p", { class: "muted small" }, `Image: ${sim.sceneInfo.imagePath} (${sim.scene.width} × ${sim.scene.height})`) : null,
        check({ label: "Use the image's sources (green)", value: sim.sceneInfo.useSources, help: "Green pixels of the scene image drive the field (SceneSettings “use sources”).",
          onChange: v => {
            sim.sceneInfo.useSources = v;
            if (sim.sceneInfo.imageBlob) void decodeImage(sim.sceneInfo.imageBlob).then(d => {
              const s = Scene.fromImage(d.rgba, d.width, d.height, v);
              s.edgeOn = sim.scene.edgeOn; s.edge = sim.scene.edge;
              s.shapes = sim.shapes;
              sim.load(s, sim.sources, sim.probeList(), sim.optics, true);
            });
          } }),
        slider({ label: "Image source amplitude", min: 0, max: 5, step: 0.05, value: e.imageSourceAmplitude, help: "Strength of the image's sources (image source scale; 1 = the Python code).",
          onInput: v => { e.imageSourceAmplitude = v; }, onChange: () => sim.reload() }))),
      adv(h("p", { class: "hint" }, "Build a circuit of your own with the ", h("b", {}, "⚡ Logic"), " tools on the rail: light guides, inputs, detectors and transistors.")),
    );
  };

  // ---- Settings: display, simulation, video (with a "find a setting" box)
  const settings = () => {
    const schemeOpts = (t: Quantity) => sim.schemes.filter(s => s.type === t && s.file !== "custom:(editing)").map(s => [s.file, s.name.replace(/_/g, " ")] as [string, string]);
    const schemeName = (t: Quantity) => (sim.schemes.find(s => s.file === sim.scheme[t])?.name ?? sim.scheme[t].replace(/\.json$/i, "")).replace(/_/g, " ");
    const logB = (q: Quantity) => slider({
      label: q === "field" ? "Field brightness" : "Intensity brightness", min: -1, max: 2.5, step: 0.01, value: Math.log10(sim.brightness[q]),
      format: v => `×${(10 ** v).toPrecision(2)}`, help: "The full brightness (100% on the ☀ slider under the picture). Display gain only — it does not change the physics.",
      onInput: v => { sim.brightness[q] = 10 ** v; } });
    const blackL = (q: Quantity) => slider({
      label: q === "field" ? "Field black level" : "Intensity black level", min: -0.5, max: 0.5, step: 0.01, value: sim.blackLevel[q],
      help: "Lifts (positive) or lowers (negative) the darkest colours of the scheme: colour × (1 − b) + b. The Windows app's default for the field is −0.05.",
      onInput: v => sim.setBlackLevel(q, v) });
    const e = sim.engine.settings;
    const recBox = h("div", {});
    renderVideo(sim, recBox);
    const sections = [
      fold({ id: "sbx-display", title: "Display", icon: "🎨", keywords: "colors scheme brightness", summary: () => `${schemeName("field")} · ${schemeName("intensity")}` },
        select({ label: "Field colours", options: schemeOpts("field"), value: sim.scheme.field, onChange: v => void sim.setScheme("field", v) }),
        select({ label: "Intensity colours", options: schemeOpts("intensity"), value: sim.scheme.intensity, onChange: v => void sim.setScheme("intensity", v) }),
        h("a", { class: "btn small filter-item", href: "#/colors" }, "🎨 Edit colour schemes…"),
        logB("field"), logB("intensity"),
        fold({ id: "sbx-black", title: "Black levels", sub: true, open: false, summary: () => `${sim.blackLevel.field} · ${sim.blackLevel.intensity}` }, blackL("field"), blackL("intensity")),
        h("div", { class: "grid2" },
          check({ label: "Show materials", value: sim.showMaterial, help: "Tint glass blue-ish and walls grey.", onChange: v => { sim.showMaterial = v; } }),
          check({ label: "Show sources", value: sim.showSources, onChange: v => { sim.showSources = v; } }))),
      fold({ id: "sbx-sim", title: "Simulation", icon: "⚙", keywords: "stencil frequency stop", summary: () => `${sim.stencil === "4th" ? "4th order" : "3×3"} · ${sim.stopAt ? `stops at ${sim.stopAt.toLocaleString()}` : "no stop"}` },
        select({ label: "Laplacian", options: [["3x3", "3×3 kernel (original)"], ["4th", "4th order cross"]], value: sim.stencil,
          help: "How the curvature of the field is computed. The 4th-order stencil has much less numerical dispersion (short waves keep their speed) and uses sub-steps to stay stable; waves travel at the same speed with both.",
          onChange: v => { sim.stencil = v as "3x3" | "4th"; } }),
        numberInput({ label: "Stop after step (0 = never)", value: sim.stopAt, min: 0, help: "Runs stop at this step, like the Steps setting of the Windows app.", onChange: v => { sim.stopAt = Math.max(0, Math.round(v)); } }),
        slider({ label: "Source frequency scale", min: 0.25, max: 8, step: 0.05, value: e.frequencyScale, help: "Angular frequency = level / 255 × 0.5 × this (radians per step). The Windows default is 2.",
          onInput: v => { e.frequencyScale = v; }, onChange: () => sim.reload() }),
        slider({ label: "Intensity decay factor", min: 1, max: 100, step: 1, value: e.timeDecayFactor,
          help: "How long the intensity view averages (TimeDecayFactor). Higher = smoother but slower to react.", onInput: v => { e.timeDecayFactor = v; } }),
        slider({ label: "Intensity scale", min: -2, max: 2, step: 0.05, value: Math.log10(e.intensityScale), format: v => `×${(10 ** v).toPrecision(2)}`,
          help: "Multiplies the intensity values themselves (also what probes measure), unlike brightness.", onInput: v => { e.intensityScale = 10 ** v; } }),
        sim.logic && !sim.logic.empty ? slider({ label: "Wave circuit: fast-forward after a flip", min: 0, max: 4000, step: 100, value: sim.logic.settle, format: fmtSettle,
          help: "Light in a guide needs about 1100 steps for 400 cells. After you flip an input the simulation runs fast this many steps, then carries on at your speed.",
          onInput: v => { if (sim.logic) sim.logic.settle = v; } }) : null),
      fold({ id: "sbx-video", title: "Video", icon: "🎬", keywords: "mp4 record export movie" }, recBox),
    ];
    const find = h("input", { type: "search", placeholder: "Find a setting…", value: query, "aria-label": "Find a setting" });
    const noHits = h("p", { class: "empty no-hits", hidden: true }, "No setting matches. Try “colour”, “frequency” or “video”.");
    const root = h("div", { class: "sbx" }, h("div", { class: "sbx-tools" }, h("span", { class: "find" }, find)), noHits, ...sections);
    const applyFind = () => {
      query = find.value;
      const n = filterFolds(root, query);
      noHits.hidden = !query.trim() || n > 0;
      root.classList.toggle("finding", !!query.trim());
    };
    find.addEventListener("input", applyFind);
    find.addEventListener("keydown", ev => { if (ev.key === "Escape" && find.value) { ev.stopPropagation(); find.value = ""; applyFind(); } });
    root.addEventListener("input", () => refreshSummaries(root));
    root.addEventListener("change", () => refreshSummaries(root));
    if (query) requestAnimationFrame(applyFind);
    return root;
  };

  const count = () => String(sim.sources.filter(s => !sim.logic?.ownerOf(s)).length + sim.shapes.length + sim.optics.length + sim.probes.length +
    (sim.logic ? sim.logic.switches.length + sim.logic.detectors.length + sim.logic.transistors.length : 0));
  const objectsTab = tabs("sandbox", [
    { id: "objects", label: "Objects", badge: count, render: objects },
    { id: "scene", label: "Scene", render: scene },
    { id: "settings", label: "Settings", render: settings },
  ]);
  // Simple mode has no Settings tab
  if (isSimple() && objectsTab.current() === "settings") objectsTab.show("objects");
  objectsTab.el.classList.add("sandbox-tabs");
  // whenever objects or the selection change: the Objects tab is drawn again (the others only update the count)
  sim.changed = [() => { if (objectsTab.current() === "objects") objectsTab.refresh(); else objectsTab.labels(); }];
  panel.replaceChildren(h("div", { class: "page-head" }, h("h2", {}, "Sandbox"),
    h("p", { class: "muted" }, "Build anything: pick a tool on the rail beside the picture, then click or drag. ",
      help("✋ Select picks up and moves anything; Del deletes, Ctrl+Z undoes, Ctrl+D duplicates, arrow keys nudge. The mouse wheel zooms; drag the background (or right-drag) to pan. Press ? for every shortcut."))),
    objectsTab.el);
  const stop = sim.onFrame(() => {
    if (!objectsTab.el.isConnected) { stop(); return; }
    for (const f of live) f();
  });
}
