// Wave Dude 2D web - the list of guided experiments.
// GPL-3.0-or-later.

import type { Experiment } from "./types";
import { splash } from "./catalog/kids";
import { wavelengthExp, refraction, doubleSlit } from "./catalog/school";
import { phasedArray, dispersion } from "./catalog/advanced";
import { echoes, singleSlit, tir, edge } from "./catalog/more";
import { arago, michelson, bragg, thinFilm, comptonExp } from "./catalog/famous";
import { waveLogic, waveMemory } from "./catalog/computing";
import { doppler } from "./catalog/doppler";

export const EXPERIMENTS: Experiment[] = [
  splash, echoes,
  wavelengthExp, refraction, singleSlit, doubleSlit, tir, doppler, arago, thinFilm, waveLogic,
  phasedArray, michelson, bragg, comptonExp, waveMemory,
  dispersion, edge,
];

// links from each experiment to the library pages that explain it
const READ_MORE: Record<string, [string, string][]> = {
  "splash": [["waves-around-us/what-is-a-wave", "What is a wave?"], ["how-waves-behave/interference-and-superposition", "Interference and superposition"]],
  "echoes": [["how-waves-behave/reflection-and-echoes", "Reflection and echoes"], ["light-and-optics/mirrors", "Mirrors"], ["waves-at-work/echolocation-sonar", "Echolocation and sonar"]],
  "wavelength": [["waves-around-us/describing-a-wave", "Describing a wave"], ["maths-of-waves/sine-waves", "Sine waves, period and phase"]],
  "refraction": [["how-waves-behave/refraction", "Refraction: why waves bend"], ["light-and-optics/lenses-and-focusing", "Lenses and focusing"], ["maths-of-waves/reflection-refraction", "Deriving reflection and refraction"]],
  "single-slit": [["how-waves-behave/diffraction", "Diffraction"], ["maths-of-waves/interference-diffraction", "Interference and diffraction formulas"]],
  "double-slit": [["light-and-optics/is-light-a-wave", "Is light a wave?"], ["how-waves-behave/interference-and-superposition", "Interference and superposition"], ["maths-of-waves/interference-diffraction", "Interference and diffraction formulas"]],
  "total-internal-reflection": [["light-and-optics/total-internal-reflection-and-fibres", "Total internal reflection and optical fibres"], ["how-waves-behave/refraction", "Refraction: why waves bend"]],
  "phased-array": [["waves-at-work/radar-phased-arrays-5g", "Radar, phased arrays and 5G"], ["maths-of-waves/adding-waves", "Adding waves"]],
  "grid-dispersion": [["how-it-computes/numerical-dispersion", "Numerical dispersion and anisotropy"], ["how-it-computes/stability-cfl", "Stability and the CFL condition"]],
  "arago-spot": [["light-and-optics/is-light-a-wave", "Is light a wave?"], ["how-waves-behave/diffraction", "Diffraction"]],
  "thin-film": [["how-waves-behave/interference-and-superposition", "Interference and superposition"], ["light-and-optics/colour-dispersion-rainbows", "Colour, dispersion and rainbows"]],
  "michelson": [["maths-of-waves/adding-waves", "Adding waves"], ["how-waves-behave/interference-and-superposition", "Interference and superposition"]],
  "bragg": [["maths-of-waves/interference-diffraction", "Interference and diffraction formulas"], ["light-and-optics/resolution-diffraction-limit", "Resolution and the diffraction limit"]],
  "compton": [["light-and-optics/is-light-a-wave", "Is light a wave?"], ["waves-around-us/sound-and-light-spectrum", "Spectra of sound and light"]],
  "wave-memory": [["waves-at-work/computing-with-waves", "Computing with waves"], ["how-waves-behave/interference-and-superposition", "Interference and superposition"], ["light-and-optics/total-internal-reflection-and-fibres", "Total internal reflection and optical fibres"]],
  "wave-logic": [["waves-at-work/computing-with-waves", "Computing with waves"], ["how-waves-behave/interference-and-superposition", "Interference and superposition"], ["light-and-optics/total-internal-reflection-and-fibres", "Total internal reflection and optical fibres"]],
  "doppler": [["how-waves-behave/doppler-effect", "The Doppler effect"], ["waves-at-work/radar-phased-arrays-5g", "Radar, phased arrays and 5G"], ["light-and-optics/is-light-a-wave", "Is light a wave?"]],
  "absorbing-edge": [["how-it-computes/absorbing-boundaries", "Boundaries and absorbing layers"], ["how-waves-behave/absorption-and-damping", "Absorption and damping"]],
};
for (const e of EXPERIMENTS) e.readMore = (READ_MORE[e.id] ?? []).map(([page, label]) => ({ page, label }));
