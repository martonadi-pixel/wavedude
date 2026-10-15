// Wave Dude 2D web - what the two computing-with-waves experiments share: the view of a circuit, input buttons, LEDs
// and truth tables the reader fills in. The circuits themselves are in src/circuits.
// GPL-3.0-or-later.
//
// Measured in the engine (test scripts drive window.waveDude headless; numbers in units of one input's light at
// the detector, level 60, glass guides n = 1.5 and 6 cells wide):
//   OR/AND combiner: 00 -> 0.000, 01 -> 1.16, 10 -> 1.01, 11 -> 4.42 (OR threshold 0.3/0.5, AND 2.0/2.6)
//   XOR (B half a wave behind): 00 -> 0.000, 01 -> 1.15, 10 -> 1.01, 11 -> 0.023 (contrast about 40:1)
//   NOT (A cancels an always-on power wave): A = 0 -> 1.20, A = 1 -> 0.024
//   half adder: sum and carry as above (11 -> sum 0.030, carry 4.47); results settle ~1350 steps after a change
//   wave transistor: an input at 40% amplitude (0.16 units at the detector) gives a full output (1.0); 25% (0.066)
//   gives none: the output level is restored. Inverted, the same with 0 and 1 swapped.
//   SR latch: Q goes 0 -> 1 about 850 steps after SET is pressed and holds (checked for 4000+ steps with all inputs
//   off); RESET likewise. Q and Q̄ LEDs: 0.92-1.04 for 1 and below 0.04 for 0.
//   register: writing 5, 10, 15, 0, 9, 6, 6, 3 read back correctly each time and 3000 steps later.
//   SET and RESET together, then released: the latch oscillates (Q, Q̄ = 11, 00, 11, ... every ~300 steps), the
//   classic forbidden input of an SR latch with perfectly matched delays.

import type { Sim } from "../../../sim/sim";
import { circuit, GATE_SETTLE } from "../../../circuits/builds";
import { ledHtml, type Circuit } from "../../../circuits/circuit";
import type { Action } from "../types";
import { look } from "../helpers";

/** The circuit on show (null when there is none). */
export const C = (): Circuit | null => circuit();
const bitOf = (id: string): 0 | 1 => { const c = C(); return c ? c.get(id).bit : 0; };

/**
 * The view of the computer. It runs at the app's calm 1x, but after each change of the inputs it fast-forwards at
 * `speed` steps per frame until the light has reached the outputs, so results come in a few seconds.
 */
export function showCircuit(sim: Sim, speed = 12): void {
  look(sim, { view: "field", field: 12, intensity: 18, speed: 1, prepare: speed });
  sim.running = true;
  C()?.fastForward();
}

/** A toggle button for an input switch. */
export function toggle(id: string, label: string): Action {
  return {
    label: () => `${label} = ${bitOf(id)}`,
    on: () => bitOf(id) === 1,
    help: `Switch input ${label} on (1: its light shines) or off (0).`,
    run: () => { const c = C(); if (c) { c.set(id, bitOf(id) ? 0 : 1); c.sim.running = true; } },
  };
}

/** The LEDs of these detectors (HTML). */
export const leds = (c: Circuit, ids: string[]): string => ids.map(id => { const d = c.det(id); return ledHtml(d.bit === 1, d.label); }).join("");

/** Results measured by the reader, per gate and input combination. */
const measured = new Map<string, { value: number; bits: number[] }>();

/** Forgets the measured results (when an experiment is opened). */
export const clearTables = (): void => measured.clear();

/** Records the current result once the outputs have settled, and draws the truth table (HTML). */
export function truthTable(key: string, inputs: string[], outputs: { id: string; label: string }[], expect: (ins: number[]) => number[], settle = GATE_SETTLE): string {
  const c = C();
  if (!c) return "";
  const now = inputs.map(id => c.get(id).bit);
  const settled = c.settled(settle);
  const cur = `${key}:${now.join("")}`;
  if (settled) measured.set(cur, { value: c.det(outputs[0].id).value, bits: outputs.map(o => c.det(o.id).bit) });
  const rows: string[] = [];
  const n = inputs.length;
  for (let k = 0; k < 1 << n; k++) {
    const ins = Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1);
    const m = measured.get(`${key}:${ins.join("")}`), here = ins.join("") === now.join("");
    const want = expect(ins);
    const cells = outputs.map((_, j) => m ? `<td>${m.bits[j] === want[j] ? "" : "⚠ "}${m.bits[j]}</td>` : `<td class="unk">?</td>`);
    rows.push(`<tr${here ? ` class="here"` : ""}>${ins.map(b => `<td>${b}</td>`).join("")}${cells.join("")}` +
      `<td class="num">${m ? m.value.toFixed(2) : ""}</td></tr>`);
  }
  const head = `<tr>${inputs.map(i => `<th>${i}</th>`).join("")}${outputs.map(o => `<th>${o.label}</th>`).join("")}<th class="num">light</th></tr>`;
  const done = [...Array(1 << n).keys()].every(k => measured.has(`${key}:${Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1).join("")}`));
  return `<table class="tt">${head}${rows.join("")}</table>` +
    `<div class="muted small">${settled ? "✓ measured (this row is filled in)." : "⏳ the light is on its way… the row is filled in when the result has settled."}` +
    `${done ? " <b>Table complete!</b>" : " Try every combination of the inputs."}</div>`;
}
