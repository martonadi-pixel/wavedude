// Wave Dude 2D web - every tool on the tool rail: its icon, name, help text, the hint shown while it is active, and
// the groups (with their keyboard keys) the rail shows them in.
// GPL-3.0-or-later.

import type { Tool } from "../view/viewport";

export interface ToolInfo { icon: string; label: string; help: string; hint: string }

export const TOOLS: Record<Tool, ToolInfo> = {
  pan: { icon: "✋", label: "Select & move", help: "Click an object to select it, drag it to move it. Drag the background to move the view; the mouse wheel zooms.",
    hint: "Click to select · drag to move · Del deletes · Ctrl+D duplicates · arrows nudge · drag the background to pan" },
  ruler: { icon: "📏", label: "Ruler", help: "Drag to measure a distance in cells. Hold Ctrl to snap to 15° steps.", hint: "Drag to measure a distance · Ctrl snaps to 15°" },
  protractor: { icon: "📐", label: "Protractor", help: "Drag the first arm from the corner point, then drag again from the same point for the second arm.",
    hint: "Drag the first arm from the corner · then drag the second arm from the same corner · Ctrl snaps" },
  source: { icon: "◉", label: "Point source", help: "Click to place a source (its settings are in the bar above the picture).", hint: "Click to place a source · drag one to move it" },
  line: { icon: "━", label: "Line source", help: "Drag to draw a line of sources: a straight wave front.", hint: "Drag to draw a straight wave front · drag its ends to change it" },
  laser: { icon: "⇶", label: "Laser", help: "Click to place a laser; drag while placing to aim it. It shines one way, in a narrow beam.", hint: "Click to place · drag while placing to aim · drag its white handle to turn it" },
  barrier: { icon: "▮", label: "Wall", help: "Draw a wall: waves bounce off it completely. Freehand, or as a straight line or a box (shape in the bar above).",
    hint: "Drag to draw a wall · choose freehand, line or box above" },
  glass: { icon: "⬭", label: "Glass", help: "Draw glass, where waves travel slower and bend.", hint: "Drag to draw glass · its refractive index is in the bar above" },
  absorber: { icon: "░", label: "Absorber", help: "Draw an absorber: it soaks up waves gradually from its edge inwards, so it hardly reflects. Thick ones absorb best.",
    hint: "Drag to draw an absorber · thick ones (40+ cells) absorb best" },
  erase: { icon: "⌫", label: "Eraser", help: "Paint empty space back (also removes sources under the brush). To delete a shape or element, select it and press Delete.",
    hint: "Drag to erase painted material · select an object and press Del to delete it" },
  optic: { icon: "◐", label: "Optics", help: "Click to place the element chosen in the bar above: lenses, mirrors, a prism, a beam splitter…", hint: "Pick an element above, then click to place it · drag one to move it" },
  pointProbe: { icon: "⊕", label: "Probe", help: "Click to measure the value at a point over time (graph below).", hint: "Click to place a probe · drag one to move it · its graph is below the picture" },
  lineProbe: { icon: "⟷", label: "Line probe", help: "Drag to measure the intensity along a line (graph below).", hint: "Drag to place a line probe · drag its ends to change it" },
  guide: { icon: "⟿", label: "Light guide", help: "Drag to draw a glass light guide: light stays inside it. Ends in empty space soak the light up; an end on another guide joins it.",
    hint: "Drag to draw a light guide · an end on another guide joins it" },
  bit: { icon: "⏻", label: "Input", help: "Click on a guide to put an input switch there (A, B, C…). Click an input again to flip it between 0 and 1.", hint: "Click on a guide to add an input · click an input to flip it" },
  detector: { icon: "💡", label: "Detector", help: "Click on a guide to put a detector with a lamp there: it lights up when enough light arrives.", hint: "Click on a guide to add a detector (a lamp)" },
  transistor: { icon: "⚡", label: "Transistor", help: "A light switched by light. First click where it looks (a detector), then where it shines.", hint: "Click where it looks (a detector), then where it shines" },
};

export interface ToolGroup { id: string; label: string; tools: Tool[]; key: string }

/** The rail, top to bottom. A key selects the group's tool; pressed again it moves on to the group's next tool. */
export const GROUPS: ToolGroup[] = [
  { id: "hand", label: "Select", tools: ["pan"], key: "v" },
  { id: "measure", label: "Measure", tools: ["ruler", "protractor"], key: "m" },
  { id: "sources", label: "Sources", tools: ["source", "line", "laser"], key: "s" },
  { id: "draw", label: "Draw", tools: ["barrier", "glass", "absorber", "erase"], key: "b" },
  { id: "optics", label: "Optics", tools: ["optic"], key: "l" },
  { id: "probes", label: "Probes", tools: ["pointProbe", "lineProbe"], key: "p" },
  { id: "logic", label: "Logic", tools: ["guide", "bit", "detector", "transistor"], key: "g" },
];

/** Keys for single tools (besides the group keys). */
export const TOOL_KEYS: Partial<Record<Tool, string>> = { erase: "e" };

export const groupOf = (t: Tool): ToolGroup | undefined => GROUPS.find(g => g.tools.includes(t));
