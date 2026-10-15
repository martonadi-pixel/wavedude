// Wave Dude 2D web - computing with waves: bit switches, threshold detectors ("LEDs") and wave transistors
// (detector-controlled sources), and the small logic layer that runs them alongside the wave simulation.
// GPL-3.0-or-later.
//
// The wave equation the engine solves is linear: waves only add up. Interference alone can therefore compute the
// parity of in-phase / anti-phase inputs (XOR) and, with a constant "bias" wave, a NOT, but it can neither decide
// (a sharp 0/1 threshold), nor amplify, nor remember. Those need a nonlinear element. Here that element is the
// detector with a threshold, and the wave transistor: a source that switches on (or, inverted, off) when its
// detector sees light. The logic runs in JavaScript every few steps between the simulation steps; the waves do
// the rest (carrying the bits, adding them up, cancelling them).

import type { Sim } from "../sim/sim";
import type { SourceSpec } from "../core/sources";

export interface Area { x: number; y: number; w: number; h: number }

/** A switch the reader flips: its sources shine while the bit is 1. A pulse switches it on for a number of steps. */
export interface BitSwitch {
  id: string;
  label: string;
  bit: 0 | 1;
  sources: SourceSpec[];
  /** Step at which a pulse ends (the bit goes back to 0), -1 = no pulse. */
  offAt: number;
  /** Where its label is drawn (cell coordinates), or null for none. */
  at: { x: number; y: number } | null;
  /** Where its first emitter was when the label was last drawn (the label follows a dragged emitter). */
  anchor?: { x: number; y: number };
}

/**
 * A light detector: the time-averaged intensity over one or more small areas (added up: light from several guides
 * falling on one photodiode), in units of one standard "1" at this place, and a bit with hysteresis (a Schmitt
 * trigger): it becomes 1 above `hi` and 0 below `lo`.
 */
export interface Detector {
  id: string;
  label: string;
  areas: Area[];
  /** Intensity of one standard "1" here (measured, see parts.ts). */
  unit: number;
  lo: number;
  hi: number;
  /** The last reading, in units. */
  value: number;
  bit: 0 | 1;
  at: { x: number; y: number } | null;
  /** Show the label as an LED (● on / ○ off) in the picture. */
  led: boolean;
}

/** A wave transistor: a source switched by a detector (on while it sees light, or the opposite when inverted). */
export interface Transistor {
  id: string;
  label: string;
  input: Detector;
  invert: boolean;
  sources: SourceSpec[];
  on: boolean;
  /** Draw the control connection from the detector to each emitter (a transistor that drives distant emitters). */
  wires?: boolean;
  /** Where its own label is drawn (transistors built in the sandbox), or none. */
  at?: { x: number; y: number } | null;
  anchor?: { x: number; y: number };
}

/** A circuit as saved in a project (configuration.json, key "web_logic"); sources are indices into object_sources. */
export interface LogicJSON {
  every: number;
  settle: number;
  hold_until: number;
  switches: { id: string; label: string; bit: 0 | 1; sources: number[]; at: { x: number; y: number } | null }[];
  detectors: { id: string; label: string; areas: Area[]; unit: number; lo: number; hi: number; bit: 0 | 1; at: { x: number; y: number } | null; led: boolean }[];
  transistors: { id: string; label: string; input: string; invert: boolean; on: boolean; sources: number[]; wires: boolean; at: { x: number; y: number } | null }[];
}

const LED_ON = "#4ade80", LED_OFF = "#94a3b8", SWITCH_ON = "#fbbf24", SWITCH_OFF = "#94a3b8";
type Box = { x: number; y: number; w: number; h: number; color: string };

export class Circuit {
  switches: BitSwitch[] = [];
  detectors: Detector[] = [];
  transistors: Transistor[] = [];
  /** The logic runs every this many simulation steps. */
  every = 12;
  /** Transistors keep their starting state until this step (the light needs time to reach the detectors). */
  holdUntil = 0;
  /** Step of the last change of a switch (to know when the outputs have settled). */
  lastInputChange = 0;
  /** Steps the outputs need to follow a change of the inputs: the run fast-forwards that far after each change (0 = not). */
  settle = 1500;
  /** Outline every detector's area in the picture (the sandbox, where you build and move them). */
  showBoxes = false;
  private lastT = 0;
  private groups: { box: Area; areas: Area[] }[] | null = null;
  private labels = new Map<string, { x: number; y: number; text: string; color?: string }>();

  constructor(readonly sim: Sim) {}

  // ------------------------------------------------------------------------------------------ building

  addSwitch(id: string, label: string, sources: SourceSpec[], at: { x: number; y: number } | null, bit: 0 | 1 = 0): BitSwitch {
    const s: BitSwitch = { id, label, bit, sources, offAt: -1, at };
    for (const src of sources) src.enabled = bit === 1;
    this.switches.push(s);
    return s;
  }

  addDetector(id: string, label: string, areas: Area[], o: { unit: number; lo: number; hi: number; at?: { x: number; y: number } | null; led?: boolean }): Detector {
    const d: Detector = { id, label, areas, unit: o.unit, lo: o.lo, hi: o.hi, value: 0, bit: 0, at: o.at ?? null, led: o.led ?? true };
    this.detectors.push(d);
    this.groups = null;
    return d;
  }

  addTransistor(id: string, label: string, input: Detector, sources: SourceSpec[], invert: boolean, on: boolean): Transistor {
    const t: Transistor = { id, label, input, invert, sources, on };
    for (const src of sources) src.enabled = on;
    // the detector starts in the state that matches the transistor, so nothing flips before light arrives
    input.bit = (on !== invert ? 1 : 0);
    this.transistors.push(t);
    return t;
  }

  /** Every source of the circuit (to give to sim.load together with any others). */
  sources(): SourceSpec[] {
    return [...this.switches.flatMap(s => s.sources), ...this.transistors.flatMap(t => t.sources)];
  }

  /** Runs the logic between the simulation steps (Sim.stepHook) and draws the labels. Call after sim.load. */
  attach(): void {
    this.sim.logic = this;
    this.sim.stepHook = t => { if (t % this.every === 0) this.update(); };
    this.lastInputChange = this.sim.time;
    this.drawLabels();
  }

  // ------------------------------------------------------------------------------------------ inputs

  get(id: string): BitSwitch {
    const s = this.switches.find(q => q.id === id);
    if (!s) throw new Error(`no switch ${id}`);
    return s;
  }

  det(id: string): Detector {
    const d = this.detectors.find(q => q.id === id);
    if (!d) throw new Error(`no detector ${id}`);
    return d;
  }

  set(id: string, bit: 0 | 1): void {
    const s = this.get(id);
    s.offAt = -1;
    if (s.bit === bit) return;
    s.bit = bit;
    for (const src of s.sources) src.enabled = bit === 1;
    // while the transistors still keep their starting state, the outputs can only follow once that time is over
    this.lastInputChange = Math.max(this.sim.time, this.holdUntil);
    this.sim.refreshSources();
    this.drawLabels();
    this.fastForward();
  }

  /**
   * Runs ahead (at sim.prepareSpeed) until the light has reached the outputs, then carries on at the chosen speed:
   * the app runs at 1x by default, at which a gate would take about 20 seconds to answer.
   */
  fastForward(): void {
    const sim = this.sim;
    if (this.settle <= 0) { sim.running = true; return; }
    if (!sim.prepareSpeed) sim.prepareSpeed = 12;
    sim.runUntil(Math.max(sim.time, this.holdUntil) + this.settle, () => { sim.running = true; });
  }

  toggle(id: string): void { this.set(id, this.get(id).bit ? 0 : 1); }

  /** Switches an input on for this many steps (a "press" of a push button). */
  pulse(id: string, steps: number): void {
    this.set(id, 1);
    // a press made while the transistors still keep their starting state (a scene that has just opened, paused at
    // step 0) lasts until they can react to it
    this.get(id).offAt = Math.max(this.sim.time, this.holdUntil) + steps;
  }

  // ------------------------------------------------------------------------------------------ editing (sandbox)

  /** The first id prefix1, prefix2... that no part uses yet. */
  freeId(prefix: string): string {
    const used = new Set([...this.switches, ...this.detectors, ...this.transistors].map(p => p.id));
    for (let i = 1; ; i++) if (!used.has(`${prefix}${i}`)) return `${prefix}${i}`;
  }

  /** The switch one of whose emitters is within r cells of the cell. */
  switchAt(cell: { x: number; y: number }, r: number): BitSwitch | undefined {
    return this.switches.find(s => s.sources.some(src => Math.hypot(src.x + 0.5 - cell.x, src.y + 0.5 - cell.y) <= r));
  }

  /** The detector whose area (grown by r cells) holds the cell. */
  detectorNear(cell: { x: number; y: number }, r: number): Detector | undefined {
    return this.detectors.find(d => d.areas.some(a => cell.x >= a.x - r && cell.x <= a.x + a.w + r && cell.y >= a.y - r && cell.y <= a.y + a.h + r));
  }

  /** The switch or transistor a source belongs to. */
  ownerOf(src: SourceSpec): BitSwitch | Transistor | undefined {
    return this.switches.find(s => s.sources.includes(src)) ?? this.transistors.find(t => t.sources.includes(src));
  }

  moveDetector(d: Detector, dx: number, dy: number): void {
    for (const a of d.areas) { a.x += dx; a.y += dy; }
    if (d.at) d.at = { x: d.at.x + dx, y: d.at.y + dy };
    this.groups = null;
    this.drawLabels();
  }

  /** Detector areas changed (moved, resized): read them afresh. */
  areasChanged(): void { this.groups = null; this.drawLabels(); }

  /** Removes a part; returns the sources it drove (for the caller to take out of the simulation). */
  remove(part: BitSwitch | Detector | Transistor): SourceSpec[] {
    const out: SourceSpec[] = [];
    if (this.switches.includes(part as BitSwitch)) {
      this.switches = this.switches.filter(s => s !== part);
      out.push(...(part as BitSwitch).sources);
    } else if (this.transistors.includes(part as Transistor)) {
      this.transistors = this.transistors.filter(t => t !== part);
      out.push(...(part as Transistor).sources);
    } else if (this.detectors.includes(part as Detector)) {
      // the transistors it switched go with it
      for (const t of this.transistors.filter(q => q.input === part)) out.push(...this.remove(t));
      this.detectors = this.detectors.filter(d => d !== part);
      this.groups = null;
    }
    this.drawLabels();
    return out;
  }

  /** Forgets sources that are no longer in the simulation; switches and transistors left without any go too. */
  prune(alive: SourceSpec[]): boolean {
    let changed = false;
    for (const p of [...this.switches, ...this.transistors]) {
      const keep = p.sources.filter(s => alive.includes(s));
      if (keep.length === p.sources.length) continue;
      changed = true;
      p.sources = keep;
      if (!keep.length) this.remove(p);
    }
    if (changed) this.drawLabels();
    return changed;
  }

  get empty(): boolean { return !this.switches.length && !this.detectors.length && !this.transistors.length; }

  // ------------------------------------------------------------------------------------------ saving

  toJSON(sources: SourceSpec[]): LogicJSON {
    const idx = (list: SourceSpec[]) => list.map(s => sources.indexOf(s)).filter(i => i >= 0);
    return {
      every: this.every, settle: this.settle, hold_until: this.holdUntil,
      switches: this.switches.map(s => ({ id: s.id, label: s.label, bit: s.offAt >= 0 ? 0 : s.bit, sources: idx(s.sources), at: s.at })),
      detectors: this.detectors.map(d => ({ id: d.id, label: d.label, areas: d.areas.map(a => ({ ...a })), unit: d.unit, lo: d.lo, hi: d.hi, bit: d.bit, at: d.at, led: d.led })),
      transistors: this.transistors.map(t => ({ id: t.id, label: t.label, input: t.input.id, invert: t.invert, on: t.on, sources: idx(t.sources), wires: !!t.wires, at: t.at ?? null })),
    };
  }

  /** A circuit saved with toJSON, driving these sources (the project's object sources, in order). Call attach after sim.load. */
  static fromJSON(sim: Sim, j: LogicJSON, sources: SourceSpec[]): Circuit {
    const c = new Circuit(sim);
    const num = (v: unknown, def: number) => (typeof v === "number" && Number.isFinite(v) ? v : def);
    const pt = (v: unknown) => (v && typeof v === "object" && Number.isFinite((v as { x: number }).x) && Number.isFinite((v as { y: number }).y) ? { x: (v as { x: number }).x, y: (v as { y: number }).y } : null);
    const srcs = (v: unknown) => (Array.isArray(v) ? v.map(i => sources[i]).filter(Boolean) : []);
    c.every = Math.max(1, Math.round(num(j.every, 12)));
    c.settle = Math.max(0, num(j.settle, 1500));
    c.holdUntil = Math.max(0, num(j.hold_until, 600));
    for (const s of Array.isArray(j.switches) ? j.switches : []) {
      const list = srcs(s.sources);
      if (list.length) c.addSwitch(String(s.id), String(s.label ?? s.id), list, pt(s.at), s.bit === 1 ? 1 : 0);
    }
    for (const d of Array.isArray(j.detectors) ? j.detectors : []) {
      const areas = (Array.isArray(d.areas) ? d.areas : []).filter(a => [a?.x, a?.y, a?.w, a?.h].every(Number.isFinite) && a.w > 0 && a.h > 0)
        .map(a => ({ x: Math.round(a.x), y: Math.round(a.y), w: Math.round(a.w), h: Math.round(a.h) }));
      if (!areas.length) continue;
      c.addDetector(String(d.id), String(d.label ?? d.id), areas, { unit: num(d.unit, 0.06) || 0.06, lo: num(d.lo, 0.3), hi: num(d.hi, 0.5), at: pt(d.at), led: d.led !== false });
    }
    for (const t of Array.isArray(j.transistors) ? j.transistors : []) {
      const input = c.detectors.find(d => d.id === t.input), list = srcs(t.sources);
      if (!input || !list.length) continue;
      const tr = c.addTransistor(String(t.id), String(t.label ?? t.id), input, list, !!t.invert, !!t.on);
      tr.wires = !!t.wires;
      tr.at = pt(t.at);
    }
    // the detectors' last bits (their hysteresis keeps them until the light has come back)
    for (const d of Array.isArray(j.detectors) ? j.detectors : []) {
      const det = c.detectors.find(q => q.id === d.id);
      if (det) det.bit = d.bit === 1 ? 1 : 0;
    }
    return c;
  }

  // ------------------------------------------------------------------------------------------ running

  /**
   * Reads every detector now. Read-backs from the GPU stall it, so the areas are gathered into a few rectangles
   * (areas whose columns are close together share one) and each rectangle is read once.
   */
  readAll(): void {
    if (!this.groups) this.groups = groupAreas(this.detectors.flatMap(d => d.areas));
    const means = new Map<Area, number>();
    for (const g of this.groups) {
      const v = this.sim.engine.readIntensity(g.box.x, g.box.y, g.box.w, g.box.h);
      for (const a of g.areas) {
        let s = 0;
        for (let y = a.y; y < a.y + a.h; y++)
          for (let x = a.x; x < a.x + a.w; x++) s += v[(y - g.box.y) * g.box.w + (x - g.box.x)];
        means.set(a, s / (a.w * a.h));
      }
    }
    for (const d of this.detectors) {
      let total = 0;
      for (const a of d.areas) total += means.get(a) ?? 0;
      d.value = total / d.unit;
    }
  }

  /** One logic update: pulses that end, detectors, then transistors. */
  update(): void {
    const t = this.sim.time;
    let changed = false;
    if (t < this.lastT) {
      // the run was reset (Reset button): pending presses end, and the outputs settle again from now
      this.lastInputChange = t;
      for (const s of this.switches) if (s.offAt >= 0) s.offAt = t;
    }
    this.lastT = t;
    for (const s of this.switches)
      if (s.offAt >= 0 && t >= s.offAt) {
        s.offAt = -1;
        s.bit = 0;
        for (const src of s.sources) src.enabled = false;
        this.lastInputChange = t;
        changed = true;
      }
    let labels = changed;
    this.readAll();
    for (const d of this.detectors) {
      const bit = d.value > d.hi ? 1 : d.value < d.lo ? 0 : d.bit;
      if (bit !== d.bit) { d.bit = bit; labels = true; }
    }
    if (t >= this.holdUntil)
      for (const tr of this.transistors) {
        const on = (tr.input.bit === 1) !== tr.invert;
        if (on === tr.on) continue;
        tr.on = on;
        for (const src of tr.sources) src.enabled = on;
        changed = labels = true;
      }
    if (changed) this.sim.refreshSources();
    if (labels) this.drawLabels();
  }

  /** Steps the simulation n steps with the logic running (for tests and for fast-forwarding without the frame loop). */
  run(n: number): void {
    const end = this.sim.time + n;
    while (this.sim.time < end) {
      if (this.sim.time % this.every === 0) this.update();
      const k = Math.min(end - this.sim.time, this.every - (this.sim.time % this.every));
      this.sim.engine.step(k);
    }
  }

  /** The outputs have had time to follow the inputs. */
  settled(steps: number): boolean {
    return this.sim.time - this.lastInputChange >= steps;
  }

  // ------------------------------------------------------------------------------------------ picture

  /** LED-like labels at the switches and detectors (kept in sim.annotations, updated in place). */
  drawLabels(): void {
    const keep = this.sim.annotations.labels.filter(l => ![...this.labels.values()].includes(l));
    const put = (key: string, x: number, y: number, text: string, color: string) => {
      let l = this.labels.get(key);
      if (!l) { l = { x, y, text, color }; this.labels.set(key, l); }
      Object.assign(l, { x, y, text, color });
      keep.push(l);
    };
    // a label follows its emitter when it is dragged
    const follow = (p: { at?: { x: number; y: number } | null; anchor?: { x: number; y: number }; sources: SourceSpec[] }) => {
      const src = p.sources[0];
      if (!src || !p.at) return;
      if (p.anchor) p.at = { x: p.at.x + src.x - p.anchor.x, y: p.at.y + src.y - p.anchor.y };
      p.anchor = { x: src.x, y: src.y };
    };
    for (const s of this.switches) {
      follow(s);
      if (s.at) put(`s:${s.id}`, s.at.x, s.at.y, `${s.bit ? "◉" : "○"} ${s.label} = ${s.bit}`, s.bit ? SWITCH_ON : SWITCH_OFF);
    }
    for (const d of this.detectors)
      if (d.at && d.led) put(`d:${d.id}`, d.at.x, d.at.y, `${d.bit ? "●" : "○"} ${d.label} = ${d.bit}`, d.bit ? LED_ON : LED_OFF);
    for (const t of this.transistors) {
      follow(t);
      if (t.at) put(`t:${t.id}`, t.at.x, t.at.y, `${t.on ? "▶" : "▷"} ${t.label} ${t.on ? "on" : "off"}`, t.on ? SWITCH_ON : SWITCH_OFF);
    }
    this.sim.annotations.labels = keep;
    const boxes = this.sim.annotations.boxes.filter(b => !this.boxes.includes(b));
    this.boxes = this.showBoxes ? this.detectors.flatMap(d => d.areas.map(a => ({ ...a, color: d.bit ? LED_ON : "#f472b6" }))) : [];
    this.sim.annotations.boxes = [...boxes, ...this.boxes];
    const arrows = this.sim.annotations.arrows.filter(a => !this.wires.includes(a));
    this.wires = [];
    for (const t of this.transistors) {
      if (!t.wires) continue;
      const a = t.input.areas[0], x0 = a.x + a.w / 2, y0 = a.y + a.h / 2;
      for (const s of t.sources) {
        const w = { x0, y0, x1: s.x, y1: s.y - 2, color: t.on ? "#4ade80aa" : "#94a3b866", dashed: true };
        this.wires.push(w);
        arrows.push(w);
      }
    }
    this.sim.annotations.arrows = arrows;
  }
  private wires: { x0: number; y0: number; x1: number; y1: number; color?: string; dashed?: boolean }[] = [];
  private boxes: Box[] = [];
}

/** HTML for an LED in a readout. */
export function ledHtml(on: boolean, label: string): string {
  return `<span class="wl-led ${on ? "on" : ""}" style="display:inline-flex;align-items:center;gap:.35em;margin-right:.9em">` +
    `<span aria-hidden="true" style="width:.9em;height:.9em;border-radius:50%;display:inline-block;` +
    `background:${on ? LED_ON : "transparent"};border:2px solid ${on ? LED_ON : LED_OFF};${on ? `box-shadow:0 0 8px ${LED_ON}` : ""}"></span>` +
    `<b>${label}</b>&nbsp;${on ? 1 : 0}</span>`;
}

/** A horizontal bar for a reading in units, with marks at the thresholds (HTML). */
export function meterHtml(value: number, max: number, marks: { at: number; label: string }[]): string {
  const pct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));
  return `<div style="position:relative;height:14px;border:1px solid #fff4;border-radius:4px;margin:.3em 0 1.2em;max-width:320px">` +
    `<div style="position:absolute;left:0;top:0;bottom:0;width:${pct(value).toFixed(1)}%;background:#fbbf24;border-radius:3px"></div>` +
    marks.map(m => `<div style="position:absolute;left:${pct(m.at).toFixed(1)}%;top:-3px;bottom:-3px;border-left:2px dashed #f472b6"></div>` +
      `<div style="position:absolute;left:${pct(m.at).toFixed(1)}%;top:15px;font-size:10px;transform:translateX(-50%);color:#f472b6">${m.label}</div>`).join("") +
    `</div>`;
}

/** Gathers areas into rectangles to read at once: areas whose columns lie within `gap` cells of each other. */
function groupAreas(areas: Area[], gap = 16): { box: Area; areas: Area[] }[] {
  const out: { box: Area; areas: Area[] }[] = [];
  for (const a of [...new Set(areas)].sort((p, q) => p.x - q.x)) {
    const g = out[out.length - 1];
    if (g && a.x <= g.box.x + g.box.w + gap) {
      const x1 = Math.max(g.box.x + g.box.w, a.x + a.w), y0 = Math.min(g.box.y, a.y), y1 = Math.max(g.box.y + g.box.h, a.y + a.h);
      g.box = { x: g.box.x, y: y0, w: x1 - g.box.x, h: y1 - y0 };
      g.areas.push(a);
    } else out.push({ box: { ...a }, areas: [a] });
  }
  return out;
}
