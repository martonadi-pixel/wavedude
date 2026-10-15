// Wave Dude 2D web - editing a probe: what it measures, where it is, and from when an integrating probe adds up.
// GPL-3.0-or-later.

import type { Sim, ProbeSpec, Measurement } from "../../sim/sim";
import { h, adv, check, numberInput, segmented, xyFields } from "../../components";

export const MEASUREMENTS: [Measurement, string][] = [["amplitude", "Field"], ["intensity", "Intensity"], ["integrated", "Integrated"]];

export function probeEditor(sim: Sim, p: ProbeSpec, relist: () => void): HTMLElement {
  // a change sets the probes again: this one is measured afresh from now on, the others keep their records
  const update = (change: Partial<ProbeSpec>) => {
    sim.undo.begin("Change probe");
    sim.setProbes(sim.probeList().map(q => (q.id === p.id ? { ...q, ...change } : q)));
    sim.undo.commit();
    relist();
  };
  return h("div", { class: "editor" },
    h("p", { class: "muted small" }, p.kind === "point" ? "Measures at one point over time (the graph under the picture)." : "Measures along a line (the graph under the picture). Drag its ends to move them."),
    segmented({ label: "Measures", options: MEASUREMENTS, value: p.measurement,
      help: "Field: the wave itself. Intensity: how strong it is on average. Integrated: the intensity added up over the steps.",
      onChange: v => update({ measurement: v as Measurement }) }),
    p.measurement === "integrated" ? adv(numberInput({ label: "Start adding up after step (−1 = from the start)", value: p.startAfter ?? -1, min: -1, onChange: v => update({ startAfter: Math.max(-1, Math.round(v)) }) })) : null,
    adv(xyFields({ labels: p.kind === "point" ? ["X", "Y"] : ["Start X", "Start Y"], x: p.x, y: p.y, onChange: (x, y) => update({ x: Math.round(x), y: Math.round(y), ...(p.kind === "point" ? { x2: Math.round(x), y2: Math.round(y) } : {}) }) })),
    p.kind === "line" ? adv(xyFields({ labels: ["End X", "End Y"], x: p.x2, y: p.y2, onChange: (x, y) => update({ x2: Math.round(x), y2: Math.round(y) }) })) : null,
    check({ label: "Measuring", value: p.active !== false, help: "Off: the probe stays (and is saved) but is not measured.", onChange: v => update({ active: v }) }),
  );
}

