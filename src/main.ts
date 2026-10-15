// Wave Dude 2D web - the main window: header, side panel, the picture with its tool rail, tool options, hint line
// and zoom buttons, the bar under it, the graphs, the keyboard, and routing between the pages.
// GPL-3.0-or-later.

import "./styles/index.css";
import { Sim } from "./sim/sim";
import type { Tool } from "./view/viewport";
import { h, installHelp, installPanelToggle, installPanelResizer } from "./components";
import type { Shell } from "./app/shell";
import { Rail } from "./app/rail";
import { ToolOptions } from "./app/options";
import { Toolbar, zoomCluster } from "./app/toolbar";
import { Graphs } from "./app/graphs";
import { openContextMenu } from "./app/context-menu";
import { SIMPLE_TOOLS, isSimple, onSimpleChange, simpleToggle } from "./app/simple";
import { installKeyboard } from "./app/keyboard";
import { TOOLS } from "./app/tools";
import { renderExperimentList, openExperiment } from "./features/experiments/guide";
import { openSandbox } from "./features/sandbox/sandbox";
import { openColors, installSavedSchemes } from "./features/colors/colors";

function start(): void {
  installHelp();
  installPanelToggle();
  installPanelResizer();
  const panel = document.getElementById("panel")!;
  const stage = document.getElementById("stage")!;
  const article = document.getElementById("article")!;
  const work = document.getElementById("work")!;
  const viewHost = document.getElementById("view")!;
  const hud = document.getElementById("hud")!;
  const headerSlot = document.getElementById("header-tools")!;

  let sim: Sim;
  try {
    sim = new Sim(viewHost);
  } catch (e) {
    viewHost.append(h("div", { class: "fatal" }, h("h2", {}, "Your browser cannot run the simulation"),
      h("p", {}, String((e as Error).message)), h("p", {}, "Wave Dude needs WebGL2 with float textures: a recent Chrome, Edge, Firefox or Safari with hardware acceleration switched on.")));
    return;
  }

  // ---------------------------------------------------------------- tools: rail, options, hint
  let offered: Tool[] = [];
  const options = new ToolOptions(sim);
  const pick = (t: Tool) => {
    if (!rail.isAllowed(t)) { offered = [...offered, t]; rail.setAllowed(offered); }
    sim.tools.cancel();
    sim.view.tool = t;
    if (sim.dim === "3d") toolbar.setDim("2d");
    rail.render();
    options.render();
  };
  const rail = new Rail(() => sim.view.tool, pick);
  // Simple mode: the Sandbox offers a few tools (an experiment keeps the tools its steps need)
  rail.limit = t => !(isSimple() && sim.owner === "sandbox") || SIMPLE_TOOLS.includes(t);
  onSimpleChange(() => {
    if (!rail.isAllowed(sim.view.tool)) pick("pan");
    rail.render();
    options.render(true);
  });
  document.querySelector("header nav")!.after(simpleToggle());
  const hint = h("div", { class: "view-hint", "aria-live": "polite" });
  work.prepend(rail.el);
  stage.prepend(options.el);
  viewHost.append(hint, zoomCluster(sim));

  // ---------------------------------------------------------------- the bar under the picture, graphs
  const toolbar = new Toolbar(sim);
  toolbar.onDim = d => { rail.el.hidden = d === "3d"; };
  document.getElementById("toolbar")!.replaceWith(toolbar.el);
  const graphs = new Graphs(sim, document.getElementById("graphs")!);

  // ---------------------------------------------------------------- per frame
  let lastHover: { x: number; y: number } | null = null;
  sim.view.onHover = c => { lastHover = c; };
  sim.onFrame(() => {
    toolbar.frame();
    options.render();
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
    const t = sim.view.tool;
    const text = sim.dim === "3d" ? "3D view — drag to turn, right-drag to move, wheel to zoom"
      : t === "protractor" && sim.view.protractorStep === 1 ? "Protractor: now drag the second arm from the same corner"
      : TOOLS[t].hint;
    if (hint.textContent !== text) hint.textContent = text;
    graphs.draw();
  });

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

  installKeyboard({ sim, allowed: t => rail.isAllowed(t), pick });
  sim.view.onContext = (cell, client) => openContextMenu({ sim, allowed: t => rail.isAllowed(t) }, cell, client);

  // ---------------------------------------------------------------- routing
  const shell: Shell = {
    sim, panel,
    // a step that offers tools starts with its first tool selected
    setTools: t => {
      // experiments: the reader may always add probes of their own
      offered = sim.owner === "experiment" ? [...t, "pointProbe", "lineProbe"] : t;
      rail.setAllowed(offered);
      sim.tools.cancel();
      sim.view.tool = t[0] ?? "pan";
      // measuring happens on the flat map
      if (sim.dim === "3d" && t.some(x => x === "ruler" || x === "protractor")) toolbar.setDim("2d");
      rail.render();
      options.render(true);
    },
    selectTool: pick,
    setToolOptions: f => options.setRenderer(f),
    refreshToolOptions: () => options.render(true),
    setHeader: node => { headerSlot.replaceChildren(...(node ? [node] : [])); },
    setGraph: (m, mk, pmk) => { graphs.mode = m; graphs.markers = mk ?? (() => []); graphs.profileMarkers = pmk ?? (() => []); },
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
    shell.setHeader(null);
    shell.setToolOptions(null);
    // every page starts paused (the colour editor excepted: its preview needs moving waves)
    if (page === "colors") sim.release(); else sim.hold();
    if (page === "experiment" && arg) openExperiment(shell, arg);
    else if (page === "sandbox") openSandbox(shell);
    // the library is a lot of text: loaded the first time it is opened
    else if (page === "learn") void import("./features/learn/page").then(m => { if (location.hash.startsWith("#/learn")) m.openLearn(shell, arg, arg2); });
    else if (page === "colors") void openColors(shell);
    else renderExperimentList(shell);
  }
  window.addEventListener("hashchange", route);
  // for the curious (and for tests): the running simulation from the browser console
  (window as unknown as { waveDude: Sim }).waveDude = sim;
  // the colour scheme list is needed by the sandbox panel
  sim.loadSchemeList().then(() => { installSavedSchemes(shell); route(); }, route);
}

start();
