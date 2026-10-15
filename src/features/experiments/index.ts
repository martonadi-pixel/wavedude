// Wave Dude 2D web - the list of guided experiments, in the order the page shows them (by level, then this order).
// Each experiment is one file in catalog/, named after its id.
// GPL-3.0-or-later.

import type { Experiment } from "./types";
import { splash } from "./catalog/splash";
import { echoes } from "./catalog/echoes";
import { wavelengthExp } from "./catalog/wavelength";
import { refraction } from "./catalog/refraction";
import { prism } from "./catalog/prism";
import { singleSlit } from "./catalog/single-slit";
import { doubleSlit } from "./catalog/double-slit";
import { tir } from "./catalog/total-internal-reflection";
import { doppler } from "./catalog/doppler";
import { arago } from "./catalog/arago-spot";
import { thinFilm } from "./catalog/thin-film";
import { waveLogic } from "./catalog/wave-logic";
import { phasedArray } from "./catalog/phased-array";
import { michelson } from "./catalog/michelson";
import { bragg } from "./catalog/bragg";
import { comptonExp } from "./catalog/compton";
import { waveMemory } from "./catalog/wave-memory";
import { dispersion } from "./catalog/grid-dispersion";
import { edge } from "./catalog/absorbing-edge";

export const EXPERIMENTS: Experiment[] = [
  splash, echoes,
  wavelengthExp, refraction, prism, singleSlit, doubleSlit, tir, doppler, arago, thinFilm, waveLogic,
  phasedArray, michelson, bragg, comptonExp, waveMemory,
  dispersion, edge,
];
