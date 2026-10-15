// Wave Dude 2D web - "Why a prism makes a rainbow" (school): dispersion. White light is eight colours at once here, and
// the glass slows each by its own index (crown glass, exaggerated × the slider so the fan fits a picture 25 µm wide).
// GPL-3.0-or-later.
//
// Measured in the engine (tests/e2e/whitelight.mjs, the same prism and beam): at ×10 every colour leaves within 1° of
// Snell's law with its own index, violet bending most; without dispersion all eight leave together (within 0.6°, the
// grid's own slight dispersion).

import { Scene } from "../../../core/scene";
import { newSource } from "../../../core/sources";
import { newOptic } from "../../../core/optics";
import { NM_PER_CELL, SPECTRAL_NM, dispersionFactor, wavelengthCss } from "../../../core/spectrum";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { f1, look } from "../helpers";

const W = 1000, H = 640, CX = 360, CY = 260, HALF = 130, N = 1.5, LEVEL = 40;
/** The beam meets the first face at minimum deviation for crown glass at 589 nm: 49.3° from its normal. */
const INCIDENCE = 49.3, AIM = INCIDENCE - 30;
const FACE_IN = { x: CX - HALF * Math.tan(Math.PI / 6), y: CY }, FACE_OUT = { x: CX + HALF * Math.tan(Math.PI / 6), y: CY };
const VIOLET = "#a78bfa", RED = "#f87171";
/** The second prism, upside down, for Newton's two-prism experiment. */
let second = false;

/** The index of the glass for a colour, with the slider's dispersion. */
const indexOf = (nm: number, p: Values) => 1 + (N - 1) * dispersionFactor(nm, p.disp);

/** The direction a colour leaves the prism (degrees below the horizontal), by Snell's law at both faces. */
function exitAngle(nm: number, p: Values): number {
  const n = indexOf(nm, p), r1 = Math.asin(Math.sin((INCIDENCE * Math.PI) / 180) / n);
  return -30 + (Math.asin(Math.min(1, n * Math.sin(Math.PI / 3 - r1))) * 180) / Math.PI;
}

function setupScene(sim: Sim): void {
  const s = new Scene(W, H);
  const a = (-AIM * Math.PI) / 180;
  const light = newSource({ kind: "laser", name: "White light", x: Math.round(FACE_IN.x - 190 * Math.cos(a)), y: Math.round(FACE_IN.y - 190 * Math.sin(a)),
    angleDeg: -AIM, beamWidth: 50, level: LEVEL });
  const optics = [newOptic("prism", { name: "Prism", x: CX, y: CY, size: 2 * HALF, radius: 60, n: N })];
  // upside down and against the first: together a slab with parallel faces. (With a gap between them, the thin layer
  // of air would itself colour the light, like a soap film.)
  if (second) optics.push(newOptic("prism", { name: "Second prism", x: CX + 2 * HALF * Math.tan(Math.PI / 6), y: CY, size: 2 * HALF, radius: 60, n: N, angleDeg: 180 }));
  sim.load(s, [light], [], optics);
  sim.annotations.labels.push({ x: light.x - 40, y: light.y + 24, text: "white light", color: "#ffffff" }, { x: CX - 22, y: CY + HALF + 22, text: "glass prism", color: "#9fe3ff" });
  look(sim, { view: "intensity", intensity: 6, field: 4 });
}

/** Dashed lines from where the beam leaves the prism: where Snell's law sends violet and red with their own index. */
function snellLines(sim: Sim, p: Values, on: boolean): void {
  const a = sim.annotations;
  a.arrows = a.arrows.filter(r => r.color !== VIOLET && r.color !== RED);
  a.labels = a.labels.filter(l => l.color !== VIOLET && l.color !== RED);
  if (!on || second) return;
  for (const [nm, color] of [[410, VIOLET], [690, RED]] as const) {
    const t = (exitAngle(nm, p) * Math.PI) / 180, L = 470;
    a.arrows.push({ x0: FACE_OUT.x, y0: FACE_OUT.y, x1: FACE_OUT.x + L * Math.cos(t), y1: FACE_OUT.y + L * Math.sin(t), color, dashed: true });
    a.labels.push({ x: FACE_OUT.x + L * Math.cos(t) + 6, y: FACE_OUT.y + L * Math.sin(t) + 4, text: nm === 410 ? "violet" : "red", color });
  }
}

/** The colours, their index in this glass and where they go. */
function table(p: Values): string {
  const rows = SPECTRAL_NM.map(nm => `<tr><td><span class="swatch" style="--c:${wavelengthCss(nm)}"></span> ${nm} nm</td>` +
    `<td>${(nm / NM_PER_CELL).toFixed(1)} cells</td><td>n = ${indexOf(nm, p).toFixed(3)}</td><td>${f1(exitAngle(nm, p))}°</td></tr>`).join("");
  return `<table class="ro-table"><tr><th>colour</th><th>wavelength</th><th>glass</th><th>bent down by</th></tr>${rows}</table>`;
}

export const prism: Experiment = {
  id: "prism",
  title: "Why a prism makes a rainbow",
  level: "school",
  minutes: 15,
  summary: "White light goes into a glass prism and a rainbow comes out. The colours were in the light all along: glass just bends each one by a different amount.",
  goals: ["White light is a mix of all colours (wavelengths)", "Glass slows violet light more than red: its refractive index depends on the colour (dispersion)", "So each colour bends by its own angle and they fan out"],
  readMore: [
    { page: "light-and-optics/colour-dispersion-rainbows", label: "Colour, dispersion and rainbows" },
    { page: "light-and-optics/is-light-a-wave", label: "Is light a wave?" },
  ],
  params: [{ id: "disp", label: "Dispersion of the glass", min: 1, max: 20, step: 1, value: 10, format: v => (v === 1 ? "real glass" : `${v} × real glass`),
    help: "How much more the glass slows violet than red, compared with ordinary (crown) glass. Real glass spreads the colours only slightly; this picture is 25 µm wide, so it is exaggerated to make the fan visible.",
    live: (sim, p) => { if (sim.whiteLight) { sim.setWhiteLight(true, p.disp); snellLines(sim, p, true); } } }],
  open() { second = false; },
  setup(sim) { setupScene(sim); },
  steps: [
    {
      title: "One colour",
      html: `<p>A beam of light of <b>one colour</b> (one wavelength, about 560 nm, yellow-green) goes through a glass <b>prism</b>, a wedge of glass. Press ▶ Run.</p>
             <p>The beam bends twice: once going into the glass, and again coming out. Both times it bends towards the thick end of the wedge, as you saw in the refraction experiment.</p>`,
      enter: (sim, p) => { if (second) { second = false; setupScene(sim); } snellLines(sim, p, false); },
      predict: {
        question: "White light is a mix of all colours. Through the prism, white light will…",
        options: ["Stay white and bend like this beam", "Split into the colours of the rainbow", "Get darker"],
        answer: 1,
        explain: "It splits into a rainbow. Isaac Newton did this in 1666 with sunlight through a hole in his shutter. The next step shows why.",
      },
    },
    {
      title: "White light",
      whiteLight: p => p.disp,
      enter: (sim, p) => { if (second) { second = false; setupScene(sim); } snellLines(sim, p, true); },
      html: `<p>Now the beam is <b>white light</b>: eight colours at once, from violet (410 nm) to deep red (690 nm), and the picture shows their real mix. Press ▶ Run.</p>
             <p>Out of the prism comes a <b>fan of colours</b>: red bends least, violet most. Where they still overlap the light stays white.</p>
             <p><b>Why?</b> Glass slows every colour down, but violet light (short waves) a little more than red light (long waves): the glass's refractive index <b>n</b> depends on the colour. Snell's law bends a wave more when n is bigger, so each colour turns by its own angle. This is called <b>dispersion</b>.</p>
             <p>The dashed lines show where Snell's law sends violet and red, each with its own n. The simulated colours follow them.</p>`,
      readout: (_sim, p) => table(p),
    },
    {
      title: "Real glass",
      whiteLight: p => p.disp,
      enter: (sim, p) => { if (second) { second = false; setupScene(sim); } snellLines(sim, p, true); },
      html: `<p>Move the <b>dispersion</b> slider down to <b>real glass</b>. The fan gets much narrower: in ordinary glass violet travels only about 1% slower than red, and the colours leave the prism less than 2° apart.</p>
             <p>That is plenty in real life: 2 m behind a prism, 2° is 7 cm, a nice rainbow on the wall. But this picture is only 25 thousandths of a millimetre wide, so here the colours hardly have room to part. That is why the slider exaggerates the glass's dispersion.</p>
             <p class="aside">On a grid of cells short waves travel a little slower than long ones even in empty space (see the grid-dispersion experiment). With real glass this adds about half a degree to the fan.</p>`,
      readout: (_sim, p) => table(p),
    },
    {
      title: "Newton's two prisms",
      whiteLight: p => p.disp,
      enter: (sim, p) => snellLines(sim, p, !second),
      html: `<p>Did the prism <i>make</i> the colours, or were they in the white light all along? Newton's answer: put a second prism, upside down, against the first. If the colours were in the light, the second prism should bend each one back and mix them into <b>white</b> again.</p>
             <p>Press the button below, then ▶ Run.</p>
             <p>The colours come out together again, as white light, travelling in the same direction as the light that went in. So white light really is a mix of colours, and the prism only sorts them. Newton also sent a single colour through a second prism: it bent, but stayed the same colour, as in the first step.</p>`,
      actions: [{
        label: () => (second ? "Take the second prism away" : "Add a second prism, upside down"),
        on: () => second,
        run: (sim, p) => { second = !second; setupScene(sim); snellLines(sim, p, !second); sim.play(); },
      }],
    },
    {
      title: "Rainbows and spectra",
      whiteLight: p => p.disp,
      enter: (sim, p) => { if (second) { second = false; setupScene(sim); } snellLines(sim, p, true); },
      html: `<p>A <b>rainbow</b> is the same thing with raindrops: sunlight bends going into a drop, reflects off its back and bends again coming out, and each colour comes out at its own angle — red at about 42° from the direction away from the Sun, violet at about 40°. Every drop sends you one colour, depending on where it is in the sky.</p>
             <p>Spreading light into its colours, a <b>spectrum</b>, is one of science's most useful tricks. Astronomers spread starlight with prisms and gratings and find dark lines where atoms of hydrogen, helium or iron have taken out their own colours: that is how we know what the Sun and the stars are made of, without going there.</p>`,
      readout: (_sim, p) => table(p),
    },
  ],
};
