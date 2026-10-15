// Wave Dude 2D web - experiments for kids.
// GPL-3.0-or-later.

import { Scene } from "../../../core/scene";
import type { Experiment } from "../types";
import { pointSource } from "../helpers";
import { omegaOfLevel } from "../../../core/physics";
import type { Sim } from "../../../sim/sim";

export const splash: Experiment = {
  id: "splash",
  title: "Splash! Making waves",
  level: "kids",
  minutes: 10,
  summary: "Tap the water, watch the ripples, and find the calm lanes where two sets of waves cancel out.",
  goals: ["Waves spread out in circles", "Faster tapping makes waves closer together", "Two waves can add up — or cancel each other"],
  params: [
    {
      id: "speed", label: "How fast the finger taps", min: 5, max: 110, step: 1, value: 30,
      help: "This is the frequency of the source: how often it bobs up and down. The Speed slider at the bottom makes everything go in slow motion.",
      live: (sim, p) => { for (const s of sim.sources) s.level = p.speed; sim.refreshSources(); },
    },
  ],
  setup(sim, p) {
    const scene = new Scene(900, 560);
    sim.load(scene, [pointSource(260, 280, p.speed, { name: "Finger" })]);
    sim.viewMode = "field";
    sim.brightness.field = 160;
    sim.brightness.intensity = 160;
    // slow enough to follow every ring with your eyes
    sim.stepsPerFrame = 1;
  },
  steps: [
    {
      title: "Drop a pebble",
      html: `<p>Imagine a pond. The coloured ring is a <b>finger tapping the water</b> up and down, again and again.</p>
             <p>Red means the water is pushed <b>up</b>, blue means it dips <b>down</b>, black means flat water.</p>
             <p>Press <b>▶ Run</b> at the bottom and watch!</p>`,
      readout: taps,
      predict: {
        question: "What shape will the waves make?",
        options: ["Squares", "Circles", "Triangles"],
        answer: 1,
        explain: "Circles! The wave travels equally fast in every direction, so after a while it has gone the same distance everywhere — that is a circle.",
      },
    },
    {
      title: "Tap faster",
      html: `<p>Move the slider <b>“How fast the finger taps”</b> (under the steps) to the right.</p>
             <p>Look at the gaps between the red rings.</p>
             <p>Too fast to see? Drag the <b>Speed</b> slider at the bottom to the left for slow motion.</p>`,
      readout: taps,
      predict: {
        question: "If the finger taps faster, the rings get…",
        options: ["Closer together", "Further apart", "They stop"],
        answer: 0,
        explain: "Closer together! The waves still travel at the same speed, but a new ring starts sooner, so the rings are packed tighter. The distance between two rings is called the wavelength.",
      },
    },
    {
      title: "Two pebbles",
      html: `<p>Now there are <b>two fingers</b> tapping at the same time. Their waves run into each other.</p>
             <p>Look to the right of the fingers. Do you see lines where the water stays almost flat?</p>`,
      enter(sim, p) {
        if (sim.sources.length < 2) {
          sim.sources = [pointSource(260, 230, p.speed, { name: "Finger 1" }), pointSource(260, 330, p.speed, { name: "Finger 2" })];
          sim.refreshSources();
        }
        sim.running = true;
      },
      predict: {
        question: "When a ‘hill’ of one wave meets a ‘valley’ of the other wave, what happens?",
        options: ["They make a bigger hill", "They cancel out and the water is flat", "They bounce off each other"],
        answer: 1,
        explain: "They cancel! Up + down = flat. Where hill meets hill they add up to an extra big wave. Scientists call this interference.",
      },
    },
    {
      title: "Find the calm lanes",
      html: `<p>We switched to the <b>Intensity</b> picture. It shows where the water moves <b>a lot</b> (bright) and where it stays <b>calm</b> (dark), averaged over time.</p>
             <p>The dark stripes are the calm lanes. A boat there would hardly rock!</p>
             <p>Try the tap-speed slider again: what happens to the number of calm lanes?</p>`,
      enter(sim) { sim.viewMode = "intensity"; sim.running = true; },
    },
    {
      title: "Build a wall",
      html: `<p>Pick the <b>Wall</b> tool in the toolbar and draw a wall in front of the fingers. Use <b>Erase</b> to remove it again.</p>
             <p>Look behind the wall. Is it completely calm, or do waves sneak around the corner?</p>
             <p>Waves bending around edges is called <b>diffraction</b> — it is why you can hear someone talking around a corner.</p>`,
      tools: ["barrier", "erase"],
      enter(sim) { sim.viewMode = "field"; sim.brushes.barrier = 4; sim.running = true; },
    },
  ],
};

/** "The finger taps about N times per second", from the source's frequency and how fast the simulation runs now. */
function taps(sim: Sim, p: Record<string, number>): string {
  if (!sim.running) return "⏸ Paused — press ▶ Run.";
  const perStep = omegaOfLevel(p.speed, sim.engine.settings.frequencyScale) / (2 * Math.PI);
  const n = perStep * sim.stats.stepsPerSec;
  if (n >= 1.5) return `👆 The finger taps about <b>${Math.round(n)} times</b> per second.`;
  if (n >= 0.75) return "👆 The finger taps about <b>once</b> per second.";
  if (n <= 0) return "👆 Waiting for the first tap…";
  return `👆 The finger taps about <b>once every ${Math.round(1 / n)} seconds</b>.`;
}
