// Wave Dude 2D web - computing with waves: logic gates from interference (school), and wave transistors, a
// one-bit memory and a 4-bit register (university). The circuits are in ../logic.
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

import type { Action, Experiment, Step, Values } from "./types";
import type { Sim } from "../sim";
import {
  buildGate, buildHalfAdder, buildFullAdder, buildTransistor, buildLatch, buildRegister, writeRegister, registerValue, circuit,
  type GateKind, type Bit, GATE_SETTLE, ADDER_SETTLE, LATCH_SETTLE, PRESS, LOW, HIGH,
} from "../logic/builds";
import { ledHtml, meterHtml, type Circuit } from "../logic/circuit";

/**
 * The view of the computer. It runs at the app's calm 1x, but after each change of the inputs it fast-forwards at
 * `speed` steps per frame until the light has reached the outputs, so results come in a few seconds.
 */
function look(sim: Sim, speed = 12): void {
  sim.viewMode = "field";
  sim.brightness.field = 12;
  sim.brightness.intensity = 18;
  sim.stepsPerFrame = 1;
  sim.prepareSpeed = speed;
  sim.running = true;
  C()?.fastForward();
}

const C = (): Circuit | null => circuit();
const bitOf = (id: string): 0 | 1 => { const c = C(); return c ? c.get(id).bit : 0; };

/** A toggle button for an input switch. */
function toggle(id: string, label: string): Action {
  return {
    label: () => `${label} = ${bitOf(id)}`,
    on: () => bitOf(id) === 1,
    help: `Switch input ${label} on (1: its light shines) or off (0).`,
    run: () => { const c = C(); if (c) { c.set(id, bitOf(id) ? 0 : 1); c.sim.running = true; } },
  };
}

// ------------------------------------------------------------------------------------------ truth tables

/** Results measured by the reader, per gate and input combination (cleared when the experiment is opened). */
const measured = new Map<string, { value: number; bits: number[] }>();

/** Records the current result once the outputs have settled, and draws the truth table (HTML). */
function truthTable(key: string, inputs: string[], outputs: { id: string; label: string }[], expect: (ins: number[]) => number[], settle = GATE_SETTLE): string {
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
    const cells = outputs.map((_, j) => m ? `<td style="text-align:center">${m.bits[j] === want[j] ? "" : "⚠ "}${m.bits[j]}</td>` : `<td style="text-align:center;opacity:.5">?</td>`);
    rows.push(`<tr style="${here ? "background:#fbbf2433" : ""}">${ins.map(b => `<td style="text-align:center">${b}</td>`).join("")}${cells.join("")}` +
      `<td style="text-align:right;opacity:.75">${m ? m.value.toFixed(2) : ""}</td></tr>`);
  }
  const head = `<tr>${inputs.map(i => `<th>${i}</th>`).join("")}${outputs.map(o => `<th>${o.label}</th>`).join("")}<th style="text-align:right">light</th></tr>`;
  const done = [...Array(1 << n).keys()].every(k => measured.has(`${key}:${Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1).join("")}`));
  return `<table style="border-collapse:collapse;min-width:220px;margin:.4em 0">${head}${rows.join("")}</table>` +
    `<div class="muted small">${settled ? "✓ measured (this row is filled in)." : "⏳ the light is on its way… the row is filled in when the result has settled."}` +
    `${done ? " <b>Table complete!</b>" : " Try every combination of the inputs."}</div>`;
}

const leds = (c: Circuit, ids: string[]) => ids.map(id => { const d = c.det(id); return ledHtml(d.bit === 1, d.label); }).join("");

// ------------------------------------------------------------------------------------------ school: logic gates

function gateStep(kind: GateKind, title: string, html: string, extra: Partial<Step>): Step {
  return {
    title, html,
    enter(sim) { buildGate(sim, kind); look(sim); },
    actions: kind === "not" ? [toggle("A", "A")] : [toggle("A", "A"), toggle("B", "B")],
    ...extra,
  };
}

const UNI_GATES = `<details class="goals"><summary>University note: interference logic</summary>
<p>The guides carry one mode each, so at the junction only the symmetric combination of the two inputs fits into the
output guide: its amplitude is proportional to <i>a</i> + <i>b</i>, the anti-symmetric part radiates away. The detector
measures intensity, |<i>a</i> + <i>b</i>|². With equal amplitudes and a relative phase φ that is 2 + 2 cos φ times one
input: 4 in phase, 0 in anti-phase. That is why XOR (φ = π) and a NOT with a bias wave come out of linear interference
alone, but only for <b>coherent</b> inputs with locked phases (here all sources share one clock).</p>
<p>AND and OR are not linear: they are a <b>threshold</b> on the intensity (0, 1 or 4 units), i.e. a nonlinear detector.
Coherent addition helps (4 instead of 2 for incoherent light), but the decision itself is made by the detector.
Interference gates of this kind have been demonstrated in photonic-crystal and plasmonic waveguides; their outputs are
not restored to clean levels, which is why they are hard to cascade.</p></details>`;

export const waveLogic: Experiment = {
  id: "wave-logic",
  title: "Computing with waves: logic gates",
  level: "school",
  minutes: 15,
  summary: "Make 1s and 0s out of light, then let waves add up and cancel to compute OR, AND, XOR, NOT — and 1 + 1.",
  goals: [
    "A bit can be light (1) or no light (0) in a glass light guide",
    "Waves that meet in step add up; half a wave out of step they cancel",
    "Adding and cancelling waves gives the logic gates OR, AND, XOR and NOT",
    "Two gates make a half adder: the start of a calculator",
  ],
  open: () => measured.clear(),
  setup(sim) { buildGate(sim, "andor"); look(sim); },
  steps: [
    gateStep("andor", "Bits made of light",
      `<p>Computers work with <b>bits</b>: each bit is either <b>1</b> or <b>0</b>. Here a bit is <b>light</b> (1) or <b>no light</b> (0).</p>
       <p>The light travels inside <b>glass light guides</b> (the blue-tinted lanes), like light in an optical fibre: the
       glass keeps it inside by bouncing it back from the walls (total internal reflection).</p>
       <p>Switch input <b>A</b> on with the button below and watch the wave travel along its guide to the
       <b>detector</b> on the right. The detector is like an LED: it lights up green when enough light arrives.</p>`,
      {
        readout: () => { const c = C(); return c ? leds(c, ["or"]) + `<div class="muted small">light at the detector: ${c.det("or").value.toFixed(2)} (1.00 = one input)</div>` : ""; },
      }),
    gateStep("andor", "Adding waves: OR and AND",
      `<p>Two guides, <b>A</b> and <b>B</b>, join into one. Both inputs shine <b>in step</b>: their wave crests arrive together.</p>
       <p>Two detectors look at the same light. The <b>OR</b> detector lights up for <i>a little</i> light, the
       <b>AND</b> detector only for <i>a lot</i>.</p>
       <p>Try all four combinations of A and B and fill in the table. (It takes a moment for the light to arrive.)</p>`,
      {
        predict: {
          question: "With A and B both on, how much light reaches the detector compared with just one input?",
          options: ["The same", "Twice as much", "Four times as much"],
          answer: 2,
          explain: "Four times! The two waves are in step, so their crests stack up into a wave twice as tall — and a wave twice as tall carries four times the energy. That big jump is what lets the AND detector tell 'both' from 'one'.",
        },
        readout: () => {
          const c = C();
          if (!c) return "";
          return leds(c, ["or", "and"]) + meterHtml(c.det("or").value, 5, [{ at: LOW.hi, label: "OR" }, { at: HIGH.hi, label: "AND" }]) +
            truthTable("andor", ["A", "B"], [{ id: "or", label: "OR" }, { id: "and", label: "AND" }], ([a, b]) => [a | b, a & b]);
        },
      }),
    gateStep("xor", "Cancelling waves: XOR",
      `<p>Now input <b>B</b> starts <b>half a wave later</b>: where A has a crest, B has a trough.</p>
       <p>Switch on A, then B as well, and look at the wave behind the junction.</p>
       <p>This gate is called <b>XOR</b> (“exclusive or”): it says 1 when <i>exactly one</i> input is on.</p>`,
      {
        predict: {
          question: "What happens at the detector when A and B are both on now?",
          options: ["It gets four times brighter", "It goes dark", "It stays the same as one input"],
          answer: 1,
          explain: "It goes dark! A crest meets a trough, so the two waves cancel. The light that cannot continue down the guide leaks out sideways at the junction — you can see it spreading into the empty space.",
        },
        readout: () => {
          const c = C();
          if (!c) return "";
          return leds(c, ["out"]) + meterHtml(c.det("out").value, 2, [{ at: LOW.hi, label: "threshold" }]) +
            truthTable("xor", ["A", "B"], [{ id: "out", label: "XOR" }], ([a, b]) => [a ^ b]);
        },
      }),
    gateStep("not", "NOT: cancelling the power",
      `<p>A <b>NOT</b> gate turns 1 into 0 and 0 into 1. Here the bottom guide is a <b>power supply</b> that always shines.</p>
       <p>Input A shines half a wave out of step with it. When A is off, the power light reaches the detector (1).
       When A is on, it cancels the power light (0).</p>`,
      {
        readout: () => {
          const c = C();
          if (!c) return "";
          return leds(c, ["out"]) + meterHtml(c.det("out").value, 2, [{ at: LOW.hi, label: "threshold" }]) +
            truthTable("not", ["A"], [{ id: "out", label: "NOT A" }], ([a]) => [1 - a]);
        },
      }),
    {
      title: "A half adder: 1 + 1 = 10",
      html: `<p>Now we can <b>add</b>! In binary, 0 + 1 = 1, but 1 + 1 = <b>10</b> (that is “two”: a 1 in the twos column).</p>
             <p>The top combiner is an <b>XOR</b>: it gives the <b>sum</b> digit. The bottom one is an <b>AND</b>: it gives the
             <b>carry</b> digit. Each input switch feeds both combiners (in a real chip a beam splitter would share one light between them).</p>
             <p>Try all four sums.</p>`,
      enter(sim) { buildHalfAdder(sim); look(sim); },
      actions: [toggle("A", "A"), toggle("B", "B")],
      readout: () => {
        const c = C();
        if (!c) return "";
        const a = c.get("A").bit, b = c.get("B").bit, s = c.det("sum").bit, k = c.det("carry").bit;
        const ok = c.settled(GATE_SETTLE);
        return `<div style="font-size:20px;margin:.2em 0">${a} + ${b} = <b>${ok ? `${k}${s}` : "…"}</b>` +
          `${ok ? ` <span class="muted small">(binary ${k}${s} = ${2 * k + s})</span>` : ""}</div>` + leds(c, ["carry", "sum"]) +
          truthTable("half", ["A", "B"], [{ id: "sum", label: "sum" }, { id: "carry", label: "carry" }], ([x, y]) => [x ^ y, x & y]);
      },
    },
    {
      title: "What waves cannot do on their own",
      html: `<p>The waves did the adding and the cancelling. But look closely at who made the <b>decisions</b>: the detectors.
             A detector turns “a little light” or “a lot of light” into a clean 0 or 1. Waves alone cannot do that — they
             only ever add up.</p>
             <p>Waves also cannot <b>remember</b>: switch the inputs off and after a moment all the light is gone.
             To build memory, and to send a result on to the next gate at full strength, we need a <b>wave transistor</b>:
             a light that is switched on and off by light. That is the next experiment, <i>Wave transistors and memory</i>.</p>
             ${UNI_GATES}`,
      enter(sim) { buildHalfAdder(sim); look(sim); },
      actions: [toggle("A", "A"), toggle("B", "B")],
      readout: () => { const c = C(); return c ? leds(c, ["carry", "sum"]) : ""; },
    },
  ],
};

// ------------------------------------------------------------------------------------------ university: memory

let latchBit: Bit | null = null;
let latchCircuit: Circuit | null = null;
/** Step 1 of the memory experiment: the transistor is inverted (a NOT with gain). */
let invertNext = false;
let regBits: Bit[] = [];
/** Last number written to the register, and when. */
let lastWrite: { value: number; at: number } | null = null;

const press = (id: () => string | undefined, label: string, help: string) => ({
  label, help,
  run: (sim: Sim) => { const c = C(), i = id(); if (c && i) { c.pulse(i, PRESS); sim.running = true; } },
});

/** Shows the latch (a new one, or the one already running when coming from the step before). */
function showLatch(sim: Sim, fresh: boolean): void {
  if (fresh || C() !== latchCircuit || !latchCircuit) {
    const l = buildLatch(sim);
    latchBit = l.bit;
    latchCircuit = l.c;
  }
  look(sim, 10);
}

/** The last "real parts" press: which transistor needed more light to switch off, and by how much. */
let mismatch: { which: "Q" | "Q̄"; pct: number } | null = null;

/**
 * Presses SET and RESET together. real: like real parts, the two transistors differ a little — one of them, picked
 * at random, needs 15-25% more light to switch off. Measured: the flicker then dies out after 5,000-11,000 steps,
 * and the less sensitive one stays on (with no difference it flickers for ever).
 */
function pressBoth(sim: Sim, real: boolean): void {
  const c = C();
  if (!c || !latchBit) return;
  for (const id of ["dQ", "dQb"]) { const d = c.det(id); d.lo = LOW.lo; d.hi = LOW.hi; }
  mismatch = null;
  if (real) {
    const which = Math.random() < 0.5 ? "Q" : "Q̄", pct = 15 + Math.round(Math.random() * 10);
    const d = c.det(which === "Q" ? "dQ" : "dQb");
    d.lo *= 1 + pct / 100;
    d.hi *= 1 + pct / 100;
    mismatch = { which, pct };
  }
  c.pulse(latchBit.s, PRESS);
  c.pulse(latchBit.r, PRESS);
  // the flicker takes a dozen rounds to die out: run ahead until it has, then on at the chosen speed
  if (real) { sim.prepareSpeed = 24; sim.runUntil(sim.time + PRESS + 10000, () => { sim.prepareSpeed = 10; sim.running = true; }); }
  sim.running = true;
}

function pulsesActive(c: Circuit): string[] {
  return c.switches.filter(s => s.offAt >= 0).map(s => s.label);
}

function write(sim: Sim, v: number): void {
  const c = C();
  if (!c || !regBits.length) return;
  writeRegister(c, regBits, v);
  lastWrite = { value: v, at: sim.time };
  sim.running = true;
}

const UNI_MEMORY = `<details class="goals"><summary>University note: why memory needs nonlinearity</summary>
<p>A linear system with any loss has, for given inputs, exactly one steady state; with the inputs off it decays to
zero. It can delay a signal (early computers stored bits as sound pulses circulating in mercury delay lines) but every
pass needs an amplifier that regenerates the pulse. A bit needs <b>two stable states</b> for the same inputs, which
takes a nonlinear element with gain plus <b>feedback</b>: here two inverting threshold elements (NOR gates) closed in a
loop, the textbook SR latch.</p>
<p>In the simulator the wave transistor's decision is a small rule run between the time steps — the honest stand-in for
the physics that does it in real devices: Kerr and other χ⁽³⁾ nonlinearities, saturable absorbers, semiconductor
optical amplifiers, or optical bistability in resonators. Research devices include a single-molecule optical
transistor (Hwang et al., Nature 2009), a switch gated by one stored photon (Chen et al., Science 2013) and
photonic-crystal nanocavity memories, about a hundred of them on one chip (Kuramochi et al., Nature Photonics 2014).
D. A. B. Miller's criteria for a useful optical transistor (Nature Photonics 2010) — cascadability, fan-out,
logic-level restoration, input/output isolation, no critical biasing — are exactly what the transistor here provides by
construction and what is hard to get from real materials. Today's photonic computing therefore mostly does the
<b>linear</b> part optically (e.g. matrix multiplication for neural networks, Shen et al., Nature Photonics 2017) and
leaves decisions and memory to electronics.</p></details>`;

export const waveMemory: Experiment = {
  id: "wave-memory",
  title: "Wave transistors and memory",
  level: "university",
  minutes: 25,
  open: () => measured.clear(),
  summary: "A light switched by light gives gain and clean 0s and 1s: enough to chain gates into a full adder, and, in a loop, to remember a bit — four make a register.",
  goals: [
    "Why gain and a threshold (a nonlinearity) are needed for logic that can be cascaded",
    "A full adder from two half adders and wave transistors",
    "How feedback between two inverting switches stores a bit (the SR latch)",
    "Set, reset, and the forbidden input of a latch",
    "A 4-bit register that keeps a number with all its inputs switched off",
  ],
  setup(sim, p) { buildTransistor(sim, p.amp ?? 40, false); look(sim, 10); },
  params: [
    { id: "amp", label: "Strength of the transistor's input", min: 10, max: 100, step: 5, value: 40, unit: "%",
      help: "Amplitude of the input wave (step 1). The detector switches at 10-15% of a full 1 in intensity, i.e. at about 32-39% amplitude.",
      live: (sim, p) => {
        const c = C();
        if (!c || !c.switches.some(s => s.id === "A")) return;
        for (const src of c.get("A").sources) src.amplitudePct = p.amp;
        sim.refreshSources();
      } },
  ],
  steps: [
    {
      title: "A light switched by light",
      html: `<p>The top guide brings a <b>weak</b> input wave (set its strength under <i>Experiment controls</i>). It ends in a
             detector. When the detector sees enough light, the <b>wave transistor</b> switches on its own emitter in the
             bottom guide — at <b>full strength</b>.</p>
             <p>That is <b>gain</b>: a weak signal controls a strong one. It also <b>restores</b> the level: a weak 1 comes out
             as a clean, full 1, so the result can drive the next gates. Try 25%, 40% and 100%, and the inverted version (a NOT with gain).</p>`,
      enter(sim, p) { buildTransistor(sim, p.amp, invertNext); look(sim, 10); },
      actions: [
        toggle("A", "input"),
        { label: () => invertNext ? "inverted (NOT) ✓" : "inverted (NOT)", on: () => invertNext, help: "Inverted: the transistor's light goes OFF when its detector sees light.",
          run: (sim: Sim, p: Values) => { invertNext = !invertNext; buildTransistor(sim, p.amp, invertNext); look(sim, 10); } },
      ],
      readout: () => {
        const c = C();
        if (!c) return "";
        const g = c.det("gate"), o = c.det("out");
        return ledHtml(g.bit === 1, "detector") + ledHtml(o.bit === 1, "output") +
          `<div class="muted small">light at the detector: ${g.value.toFixed(2)} · light at the output: ${o.value.toFixed(2)} (1.00 = one full emitter)</div>` +
          meterHtml(g.value, 1.2, [{ at: 0.15, label: "switch" }]);
      },
    },
    {
      title: "Chaining gates: a full adder",
      html: `<p>A half adder adds two bits. To add longer numbers, every column must also add the <b>carry</b> from the
             column before — three bits: A + B + Cin. A <b>full adder</b> is two half adders in a row.</p>
             <p>But there is a catch. Switch on only A and look at the light reaching the first AND detector (A·B): it is
             not 0, it is a whole unit of light — the AND detector just ignores it. Sent straight on into the next gate,
             it would count as a 1. So each first-stage result goes through a <b>wave transistor</b> that decides 0 or 1
             and sends a fresh, full-strength wave into the second stage (dashed lines: the transistors' control
             connections). This is <b>level restoration</b>, the reason real computers put transistors between their gates.</p>
             <p>Watch the answer while the light is on its way: it can show a wrong value for a moment (a <b>glitch</b>).
             Real computers wait for the next tick of their clock before they read a result.</p>`,
      enter(sim) { buildFullAdder(sim); look(sim, 16); },
      actions: [toggle("A", "A"), toggle("B", "B"), toggle("C", "Cin")],
      readout: () => {
        const c = C();
        if (!c || !c.detectors.some(d => d.id === "cout")) return "";
        const a = c.get("A").bit, b = c.get("B").bit, ci = c.get("C").bit, s = c.det("sum").bit, k = c.det("cout").bit;
        const ok = c.settled(ADDER_SETTLE);
        return `<div style="font-size:20px;margin:.2em 0">${a} + ${b} + ${ci} = <b>${ok ? `${k}${s}` : "…"}</b>` +
          `${ok ? ` <span class="muted small">(binary ${k}${s} = ${2 * k + s})</span>` : ""}</div>` + leds(c, ["cout", "sum"]) +
          truthTable("full", ["A", "B", "C"], [{ id: "sum", label: "sum" }, { id: "cout", label: "carry" }], ([x, y, z]) => [x ^ y ^ z, (x + y + z) >> 1], ADDER_SETTLE);
      },
    },
    {
      title: "One bit of memory: the latch",
      html: `<p>Two inverted wave transistors feed each other. <b>Q</b> shines only while no light reaches its detector — and its
             detector gets the light of <b>Q̄</b> (“Q-bar”) and of the RESET input. Q̄ shines only while its detector,
             fed by Q and by SET, is dark.</p>
             <p>So either Q shines and keeps Q̄ dark, or Q̄ shines and keeps Q dark. Both are stable: that is one bit.</p>
             <p>Press <b>SET</b>, wait until Q lights up, and watch: the SET light goes off again, yet Q stays on. Then press <b>RESET</b>.</p>`,
      enter(sim) { showLatch(sim, true); },
      predict: {
        question: "After you press SET and let go, what keeps Q on?",
        options: ["The SET light, which is still travelling", "Q̄ is off, so nothing switches Q off: the loop holds itself", "Nothing: Q goes off again after a while"],
        answer: 1,
        explain: "The loop holds itself. Q's light keeps Q̄'s detector lit, so Q̄ stays off, so Q's detector stays dark, so Q stays on — for as long as you like.",
      },
      actions: [
        press(() => latchBit?.s, "Press SET", "Shines on the Q̄ transistor's detector for a moment: Q̄ goes off, then Q comes on."),
        press(() => latchBit?.r, "Press RESET", "Shines on the Q transistor's detector for a moment: Q goes off, then Q̄ comes on."),
        { label: "Press both (forbidden!)", help: "SET and RESET together: both transistors go off. What happens when you let go?",
          run: (sim: Sim) => pressBoth(sim, false) },
      ],
      readout: () => {
        const c = C();
        if (!c || !latchBit) return "";
        const act = pulsesActive(c);
        return leds(c, [latchBit.q.id, latchBit.qb.id]) +
          `<div class="muted small">${act.length ? `pressing: ${act.join(", ")}` : "all inputs off — the latch keeps its bit by itself"}</div>`;
      },
    },
    {
      title: "Set and reset together",
      html: `<p>Press <b>both</b>. Both transistors switch off. When you let go, both see darkness at the same moment and switch
             on together — then both see light and switch off together…</p>
             <p>In this perfect simulation the two halves are exactly alike, so they <b>flicker</b> for ever.</p>
             <p>Real parts are never exactly alike. Press <b>both, with real parts</b>: one of the two transistors, picked at
             random, needs a little more light to switch off. Each round it stays on a moment longer than the other, the
             flicker dies out, and the latch falls into 0 or 1. Which one? You cannot tell beforehand. That is why “set and
             reset together” is the <b>forbidden input</b> of an SR latch: the bit you get is a coin toss.</p>
             <p>Press SET or RESET alone to put it back in order.</p>`,
      enter(sim) { showLatch(sim, false); },
      actions: [
        press(() => latchBit?.s, "Press SET", "Q = 1."),
        press(() => latchBit?.r, "Press RESET", "Q = 0."),
        { label: "Press both (perfect parts)", help: "Both halves exactly alike: the latch flickers for ever.", run: (sim: Sim) => pressBoth(sim, false) },
        { label: "Press both (real parts)", help: "One transistor, picked at random, is 15-25% less sensitive. Fast-forwards until the flicker has died out.", run: (sim: Sim) => pressBoth(sim, true) },
      ],
      readout: sim => {
        const c = C();
        if (!c || !latchBit || c !== latchCircuit) return "";
        const q = latchBit.q.bit, qb = latchBit.qb.bit, act = pulsesActive(c);
        const status = act.length ? `pressing: ${act.join(", ")}`
          : q === qb ? (sim.preparing ? "flickering… (running ahead until it settles)" : "flickering: Q and Q̄ switch on and off together")
          : `settled: Q = ${q}${mismatch ? `. This time the ${mismatch.which} transistor needed ${mismatch.pct}% more light to switch off, so it stayed on.` : ""}`;
        return leds(c, [latchBit.q.id, latchBit.qb.id]) + `<div class="muted small">${status}</div>`;
      },
    },
    {
      title: "A 4-bit register",
      html: `<p>Four latches, one above the other, store a 4-bit number: bit 3 (worth 8) at the top down to bit 0 (worth 1).</p>
             <p>Writing a number presses SET on the latches that should hold 1 and RESET on the others, for a moment. Then
             every input is off again — and the number stays.</p>`,
      enter(sim) { const r = buildRegister(sim, 4); regBits = r.bits; lastWrite = null; look(sim, 10); },
      actions: [5, 10, 15, 0, 9].map(v => ({ label: `Write ${v} (${v.toString(2).padStart(4, "0")})`, run: (sim: Sim) => write(sim, v) })),
      readout: (sim) => {
        const c = C();
        if (!c || !regBits.length || !c.switches.some(s => s.id === regBits[0].s)) return "";
        const { value, clean } = registerValue(regBits);
        const busy = pulsesActive(c).length > 0 || (lastWrite !== null && sim.time - lastWrite.at < PRESS + LATCH_SETTLE);
        return `<div style="font-size:20px;margin:.2em 0">${[3, 2, 1, 0].map(i => regBits[i].q.bit).join("")} = <b>${value}</b></div>` +
          [3, 2, 1, 0].map(i => ledHtml(regBits[i].q.bit === 1, `b${i}`)).join("") +
          `<div class="muted small">${busy ? "writing… (the set/reset light is on its way)" : lastWrite ? `holding ${lastWrite.value} with every input off${clean && value === lastWrite.value ? " ✓" : ""}` : "every latch starts at 0"}</div>`;
      },
    },
    {
      title: "From here to a real computer",
      html: `<p>You have built the parts of a computer from waves: gates that add and compare, and memory that holds a number.</p>
             <p>Notice what did which job. The <b>waves</b> carried the bits and added them up. The <b>transistors</b> made the
             decisions, restored the signals and, wired in a loop, remembered. Real optical computers have exactly this
             problem: light is great at carrying and adding, but switching light with light needs special materials whose
             response is not linear, and they are still a research topic.</p>
             ${UNI_MEMORY}`,
    },
  ],
};
