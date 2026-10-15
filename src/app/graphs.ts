// Wave Dude 2D web - the graphs under the picture: point probes over time, line probes along their line.
// GPL-3.0-or-later.

import type { Sim } from "../sim/sim";
import { Graph } from "../view/graph";
import type { GraphMarker, GraphMode } from "./shell";

const MEASURE = { amplitude: "Field", intensity: "Intensity", integrated: "Integrated intensity" } as const;

export class Graphs {
  mode: GraphMode = "none";
  markers: () => GraphMarker[] = () => [];
  profileMarkers: () => GraphMarker[] = () => [];
  private point = new Graph(150);
  private profile = new Graph(150);

  constructor(private sim: Sim, readonly el: HTMLElement) {
    el.append(this.point.el, this.profile.el);
  }

  draw(): void {
    const sim = this.sim, pts = sim.pointProbes, lines = sim.lineProbes, m = this.mode;
    // probes the reader placed always get their graph
    const showPts = (m === "points" || m === "auto" || pts.some(p => p.mine)) && pts.length > 0;
    const showProf = (m === "profile" || m === "auto" || lines.some(p => p.mine)) && lines.length > 0;
    this.point.el.hidden = !showPts;
    this.profile.el.hidden = !showProf;
    this.el.hidden = !showPts && !showProf;
    if (showPts) {
      const kinds = [...new Set(pts.map(p => MEASURE[p.measurement]))].join(" / ");
      this.point.draw(pts.map((p, i) => ({ values: sim.history[i] ?? [], color: p.color, label: p.label })), {
        title: `${kinds} at the probe${pts.length > 1 ? "s" : ""} over time`, xLabel: "step", x0: sim.historyStart, dx: 1, markers: this.markers(),
      });
    }
    if (showProf)
      this.profile.draw(lines.map((p, i) => ({ values: sim.profiles[i] ?? [], color: p.color, label: p.label })), {
        title: `${[...new Set(lines.map(p => MEASURE[p.measurement]))].join(" / ")} along the line probe${lines.length > 1 ? "s" : ""}`, xLabel: "cells along the line", markers: this.profileMarkers(),
      });
  }
}
