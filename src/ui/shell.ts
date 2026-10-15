// Wave Dude 2D web - what the panels (experiments, sandbox, learn) can use of the main window.
// GPL-3.0-or-later.

import type { Sim } from "../sim";
import type { Tool } from "../view/viewport";

export type GraphMode = "none" | "points" | "profile" | "auto";
export type GraphMarker = { x: number; color: string; label?: string };

export interface Shell {
  sim: Sim;
  panel: HTMLElement;
  /** Tools offered on the toolbar besides pan (the measuring tools are always there). */
  setTools(tools: Tool[]): void;
  /** Selects a toolbar tool (adding it to the toolbar if the page did not offer it). */
  selectTool(tool: Tool): void;
  /** Markers: vertical lines on the probe graph (x = step) and on the line-probe graph (x = cell along the line). */
  setGraph(mode: GraphMode, markers?: () => GraphMarker[], profileMarkers?: () => GraphMarker[]): void;
  /** Show or hide the simulation (the Learn pages use the whole width). */
  showStage(on: boolean): void;
  go(hash: string): void;
}
