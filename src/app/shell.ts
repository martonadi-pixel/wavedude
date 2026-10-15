// Wave Dude 2D web - what the panels (experiments, sandbox, learn) can use of the main window.
// GPL-3.0-or-later.

import type { Sim } from "../sim/sim";
import type { Tool } from "../view/viewport";

export type GraphMode = "none" | "points" | "profile" | "auto";
export type GraphMarker = { x: number; color: string; label?: string };

export interface Shell {
  sim: Sim;
  panel: HTMLElement;
  /** Tools offered on the tool rail besides select and the measuring tools (always there). The first is selected. */
  setTools(tools: Tool[]): void;
  /** Selects a tool (adding it to the rail if the page did not offer it). */
  selectTool(tool: Tool): void;
  /** The page's own settings in the bar above the picture, for the active tool (null: none besides painting). */
  setToolOptions(render: ((tool: Tool) => Node | Node[] | null) | null): void;
  /** Redraws the bar above the picture (after a setting it shows changed elsewhere). */
  refreshToolOptions(): void;
  /** The page's own controls in the header (the Sandbox's project), or null. */
  setHeader(node: Node | null): void;
  /** Markers: vertical lines on the probe graph (x = step) and on the line-probe graph (x = cell along the line). */
  setGraph(mode: GraphMode, markers?: () => GraphMarker[], profileMarkers?: () => GraphMarker[]): void;
  /** Show or hide the simulation (the Learn pages use the whole width). */
  showStage(on: boolean): void;
  go(hash: string): void;
}
