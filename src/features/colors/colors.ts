// Wave Dude 2D web - the colour scheme editor (the Colors tab of the Windows app): 9 stops, linear in RGB, 255 entries,
// saved in this browser and downloadable as the same JSON files the Windows app uses.
// GPL-3.0-or-later.

import type { Quantity } from "../../engine/engine";
import type { ColorSchemeInfo } from "../../sim/sim";
import { h, select } from "../../components";
import type { Shell } from "../../app/shell";

const STOPS = 9, ENTRIES = 255;
const STORE = "waveDude.colorSchemes";

interface SavedScheme { name: string; type: Quantity; stops: number[][] }

/** ColorScheme.InterpolateStops: equally spaced stops, linear in RGB, rounded half away from zero. */
export function interpolate(stops: number[][]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < ENTRIES; i++) {
    const pos = (i * (STOPS - 1)) / (ENTRIES - 1);
    const seg = Math.min(STOPS - 2, Math.floor(pos)), t = pos - seg;
    out.push([0, 1, 2].map(k => Math.min(255, Math.max(0, Math.round(stops[seg][k] + (stops[seg + 1][k] - stops[seg][k]) * t)))));
  }
  return out;
}

/** ColorScheme.ToStopScheme: 9 stops sampled from the entries. */
function sampleStops(colors: number[][]): number[][] {
  return Array.from({ length: STOPS }, (_, k) => {
    const pos = (k * (colors.length - 1)) / (STOPS - 1), i = Math.floor(pos), t = pos - i;
    const a = colors[i], b = colors[Math.min(colors.length - 1, i + 1)];
    return [0, 1, 2].map(c => Math.round(a[c] + (b[c] - a[c]) * t));
  });
}

function loadSaved(): SavedScheme[] {
  try { return JSON.parse(localStorage.getItem(STORE) ?? "[]") as SavedScheme[]; } catch { return []; }
}
function storeSaved(list: SavedScheme[]): void {
  try { localStorage.setItem(STORE, JSON.stringify(list)); } catch { /* private mode: kept for this visit only */ }
}

const fileOf = (name: string) => `custom:${name}`;

/** Registers the schemes saved in this browser (called once at start). */
export function installSavedSchemes(shell: Shell): void {
  for (const s of loadSaved()) shell.sim.putScheme({ file: fileOf(s.name), name: s.name, type: s.type, colors: interpolate(s.stops) });
}

const hex = (c: number[]) => "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
const rgb = (x: string) => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));

/** The scheme file in the Windows format (ColorSchemeStore). */
function schemeJson(name: string, type: Quantity, stops: number[][]): string {
  const colors = interpolate(stops);
  const rows: string[] = [];
  for (let i = 0; i < colors.length; i += 8) rows.push("    " + colors.slice(i, i + 8).map(c => `[${c.join(",")}]`).join(", "));
  return `{\n  "name": ${JSON.stringify(name)},\n  "origin": "9-stop gradient made in the color scheme editor",\n  "category": "custom",\n` +
    `  "scheme_type": "${type}",\n  "bits_per_channel": 8,\n  "entry_count": 255,\n` +
    `  "stops": [${stops.map(c => `[${c.join(",")}]`).join(", ")}],\n  "colors": [\n${rows.join(",\n")}\n  ]\n}\n`;
}

export async function openColors(shell: Shell): Promise<void> {
  const { sim, panel } = shell;
  shell.showStage(true);
  shell.setTools([]);
  shell.setGraph("none");
  if (sim.owner !== "sandbox" && sim.owner !== "colors") {
    sim.owner = "colors";
  }
  sim.running = true;
  // the live preview uses a temporary scheme; put the real choice back when leaving without saving
  const before = { ...sim.scheme };
  const stop = sim.onFrame(() => {
    if (location.hash.startsWith("#/colors")) return;
    stop();
    for (const q of ["field", "intensity"] as const) if (sim.scheme[q] === "custom:(editing)") void sim.setScheme(q, before[q]);
  });

  let type: Quantity = sim.viewMode;
  let base = sim.scheme[type];
  let name = "My scheme";
  let stops = sampleStops(await sim.schemeColors(base, type));
  const status = h("p", { class: "status" });
  const strip = h("canvas", { class: "strip", width: ENTRIES, height: 1 });
  const stopBox = h("div", { class: "stops" });

  const preview = () => {
    const colors = interpolate(stops);
    const g = strip.getContext("2d")!, img = g.createImageData(ENTRIES, 1);
    colors.forEach((c, i) => img.data.set([c[0], c[1], c[2], 255], i * 4));
    g.putImageData(img, 0, 0);
    // show it live on the simulation
    sim.putScheme({ file: "custom:(editing)", name: "(editing)", type, colors });
    sim.viewMode = type;
    void sim.setScheme(type, "custom:(editing)");
  };
  const drawStops = () => {
    stopBox.replaceChildren(...stops.map((c, i) => {
      const inp = h("input", { type: "color", value: hex(c), title: `Stop ${i + 1}${i === 4 ? " (middle: zero field)" : ""}` });
      inp.addEventListener("input", () => { stops[i] = rgb(inp.value); preview(); });
      return h("label", { class: "stop" }, inp, h("small", {}, String(i + 1)));
    }));
  };

  const render = () => {
    const saved = loadSaved();
    const opts = sim.schemes.filter(s => s.type === type && s.file !== "custom:(editing)").map(s => [s.file, s.name.replace(/_/g, " ")] as [string, string]);
    const nameIn = h("input", { type: "text", value: name });
    nameIn.addEventListener("input", () => { name = nameIn.value.trim(); });
    const importIn = h("input", { type: "file", accept: ".json", hidden: true });
    importIn.addEventListener("change", async () => {
      const f = importIn.files?.[0];
      if (!f) return;
      try {
        const j = JSON.parse((await f.text()).replace(/^\uFEFF/, ""));
        const colors = j.colors as number[][];
        stops = Array.isArray(j.stops) && j.stops.length === STOPS ? j.stops : sampleStops(colors);
        name = String(j.name ?? f.name.replace(/\.json$/i, ""));
        type = j.scheme_type === "intensity" ? "intensity" : "field";
        render();
        status.className = "status ok"; status.textContent = `Imported ${f.name}. Press “Save in this browser” to keep it.`;
      } catch { status.className = "status no"; status.textContent = "That file is not a colour scheme."; }
    });
    const parts: (Node | null)[] = [
      sim.owner === "sandbox" ? h("a", { class: "back-link", href: "#/sandbox" }, "← Back to the sandbox") : null,
      h("div", { class: "page-head" },
        h("h2", {}, "Colour schemes"),
        h("p", { class: "muted" }, "A scheme turns numbers into colours: 9 stops, blended into 255 colours. For the field the middle stop is zero, the left end the deepest trough and the right end the highest crest. For intensity the left end is no energy.")),
      status,
      h("div", { class: "pane box" },
        h("div", { class: "eyebrow" }, "Scheme"),
        select({ label: "Used for", options: [["field", "Field (−1 … 0 … +1)"], ["intensity", "Intensity (0 … max)"]], value: type, onChange: v => { type = v as Quantity; base = sim.scheme[type]; void sim.schemeColors(base, type).then(c => { stops = sampleStops(c); render(); }); } }),
        select({ label: "Start from", options: opts, value: opts.some(o => o[0] === base) ? base : opts[0]?.[0] ?? "", help: "Copy the 9 stops of an existing scheme to start from.",
          onChange: v => { base = v; void sim.schemeColors(v, type).then(c => { stops = sampleStops(c); name = (sim.schemes.find(s => s.file === v)?.name ?? "Scheme") + " copy"; render(); }); } }),
        h("label", { class: "field" }, h("span", { class: "lbl" }, h("span", { class: "t" }, "Name")), nameIn)),
      h("div", { class: "pane box" },
        h("div", { class: "eyebrow" }, "Colours"),
        strip, stopBox,
        h("div", { class: "btns" },
          h("button", { onclick: () => { stops.reverse(); render(); } }, "⇄ Reverse"),
          h("button", { onclick: () => { stops = stops.map(c => c.map(v => 255 - v)); render(); } }, "Invert"),
          h("button", { onclick: () => { stops = stops.map((_, i) => stops[Math.min(i, 8 - i) * 2]); render(); }, "data-help": "Squeeze the scheme into each half and mirror it around the middle (make symmetric)." }, "Symmetric"))),
      h("div", { class: "btns" },
        h("button", { class: "primary", onclick: () => {
          if (!name) { status.className = "status no"; status.textContent = "Give the scheme a name first."; return; }
          const list = loadSaved().filter(s => s.name !== name);
          list.push({ name, type, stops: stops.map(c => [...c]) });
          storeSaved(list);
          const info: ColorSchemeInfo & { colors: number[][] } = { file: fileOf(name), name, type, colors: interpolate(stops) };
          sim.putScheme(info);
          before[type] = info.file;
          void sim.setScheme(type, info.file);
          status.className = "status ok"; status.textContent = `Saved “${name}” in this browser and selected it for the ${type}.`;
          render();
        } }, "💾 Save in this browser"),
        h("button", { onclick: () => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([schemeJson(name || "Scheme", type, stops)], { type: "application/json" }));
          a.download = `${(name || "Scheme").replace(/[^\w.-]+/g, "_")}.json`;
          a.click();
        }, "data-help": "The JSON file of the Windows app's ColorSchemeList folder." }, "⬇ Download .json"),
        h("button", { onclick: () => importIn.click() }, "Import .json…"), importIn),
      saved.length ? h("div", { class: "pane box saved" }, h("div", { class: "eyebrow" }, "Saved in this browser"), ...saved.map(s => h("div", { class: "row" },
        h("span", { class: "grow" }, s.name, h("small", {}, ` ${s.type}`)),
        h("button", { onclick: () => { name = s.name; type = s.type; stops = s.stops.map(c => [...c]); render(); } }, "Edit"),
        h("button", { class: "icon del", title: "Delete", "aria-label": `Delete ${s.name}`, onclick: () => { storeSaved(loadSaved().filter(x => x.name !== s.name)); render(); } }, "✕")))) : null,
      h("p", { class: "muted small" }, "Saved schemes live in this browser only. Download the .json to use a scheme in the Windows app or on another computer."),
    ];
    panel.replaceChildren(...parts.filter((x): x is Node => x !== null));
    drawStops();
    preview();
  };
  render();
}
