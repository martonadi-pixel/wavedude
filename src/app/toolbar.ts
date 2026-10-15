// Wave Dude 2D web - the bar under the picture (run, speed, what the picture shows, brightness, undo) and the zoom
// buttons floating on the picture.
// GPL-3.0-or-later.

import type { Sim } from "../sim/sim";
import { h, adv } from "../components";

/** The speed slider picks from these steps per frame; below 1 is slow motion. */
const SPEEDS = [0.125, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];
const speedIndex = (v: number) => SPEEDS.reduce((best, s, i) => (Math.abs(s - v) < Math.abs(SPEEDS[best] - v) ? i : best), 0);
const speedText = (v: number) => (v >= 1 ? `${v}×` : `1/${Math.round(1 / v)}`);
const pctText = (v: number) => `${v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)}%`;

export class Toolbar {
  readonly el: HTMLElement;
  private runBtn: HTMLButtonElement;
  private stepOut: HTMLElement;
  private undoBtn: HTMLButtonElement;
  private redoBtn: HTMLButtonElement;
  private sync: () => void;
  private last = { mode: "", spf: 0, pct: 0, outlines: false, dim: "" };
  /** Called when the 2D / 3D view changes (the rail is put away in 3D). */
  onDim: (d: "2d" | "3d") => void = () => {};

  constructor(private sim: Sim) {
    const toggleRun = () => { if (sim.running) sim.running = false; else sim.play(); };
    this.runBtn = h("button", { class: "primary run", "data-help": "Run / pause (space bar)", onclick: toggleRun }, "▶ Run");
    this.stepOut = h("span", { class: "steps" }, "step 0");
    const seg = (text: string, help: string, on: () => void) => h("button", { type: "button", class: "seg", "data-help": help, onclick: () => { on(); this.sync(); } }, text);
    const field = seg("Field", "The wave itself right now: red = up, blue = down.", () => { sim.viewMode = "field"; });
    const inten = seg("Intensity", "Where the waves are strong on average (energy), averaged over time.", () => { sim.viewMode = "intensity"; });
    const dim2 = seg("2D", "Flat map view: the tools, rulers and probes work here.", () => this.setDim("2d"));
    const dim3 = seg("3D", "3D view: the waves as a moving surface. Drag to turn, right-drag to move, wheel to zoom.", () => this.setDim("3d"));
    // brightness in % of the scene's full brightness, on a log scale from 3% to 1000%
    const bright = h("input", { type: "range", min: Math.log10(3), max: 3, step: 0.01, "aria-label": "Brightness", "data-help": "Brightness of the picture (display only): 100% = the scene's full brightness." });
    const brightOut = h("span", { class: "lbl val" });
    bright.addEventListener("input", () => { sim.brightnessPct = 10 ** +bright.value; brightOut.textContent = pctText(sim.brightnessPct); });
    const speed = h("input", { type: "range", min: 0, max: SPEEDS.length - 1, step: 1, "aria-label": "Speed",
      "data-help": "Speed: simulation steps per screen frame. Left of 1× is slow motion (one step every few frames) — handy to follow each wave." });
    const speedOut = h("span", { class: "lbl val" });
    speed.addEventListener("input", () => { sim.stepsPerFrame = SPEEDS[+speed.value]; speedOut.textContent = speedText(sim.stepsPerFrame); });
    const outlines = h("button", { type: "button", class: "icon-btn", "aria-label": "Outlines",
      "data-help": "Outlines (O): a line around every lens, prism, mirror, glass and wall so they are easy to see.",
      onclick: () => { sim.setOutlines(!sim.showOutlines); this.sync(); sim.notify(); } }, "◇");
    const height = h("input", { type: "range", min: 0, max: 0.4, step: 0.005, value: sim.waveHeight, "aria-label": "Wave height in 3D", "data-help": "How tall the waves are drawn in 3D (display only)." });
    height.addEventListener("input", () => { sim.waveHeight = +height.value; });
    const heightGrp = h("div", { class: "grp" }, h("span", { class: "lbl" }, "Waves"), height);
    this.undoBtn = h("button", { type: "button", class: "icon-btn", "aria-label": "Undo", onclick: () => sim.undo.undo() }, "↶");
    this.redoBtn = h("button", { type: "button", class: "icon-btn", "aria-label": "Redo", onclick: () => sim.undo.redo() }, "↷");
    this.sync = () => {
      field.classList.toggle("on", sim.viewMode === "field");
      inten.classList.toggle("on", sim.viewMode === "intensity");
      dim2.classList.toggle("on", sim.dim === "2d");
      dim3.classList.toggle("on", sim.dim === "3d");
      heightGrp.hidden = sim.dim === "2d";
      outlines.classList.toggle("on", sim.showOutlines);
      outlines.setAttribute("aria-pressed", String(sim.showOutlines));
      bright.value = String(Math.log10(sim.brightnessPct));
      brightOut.textContent = pctText(sim.brightnessPct);
      speed.value = String(speedIndex(sim.stepsPerFrame));
      speedOut.textContent = speedText(sim.stepsPerFrame);
      this.last = { mode: sim.viewMode, spf: sim.stepsPerFrame, pct: sim.brightnessPct, outlines: sim.showOutlines, dim: sim.dim };
    };
    this.el = h("div", { id: "toolbar", class: "toolbar" },
      h("div", { class: "grp" }, this.runBtn,
        h("button", { type: "button", "data-help": "Clear all waves and start again from step 0 (R). The scene stays.", onclick: () => sim.reset() }, "⟲ Reset"), this.stepOut),
      h("div", { class: "grp" }, h("span", { class: "lbl" }, "Speed"), speed, speedOut),
      h("div", { class: "grp" }, h("div", { class: "segs" }, field, inten), adv(outlines)),
      adv(h("div", { class: "grp" }, h("span", { class: "lbl", "aria-hidden": "true" }, "☀"), bright, brightOut,
        h("button", { type: "button", "data-help": "Automatic brightness: makes the strongest waves just reach full colour (A).", onclick: () => sim.autoExposure() }, "Auto"))),
      h("div", { class: "grp" }, h("div", { class: "segs" }, dim2, dim3), heightGrp),
      h("div", { class: "grp" }, this.undoBtn, this.redoBtn),
    );
    sim.undo.changed = () => this.syncUndo();
    this.sync();
    this.syncUndo();
  }

  setDim(d: "2d" | "3d"): void {
    const sim = this.sim;
    sim.dim = d;
    sim.view.mode3d = d === "3d";
    if (d === "3d") sim.view.fit();
    this.onDim(d);
    this.sync();
  }

  private syncUndo(): void {
    const u = this.sim.undo;
    this.undoBtn.disabled = !u.canUndo;
    this.redoBtn.disabled = !u.canRedo;
    this.undoBtn.dataset.help = u.canUndo ? `Undo: ${u.undoLabel} (Ctrl+Z)` : "Nothing to undo";
    this.redoBtn.dataset.help = u.canRedo ? `Redo: ${u.redoLabel} (Ctrl+Shift+Z)` : "Nothing to redo";
  }

  /** Every frame: the run button, the step counter, and anything a page changed (view, speed, brightness). */
  frame(): void {
    const sim = this.sim, l = this.last;
    this.runBtn.textContent = sim.running ? "⏸ Pause" : "▶ Run";
    this.runBtn.classList.toggle("on", sim.running);
    // a new scene waits for the reader: the Run button says so
    this.runBtn.classList.toggle("waiting", sim.held && !sim.running);
    this.stepOut.textContent = `step ${sim.time.toLocaleString()}${sim.preparing ? " · fast-forward ⏩" : ""}`;
    if (sim.viewMode !== l.mode || sim.stepsPerFrame !== l.spf || sim.brightnessPct !== l.pct || sim.showOutlines !== l.outlines || sim.dim !== l.dim) this.sync();
    if (this.undoBtn.disabled === this.sim.undo.canUndo) this.syncUndo();
  }
}

/** Zoom out, zoom in, fit and a picture of the view, floating at the picture's top right. */
export function zoomCluster(sim: Sim): HTMLElement {
  return h("div", { class: "view-zoom", role: "toolbar", "aria-label": "Zoom" },
    h("button", { type: "button", "aria-label": "Zoom in", "data-help": "Zoom in (+). Or use the mouse wheel over the picture.", onclick: () => sim.view.zoomBy(1.4) }, "+"),
    h("button", { type: "button", "aria-label": "Zoom out", "data-help": "Zoom out (−)", onclick: () => sim.view.zoomBy(1 / 1.4) }, "−"),
    h("button", { type: "button", "aria-label": "Fit", "data-help": "Show the whole scene (F)", onclick: () => sim.view.fit() }, "⤢"),
    h("button", { type: "button", "aria-label": "Save the picture", "data-help": "Save the picture as PNG", onclick: () => sim.screenshot() }, "📷"),
    adv(h("button", { type: "button", "aria-label": "Clear measurements", "data-help": "Remove the ruler and protractor", onclick: () => { sim.view.measure = { ruler: null, protractor: null }; sim.view.onMeasure(); } }, "🧹")));
}
