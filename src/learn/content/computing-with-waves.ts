// Wave Dude 2D web - "How it works" library: Computing with waves (logic gates, transistors and memory from light).
// GPL-3.0-or-later.
//
// The simulator numbers below were measured in the engine (see src/logic/parts.ts and builds.ts): light guides 6 cells
// of n = 1.5 at frequency level 60 (wavelength 14.9 cells), a Y-combiner read 150 cells behind the junction.

import type { LearnPage } from "../types";

export const page: LearnPage = {
  id: "computing-with-waves",
  title: "Computing with waves",
  summary: "Light as 1, darkness as 0: how adding waves makes logic gates, and why deciding and remembering need a transistor.",
  sections: [
    {
      level: "kids",
      html: `
<p>A computer only knows two things: <b>1</b> and <b>0</b>, yes and no, on and off. Inside a normal computer a 1 is a little
bit of electricity and a 0 is none. But a 1 could just as well be <b>light</b>, and a 0 darkness.</p>
<p>To send light where you want it, you use a <b>light guide</b>: a thin strip of glass that light cannot escape from, like
water in a pipe. A light at the start of the guide is a switch: on means 1, off means 0. A little lamp at the end, which
lights up when light arrives, shows the answer.</p>
<h4>When two waves meet</h4>
<p>Now let two light guides join into one. If both lights are on, what comes out? That depends on how the waves meet.</p>
<ul>
<li>If the hills of one wave meet the hills of the other, they <b>add up</b>: much more light comes out. Like two friends
pushing a swing at the same moment.</li>
<li>If the hills of one wave meet the valleys of the other, they <b>cancel</b>: it goes dark! Like one friend pushing the
swing forward while the other pushes it back.</li>
</ul>
<figure class="diagram"><svg viewBox="0 0 320 150">
  <path d="M 10 30 L 60 30 L 150 75 L 310 75" fill="none" stroke="#60a5fa" stroke-width="10" stroke-linejoin="round" opacity=".35"/>
  <path d="M 10 120 L 60 120 L 150 75" fill="none" stroke="#60a5fa" stroke-width="10" stroke-linejoin="round" opacity=".35"/>
  <circle cx="22" cy="30" r="7" fill="#fbbf24"/><text x="22" y="16" font-size="13" fill="currentColor" text-anchor="middle">A</text>
  <circle cx="22" cy="120" r="7" fill="#fbbf24"/><text x="22" y="145" font-size="13" fill="currentColor" text-anchor="middle">B</text>
  <circle cx="290" cy="75" r="9" fill="#4ade80"/><text x="290" y="105" font-size="13" fill="currentColor" text-anchor="middle">lamp</text>
  <text x="200" y="60" font-size="12" fill="currentColor" text-anchor="middle">waves add up or cancel</text>
</svg><figcaption>Two light guides join into one. A lamp at the end shows what came out.</figcaption></figure>
<p>That is already a little calculator! With the right lamp, “A or B shines” lights it up (an <b>OR</b>), and with a lamp that
needs a lot of light, only “A and B shine together” lights it (an <b>AND</b>). Put the waves so they cancel, and the lamp
lights up when <i>only one</i> of them shines: that one is called <b>XOR</b>, and it is the main part of adding numbers.</p>
<h4>The part that decides</h4>
<p>Waves are great at adding up and cancelling, but they cannot make up their mind, and they cannot remember anything: when
you switch the lights off, the light is gone. For that you need a <b>transistor</b>: a light that is switched on or off by
another light. Two transistors that keep each other switched off can hold a 1 or a 0 for as long as you like: that is
<b>memory</b>.</p>
<div class="fact"><b>Fun fact:</b> some of the very first computers, around 1950, remembered their numbers as <b>sound
waves</b> running round and round through tubes of mercury. Each time a wave came out of the end, a machine made it fresh
and sent it in again.</div>
<div class="home"><b>Try it at home:</b> Play “memory” with a friend and two torches in a dark room. The rule for each of you:
“If the other person's torch shines on me, I switch mine off. If not, I switch mine on.” Start with one torch on. Does it
stay like that? Now both switch on at exactly the same moment. What happens?</div>`,
    },
    {
      level: "school",
      html: `
<h4>Bits and truth tables</h4>
<p>A <b>logic gate</b> takes one or more bits and gives a bit. A <b>truth table</b> lists the output for every input:</p>
<table>
<tr><th>A</th><th>B</th><th>A OR B</th><th>A AND B</th><th>A XOR B</th></tr>
<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>
<tr><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td></tr>
</table>
<h4>Why two inputs give four times the light</h4>
<p>Waves add their <b>amplitudes</b> (how high the hills are), but a detector measures <b>intensity</b>, which goes as the
amplitude squared. Call the light of one input at the detector 1 unit. Then:</p>
<ul>
<li>one input: amplitude 1, intensity 1² = <b>1</b>;</li>
<li>both inputs in phase (hill meets hill): amplitude 1 + 1 = 2, intensity 2² = <b>4</b>;</li>
<li>both inputs in anti-phase (hill meets valley): amplitude 1 − 1 = 0, intensity <b>0</b>.</li>
</ul>
<p>In the simulator the measured values are 1, about 4.0–4.4 and about 0.01–0.05. So a detector that switches on at
“more than half a unit” is an OR, one that needs “more than 2.6 units” is an AND, and the same junction with the inputs half
a wave apart is an XOR. A NOT is an XOR with one input always on: the input A cancels a steady “power” light.</p>
<h4>Adding numbers</h4>
<p>In binary, 1 + 1 = 10 (“one-zero”: two). Adding two bits gives a <b>sum</b> bit and a <b>carry</b> bit:
sum = A XOR B and carry = A AND B. That pair of gates is a <b>half adder</b>. Two half adders plus an OR make a
<b>full adder</b>, which also takes the carry from the column before, just as you carry a 1 when you add 7 + 5 on paper.
Chain full adders and you can add numbers of any length.</p>
<h4>Why the waves need help</h4>
<p>Each gate loses some light, and a detector reading of “3.1 units” is not a clean 1. If the weak, smeared result went
straight into the next gate, the errors would pile up. A <b>wave transistor</b> fixes this: it looks at the light with a
detector, decides “1” or “0”, and switches its own emitter fully on or off. The signal comes out at full strength again,
like a repeater in a long fibre-optic cable.</p>
<p>Memory needs the same part. A <b>latch</b> is two inverted transistors (each shines only while its detector is dark),
each looking at the other's light. Either the first shines and keeps the second dark, or the other way round: two stable
states, so one bit. A short flash on SET or RESET flips it, and it then holds its bit with every input off.</p>
<p class="aside">In the simulator light in the glass moves about 0.37 cells per step, so it needs some 1200 steps for the
500 cells from an input to a gate's detector: a gate gives its answer after roughly 1500 steps, a full adder (two gates in a
row) after about 3200. Real light crosses a few millimetres of chip in about ten picoseconds.</p>`,
    },
    {
      level: "university",
      html: `
<h4>What a linear wave can and cannot compute</h4>
<p>The wave equation is linear: the field at the output is a fixed linear combination of the input fields,
E<sub>out</sub> = Σ<sub>k</sub> t<sub>k</sub> E<sub>k</sub>, with complex transmission coefficients t<sub>k</sub> set by the
geometry. Everything nonlinear comes from the <b>detector</b>, which measures |E<sub>out</sub>|<sup>2</sup>. For two inputs of
equal amplitude and relative phase φ,</p>
<p class="formula">I = |t|<sup>2</sup> |E|<sup>2</sup> · (2 + 2 cos φ) for both on, &nbsp; |t|<sup>2</sup> |E|<sup>2</sup> for one on</p>
<p>so φ = 0 gives the 1 : 4 ratio that a threshold turns into OR and AND, and φ = π gives 1 : 0, an XOR. These are the only
tricks available: superposition plus a square-law detector plus a threshold. Interference alone never <b>decides</b>, never
<b>amplifies</b> (a passive linear network cannot put out more power than goes in), and never <b>remembers</b> (a linear system
with any loss has a single steady state for given inputs, and it decays to zero when they are off).</p>
<h4>Where does the light go when it cancels?</h4>
<p>A symmetric Y-junction from two single-mode guides into one cannot be lossless for every input: the two input guides
carry two modes, the output guide one. The symmetric (in-phase) combination couples into the output mode; the antisymmetric
(anti-phase) combination matches the output guide's <b>odd</b> mode, which the single-mode guide cannot carry, so it is
radiated into the cladding. For one input alone, half its power goes each way. In units of half an input's power:
one input gives 1, both in phase give all of 2 inputs' power = 4 units, both in anti-phase give 0 and radiate everything.
Energy is conserved; it just leaves sideways. That is why the simulator reads the output 150 cells behind the junction, after
the radiated part has left the guide, and why the guide must be single-mode: with a guide 8 cells wide the anti-phase output
was still 1.5 units instead of 0.02–0.05.</p>
<h4>What a usable logic device needs</h4>
<p>D. A. B. Miller (2010) listed what an optical switch must offer before it can replace a transistor in logic:</p>
<ul>
<li><b>Cascadability</b>: the output can drive the input of the next stage of the same kind;</li>
<li><b>Fan-out</b>: one output can drive at least two inputs, which needs <b>gain</b>;</li>
<li><b>Logic-level restoration</b>: the output levels are clean whatever small errors the inputs had;</li>
<li><b>Input–output isolation</b>: light reflected back from the next stage does not disturb this one;</li>
<li>no need for <b>critical biasing</b>, and logic levels that do not depend on the <b>loss</b> along the way.</li>
</ul>
<p>Passive interference fails all of them except, partly, cascadability. The simulator's wave transistor passes them by
construction: it is a detector with a threshold (with hysteresis, a Schmitt trigger) that switches a fresh emitter, i.e. an
optical–electrical–optical repeater. That step is a small rule run between the time steps, not something the wave equation does,
and the experiments say so. Fan-out is done here by giving an input switch several emitters, which is what gain buys you.</p>
<h4>Memory is bistability plus feedback</h4>
<p>Two inverting threshold elements in a loop (two NOR gates) form the SR latch: for the same inputs (both off) it has two
stable states; here a latch flips in about 600 steps. Pressing SET and RESET together and releasing them at once puts both
halves in the same state at the same moment; with identical parts and pure delay the symmetric oscillation never ends.
With real parts, a small mismatch (a detector that needs 15–25% more light in the experiment) shortens one side's pulses a
little every round until they vanish and the latch falls one way. In electronics this is <b>metastability</b>: the
resolution time has no upper bound, which is why circuits that sample asynchronous signals use synchronizers and quote a
mean time between failures.</p>`,
    },
    {
      level: "research",
      title: "Optical and wave computing today",
      html: `
<p>Light is excellent at the linear part of computing and poor at the nonlinear part, and current research is shaped by that.</p>
<ul>
<li><b>Linear photonic processors.</b> Meshes of Mach–Zehnder interferometers implement arbitrary unitary matrices
(Reck et al. 1994; Clements et al. 2016) and have been used to run the matrix multiplications of neural networks (Shen et al.,
<i>Nature Photonics</i> 2017). Diffractive networks made of 3D-printed phase plates classify images in free space (Lin et al.,
<i>Science</i> 2018). In both the nonlinear activation is usually done electronically or by the detector, as in this simulator.</li>
<li><b>Optical bistability and memory.</b> Nonlinear media (Kerr, saturable absorption, carrier effects) in a resonator give
two stable transmission states for one input power (Gibbs, <i>Optical Bistability</i>, 1985). Photonic-crystal nanocavities
have been operated as all-optical RAM bits at very low power (Nozaki et al., <i>Nature Photonics</i> 2012), but holding times,
footprint and cascadability remain hard.</li>
<li><b>Transistors for light.</b> A single stored photon in a cold-atom ensemble has been used to switch a light beam with
gain (W. Chen et al., <i>Science</i> 2013): a proof of principle far from integrated circuits.</li>
<li><b>Waves as analog computers.</b> The scalar wave equation itself, with a trainable distribution of material and an
intensity-dependent nonlinearity, behaves like a recurrent neural network and can be trained to classify signals
(Hughes, Williamson, Minkov &amp; Fan, <i>Science Advances</i> 2019). Metamaterial blocks can compute derivatives and integrals of
an incoming field profile (Silva et al., <i>Science</i> 2014). Spin waves (magnonics) are explored for majority-gate logic.</li>
<li><b>Linear optics and quantum computing.</b> With single photons, interference plus measurement and feed-forward is enough
for universal quantum computing (Knill, Laflamme &amp; Milburn, <i>Nature</i> 2001): there the needed nonlinearity is supplied by the
measurement, the same role the detector plays here.</li>
</ul>
<p><b>Energy.</b> Erasing a bit costs at least k<sub>B</sub>T ln 2 ≈ 2.9 × 10<sup>−21</sup> J at room temperature (Landauer 1961);
logically reversible “conservative” logic, of which Fredkin and Toffoli's billiard-ball model (1982) is the classic mechanical
picture, avoids that bound in principle. Practical optical switches are still many orders of magnitude above it, and the
energy needed to detect light reliably (enough photons to beat shot noise) is one of Miller's arguments for using optics
mainly for communication and linear operations.</p>
<p class="aside">Limits of the model here: the engine is a 2D scalar wave without dispersion of the material, without loss in
the glass and without any intensity-dependent index, so all switching comes from the logic rule between the steps. Its timing
(hundreds of steps per gate) and the guide losses (roughly a third of the light lost over 400 cells, mostly near the emitter)
belong to this grid, not to real devices.</p>`,
    },
  ],
  tryIt: [
    { experiment: "wave-logic", label: "Computing with waves: logic gates" },
    { experiment: "wave-memory", label: "Wave transistors and memory" },
  ],
  sources: [
    "D. A. B. Miller, “Are optical transistors the logical next step?”, Nature Photonics 4, 3–5 (2010)",
    "H. M. Gibbs, Optical Bistability: Controlling Light with Light (Academic Press, 1985)",
    "Y. Shen et al., “Deep learning with coherent nanophotonic circuits”, Nature Photonics 11, 441–446 (2017)",
    "X. Lin et al., “All-optical machine learning using diffractive deep neural networks”, Science 361, 1004–1008 (2018)",
    "K. Nozaki et al., “Ultralow-power all-optical RAM based on nanocavities”, Nature Photonics 6, 248–252 (2012)",
    "W. Chen et al., “All-optical switch and transistor gated by one stored photon”, Science 341, 768–770 (2013)",
    "T. W. Hughes, I. A. D. Williamson, M. Minkov, S. Fan, “Wave physics as an analog recurrent neural network”, Science Advances 5, eaay6946 (2019)",
    "E. Knill, R. Laflamme, G. J. Milburn, “A scheme for efficient quantum computation with linear optics”, Nature 409, 46–52 (2001)",
    "R. Landauer, “Irreversibility and heat generation in the computing process”, IBM J. Res. Dev. 5, 183–191 (1961)",
    "E. Fredkin, T. Toffoli, “Conservative logic”, Int. J. Theor. Phys. 21, 219–253 (1982)",
    "C. Petzold, Code: The Hidden Language of Computer Hardware and Software (Microsoft Press, 1999) — gates, adders and latches from scratch",
  ],
};
