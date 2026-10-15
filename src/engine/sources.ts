// Wave Dude 2D web - object sources (SourceSettings.vb / SourceElement).
// GPL-3.0-or-later.

import { omegaOfLevel, wavelength } from "./physics";

export type SourceMode = "continuous" | "pulsed";
export type PulseShape = "gaussian" | "square";

/** One driven cell, as the engine sees it (SourceElement). */
export interface SourceElement {
  x: number;
  y: number;
  /** Frequency level 1..255 (the green value of a scene image). */
  level: number;
  /** 1 = the amplitude of an image source. */
  amplitude: number;
  phase: number; // radians
  mode: SourceMode;
  shape: PulseShape;
  /** Pulsed: on and off spans in cycles of the source's own frequency. */
  onCycles: number;
  offCycles: number;
  /** Step at which the source fades out over DETACH_RAMP_STEPS steps and lets go of the field; -1 = never. */
  detachStep: number;
  /**
   * Windows app: off-width to redraw from at run time and by how much (+/-). Kept so projects save unchanged; this
   * version does not re-randomize during a run (every cycle uses offCycles).
   */
  offWidthBase?: number;
  randomizeOffWidthAmount?: number;
  /**
   * > 0: a soft source that adds gain x its value to the field (a moving source: it must not hold the cells it passes
   * over); 0 or missing: the source pulls its cell towards its value (u = 0.9 u + 0.1 v), as in the Windows app.
   */
  soft?: number;
}

/**
 * How a point source moves (the Doppler effect): along a straight line or round a circle. The speed is given as a
 * multiple of the wave speed in empty space (the Mach number), so 1 = as fast as its own waves.
 */
export interface SourceMotion {
  kind: "line" | "circle";
  mach: number;
  /** line: direction of travel (degrees, 0 = right, 90 = down); circle: where on the circle it starts. */
  angleDeg: number;
  /** line: how far it travels before it stops (cells; 0 = until it nears the edge of the scene). */
  distance: number;
  /** circle: radius in cells; the circle is centred on the source's position. */
  radius: number;
  clockwise: boolean;
}

export const newMotion = (over: Partial<SourceMotion> = {}): SourceMotion =>
  ({ kind: "line", mach: 0.5, angleDeg: 0, distance: 0, radius: 80, clockwise: false, ...over });

/** Gain of a soft (moving) source: measured so its waves are as strong as those of a still point source (0.2 gave 2.15x
 * their amplitude at levels 30, 60 and 120 alike). */
export const SOFT_GAIN = 0.093;

/**
 * Where a moving source is at step t. c = wave speed in cells per step; the line stops `margin` cells from the
 * scene's edge (or after `distance` cells).
 */
export function motionPosition(s: SourceSpec, t: number, c: number, width: number, height: number, margin = 70): { x: number; y: number } {
  const m = s.motion;
  if (!m) return { x: s.x, y: s.y };
  const v = m.mach * c, a = (m.angleDeg * Math.PI) / 180;
  if (m.kind === "circle") {
    const r = Math.max(1, m.radius), th = a + ((m.clockwise ? 1 : -1) * v * t) / r;
    return { x: s.x + r * Math.cos(th), y: s.y + r * Math.sin(th) };
  }
  const dx = Math.cos(a), dy = Math.sin(a);
  // how far it can go before the edge (or its set distance)
  const room = (p: number, d: number, size: number) => (d > 1e-9 ? (size - 1 - margin - p) / d : d < -1e-9 ? (p - margin) / -d : Infinity);
  let far = Math.max(0, Math.min(room(s.x, dx, width), room(s.y, dy, height)));
  if (m.distance > 0) far = Math.min(far, m.distance);
  const d = Math.min(v * t, far);
  return { x: s.x + dx * d, y: s.y + dy * d };
}

/** The cells a moving point source drives at step t: its value spread over the four cells around it (bilinear). */
export function movingElements(s: SourceSpec, t: number, c: number, width: number, height: number): SourceElement[] {
  if (!s.enabled || !s.hasPosition || !s.motion) return [];
  const p = motionPosition(s, t, c, width, height);
  const x0 = Math.floor(p.x), y0 = Math.floor(p.y), fx = p.x - x0, fy = p.y - y0;
  const base = {
    level: Math.min(255, Math.max(1, Math.round(s.level))), phase: (s.phaseDeg * Math.PI) / 180, mode: s.mode, shape: s.shape,
    onCycles: Math.max(1, Math.round(s.onCycles)), offCycles: Math.max(0, Math.round(s.offCycles)), detachStep: -1, soft: SOFT_GAIN,
  };
  const A = s.amplitudePct / 100;
  return ([[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]] as const)
    .filter(([, , w]) => w > 1e-4)
    .map(([ox, oy, w]) => ({ ...base, x: x0 + ox, y: y0 + oy, amplitude: A * w }));
}

export const DETACH_RAMP_STEPS = 30;

/**
 * A source as the user edits it (SourceSettings): a single point, a rectangular array centred on (x, y), or a line of
 * sources from (x, y) to (x2, y2). phaseStepXDeg/phaseStepYDeg add a phase gradient across an array or along a line
 * (not in the Windows version; it is what steers a phased array).
 */
export interface SourceSpec {
  id: number;
  name: string;
  kind: "point" | "array" | "line" | "laser";
  x: number;
  y: number;
  x2: number;
  y2: number;
  level: number;
  amplitudePct: number;
  phaseDeg: number;
  mode: SourceMode;
  shape: PulseShape;
  onCycles: number;
  offCycles: number;
  detach: boolean;
  detachAfterSteps: number;
  enabled: boolean;
  countX: number;
  countY: number;
  spacingX: number;
  spacingY: number;
  phaseStepXDeg: number;
  phaseStepYDeg: number;
  /** Line sources: one element every this many cells. */
  lineSpacing: number;
  /** Composite "inherit + randomize" (SourceSettings): each element gets random offsets within +/- these amounts. */
  randomize: boolean;
  randFrequency: number;  // levels
  randPhase: number;      // degrees
  randOffWidth: number;   // cycles
  randPosition: number;   // cells
  /** Seed of the random numbers, so the same settings give the same elements. */
  seed: number;
  /** Elements loaded from a project file: used as they are until a setting is changed. */
  baked?: SourceElement[];
  /** Windows "has position": false = not placed yet (does not run). */
  hasPosition: boolean;
  /** Laser: direction of the beam in degrees (0 = right, 90 = down) and its half-width (1/e of the amplitude) in cells. */
  angleDeg: number;
  beamWidth: number;
  /** A point source that moves (see SourceMotion); its cells are set every step (movingElements), not here. */
  motion?: SourceMotion | null;
}

let nextId = 1;

export function newSource(over: Partial<SourceSpec> = {}): SourceSpec {
  const id = nextId++;
  return {
    id, name: `Source ${id}`, kind: "point", x: 100, y: 100, x2: 100, y2: 200,
    level: 60, amplitudePct: 100, phaseDeg: 0, mode: "continuous", shape: "gaussian",
    onCycles: 3, offCycles: 30, detach: false, detachAfterSteps: 1000, enabled: true,
    countX: 1, countY: 1, spacingX: 8, spacingY: 8, phaseStepXDeg: 0, phaseStepYDeg: 0, lineSpacing: 1,
    randomize: false, randFrequency: 0, randPhase: 0, randOffWidth: 0, randPosition: 0,
    seed: Math.floor(Math.random() * 2 ** 31), hasPosition: true, angleDeg: 0, beamWidth: 30,
    ...over,
  };
}

/** A small seeded random generator (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** SourceSettings.GenerateElements (plus line sources and phase steps), or the baked elements of a loaded project. */
export function elementsOf(s: SourceSpec): SourceElement[] {
  if (!s.enabled || !s.hasPosition || (s.motion && s.kind === "point")) return [];
  if (s.baked) return s.baked;
  const base = {
    level: Math.min(255, Math.max(1, Math.round(s.level))),
    amplitude: s.amplitudePct / 100,
    mode: s.mode, shape: s.shape,
    onCycles: Math.max(1, Math.round(s.onCycles)), offCycles: Math.max(0, Math.round(s.offCycles)),
    detachStep: s.detach ? s.detachAfterSteps : -1,
  };
  const rad = Math.PI / 180;
  const out: SourceElement[] = [];
  if (s.kind === "point") {
    out.push({ ...base, x: Math.round(s.x), y: Math.round(s.y), phase: s.phaseDeg * rad });
  } else if (s.kind === "array") {
    const r = rng(s.seed);
    // a uniform random integer in [-amount, amount] (SourceSettings.RandomInt)
    const ri = (amount: number) => (amount > 0 ? Math.floor(r() * (2 * amount + 1)) - amount : 0);
    for (let row = 0; row < s.countY; row++)
      for (let col = 0; col < s.countX; col++) {
        // centred on (x, y), not anchored at a corner
        let ex = s.x + Math.round((col - (s.countX - 1) / 2) * s.spacingX);
        let ey = s.y + Math.round((row - (s.countY - 1) / 2) * s.spacingY);
        let level = base.level, deg = s.phaseDeg, off = base.offCycles, randOff = 0;
        if (s.randomize) {
          if (s.randPosition > 0) { ex += ri(s.randPosition); ey += ri(s.randPosition); }
          if (s.randFrequency > 0) level = Math.min(255, Math.max(1, s.level + ri(s.randFrequency)));
          if (s.randPhase > 0) deg = Math.min(180, Math.max(-180, s.phaseDeg + ri(s.randPhase)));
          if (s.randOffWidth > 0) { off = Math.max(1, s.offCycles + ri(s.randOffWidth)); randOff = s.randOffWidth; }
        }
        const ph = (deg + col * s.phaseStepXDeg + row * s.phaseStepYDeg) * rad;
        out.push({ ...base, x: ex, y: ey, level, phase: ph, offCycles: off, offWidthBase: base.offCycles, randomizeOffWidthAmount: randOff });
      }
  } else if (s.kind === "laser") {
    // two rows of sources a quarter wavelength apart, the back row a quarter cycle ahead: their waves add up
    // forwards and cancel backwards (an end-fire pair), so the laser shines one way only. Across the beam the
    // amplitude falls off as a Gaussian, exp(-(s / w)^2), which gives a Gaussian beam.
    const a = (s.angleDeg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
    const w = Math.max(2, s.beamWidth), half = Math.ceil(1.8 * w);
    const lambda = wavelength(omegaOfLevel(base.level), 1), kw = (2 * Math.PI) / lambda;
    const seen = new Set<number>();
    for (const back of [0, lambda / 4])
      for (let k = -half; k <= half; k++) {
        const ex = Math.round(s.x - dy * k - dx * back), ey = Math.round(s.y + dx * k - dy * back);
        const key = ey * 100000 + ex;
        if (seen.has(key)) continue;
        seen.add(key);
        // phase from where the cell really is along the beam (cells are whole numbers): phi = phi0 - k p
        const along = (ex - s.x) * dx + (ey - s.y) * dy;
        out.push({ ...base, x: ex, y: ey, amplitude: base.amplitude * Math.exp(-((k / w) ** 2)), phase: s.phaseDeg * rad - kw * along });
      }
  } else {
    const len = Math.hypot(s.x2 - s.x, s.y2 - s.y);
    const n = Math.max(1, Math.floor(len / Math.max(1, s.lineSpacing)) + 1);
    const seen = new Set<number>();
    for (let k = 0; k < n; k++) {
      const f = n === 1 ? 0 : k / (n - 1);
      const ex = Math.round(s.x + (s.x2 - s.x) * f), ey = Math.round(s.y + (s.y2 - s.y) * f);
      const key = ey * 100000 + ex;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...base, x: ex, y: ey, phase: (s.phaseDeg + k * s.phaseStepXDeg) * rad });
    }
  }
  return out;
}
