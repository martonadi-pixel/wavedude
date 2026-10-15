// Wave Dude 2D web - "Wave transistors and memory" (university): gain and level restoration, a full adder, the SR
// latch and a 4-bit register. The measured numbers are in circuit-steps.ts.
// GPL-3.0-or-later.

import type { Sim } from "../../../sim/sim";
import {
  buildFullAdder, buildTransistor, buildLatch, buildRegister, writeRegister, registerValue,
  type Bit, ADDER_SETTLE, LATCH_SETTLE, PRESS, LOW,
} from "../../../circuits/builds";
import { ledHtml, meterHtml, type Circuit } from "../../../circuits/circuit";
import type { Experiment, Values } from "../types";
import { C, clearTables, leds, showCircuit, toggle, truthTable } from "./circuit-steps";

let latchBit: Bit | null = null;
let latchCircuit: Circuit | null = null;
/** Step 1: the transistor is inverted (a NOT with gain). */
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
  showCircuit(sim, 10);
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
  open: clearTables,
  summary: "A light switched by light gives gain and clean 0s and 1s: enough to chain gates into a full adder, and, in a loop, to remember a bit — four make a register.",
  goals: [
    "Why gain and a threshold (a nonlinearity) are needed for logic that can be cascaded",
    "A full adder from two half adders and wave transistors",
    "How feedback between two inverting switches stores a bit (the SR latch)",
    "Set, reset, and the forbidden input of a latch",
    "A 4-bit register that keeps a number with all its inputs switched off",
  ],
  readMore: [
    { page: "waves-at-work/computing-with-waves", label: "Computing with waves" },
    { page: "how-waves-behave/interference-and-superposition", label: "Interference and superposition" },
    { page: "light-and-optics/total-internal-reflection-and-fibres", label: "Total internal reflection and optical fibres" },
  ],
  setup(sim, p) { buildTransistor(sim, p.amp ?? 40, false); showCircuit(sim, 10); },
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
      enter(sim, p) { buildTransistor(sim, p.amp, invertNext); showCircuit(sim, 10); },
      actions: [
        toggle("A", "input"),
        { label: () => invertNext ? "inverted (NOT) ✓" : "inverted (NOT)", on: () => invertNext, help: "Inverted: the transistor's light goes OFF when its detector sees light.",
          run: (sim: Sim, p: Values) => { invertNext = !invertNext; buildTransistor(sim, p.amp, invertNext); showCircuit(sim, 10); } },
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
      enter(sim) { buildFullAdder(sim); showCircuit(sim, 16); },
      actions: [toggle("A", "A"), toggle("B", "B"), toggle("C", "Cin")],
      readout: () => {
        const c = C();
        if (!c || !c.detectors.some(d => d.id === "cout")) return "";
        const a = c.get("A").bit, b = c.get("B").bit, ci = c.get("C").bit, s = c.det("sum").bit, k = c.det("cout").bit;
        const ok = c.settled(ADDER_SETTLE);
        return `<div class="ro-big">${a} + ${b} + ${ci} = <b>${ok ? `${k}${s}` : "…"}</b>` +
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
      enter(sim) { const r = buildRegister(sim, 4); regBits = r.bits; lastWrite = null; showCircuit(sim, 10); },
      actions: [5, 10, 15, 0, 9].map(v => ({ label: `Write ${v} (${v.toString(2).padStart(4, "0")})`, run: (sim: Sim) => write(sim, v) })),
      readout: (sim) => {
        const c = C();
        if (!c || !regBits.length || !c.switches.some(s => s.id === regBits[0].s)) return "";
        const { value, clean } = registerValue(regBits);
        const busy = pulsesActive(c).length > 0 || (lastWrite !== null && sim.time - lastWrite.at < PRESS + LATCH_SETTLE);
        return `<div class="ro-big">${[3, 2, 1, 0].map(i => regBits[i].q.bit).join("")} = <b>${value}</b></div>` +
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
