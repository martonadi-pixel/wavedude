// Wave Dude 2D web - ready-made wave circuits: gates, a half adder, a wave transistor, a set-reset latch and a
// small register. Each builds the scene, loads it into the simulation and returns the running Circuit.
// GPL-3.0-or-later.

import { Scene } from "../core/scene";
import type { SourceSpec } from "../core/sources";
import type { Sim } from "../sim/sim";
import { Circuit, type Detector } from "./circuit";
import { combiner, emitter, latch, guide, absorbingEnd, across, COMBINER_UNIT, LATCH_UNIT, LATCH_XD, LATCH_XE, LATCH_XO, EDGE } from "./parts";

export type GateKind = "xor" | "andor" | "not";

/** Steps from a change at an input until the combiner's detector shows the new result (measured: the light arrives after ~1200 steps, the reading is steady by ~1350). */
export const GATE_SETTLE = 1500;
/** Steps a latch needs to flip (the light goes round the two transistors once and a bit): measured ~600. */
export const LATCH_SETTLE = 900;
/** How long a set or reset press lasts. */
export const PRESS = 700;

/** Thresholds in units of one input: "some light" (OR, XOR, NOT) and "a lot of light" (AND: two inputs in phase = 4). */
export const LOW = { lo: 0.3, hi: 0.5 };
export const HIGH = { lo: 2.0, hi: 2.6 };

let current: Circuit | null = null;
/** The circuit now running (for tests and readouts). */
export function circuit(): Circuit | null { return current; }

function finish(sim: Sim, scene: Scene, c: Circuit, others: SourceSpec[] = []): Circuit {
  sim.load(scene, [...c.sources(), ...others], []);
  c.attach();
  current = c;
  return c;
}

/**
 * One combiner. xor: B is launched half a wave behind A (phase 180°), so together they cancel. andor: in phase,
 * read by two detectors on the same light, a low threshold (OR) and a high one (AND). not: the top input is A
 * (phase 180°), the bottom one a power supply that is always on: A cancels it.
 */
export function buildGate(sim: Sim, kind: GateKind): Circuit {
  const scene = new Scene(600, 400), c = new Circuit(sim);
  c.settle = GATE_SETTLE;
  const g = combiner(scene, 0, 200);
  const label = (p: { x: number; y: number }) => ({ x: p.x + 8, y: p.y - 9 });
  if (kind === "not") {
    c.addSwitch("A", "A", [emitter("A", g.a.x, g.a.y, { phaseDeg: 180 })], label(g.a));
    c.addSwitch("P", "power (always on)", [emitter("Power", g.b.x, g.b.y)], label(g.b), 1);
    c.addDetector("out", "NOT A", [g.out], { unit: COMBINER_UNIT, ...LOW, at: g.outAt });
  } else {
    c.addSwitch("A", "A", [emitter("A", g.a.x, g.a.y)], label(g.a));
    c.addSwitch("B", "B", [emitter("B", g.b.x, g.b.y, { phaseDeg: kind === "xor" ? 180 : 0 })], label(g.b));
    if (kind === "xor") c.addDetector("out", "A XOR B", [g.out], { unit: COMBINER_UNIT, ...LOW, at: g.outAt });
    else {
      c.addDetector("or", "A OR B", [g.out], { unit: COMBINER_UNIT, ...LOW, at: g.outAt });
      c.addDetector("and", "A AND B", [g.out], { unit: COMBINER_UNIT, ...HIGH, at: { x: g.outAt.x, y: g.outAt.y + 30 } });
    }
  }
  return finish(sim, scene, c);
}

/** Half adder: an XOR combiner (sum) above an AND combiner (carry); each input switch drives one emitter in each. */
export function buildHalfAdder(sim: Sim): Circuit {
  const scene = new Scene(600, 580), c = new Circuit(sim);
  c.settle = GATE_SETTLE;
  const x = combiner(scene, 0, 160), a = combiner(scene, 0, 410);
  const lab = (p: { x: number; y: number }) => ({ x: p.x + 8, y: p.y - 9 });
  c.addSwitch("A", "A", [emitter("A (to sum)", x.a.x, x.a.y), emitter("A (to carry)", a.a.x, a.a.y)], lab(x.a));
  c.addSwitch("B", "B", [emitter("B (to sum)", x.b.x, x.b.y, { phaseDeg: 180 }), emitter("B (to carry)", a.b.x, a.b.y)], lab(x.b));
  c.addDetector("sum", "SUM", [x.out], { unit: COMBINER_UNIT, ...LOW, at: x.outAt });
  c.addDetector("carry", "CARRY", [a.out], { unit: COMBINER_UNIT, ...HIGH, at: a.outAt });
  return finish(sim, scene, c);
}

/** Steps from a change at an input until the full adder's outputs have settled (two gate delays, measured). */
export const ADDER_SETTLE = 3200;

/**
 * Full adder from two half adders in a row: stage 1 adds A and B, stage 2 adds the sum s1 and the carry-in Cin.
 * The stage-1 results are thresholded by wave transistors that re-emit them at full strength into stage 2 (the
 * dashed lines are their control connections: detect, decide, re-emit, like an optical repeater). The carry-out
 * detector collects the light of two carry transistors, one per stage (an OR: two guides on one photodiode).
 */
export function buildFullAdder(sim: Sim): Circuit {
  const scene = new Scene(1200, 600), c = new Circuit(sim);
  c.settle = ADDER_SETTLE;
  const x1 = combiner(scene, 0, 130, 520), a1 = combiner(scene, 0, 420, 520);
  const x2 = combiner(scene, 560, 130, 1080), a2 = combiner(scene, 560, 420, 1080);
  // carry guides: from the stage-1 carry transistor (row 275) and the stage-2 one (row 330) to the carry-out detector
  const yC1 = 275, yC2 = 330, xc = 1050;
  guide(scene, [[600, yC1], [1080, yC1]]); absorbingEnd(scene, 600, yC1, -1); absorbingEnd(scene, 1080, yC1, 1);
  guide(scene, [[960, yC2], [1080, yC2]]); absorbingEnd(scene, 960, yC2, -1); absorbingEnd(scene, 1080, yC2, 1);
  const lab = (p: { x: number; y: number }) => ({ x: p.x + 8, y: p.y - 9 });
  c.addSwitch("A", "A", [emitter("A (to sum)", x1.a.x, x1.a.y), emitter("A (to carry)", a1.a.x, a1.a.y)], lab(x1.a));
  c.addSwitch("B", "B", [emitter("B (to sum)", x1.b.x, x1.b.y, { phaseDeg: 180 }), emitter("B (to carry)", a1.b.x, a1.b.y)], lab(x1.b));
  c.addSwitch("C", "Cin", [emitter("Cin (to sum)", x2.b.x, x2.b.y, { phaseDeg: 180 }), emitter("Cin (to carry)", a2.b.x, a2.b.y)], lab(x2.b));
  const s1 = c.addDetector("s1", "A⊕B", [x1.out], { unit: COMBINER_UNIT, ...LOW, at: x1.outAt });
  const c1 = c.addDetector("c1", "A·B", [a1.out], { unit: COMBINER_UNIT, ...HIGH, at: a1.outAt });
  c.addTransistor("Ts1", "s1", s1, [emitter("Transistor s1 (to sum)", x2.a.x, x2.a.y), emitter("Transistor s1 (to carry)", a2.a.x, a2.a.y)], false, false).wires = true;
  c.addTransistor("Tc1", "c1", c1, [emitter("Transistor c1", 620, yC1)], false, false).wires = true;
  c.addDetector("sum", "SUM", [x2.out], { unit: COMBINER_UNIT, ...LOW, at: x2.outAt });
  const c2 = c.addDetector("c2", "s1·Cin", [a2.out], { unit: COMBINER_UNIT, ...HIGH, at: a2.outAt });
  c.addTransistor("Tc2", "c2", c2, [emitter("Transistor c2", 980, yC2)], false, false).wires = true;
  c.addDetector("cout", "CARRY", [across(xc, yC1), across(xc, yC2)], { unit: LATCH_UNIT, ...LOW, at: { x: xc - 30, y: yC1 - 14 } });
  return finish(sim, scene, c);
}

/**
 * A wave transistor: light in the top guide falls on a detector; when the detector sees enough light, the
 * transistor's own emitter shines into the bottom guide at full strength (or, inverted, stops shining).
 */
export function buildTransistor(sim: Sim, amplitudePct: number, invert: boolean): Circuit {
  const scene = new Scene(460, 320), c = new Circuit(sim);
  c.settle = GATE_SETTLE;
  const yIn = 130, yOut = 190;
  guide(scene, [[0, yIn], [LATCH_XD, yIn]]);
  absorbingEnd(scene, LATCH_XD, yIn, 1);
  guide(scene, [[LATCH_XD, yOut], [scene.width, yOut]]);
  absorbingEnd(scene, LATCH_XD, yOut, -1);
  c.addSwitch("A", "input", [emitter("Input", EDGE + 6, yIn, { amplitudePct })], { x: EDGE + 14, y: yIn - 9 });
  // the gate of the transistor: switches at 10-15% of a full "1" (so a weak input still counts)
  const d = c.addDetector("gate", "detector", [across(LATCH_XD - 6, yIn)], { unit: LATCH_UNIT, lo: 0.1, hi: 0.15, at: { x: LATCH_XD - 60, y: yIn - 12 } });
  c.addTransistor("T", "transistor", d, [emitter("Transistor", LATCH_XE, yOut)], invert, invert);
  c.addDetector("out", "output", [across(LATCH_XO, yOut)], { unit: LATCH_UNIT, ...LOW, at: { x: LATCH_XO - 10, y: yOut - 14 } });
  c.holdUntil = 400;
  return finish(sim, scene, c);
}

export interface Bit { s: string; r: string; q: Detector; qb: Detector }

/** Adds one latch (two NOR transistors) at this height; it starts storing 0 (Q off, Q̄ on). */
function addLatch(scene: Scene, c: Circuit, top: number, name: string): Bit {
  const L = latch(scene, top);
  const s = c.addSwitch(`S${name}`, name ? `set ${name}` : "SET", [emitter(`Set ${name}`, L.s.x, L.s.y)], { x: L.s.x + 8, y: L.s.y - 8 });
  const r = c.addSwitch(`R${name}`, name ? `reset ${name}` : "RESET", [emitter(`Reset ${name}`, L.r.x, L.r.y)], { x: L.r.x + 8, y: L.r.y + 16 });
  // NOR transistors: light at their detector switches them off
  const dQ = c.addDetector(`dQ${name}`, "", L.dQ, { unit: LATCH_UNIT, ...LOW, led: false });
  const dQb = c.addDetector(`dQb${name}`, "", L.dQb, { unit: LATCH_UNIT, ...LOW, led: false });
  c.addTransistor(`TQ${name}`, `Q${name}`, dQ, [emitter(`Transistor Q${name}`, L.q.x, L.q.y)], true, false);
  c.addTransistor(`TQb${name}`, `Q̄${name}`, dQb, [emitter(`Transistor Q̄${name}`, L.qb.x, L.qb.y)], true, true);
  const q = c.addDetector(`Q${name}`, `Q${name}`, [L.outQ], { unit: LATCH_UNIT, ...LOW, at: { x: LATCH_XO + 8, y: L.q.y - 6 } });
  const qb = c.addDetector(`Qb${name}`, `Q̄${name}`, [L.outQb], { unit: LATCH_UNIT, ...LOW, at: { x: LATCH_XO + 8, y: L.qb.y + 14 } });
  qb.bit = 1;
  return { s: s.id, r: r.id, q, qb };
}

/** One set-reset latch. */
export function buildLatch(sim: Sim): { c: Circuit; bit: Bit } {
  const scene = new Scene(480, 300), c = new Circuit(sim);
  c.settle = PRESS + LATCH_SETTLE;
  const bit = addLatch(scene, c, 110, "");
  // the transistors keep their state until the light of Q̄ has reached the other detector
  c.holdUntil = 700;
  finish(sim, scene, c);
  return { c, bit };
}

/** A register of n latches (bit n-1 at the top), all storing 0 at the start. */
export function buildRegister(sim: Sim, n = 4): { c: Circuit; bits: Bit[] } {
  const scene = new Scene(480, 2 * 84 + n * 130 - 50), c = new Circuit(sim);
  c.settle = PRESS + LATCH_SETTLE;
  const bits: Bit[] = [];
  for (let i = n - 1; i >= 0; i--) bits[i] = addLatch(scene, c, 84 + (n - 1 - i) * 130, String(i));
  c.holdUntil = 700;
  finish(sim, scene, c);
  return { c, bits };
}

/** The number a register stores now (from the Q LEDs), and whether every latch agrees with itself (Q̄ = not Q). */
export function registerValue(bits: Bit[]): { value: number; clean: boolean } {
  let v = 0, clean = true;
  bits.forEach((b, i) => { if (b.q.bit) v |= 1 << i; if (b.q.bit === b.qb.bit) clean = false; });
  return { value: v, clean };
}

/** Writes a number into the register: a set press for every 1 bit and a reset press for every 0 bit. */
export function writeRegister(c: Circuit, bits: Bit[], value: number): void {
  bits.forEach((b, i) => {
    c.set(b.s, 0); c.set(b.r, 0);
    c.pulse((value >> i) & 1 ? b.s : b.r, PRESS);
  });
}

export { LATCH_XD, LATCH_XE, LATCH_XO };
