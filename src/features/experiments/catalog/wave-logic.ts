// Wave Dude 2D web - "Computing with waves: logic gates" (school): OR, AND, XOR, NOT and a half adder from waves
// that add up and cancel. The measured numbers are in circuit-steps.ts.
// GPL-3.0-or-later.

import { buildGate, buildHalfAdder, type GateKind, GATE_SETTLE, LOW, HIGH } from "../../../circuits/builds";
import { meterHtml } from "../../../circuits/circuit";
import type { Experiment, Step } from "../types";
import { C, clearTables, leds, showCircuit, toggle, truthTable } from "./circuit-steps";

function gateStep(kind: GateKind, title: string, html: string, extra: Partial<Step>): Step {
  return {
    title, html,
    enter(sim) { buildGate(sim, kind); showCircuit(sim); },
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
  readMore: [
    { page: "waves-at-work/computing-with-waves", label: "Computing with waves" },
    { page: "how-waves-behave/interference-and-superposition", label: "Interference and superposition" },
    { page: "light-and-optics/total-internal-reflection-and-fibres", label: "Total internal reflection and optical fibres" },
  ],
  open: clearTables,
  setup(sim) { buildGate(sim, "andor"); showCircuit(sim); },
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
      enter(sim) { buildHalfAdder(sim); showCircuit(sim); },
      actions: [toggle("A", "A"), toggle("B", "B")],
      readout: () => {
        const c = C();
        if (!c) return "";
        const a = c.get("A").bit, b = c.get("B").bit, s = c.det("sum").bit, k = c.det("carry").bit;
        const ok = c.settled(GATE_SETTLE);
        return `<div class="ro-big">${a} + ${b} = <b>${ok ? `${k}${s}` : "…"}</b>` +
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
      enter(sim) { buildHalfAdder(sim); showCircuit(sim); },
      actions: [toggle("A", "A"), toggle("B", "B")],
      readout: () => { const c = C(); return c ? leds(c, ["carry", "sum"]) : ""; },
    },
  ],
};
