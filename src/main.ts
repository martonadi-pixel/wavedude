// Wave Dude 2D web - the main window: header, panel, simulation with toolbar and graphs, and routing.
// GPL-3.0-or-later.

import "./styles/style.css";
import { Sim } from "./sim/sim";
import type { Tool } from "./view/viewport";
import { Graph } from "./view/graph";
import { h, installHelp, installPanelToggle, installPanelResizer } from "./components";
import type { GraphMarker, GraphMode, Shell } from "./app/shell";
import { renderExperimentList, openExperiment } from "./features/experiments/guide";
import { openSandbox } from "./features/sandbox/sandbox";
import { openColors, installSavedSchemes } from "./features/colors/colors";

const TOOLS: Record<Tool, { icon: string; label: string; help: string }> = {
  pan: { icon: "✋", label: "Pan", help: "Drag the picture to move the view; the mouse wheel zooms and two fingers pinch-zoom. Where allowed (Sandbox, kids' experiments) drag a source or a probe to move it — the cursor shows a hand over them. Right-drag always moves the view." },
  ruler: { icon: "📏", label: "Ruler", help: "Drag to measure a distance in cells. Hold Ctrl to snap to 15° steps." },
  protractor: { icon: "📐", label: "Protractor", help: "Drag the first arm from the corner point, then drag again from the same point for the second arm. Shows the angle between them. Ctrl snaps." },
  source: { icon: "◉", label: "Source", help: "Click to place a source (settings under “New sources”). Click an existing source to select it." },
  line: { icon: "━", label: "Line source", help: "Drag to draw a line of sources: a straight wave front." },
  glass: { icon: "⬭", label: "Glass", help: "Paint material where waves are slower (refractive index under Painting)." },
  barrier: { icon: "▮", label: "Wall", help: "Paint a wall that blocks waves (fully damped cells)." },
  absorber: { icon: "░", label: "Absorber", help: "Paint an absorber: it soaks up waves gradually from its edge inwards, so it reflects almost nothing. Thick strokes (20+ cells) absorb best." },
  erase: { icon: "⌫", label: "Erase", help: "Paint empty space back (also removes sources under the brush)." },
  pointProbe: { icon: "⊕", label: "Probe", help: "Click to measure the value at a point over time (graph below)." },
  optic: { icon: "◐", label: "Optics", help: "Click to place the optical element chosen in the side panel (Optics). Click or drag an element to select or move it." },
  laser: { icon: "⇶", label: "Laser", help: "Click to place a laser; drag while placing to aim it. It shines one way, in a narrow beam." },
  lineProbe: { icon: "⟷", label: "Line probe", help: "Drag to measure the intensity along a line (graph below)." },
  guide: { icon: "⟿", label: "Light guide", help: "Drag to draw a glass light guide: light stays inside it. Ends in empty space soak the light up; an end on another guide joins it." },
  bit: { icon: "⏻", label: "Input", help: "Click on a guide to put an input switch there (A, B, C…). Click an input again, or click it with the ✋ hand, to flip it between 0 and 1." },
  detector: { icon: "💡", label: "Detector", help: "Click on a guide to put a detector with a lamp there: it lights up when enough light arrives." },
  transistor: { icon: "⚡", label: "Transistor", help: "A light switched by light. First click where it looks (a detector), then where it shines." },
};

const MEASURE = { amplitude: "Field", intensity: "Intensity", integrated: "Integrated intensity" } as const;

function start(): void {
  installHelp();
  installPanelToggle();
  installPanelResizer();
  const panel = document.getElementById("panel")!;
  const stage = document.getElementById("stage")!;
  const article = document.getElementById("article")!;
  const viewHost = document.getElementById("view")!;
  const toolbar = document.getElementById("toolbar")!;
  const graphs = document.getElementById("graphs")!;
  const hud = document.getElementById("hud")!;

  let sim: Sim;
  try {
    sim = new Sim(viewHost);
  } catch (e) {
    viewHost.append(h("div", { class: "fatal" }, h("h2", {}, "Your browser cannot run the simulation"),
      h("p", {}, String((e as Error).message)), h("p", {}, "Wave Dude needs WebGL2 with float textures: a recent Chrome, Edge, Firefox or Safari with hardware acceleration switched on.")));
    return;
  }

  // ---------------------------------------------------------------- toolbar
  let extraTools: Tool[] = [];
  const runBtn = h("button", { class: "primary run", "data-help": "Run / pause (space bar)", onclick: () => { if (sim.running) sim.running = false; else sim.play(); } }, "▶ Run");
  const stepOut = h("span", { class: "steps" }, "step 0");
  const viewField = h("button", { class: "seg", "data-help": "The wave itself right now: red = up, blue = down.", onclick: () => { sim.viewMode = "field"; syncView(); } }, "Field");
  const viewInt = h("button", { class: "seg", "data-help": "Where the waves are strong on average (energy), averaged over time.", onclick: () => { sim.viewMode = "intensity"; syncView(); } }, "Intensity");
  // brightness in % of the scene's full brightness, on a log scale from 3% to 1000%
  const bright = h("input", { type: "range", min: Math.log10(3), max: 3, step: 0.01, "data-help": "Brightness of the picture (display only): 100% = the scene's full brightness." });
  const brightOut = h("span", { class: "lbl speedval brightval" }, "");
  const pctText = (v: number) => `${v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)}%`;
  bright.addEventListener("input", () => { sim.brightnessPct = 10 ** +bright.value; brightOut.textContent = pctText(sim.brightnessPct); });
  // the slider picks from these steps per frame; below 1 is slow motion
  const SPEEDS = [0.125, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];
  const speedIndex = (v: number) => SPEEDS.reduce((best, s, i) => (Math.abs(s - v) < Math.abs(SPEEDS[best] - v) ? i : best), 0);
  const speedText = (v: number) => (v >= 1 ? `${v}×` : `1/${Math.round(1 / v)}`);
  const speed = h("input", { type: "range", min: 0, max: SPEEDS.length - 1, step: 1, value: speedIndex(6),
    "data-help": "Speed: simulation steps per screen frame. Left of 1× is slow motion (one step every few frames) — handy to follow each wave." });
  const speedOut = h("span", { class: "lbl speedval" }, "");
  speed.addEventListener("input", () => { sim.stepsPerFrame = SPEEDS[+speed.value]; speedOut.textContent = speedText(sim.stepsPerFrame); });
  const toolBox = h("div", { class: "tools" });
  // outlines of lenses, glass, mirrors and walls
  const outlineBtn = h("button", { class: "tool", "aria-pressed": String(sim.showOutlines),
    "data-help": "Outlines (O): draw a line around every lens, prism, mirror, glass and wall so they are easy to see." },
    h("span", { class: "ic" }, "◇"), h("span", { class: "tl" }, "Outlines"));
  const syncOutline = () => { outlineBtn.classList.toggle("on", sim.showOutlines); outlineBtn.setAttribute("aria-pressed", String(sim.showOutlines)); };
  outlineBtn.addEventListener("click", () => { sim.setOutlines(!sim.showOutlines); syncOutline(); sim.changed.forEach(f => f()); });
  syncOutline();
  // 2D map or 3D surface; in 3D the mouse turns the camera and the tools are put away
  const dim2 = h("button", { class: "seg", "data-help": "Flat map view: the tools, rulers and probes work here.", onclick: () => setDim("2d") }, "2D");
  const dim3 = h("button", { class: "seg", "data-help": "3D view: the waves as a moving surface. Drag to turn, right-drag to move, wheel to zoom.", onclick: () => setDim("3d") }, "3D");
  const height = h("input", { type: "range", min: 0, max: 0.4, step: 0.005, value: sim.waveHeight, "data-help": "How tall the waves are drawn in 3D (display only)." });
  height.addEventListener("input", () => { sim.waveHeight = +height.value; });
  const heightGrp = h("div", { class: "grp" }, h("span", { class: "lbl" }, "Waves"), height);
  const setDim = (d: "2d" | "3d") => {
    sim.dim = d;
    dim2.classList.toggle("on", d === "2d");
    dim3.classList.toggle("on", d === "3d");
    heightGrp.hidden = d === "2d";
    toolBox.hidden = d === "3d";
    sim.view.mode3d = d === "3d";
    if (d === "3d") sim.view.fit();
  };
  const syncView = () => {
    viewField.classList.toggle("on", sim.viewMode === "field");
    viewInt.classList.toggle("on", sim.viewMode === "intensity");
    bright.value = String(Math.log10(sim.brightnessPct));
    brightOut.textContent = pctText(sim.brightnessPct);
    speed.value = String(speedIndex(sim.stepsPerFrame));
    speedOut.textContent = speedText(sim.stepsPerFrame);
  };
  const renderTools = () => {
    // experiments: the reader may always add probes of their own
    const own: Tool[] = sim.owner === "experiment" ? ["pointProbe", "lineProbe"] : [];
    const list: Tool[] = ["pan", "ruler", "protractor", ...extraTools.filter(t => t !== "ruler" && t !== "protractor" && !own.includes(t)), ...own];
    if (!list.includes(sim.view.tool)) sim.view.tool = extraTools[0] ?? "pan";
    toolBox.replaceChildren(...list.map(t => h("button", {
      class: `tool ${sim.view.tool === t ? "on" : ""} ${extraTools.includes(t) ? "hl" : ""}`, "data-help": `${TOOLS[t].label}: ${TOOLS[t].help}`,
      onclick: () => { sim.view.tool = t; renderTools(); },
    }, h("span", { class: "ic" }, TOOLS[t].icon), h("span", { class: "tl" }, TOOLS[t].label))),
    h("button", { class: "tool", "data-help": "Remove the ruler and protractor.", onclick: () => { sim.view.measure = { ruler: null, protractor: null }; sim.view.onMeasure(); } }, h("span", { class: "ic" }, "🧹")));
  };
  toolbar.append(
    h("div", { class: "grp" }, runBtn,
      h("button", { "data-help": "Clear all waves and start again from step 0 (R). The scene stays.", onclick: () => sim.reset() }, "⟲ Reset"), stepOut),
    h("div", { class: "grp" }, h("span", { class: "lbl" }, "Speed"), speed, speedOut),
    h("div", { class: "grp" }, h("div", { class: "segs" }, dim2, dim3)), heightGrp,
    h("div", { class: "grp" }, h("div", { class: "segs" }, viewField, viewInt), outlineBtn, h("span", { class: "lbl" }, "☀"), bright, brightOut,
      h("button", { "data-help": "Automatic brightness: makes the strongest waves just reach full colour (A).", onclick: () => sim.autoExposure() }, "Auto")),
    toolBox,
    h("div", { class: "grp" },
      h("button", { "data-help": "Zoom out (−)", onclick: () => sim.view.zoomBy(1 / 1.4) }, "−"),
      h("button", { "data-help": "Zoom in (+). Or use the mouse wheel over the picture.", onclick: () => sim.view.zoomBy(1.4) }, "+"),
      h("button", { "data-help": "Show the whole scene (F)", onclick: () => sim.view.fit() }, "Fit"),
      h("button", { "data-help": "Save the picture as PNG", onclick: () => sim.screenshot() }, "📷")),
  );
  renderTools();
  syncView();
  setDim("2d");

  // ---------------------------------------------------------------- graphs
  let graphMode: GraphMode = "none";
  let markers: () => GraphMarker[] = () => [], profileMarkers: () => GraphMarker[] = () => [];
  const pointGraph = new Graph(150), profileGraph = new Graph(150);
  graphs.append(pointGraph.el, profileGraph.el);

  // ---------------------------------------------------------------- per frame
  let lastHover: { x: number; y: number } | null = null;
  sim.view.onHover = c => { lastHover = c; };
  let lastMode = sim.viewMode, lastSpf = sim.stepsPerFrame, lastBright = sim.brightnessPct;
  sim.onFrame(() => {
    // experiments change the view, speed and brightness; keep the toolbar in step
    if (sim.viewMode !== lastMode || sim.stepsPerFrame !== lastSpf || sim.brightnessPct !== lastBright) {
      syncView();
      lastMode = sim.viewMode; lastSpf = sim.stepsPerFrame; lastBright = sim.brightnessPct;
    }
    runBtn.textContent = sim.running ? "⏸ Pause" : "▶ Run";
    runBtn.classList.toggle("on", sim.running);
    // a new scene waits for the reader: the Run button says so
    runBtn.classList.toggle("waiting", sim.held && !sim.running);
    stepOut.textContent = `step ${sim.time.toLocaleString()}${sim.preparing ? " · fast-forward ⏩" : ""}`;
    const zoom = 1 / sim.view.scale;
    let txt = `${sim.scene.width}×${sim.scene.height} · zoom ${zoom >= 1 ? zoom.toFixed(zoom < 10 ? 1 : 0) : zoom.toFixed(2)}× · ${Math.round(sim.stats.stepsPerSec).toLocaleString()} steps/s`;
    if (lastHover) {
      const x = Math.floor(lastHover.x), y = Math.floor(lastHover.y);
      if (x >= 0 && y >= 0 && x < sim.scene.width && y < sim.scene.height) {
        const i = y * sim.scene.width + x;
        txt += ` · (${x}, ${y}) n=${sim.scene.n[i].toFixed(2)}${sim.scene.dBase[i] < 1 ? " absorbing" : ""}`;
      }
    }
    hud.textContent = txt;
    drawGraphs();
  });

  function drawGraphs(): void {
    const pts = sim.pointProbes, lines = sim.lineProbes;
    // probes the reader placed always get their graph
    const showPts = (graphMode === "points" || graphMode === "auto" || pts.some(p => p.mine)) && pts.length > 0;
    const showProf = (graphMode === "profile" || graphMode === "auto" || lines.some(p => p.mine)) && lines.length > 0;
    pointGraph.el.hidden = !showPts;
    profileGraph.el.hidden = !showProf;
    graphs.hidden = !showPts && !showProf;
    if (showPts) {
      const kinds = [...new Set(pts.map(p => MEASURE[p.measurement]))].join(" / ");
      pointGraph.draw(pts.map((p, i) => ({ values: sim.history[i] ?? [], color: p.color, label: p.label })), {
        title: `${kinds} at the probe${pts.length > 1 ? "s" : ""} over time`, xLabel: "step", x0: sim.historyStart, dx: 1, markers: markers(),
      });
    }
    if (showProf)
      profileGraph.draw(lines.map((p, i) => ({ values: sim.profiles[i] ?? [], color: p.color, label: p.label })), {
        title: `${[...new Set(lines.map(p => MEASURE[p.measurement]))].join(" / ")} along the line probe${lines.length > 1 ? "s" : ""}`, xLabel: "cells along the line", markers: profileMarkers(),
      });
  }

  // a short note when the GPU context had to be rebuilt (the run starts again from step 0)
  sim.restoredListeners.push(() => {
    const note = h("div", { class: "toast" }, "The graphics driver was reset — the simulation was rebuilt and started again.");
    viewHost.append(note);
    setTimeout(() => note.remove(), 6000);
  });

  sim.lostListeners.push(() => {
    viewHost.append(h("div", { class: "toast" }, "The graphics card stopped responding to this page. ",
      h("button", { class: "primary", onclick: () => location.reload() }, "Reload the page")));
  });

  // ---------------------------------------------------------------- keyboard
  window.addEventListener("keydown", e => {
    if ((e.target as HTMLElement).closest("input, select, textarea")) return;
    if (e.key === " ") { e.preventDefault(); if (sim.running) sim.running = false; else sim.play(); }
    else if (e.key === "r" || e.key === "R") sim.reset();
    else if (e.key === "f" || e.key === "F") sim.view.fit();
    else if (e.key === "+" || e.key === "=") sim.view.zoomBy(1.4);
    else if (e.key === "-") sim.view.zoomBy(1 / 1.4);
    else if (e.key === "a" || e.key === "A") sim.autoExposure();
    else if (e.key === "o" || e.key === "O") { sim.setOutlines(!sim.showOutlines); syncOutline(); sim.changed.forEach(f => f()); }
  });

  // ---------------------------------------------------------------- routing
  const shell: Shell = {
    sim, panel,
    // a step that offers tools starts with its first tool selected
    setTools: t => {
      extraTools = t;
      sim.view.tool = t[0] ?? "pan";
      // measuring happens on the flat map
      if (sim.dim === "3d" && t.some(x => x === "ruler" || x === "protractor")) setDim("2d");
      renderTools();
    },
    setGraph: (m, mk, pmk) => { graphMode = m; markers = mk ?? (() => []); profileMarkers = pmk ?? (() => []); },
    selectTool: t => { if (!extraTools.includes(t) && t !== "pan" && t !== "ruler" && t !== "protractor") extraTools = [...extraTools, t]; sim.view.tool = t; if (sim.dim === "3d") setDim("2d"); renderTools(); },
    showStage: on => { stage.hidden = !on; article.hidden = on; if (on) requestAnimationFrame(() => sim.view.resize()); },
    go: hash => { if (location.hash === hash) route(); else location.hash = hash; },
  };

  function route(): void {
    const [, page, arg, arg2] = (location.hash || "#/experiments").split("/");
    document.querySelectorAll<HTMLElement>("header nav a").forEach(a =>
      a.classList.toggle("on", a.dataset.nav === (page === "experiment" ? "experiments" : page)));
    sim.changed = [];
    sim.view.onMeasure = () => {};
    sim.view.measure = { ruler: null, protractor: null };
    panel.scrollTop = 0;
    // every page starts paused (the colour editor excepted: its preview needs moving waves)
    if (page === "colors") sim.release(); else sim.hold();
    if (page === "experiment" && arg) openExperiment(shell, arg);
    else if (page === "sandbox") openSandbox(shell);
    // the library is a lot of text: loaded the first time it is opened
    else if (page === "learn") void import("./features/learn/page").then(m => { if (location.hash.startsWith("#/learn")) m.openLearn(shell, arg, arg2); });
    else if (page === "colors") void openColors(shell);
    else renderExperimentList(shell);
    syncView();
  }
  window.addEventListener("hashchange", route);
  // for the curious (and for tests): the running simulation from the browser console
  (window as unknown as { waveDude: Sim }).waveDude = sim;
  // the colour scheme list is needed by the sandbox panel
  sim.loadSchemeList().then(() => { installSavedSchemes(shell); route(); }, route);
}

start();
