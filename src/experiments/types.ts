// Wave Dude 2D web - what a guided experiment is made of.
// GPL-3.0-or-later.

import type { Sim } from "../sim";
import type { Tool } from "../view/viewport";

export type Level = "kids" | "school" | "university" | "research";

export const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: "kids", label: "Kids", blurb: "Play and discover — no maths needed" },
  { id: "school", label: "School", blurb: "Measure waves and find the rules" },
  { id: "university", label: "University", blurb: "Interference, phase and real devices" },
  { id: "research", label: "Research", blurb: "How the numerical model itself behaves" },
];

/** A slider the experiment offers. `live` applies a change without restarting; otherwise the scene is rebuilt. */
export interface Param {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  help?: string;
  live?: (sim: Sim, p: Values) => void;
  /** How the value is shown (default: the number and the unit). */
  format?: (v: number) => string;
}

export type Values = Record<string, number>;

/** A button under a step's text (e.g. flip an input bit). The step is drawn again after a click. */
export interface Action {
  label: string | ((sim: Sim, p: Values) => string);
  run: (sim: Sim, p: Values) => void;
  help?: string;
  /** A toggle: shown pressed while this is true. */
  on?: (sim: Sim, p: Values) => boolean;
}

/** What the learner measured when they press "Check". */
export interface Measured {
  ruler: number | null;        // length in cells
  angle: number | null;        // protractor angle in degrees
  input: number | null;        // the number typed in the step's input box
}

export interface CheckResult { ok: boolean; message: string }

export interface Step {
  title: string;
  /** Explanation, as HTML. */
  html: string | ((p: Values, sim: Sim) => string);
  /** Ask for a prediction before showing what happens. */
  predict?: { question: string; options: string[]; answer: number; explain: string };
  /** Tools to offer on the toolbar for this step (pan and zoom are always there). */
  tools?: Tool[];
  /** A measurement to make and check. */
  task?: {
    prompt: string;
    input?: { label: string; placeholder?: string };
    check: (m: Measured, p: Values, sim: Sim) => CheckResult;
  };
  /** A live readout under the text, refreshed a few times a second (HTML). */
  readout?: (sim: Sim, p: Values) => string;
  /** Buttons under the readout. */
  actions?: Action[];
  /** Runs when the step is shown (e.g. switch the view, add a source, start running). */
  enter?: (sim: Sim, p: Values) => void;
}

export interface Experiment {
  id: string;
  title: string;
  level: Level;
  minutes: number;
  summary: string;
  goals: string[];
  params?: Param[];
  /** Runs once when the experiment is opened (e.g. to clear results collected in an earlier visit). */
  open?: () => void;
  /** Builds the scene, sources and probes from the parameter values. */
  setup: (sim: Sim, p: Values) => void;
  steps: Step[];
  /** Pages of the "How it works" library that explain this experiment ("category/page"). */
  readMore?: { page: string; label: string }[];
  /** Sources and probes may be dragged around (only where no measurement depends on their position). */
  movable?: boolean;
  /** Colour schemes this experiment shows best in (scheme files); the reader's own choice comes back on leaving. */
  colors?: { field?: string; intensity?: string };
  /** Vertical marker lines on the line-probe graph (x = cell along the first line probe). */
  profileMarkers?: (sim: Sim) => { x: number; color: string; label?: string }[];
  /** Graph shown under the simulation while the experiment is open. */
  graph?: "points" | "profile" | "auto";
}
