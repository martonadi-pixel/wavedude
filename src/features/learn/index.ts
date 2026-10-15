// Wave Dude 2D web - the "How it works" library, in reading order.
// GPL-3.0-or-later.

import type { LearnCategory } from "./types";
import { category as wavesAroundUs } from "./content/waves-around-us";
import { category as howWavesBehave } from "./content/how-waves-behave";
import { category as lightAndOptics } from "./content/light-and-optics";
import { category as wavesAtWork } from "./content/waves-at-work";
import { category as mathsOfWaves } from "./content/maths-of-waves";
import { category as howItComputes } from "./content/how-it-computes";
import { category as insideTheCode } from "./content/inside-the-code";

export const CATEGORIES: LearnCategory[] = [
  wavesAroundUs, howWavesBehave, lightAndOptics, wavesAtWork, mathsOfWaves, howItComputes, insideTheCode,
];
