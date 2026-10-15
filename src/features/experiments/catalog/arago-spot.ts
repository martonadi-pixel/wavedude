// Wave Dude 2D web - "Arago's spot" (school, 1818): light in the middle of a shadow.
// GPL-3.0-or-later.
//
// Measured in the engine with a clean, one-way plane wave (a laser beam far wider than the scene, whose housing
// absorbs anything coming back, so no cavity forms between the obstacle and the source). Along a screen behind the
// obstacle there are three regimes, set by the Fresnel number a^2 / (lambda L):
//  - close behind it (e.g. a = 35, L < 200) the light that bends round the edges has not met in the middle yet:
//    the brightest light in the shadow is near its edges, though the centre is already a small bright line;
//  - at medium distances (a = 35: 200-450, a = 40: 300-950, a = 55: 700+) the centre line is the brightest part
//    of the shadow, 2-3 times brighter than the dark bands next to it;
//  - far behind it the dark bands are gone and light fills the shadow, brightest in the middle.
// P2 therefore sits on the dark band next to the centre line, found from the light along the screen, instead of a
// fixed distance from it: halfway to the shadow's edge lands on a bright band at some distances.

import { Scene } from "../../../core/scene";
import { newSource } from "../../../core/sources";
import type { Sim } from "../../../sim/sim";
import type { Experiment, Values } from "../types";
import { box, lam, lamText, lineProbe, look, pointProbe } from "../helpers";

const W = 1500, H = 1000, CY = 500, OBST_X = 400, LEVEL = 60;
const RUN = 4500;

interface AragoScan {
  /** P2's distance below the centre line, in cells. */
  off: number;
  /** P2 sits on a dark band (else there is none any more and it sits halfway to the shadow's edge). */
  onBand: boolean;
  /** The brightest light in the shadow compared with the centre line. */
  edge: number;
  /** Close behind the obstacle: the light bending round the edges has not met in the middle yet. */
  close: boolean;
  /** The centre line compared with the light outside the shadow. */
  ofOpen: number;
}

/** What the screen shows now (P2's place and the regime), for the readout and the graph markers. */
let now: { half: number; off: number; scan: AragoScan | null } = { half: 40, off: 20, scan: null };

/** Reads the light along the screen and finds the dark band next to the centre line. */
function scanScreen(sim: Sim, p: Values): AragoScan {
  const x = OBST_X + p.dist, h = p.half, R = 200;
  const col = sim.engine.readIntensity(x, CY - R, 1, 2 * R + 1);
  // both halves of the screen averaged, then smoothed over 5 cells (the time average still ripples a little)
  const sym = Array.from({ length: R + 1 }, (_, k) => (col[R + k] + col[R - k]) / 2);
  const sm = sym.map((_, k) => {
    let s = 0, n = 0;
    for (let j = k - 2; j <= k + 2; j++) if (Math.abs(j) <= R) { s += sym[Math.abs(j)]; n++; }
    return s / n;
  });
  let band = 0;
  // the first dip that is clearly darker than the centre and that the light rises again from (towards the edge)
  for (let k = 3; k <= h && !band; k++)
    if (sm[k] <= sm[k - 1] && sm[k] <= sm[k + 1] && sm[k] < 0.8 * sm[0] && Math.max(...sm.slice(k, h + 25)) > 1.2 * sm[k]) band = k;
  const brightest = Math.max(...sm.slice(0, Math.max(1, h - 3)));
  let open = 0;
  for (let k = h + 60; k <= Math.min(R, h + 160); k++) open += sm[k] / (Math.min(R, h + 160) - h - 59);
  // measured: the centre line is the brightest part of the shadow once the Fresnel number a^2 / (lambda L) < ~0.42
  const edge = brightest / Math.max(1e-12, sm[0]), fresnel = (h * h) / (lam(LEVEL) * (p.dist - 2));
  return { off: band || Math.round(h / 2), onBand: band > 0, edge, close: edge > 1.25 && fresnel > 0.3, ofOpen: sm[0] / Math.max(1e-12, open) };
}

/** The screen: P1 on the centre line, P2 on the dark band next to it, and the line probe L1 along it. */
function placeProbes(sim: Sim, p: Values): void {
  const x = OBST_X + p.dist;
  const scan = sim.time >= RUN ? scanScreen(sim, p) : null;
  now = { half: p.half, off: scan ? scan.off : Math.round(p.half / 2), scan };
  sim.setProbes([pointProbe(x, CY, "intensity"), pointProbe(x, CY + now.off, "intensity"), lineProbe(x, CY - 200, x, CY + 200)]);
  sim.annotations.labels = sim.annotations.labels.filter(l => !l.text.startsWith("screen"));
  sim.annotations.labels.push({ x: x + 8, y: CY - 205, text: "screen", color: "#f472b6" });
}

/** Zooms onto the shadow from the obstacle to a little behind the screen, with the whole line probe. */
function zoom(sim: Sim, p: Values): void {
  if (sim.view.mode3d) return;
  sim.view.zoomTo(OBST_X - 60, CY - 215, OBST_X + Math.max(450, p.dist + 120), CY + 215);
}

/** Intensity now at the two probes (read straight from the simulation, so it works paused too). */
function readProbes(sim: Sim, p: Values): { p1: number; p2: number } | null {
  if (sim.time < RUN) return null;
  const x = OBST_X + p.dist;
  return { p1: sim.engine.readCell(x, CY)[1], p2: sim.engine.readCell(x, CY + now.off)[1] };
}

const times = (r: number) => (r >= 20 ? "more than 20×" : `${r.toFixed(1)}×`);

export const arago: Experiment = {
  id: "arago-spot",
  title: "Arago's spot: light in the middle of a shadow",
  level: "school",
  minutes: 12,
  summary: "In 1818 a prediction meant to ridicule the wave theory of light — a bright spot in the middle of a shadow — turned out to be true.",
  goals: ["Shadows of small objects are not completely dark", "Waves bending round both edges meet in step in the middle", "How one experiment convinced scientists that light is a wave"],
  readMore: [
    { page: "light-and-optics/is-light-a-wave", label: "Is light a wave?" },
    { page: "how-waves-behave/diffraction", label: "Diffraction" },
  ],
  graph: "auto",
  profileMarkers: () => [
    { x: 200 - now.half, color: "#ffffff66", label: "shadow" },
    { x: 200 + now.half, color: "#ffffff66" },
    { x: 200, color: "#ffd84a", label: "P1" },
    { x: 200 + now.off, color: "#4ade80", label: "P2" },
  ],
  // dark purple bands and an orange centre line: the clearest scheme for the faint structure in the shadow
  colors: { intensity: "inferno.json" },
  params: [
    { id: "half", label: "Half-width of the obstacle", min: 25, max: 60, step: 5, value: 40, unit: " cells", help: `${lamText(LEVEL)}. Each change restarts the run.` },
    { id: "dist", label: "Screen distance behind the obstacle", min: 100, max: 950, step: 10, value: 330, unit: " cells", help: "Move the screen (the graph shows the light along it).",
      live: (sim, p) => {
        placeProbes(sim, p);
        // follow the screen when it leaves the picture
        const x = OBST_X + p.dist, v = sim.view;
        if (x > v.toCell(v.cssW, 0).x - 30 || x < v.toCell(0, 0).x + 30) zoom(sim, p);
      } },
  ],
  setup(sim, p) {
    const s = new Scene(W, H).add(box(OBST_X, CY - p.half, 4, 2 * p.half, "wall", { name: "Obstacle" }));
    // a very wide laser beam: a clean plane wave that only goes one way
    sim.load(s, [newSource({ name: "Light", kind: "laser", x: 150, y: CY, level: LEVEL, beamWidth: 2500 })]);
    sim.annotations.labels.push({ x: OBST_X + 10, y: CY - p.half - 10, text: "obstacle" });
    sim.annotations.arrows.push(
      { x0: OBST_X + 4, y0: CY - p.half, x1: W - 120, y1: CY - p.half, color: "#ffffff66", dashed: true },
      { x0: OBST_X + 4, y0: CY + p.half, x1: W - 120, y1: CY + p.half, color: "#ffffff66", dashed: true },
    );
    placeProbes(sim, p);
    // the shadow and what is in it fill the screen (zoom out to see the whole scene); again once the graphs under
    // the picture have appeared and the view has its final size
    zoom(sim, p);
    setTimeout(() => zoom(sim, p), 300);
    look(sim, {
      view: "intensity", intensity: 3, field: 2, prepare: 24, runTo: RUN,
      then: () => {
        // the light on the centre line at full colour: the line shows bright, the dark bands next to it stay dark
        // (the light outside the shadow simply saturates)
        const centre = sim.engine.readCell(OBST_X + p.dist, CY)[1];
        if (centre > 0) sim.fadeBrightness("intensity", 0.95 / Math.sqrt(centre));
        // P2 onto the dark band, now that the light along the screen has settled
        placeProbes(sim, p);
        // keep running so the probe graphs stay live when the screen is moved
        sim.running = true;
        zoom(sim, p);
      },
    });
  },
  steps: [
    {
      title: "A shadow",
      html: `<p>A straight wave hits a small obstacle. The dashed lines mark its <b>geometric shadow</b>: where a beam of tiny particles flying in straight lines could not reach.</p>
             <p>In 1818 the French Academy held a prize contest on the nature of light. Augustin Fresnel entered a wave theory. One of the judges, Siméon Denis Poisson, worked out what Fresnel's equations predicted behind a small round obstacle, and found something he thought was absurd.</p>`,
      predict: {
        question: "What is in the very middle of the shadow?",
        options: ["Complete darkness", "A bright spot", "A blurry grey, evenly dim"],
        answer: 1,
        explain: "A bright spot! The waves that bend round the edges all travel the same distance to the centre line, so they arrive in step and add up. Poisson thought this proved Fresnel wrong — then François Arago did the experiment and saw the spot.",
      },
    },
    {
      title: "Find the bright line",
      html: `<p>Look along the middle of the shadow, between the dashed lines: a <b>bright line runs down its centre</b>, with darker bands on either side.</p>
             <p>Two probes sit on the screen: <b class="p-1">P1</b> exactly on the centre line, <b class="p-2">P2</b> a little closer to the shadow's edge. The graphs show what they measure over time, and the light all along the screen (L1, with P1, P2 and the shadow's edges marked).</p>
             <p>The picture is zoomed onto the shadow; press <b>Fit</b> to see the whole set-up.</p>
             <p>Move the screen with the <b>Screen distance</b> slider; P2 moves along, staying beside the centre line. <b>Close</b> behind the obstacle the light bending round the edges has not met in the middle yet, so the shadow is brightest near its edges. At <b>medium</b> distances the bright centre line stands out most. <b>Far</b> away the dark bands fade and light fills the shadow.</p>`,
      predict: {
        question: "P1 is in the very middle of the shadow, P2 is a little closer to the shadow's edge. Which one measures more light?",
        options: ["P2 — it is nearer the light", "P1 — the middle", "Both the same: it is all shadow"],
        answer: 1,
        explain: "P1, in the middle! P2 is closer to the lit area, yet it sits on a dark band where the waves from the two edges arrive out of step. On the centre line they always arrive in step.",
      },
      readout: (sim, p) => {
        const q = readProbes(sim, p), s = now.scan;
        if (!q || !s) return "Waiting for the light to fill the picture…";
        const ratio = q.p1 / Math.max(1e-12, q.p2);
        let txt = `<span class="p-1">P1</span> (centre): <b>${q.p1.toExponential(2)}</b> · ` +
          `<span class="p-2">P2</span> (${s.onBand ? "dark band" : "halfway to the edge"}): <b>${q.p2.toExponential(2)}</b><br>`;
        if (s.close)
          txt += `<b>Close behind the obstacle:</b> ${s.onBand ? `the centre is already ${times(ratio)} brighter than the dark band beside it, but ` : ""}` +
            `the brightest light in the shadow is near its edges (${s.edge.toFixed(1)}× the centre). The waves bending round the two edges have not met in the middle yet — move the screen further back.`;
        else if (s.onBand)
          txt += `The centre gets <b>${times(ratio)}</b> as much light as P2 on the dark band beside it: a bright line in the middle of the shadow, ${Math.round(100 * s.ofOpen)}% as bright as the light outside it.`;
        else if (ratio >= 1.2)
          txt += `<b>Further back</b> the dark bands fade as light fills the shadow, but the centre still gets <b>${times(ratio)}</b> as much light as P2 — ${Math.round(100 * s.ofOpen)}% as bright as the light outside.`;
        else
          txt += `<b>Further back</b> light fills the shadow and the centre line no longer stands out (${times(ratio)} P2). Move the screen closer to find it again.`;
        return txt;
      },
    },
    {
      title: "A spot in 3D, a line in 2D",
      html: `<p>Arago used a small metal disc. Every point of its round edge is the same distance from the axis behind it, so <i>all</i> the bent waves meet there in step: a bright spot about as bright as if the disc were not there at all.</p>
             <p>This simulator is 2D, so the “disc” is a strip with only <b>two</b> edges. Their waves still meet in step on the centre line — the bright line you see — but with only two edges adding up it is fainter than Arago's spot, and clearest at medium distances.</p>
             <p>Change the obstacle's width: the bright centre line is always there, it just appears further away for wider obstacles. Fresnel won the prize, and the wave theory of light was accepted.</p>`,
    },
  ],
};
