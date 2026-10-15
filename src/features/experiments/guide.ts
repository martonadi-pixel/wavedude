// Wave Dude 2D web - the experiment list and the step-by-step guide.
// GPL-3.0-or-later.

import { defaultSettings } from "../../engine/engine";
import { EXPERIMENTS } from ".";
import { LEVELS, type Level, type Experiment, type Values, type Measured } from "./types";
import { angleDeg } from "../../view/viewport";
import { h, slider, fold, loadPref, savePref } from "../../components";
import type { Shell } from "../../app/shell";
import { DEFAULT_BRIGHTNESS_PCT } from "../../sim/sim";

let levelFilter: Level | "all" = loadPref<Level | "all">("levelFilter", "all");

/** Experiments finished (the Finish button on their last step), remembered in this browser. */
const finished = () => new Set(loadPref<string[]>("finished", []));
function markFinished(id: string): void {
  const s = finished();
  s.add(id);
  savePref("finished", [...s]);
}

export function renderExperimentList(shell: Shell): void {
  const { panel } = shell;
  shell.showStage(true);
  shell.setTools([]);
  shell.setGraph("none");
  panel.replaceChildren();
  if (levelFilter !== "all" && !LEVELS.some(l => l.id === levelFilter)) levelFilter = "all";
  const done = finished();
  const chips = h("div", { class: "chips lvl-chips", role: "toolbar", "aria-label": "Show the experiments of a level" });
  const list = h("div", { class: "cards" });
  const draw = () => {
    chips.replaceChildren(
      ...([["all", "All"], ...LEVELS.map(l => [l.id, l.label])] as [Level | "all", string][]).map(([id, label]) => {
        const n = id === "all" ? EXPERIMENTS.length : EXPERIMENTS.filter(e => e.level === id).length;
        return h("button", {
          class: `chip ${levelFilter === id ? "on" : ""} lvl-${id}`, "aria-pressed": String(levelFilter === id),
          onclick: () => { levelFilter = id; savePref("levelFilter", id); draw(); },
        }, id === "all" ? null : h("span", { class: "ldot", "aria-hidden": "true" }), label, h("span", { class: "n" }, String(n)));
      }),
    );
    list.replaceChildren();
    for (const lv of LEVELS) {
      if (levelFilter !== "all" && levelFilter !== lv.id) continue;
      const exps = EXPERIMENTS.filter(e => e.level === lv.id);
      if (!exps.length) continue;
      list.append(h("h3", { class: "lvl-head" }, h("span", { class: `badge lvl-${lv.id}` }, lv.label), h("small", {}, lv.blurb)));
      for (const e of exps)
        list.append(h("button", { class: `card exp-card lvl-${e.level}${done.has(e.id) ? " done" : ""}`, onclick: () => shell.go(`#/experiment/${e.id}`) },
          h("span", { class: "card-top" },
            h("b", {}, e.title),
            done.has(e.id) ? h("span", { class: "done-mark", title: "You finished this one" }, "✓") : null),
          h("span", { class: "meta" },
            h("span", {}, `⏱ ${e.minutes} min`), h("span", {}, `${e.steps.length} steps`),
            e.params?.length ? h("span", {}, "🎛 controls") : null),
          h("span", { class: "summary" }, e.summary)));
    }
  };
  draw();
  panel.append(
    h("div", { class: "page-head" },
      h("h2", {}, "Experiments"),
      h("p", { class: "muted" }, "Step-by-step investigations, from a first splash to the limits of the numerical model. Pick your level.")),
    chips, list,
  );
  // a calm demo behind the list
  shell.sim.owner = "experiment";
  Object.assign(shell.sim.engine.settings, defaultSettings());
  shell.sim.setWhiteLight(false);
  shell.sim.keepMine = false;
  const first = EXPERIMENTS[0];
  const p = defaults(first);
  shell.sim.stepsPerFrame = 1;
  shell.sim.prepareSpeed = 0;
  shell.sim.brightnessPct = DEFAULT_BRIGHTNESS_PCT;
  first.setup(shell.sim, p);
}

function defaults(e: Experiment): Values {
  const p: Values = {};
  for (const q of e.params ?? []) p[q.id] = q.value;
  return p;
}

export function openExperiment(shell: Shell, id: string): void {
  const found = EXPERIMENTS.find(e => e.id === id);
  if (!found) return shell.go("#/experiments");
  const exp: Experiment = found;
  const sim = shell.sim;
  shell.showStage(true);
  const p = defaults(exp);
  let stepIndex = 0;
  const answers = new Map<number, number>();
  const feedback = new Map<number, { ok: boolean; message: string }>();
  const inputs = new Map<number, string>();
  let rebuildTimer = 0;

  sim.owner = "experiment";
  // experiments are written for the default stencil, frequency scale and intensity filter, whatever the Sandbox set
  Object.assign(sim.engine.settings, defaultSettings());
  // probes the reader places stay through slider changes, until they leave the experiment
  sim.keepMine = false;
  sim.clearMine();
  sim.keepMine = true;
  exp.open?.();
  if (exp.colors) {
    // use the experiment's colour schemes while it is open, then put the reader's own back
    const before = { ...sim.scheme };
    for (const q of ["field", "intensity"] as const) if (exp.colors[q]) void sim.setScheme(q, exp.colors[q]!);
    const stop = sim.onFrame(() => {
      if (location.hash.startsWith(`#/experiment/${exp.id}`)) return;
      stop();
      for (const q of ["field", "intensity"] as const) if (exp.colors![q] && sim.scheme[q] === exp.colors![q]) void sim.setScheme(q, before[q]);
    });
  }
  // every experiment starts calm: speed 1x (it fast-forwards to a steady state at its own prepareSpeed) and the
  // picture at 30% of the brightness it was tuned for
  sim.stepsPerFrame = 1;
  sim.prepareSpeed = 0;
  sim.brightnessPct = DEFAULT_BRIGHTNESS_PCT;
  exp.setup(sim, p);
  shell.setGraph(exp.graph ?? "none", exp.markers ? () => exp.markers!(sim) : undefined,
    exp.profileMarkers ? () => exp.profileMarkers!(sim) : undefined);

  const progress = h("div", { class: "progress" });
  const body = h("div", { class: "step" });
  const nav = h("div", { class: "nav" });
  const params = h("div", { class: "params" });
  const panel = shell.panel;
  const levelLabel = LEVELS.find(l => l.id === exp.level)!.label;

  const dock = h("div", { class: "exp-dock" });
  if (exp.params?.length) {
    // the experiment's own sliders, in a card that stays at the bottom of the panel
    const defaultsBtn = h("button", { type: "button", class: "link small", "data-help": "Put every control back to where it started.",
      onclick: () => { for (const q of exp.params!) p[q.id] = q.value; drawParams(); restart(); } }, "↺ Reset controls");
    dock.append(fold({ id: "exp-controls", title: "Experiment controls", icon: "🎛", class: "controls",
      summary: () => `${exp.params!.length} setting${exp.params!.length === 1 ? "" : "s"}` }, params, h("div", { class: "params-foot" }, defaultsBtn)));
  }
  // the reader's own probes (Probe / Line probe on the rail): each with a ✕ that removes only that one, and all at once
  const mineNote = h("div", { class: "mine-probes", hidden: true });
  const removeMine = (id: number) => {
    sim.undo.begin("Delete probe");
    sim.removeProbe(id);
    sim.undo.commit();
  };
  const showMine = () => {
    const mine = sim.probes.filter(q => q.mine);
    mineNote.hidden = mine.length === 0;
    mineNote.replaceChildren(
      h("span", {}, "Your probes: ", ...mine.flatMap((q, i) => [i ? " " : "",
        h("span", { class: "mine-probe" }, h("b", { style: `color:${q.color}` }, q.label),
          h("button", { type: "button", class: "link small", "aria-label": `Remove ${q.label}`, "data-help": `Remove your probe ${q.label}`, onclick: () => removeMine(q.id) }, "✕"))]),
        h("span", { class: "muted" }, " — drag them with ✋ Select & move")),
      ...(mine.length > 1 ? [h("button", { type: "button", class: "link small", onclick: () => sim.clearMine() }, "✕ Remove all")] : []));
  };
  sim.changed = [showMine];
  dock.append(mineNote, nav);

  panel.replaceChildren(
    h("div", { class: "exp-page" },
      h("button", { class: "back", onclick: () => shell.go("#/experiments") }, "← All experiments"),
      h("div", { class: `exp-head lvl-${exp.level}` },
        h("div", { class: "exp-meta" },
          h("span", { class: `badge lvl-${exp.level}` }, levelLabel),
          h("span", { class: "muted small" }, `⏱ ${exp.minutes} min · ${exp.steps.length} steps`)),
        h("h2", {}, exp.title),
        h("p", { class: "muted" }, exp.summary),
        h("details", { class: "goals" }, h("summary", {}, "What you will learn"), h("ul", {}, ...exp.goals.map(g => h("li", {}, g)))),
        exp.readMore?.length ? h("div", { class: "readmore" }, "📖 Read more: ",
          ...exp.readMore.flatMap((r, i) => [i ? " · " : "", h("a", { href: `#/learn/${r.page}` }, r.label)])) : null),
      progress,
      body),
    dock,
  );

  let rebuildPending = false;
  function restart(): void {
    rebuildPending = false;
    exp.setup(sim, p);
    exp.steps[stepIndex].enter?.(sim, p);
    sim.running = true;
    renderStep(false);
  }

  function drawParams(): void {
    params.replaceChildren();
    for (const q of exp.params ?? [])
      params.append(slider({
        label: q.label, min: q.min, max: q.max, step: q.step, value: p[q.id], unit: q.unit, help: q.help, format: q.format,
        onInput: v => {
          p[q.id] = v;
          if (q.live) { q.live(sim, p); renderStep(false); return; }
          clearTimeout(rebuildTimer);
          // until the rebuild, the picture still belongs to the old value: no readout may record it for the new one
          rebuildPending = true;
          const el = document.getElementById("step-readout");
          if (el) el.textContent = "Updating…";
          rebuildTimer = window.setTimeout(restart, 250);
        },
      }));
  }
  drawParams();

  function renderStep(enter: boolean): void {
    const st = exp.steps[stepIndex];
    if (enter) {
      sim.setWhiteLight(st.whiteLight !== undefined, st.whiteLight ?? sim.dispersion);
      st.enter?.(sim, p);
      shell.setTools(st.tools ?? []);
    }
    progress.replaceChildren(
      h("div", { class: "step-no" }, h("b", {}, `Step ${stepIndex + 1}`), ` of ${exp.steps.length}`),
      h("div", { class: "dots", role: "group", "aria-label": "Steps" }, ...exp.steps.map((s, i) =>
        h("button", {
          class: `dot ${i === stepIndex ? "on" : ""} ${i < stepIndex ? "done" : ""}`, title: `${i + 1}. ${s.title}`,
          "aria-label": `Step ${i + 1}: ${s.title}${i < stepIndex ? " (done)" : ""}`, "aria-current": i === stepIndex ? "step" : undefined,
          onclick: () => go(i),
        }))));
    const html = typeof st.html === "function" ? st.html(p, sim) : st.html;
    const parts: (Node | null)[] = [
      h("h3", {}, st.title),
      h("div", { class: "prose", html }),
    ];

    if (st.readout) parts.push(h("div", { class: "readout-live", id: "step-readout", "aria-live": "off", html: st.readout(sim, p) }));

    if (st.actions?.length)
      parts.push(h("div", { class: "chips step-actions", role: "group", "aria-label": "Controls of this step" }, ...st.actions.map(a => {
        const on = a.on?.(sim, p);
        return h("button", { type: "button", class: `chip${on ? " on" : ""}`, "aria-pressed": on === undefined ? undefined : String(on), "data-help": a.help,
          onclick: () => { sim.release(); a.run(sim, p); renderStep(false); } }, typeof a.label === "function" ? a.label(sim, p) : a.label);
      })));

    if (st.predict) {
      const pr = st.predict, chosen = answers.get(stepIndex);
      const box = h("div", { class: "predict" }, h("div", { class: "q-title" }, h("span", { class: "q-ic", "aria-hidden": "true" }, "🤔"), h("span", {}, h("b", {}, "Predict first: "), pr.question)));
      pr.options.forEach((o, i) => box.append(h("button", {
        class: `opt ${chosen === undefined ? "" : i === pr.answer ? "right" : i === chosen ? "wrong" : "dim"}`,
        onclick: () => { answers.set(stepIndex, i); renderStep(false); },
      }, h("span", { class: "opt-k", "aria-hidden": "true" }, String.fromCharCode(65 + i)), h("span", {}, o))));
      if (chosen !== undefined)
        box.append(h("p", { class: `explain ${chosen === pr.answer ? "ok" : "no"}`, role: "status" },
          h("b", {}, chosen === pr.answer ? "Yes! " : "Not quite. "), pr.explain));
      parts.push(box);
    }

    if (st.task) {
      const t = st.task;
      const m = readMeasure();
      const readout = h("div", { class: "readout" },
        h("span", {}, "📏 Ruler ", h("b", { id: "ro-ruler" }, m.ruler === null ? "—" : `${m.ruler.toFixed(1)} cells`)),
        h("span", {}, "📐 Angle ", h("b", { id: "ro-angle" }, m.angle === null ? "—" : `${m.angle.toFixed(1)}°`)));
      const box = h("div", { class: "task" }, h("div", { class: "q-title" }, h("span", { class: "q-ic", "aria-hidden": "true" }, "🔬"), h("span", {}, h("b", {}, "Measure: "), t.prompt)), readout);
      let input: HTMLInputElement | null = null;
      const checkBtn = h("button", { class: "primary", onclick: () => {
        const mm = readMeasure();
        mm.input = input && input.value !== "" ? +input.value : null;
        feedback.set(stepIndex, t.check(mm, p, sim));
        renderStep(false);
      } }, "Check my measurement");
      if (t.input) {
        input = h("input", { type: "number", min: 0, step: "any", placeholder: t.input.placeholder ?? "", value: inputs.get(stepIndex) ?? "" });
        input.addEventListener("input", () => inputs.set(stepIndex, input!.value));
        input.addEventListener("keydown", e => { if (e.key === "Enter") checkBtn.click(); });
        box.append(h("label", { class: "field num" }, h("span", { class: "lbl" }, t.input.label), input));
      }
      box.append(checkBtn);
      const fb = feedback.get(stepIndex);
      if (fb) box.append(h("p", { class: `explain ${fb.ok ? "ok" : "no"}`, role: "status" }, fb.message));
      parts.push(box);
    }
    body.replaceChildren(...parts.filter((x): x is Node => x !== null));

    const last = stepIndex === exp.steps.length - 1;
    nav.replaceChildren(
      h("button", { disabled: stepIndex === 0, onclick: () => go(stepIndex - 1) }, "← Back"),
      h("span", { class: "nav-pos", "aria-hidden": "true" }, `${stepIndex + 1} / ${exp.steps.length}`),
      !last
        ? h("button", { class: "primary", onclick: () => go(stepIndex + 1) }, "Next →")
        : h("button", { class: "primary", onclick: () => { markFinished(exp.id); shell.go("#/experiments"); } }, "Finish ✓"));
  }

  function go(i: number): void {
    stepIndex = Math.max(0, Math.min(exp.steps.length - 1, i));
    renderStep(true);
    panel.scrollTop = 0;
  }

  function readMeasure(): Measured {
    const mm = sim.view.measure;
    return {
      ruler: mm.ruler ? Math.hypot(mm.ruler.b.x - mm.ruler.a.x, mm.ruler.b.y - mm.ruler.a.y) : null,
      angle: mm.protractor ? angleDeg(mm.protractor) : null,
      input: null,
    };
  }

  // live readouts while measuring
  sim.view.onMeasure = () => {
    const m = readMeasure();
    const r = document.getElementById("ro-ruler"), a = document.getElementById("ro-angle");
    if (r) r.textContent = m.ruler === null ? "—" : `${m.ruler.toFixed(1)} cells`;
    if (a) a.textContent = m.angle === null ? "—" : `${m.angle.toFixed(1)}°`;
  };

  // the reader moved or deleted part of the experiment: its numbers assume the original layout
  const layoutNote = h("div", { class: "layout-note", role: "status", hidden: true },
    h("span", {}, "You moved or deleted part of the experiment. Its readouts and checks were worked out for the original layout."),
    h("button", { type: "button", class: "small", onclick: () => restart() }, "↺ Original layout"));
  dock.prepend(layoutNote);

  // live readouts of the current step
  let lastReadout = 0;
  const stopReadout = sim.onFrame(() => {
    if (!location.hash.startsWith(`#/experiment/${exp.id}`)) { stopReadout(); return; }
    if (layoutNote.hidden === sim.layoutChanged) layoutNote.hidden = !sim.layoutChanged;
    const st = exp.steps[stepIndex], el = document.getElementById("step-readout");
    if (!st.readout || !el || rebuildPending || performance.now() - lastReadout < 250) return;
    lastReadout = performance.now();
    el.innerHTML = st.readout(sim, p);
  });

  go(0);
}
