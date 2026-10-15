// Wave Dude 2D web - the menu a right-click (or a finger held still) opens on the picture: what can be done with the
// object under the pointer, or, on an empty spot, what can be put there, and the view.
// GPL-3.0-or-later.

import type { Sim } from "../sim/sim";
import type { Selection } from "../sim/selection";
import type { Pt, Tool } from "../view/viewport";
import { showMenu, type MenuItem } from "../components";

export interface ContextHost {
  sim: Sim;
  allowed: (t: Tool) => boolean;
}

/** The name of an object, for the top of the menu. */
function nameOf(sim: Sim, sel: Selection): string {
  switch (sel.kind) {
    case "source": return sim.sources.find(q => q.id === sel.id)?.name ?? "Source";
    case "probe": return sim.probes.find(q => q.id === sel.id)?.label ?? "Probe";
    case "shape": return sim.shapes.find(q => q.id === sel.id)?.name ?? "Shape";
    case "optic": return sim.optics.find(q => q.id === sel.id)?.name ?? "Element";
    case "switch": return `Input ${sim.logic?.switches.find(q => q.id === sel.id)?.label ?? ""}`;
    case "detector": { const d = sim.logic?.detectors.find(q => q.id === sel.id); return `Detector ${d?.label || d?.id || ""}`; }
    case "transistor": return sim.logic?.transistors.find(q => q.id === sel.id)?.label ?? "Transistor";
  }
}

export function openContextMenu(host: ContextHost, cell: Pt, client: Pt): void {
  const { sim } = host, items: (MenuItem | "-")[] = [];
  const hit = sim.selector.hit(cell, "pan");
  if (hit) {
    // the menu is about the selected object: select it, so the picture and the inspector show which one
    const sel: Selection = { kind: hit.kind, id: hit.id };
    sim.select(sel);
    items.push({ label: nameOf(sim, sel), disabled: true, run: () => {} }, "-");
    if (hit.kind === "source" || hit.kind === "probe") {
      const s = hit.kind === "source" ? sim.sources.find(q => q.id === hit.id) : undefined, p = hit.kind === "probe" ? sim.probes.find(q => q.id === hit.id) : undefined;
      const on = s ? s.enabled : p?.active !== false;
      items.push({ label: on ? "Turn off" : "Turn on", help: "Switch it off without deleting it.", run: () => {
        sim.undo.begin("On / off");
        if (s) { s.enabled = !on; sim.refreshSources(); }
        else if (p) sim.setProbes(sim.probeList().map(q => (q.id === p.id ? { ...q, active: !on } : q)));
        sim.undo.commit();
        sim.notify();
      } });
    }
    if (hit.kind === "switch") items.push({ label: "Flip the input (0 ↔ 1)", run: () => { sim.release(); sim.logic?.toggle(String(hit.id)); sim.running = true; } });
    if (sim.selector.canTurn(sel)) {
      items.push({ label: "↻ Turn 90° right", run: () => sim.selector.turn(90) }, { label: "↺ Turn 90° left", run: () => sim.selector.turn(-90) });
      items.push({ label: "↻ Turn 15° right", help: "Or press . (and , to turn left)", run: () => sim.selector.turn(15) });
    }
    if (hit.kind === "source" || hit.kind === "probe" || hit.kind === "shape" || hit.kind === "optic")
      items.push({ label: "⧉ Duplicate", help: "Ctrl+D", run: () => sim.selector.duplicate() });
    items.push({ label: "✕ Delete", help: "Delete key", run: () => sim.selector.deleteSelection() });
  } else {
    sim.select(null);
    const x = Math.floor(cell.x), y = Math.floor(cell.y);
    const inside = x >= 0 && y >= 0 && x < sim.scene.width && y < sim.scene.height;
    const place = (t: Tool, label: string, help: string) => {
      if (inside && host.allowed(t)) items.push({ label, help, run: () => sim.tools.act(t, "down", cell, cell) });
    };
    place("source", "◉ Add a source here", "A point source with the settings of the Source tool.");
    place("pointProbe", "⊕ Add a probe here", "Measures the wave at this point and draws its graph.");
    place("optic", "◐ Add an element here", "The optical element chosen in the Optics tool.");
  }
  if (items.length) items.push("-");
  items.push(
    { label: sim.running ? "⏸ Pause" : "▶ Run", help: "Space bar", run: () => { if (sim.running) sim.running = false; else sim.play(); } },
    { label: "⟲ Reset the waves", help: "R — the scene stays", run: () => sim.reset() },
    { label: "⤢ Fit the scene in view", help: "F", run: () => sim.view.fit() },
  );
  showMenu(items, client.x, client.y, hit ? nameOf(sim, { kind: hit.kind, id: hit.id }) : "Picture");
}
