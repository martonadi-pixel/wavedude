// Wave Dude 2D web - "Echoes and mirrors" (kids): a clap and its echo from a wall, then a dish-shaped mirror that
// collects straight waves in its focus.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import { newOptic } from "../../../core/optics";
import type { Sim } from "../../../sim/sim";
import type { Experiment } from "../types";
import { box, lineSource, look, pointProbe, pointSource } from "../helpers";

const EW = 1000, EH = 600;
let echoScene: "wall" | "dish" | "" = "";

function wallScene(sim: Sim): void {
  const s = new Scene(EW, EH).add(box(720, 120, 10, 360, "wall", { name: "Wall" }));
  sim.load(s, [pointSource(260, 300, 55, { name: "Clap", mode: "pulsed", shape: "gaussian", onCycles: 3, offCycles: 100000 })], [pointProbe(300, 300)]);
  sim.annotations.labels.push({ x: 740, y: 110, text: "wall" }, { x: 310, y: 290, text: "ear 👂", color: "#ffd84a" });
  // measured: the clap peaks at |u| 0.016 near the source, the ring is ~0.005 half-way to the wall and the echo ~0.002;
  // at the default 30% this shows the ring at ~0.6 of full colour and the echo at ~0.25 (the first moment saturates)
  look(sim, { view: "field", field: 800 });
  echoScene = "wall";
}

const DISH_X = 880, FOCUS = 160;
function dishScene(sim: Sim): void {
  const s = new Scene(EW, EH), c = EH / 2;
  // a parabolic mirror opening to the left: x = DISH_X - (y - c)^2 / (4 f), focus at (DISH_X - f, c)
  const dish = newOptic("parabolic", { name: "Dish", x: DISH_X, y: c, size: 460, radius: FOCUS, thickness: 8 });
  sim.load(s, [lineSource(150, 70, 150, EH - 70, 55, { name: "Waves" })], [], [dish]);
  sim.annotations.labels.push({ x: DISH_X - FOCUS, y: c, mark: "★", text: "focus", color: "#ffd84a" });
  look(sim, { view: "field", field: 6, intensity: 9 });
  echoScene = "dish";
}

export const echoes: Experiment = {
  id: "echoes",
  title: "Echoes and mirrors",
  level: "kids",
  minutes: 10,
  summary: "Clap and hear the echo, then catch waves with a dish-shaped mirror like a satellite dish.",
  goals: ["Waves bounce off walls: that is an echo", "The time until the echo tells how far away the wall is", "A curved mirror collects waves in one spot"],
  readMore: [
    { page: "how-waves-behave/reflection-and-echoes", label: "Reflection and echoes" },
    { page: "light-and-optics/mirrors", label: "Mirrors" },
    { page: "waves-at-work/echolocation-sonar", label: "Echolocation and sonar" },
  ],
  graph: "points",
  setup(sim) { wallScene(sim); },
  steps: [
    {
      title: "Clap!",
      html: `<p>The coloured ring is a <b>clap</b>: one short splash of waves. Next to it is an <b>ear</b> that listens (the yellow cross).</p>
             <p>Press <b>▶ Run</b> and watch the ring travel towards the wall.</p>`,
      enter(sim) { if (echoScene !== "wall") wallScene(sim); sim.reset(); },
      predict: {
        question: "What happens when the ring reaches the wall?",
        options: ["It goes through the wall", "It bounces back", "It stops and disappears"],
        answer: 1,
        explain: "It bounces back! A wave that hits a hard wall turns around. When that happens to sound, you hear an echo.",
      },
    },
    {
      title: "Hear the echo",
      html: `<p>The graph under the picture shows what the ear hears. The first wiggle is the clap itself. The second, smaller wiggle is the <b>echo</b> coming back from the wall.</p>
             <p>Bats and dolphins send out clicks and listen for echoes. The longer they wait, the further away the wall (or the tasty insect) is. Ships do the same with sonar.</p>`,
      enter(sim) { if (echoScene !== "wall") wallScene(sim); sim.reset(); sim.runUntil(2300); },
    },
    {
      title: "A curved mirror",
      html: `<p>Now straight waves come from the left and hit a <b>curved mirror</b>, shaped like a satellite dish.</p>`,
      enter(sim) { if (echoScene !== "dish") dishScene(sim); sim.runUntil(2400); },
      predict: {
        question: "After bouncing off the curved mirror, the waves…",
        options: ["Spread out in all directions", "All meet in one spot", "Disappear"],
        answer: 1,
        explain: "They all meet in one spot, the focus. Every part of the dish sends its wave to the same place.",
      },
    },
    {
      title: "Find the focus",
      html: `<p>We switched to the <b>Intensity</b> picture. The brightest spot in front of the mirror is the <b>focus</b> (★).</p>
             <p>Satellite dishes put their receiver right there, and big telescopes use curved mirrors to collect faint starlight.</p>`,
      enter(sim) { if (echoScene !== "dish") dishScene(sim); sim.viewMode = "intensity"; sim.running = true; },
    },
  ],
};
