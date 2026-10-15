// Wave Dude 2D web - white light on the GPU: eight wavelengths simulated side by side, four to a texture (two groups),
// each with its own frequency and, in glass, its own refractive index (dispersion). The picture shows the colour
// their intensities make together (see core/spectrum.ts).
//
// Per group three float textures take turns: the field a step ago, the field now, and one to write into. The sources'
// pass writes "now" with the sources applied into the spare one; the step then writes the next field over the plain
// "now", which is no longer needed. As in the one-wave step, the field with the sources applied becomes "a step ago"
// for the next step. The colour's running average (linear red, green, blue) is one more pair.
// GPL-3.0-or-later.

import { SOURCE_GLSL, displayShader } from "./shaders";
import { type Program, bind, framebuffer, program, texture } from "./gl";
import { CHANNELS, CHANNEL_RGB, SPECTRAL_NM, dispersionFactor, omegaForWavelength, wavelengthCells } from "../core/spectrum";
import type { Stencil } from "../core/physics";

const GROUPS = CHANNELS / 4;

// the sources' pass for one group: every source sends all four colours (white light), in step with each other
const SOURCES_FS = `#version 300 es
precision highp float;
uniform sampler2D cur;
uniform float srcBlend;
uniform vec4 omega;
out vec4 o;
${SOURCE_GLSL}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 u = texelFetch(cur, p, 0);
  vec4 a = texelFetch(srcA, p, 0);
  float e;
  if (a.a > 0.5) {
    vec4 b = texelFetch(srcB, p, 0);
    if (sourceEnvelope(a, b, e)) {
      vec4 v = sin(a.b + omega * t) * e;
      u = b.a > 0.0 ? u + v * b.a * srcBlend * 10.0 : u * (1.0 - srcBlend) + v * srcBlend;
    }
  }
  o = u;
}`;

// one sub-step for four colours at once: the same update as the one-wave step, with each colour's own speed in glass
const STEP_FS = `#version 300 es
precision highp float;
uniform sampler2D field, prev, mat;
uniform ivec2 size;
uniform float c2Scale, dPow, use4th;
uniform vec4 disp;          // each colour's n - 1 is (n - 1) x disp
out vec4 o;
vec4 U(ivec2 p) {
  if (p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y) return vec4(0.0);
  return texelFetch(field, p, 0);
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 m = texelFetch(mat, p, 0);
  vec4 uc = U(p), lap;
  if (use4th > 0.5 && p.x >= 1 && p.y >= 1 && p.x < size.x - 1 && p.y < size.y - 1) {
    lap = 0.316 * ((-1.0 / 12.0) * (U(p + ivec2(-2, 0)) + U(p + ivec2(2, 0)) + U(p + ivec2(0, -2)) + U(p + ivec2(0, 2)))
        + (4.0 / 3.0) * (U(p + ivec2(-1, 0)) + U(p + ivec2(1, 0)) + U(p + ivec2(0, -1)) + U(p + ivec2(0, 1)))
        - 5.0 * uc);
  } else {
    lap = 0.066 * (U(p + ivec2(-1, -1)) + U(p + ivec2(1, -1)) + U(p + ivec2(-1, 1)) + U(p + ivec2(1, 1)))
        + 0.184 * (U(p + ivec2(-1, 0)) + U(p + ivec2(1, 0)) + U(p + ivec2(0, -1)) + U(p + ivec2(0, 1)))
        - uc;
  }
  vec4 n = 1.0 + (m.b - 1.0) * disp;
  vec4 nv = uc + (uc - texelFetch(prev, p, 0)) * pow(m.g, dPow) + lap * c2Scale / (n * n);
  if (m.a > 0.999) nv = vec4(0.0);
  o = nv;
}`;

// the running average of the colour: each wavelength's u² weighted by how much red, green and blue it adds
const INTENSITY_FS = `#version 300 es
precision highp float;
uniform sampler2D u0, u1, inten;
uniform mat4x3 w0, w1;
uniform float alpha;
out vec4 o;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 a = texelFetch(u0, p, 0), b = texelFetch(u1, p, 0);
  vec3 now = w0 * (a * a) + w1 * (b * b);
  o = vec4(texelFetch(inten, p, 0).rgb * alpha + now * (1.0 - alpha), 1.0);
}`;

// the picture: linear light (now, or averaged) times brightness², too-bright colours scaled down whole, sRGB curve
const WAVE = `
uniform sampler2D u0, u1, inten;
uniform mat4x3 w0, w1;
vec3 waveColor(ivec2 p) {
  vec3 lin;
  if (mode < 0.5) { vec4 a = texelFetch(u0, p, 0), b = texelFetch(u1, p, 0); lin = w0 * (a * a) + w1 * (b * b); }
  else lin = texelFetch(inten, p, 0).rgb;
  lin = max(lin * brightness * brightness, 0.0);
  float mx = max(lin.r, max(lin.g, lin.b));
  if (mx > 1.0) lin /= mx;
  vec3 hi = 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055;
  return mix(12.92 * lin, hi, step(0.0031308, lin));
}`;

/** Steps kept on the GPU before the probes' values are read back, and how many probes there can be. */
const HISTORY = 512;
const MAX_PROBES = 4;

// the probes: one column per step; row 2p + g = probe p's colours of group g
const PROBE_FS = `#version 300 es
precision highp float;
uniform sampler2D u0, u1;
uniform ivec2 pos[${MAX_PROBES}];
out vec4 o;
void main() {
  int r = int(gl_FragCoord.y), p = r / 2;
  o = r - 2 * p == 0 ? texelFetch(u0, pos[p], 0) : texelFetch(u1, pos[p], 0);
}`;

/** Each group's columns of the colour weights (channel k's red, green, blue), for a mat4x3 uniform. */
const weights = (g: number) => new Float32Array(Array.from({ length: 4 }, (_, k) => [...CHANNEL_RGB[4 * g + k]]).flat());

export interface SpectralStep {
  time: number;
  sub: number;
  stencil: Stencil;
  alpha: number;
  mat: WebGLTexture;
  srcA: WebGLTexture;
  srcB: WebGLTexture;
}

export class SpectralField {
  /** How much stronger than real crown glass the dispersion is (1 = real). */
  exaggerate = 10;
  private tex: WebGLTexture[][] = [];
  private fbo: WebGLFramebuffer[][] = [];
  /** Per group: which texture holds [a step ago, now, spare]. */
  private order: number[][] = [];
  private inten: WebGLTexture[] = [];
  private intenFbo: WebGLFramebuffer[] = [];
  private intenCur = 0;
  private srcP: Program;
  private stepP: Program;
  private intenP: Program;
  private probeP: Program;
  readonly showP: Program;
  /** Probes at single cells: every step's eight values there (read with readProbes). */
  probes: { x: number; y: number }[] = [];
  private histTex: WebGLTexture;
  private histFbo: WebGLFramebuffer;
  private histFill = 0;
  /** Per probe, per step: the eight values. */
  private pending: number[][][] = [];

  constructor(private gl: WebGL2RenderingContext, readonly width: number, readonly height: number) {
    this.srcP = program(gl, SOURCES_FS);
    this.stepP = program(gl, STEP_FS);
    this.intenP = program(gl, INTENSITY_FS);
    this.showP = program(gl, displayShader(WAVE));
    this.probeP = program(gl, PROBE_FS);
    this.histTex = texture(gl, HISTORY, GROUPS * MAX_PROBES, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
    this.histFbo = framebuffer(gl, this.histTex);
    for (let g = 0; g < GROUPS; g++) {
      this.tex.push([0, 1, 2].map(() => texture(gl, width, height, gl.RGBA32F, gl.RGBA, gl.FLOAT, null)));
      this.fbo.push(this.tex[g].map(t => framebuffer(gl, t)));
      this.order.push([0, 1, 2]);
    }
    this.inten = [0, 1].map(() => texture(gl, width, height, gl.RGBA32F, gl.RGBA, gl.FLOAT, null));
    this.intenFbo = this.inten.map(t => framebuffer(gl, t));
    this.clear();
  }

  /** Frees the GPU memory. */
  dispose(): void {
    const gl = this.gl;
    for (const t of [...this.tex.flat(), ...this.inten, this.histTex]) gl.deleteTexture(t);
    for (const f of [...this.fbo.flat(), ...this.intenFbo, this.histFbo]) gl.deleteFramebuffer(f);
    for (const p of [this.srcP, this.stepP, this.intenP, this.showP, this.probeP]) gl.deleteProgram(p.pr);
    this.tex = []; this.fbo = []; this.inten = []; this.intenFbo = [];
  }

  /** All eight fields and the colour at rest. */
  clear(): void {
    const gl = this.gl;
    for (const f of [...this.fbo.flat(), ...this.intenFbo]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.histFill = 0;
    this.pending = [];
  }

  /** Angular frequencies (per step) of the eight colours, exact on this grid. */
  omegas(stencil: Stencil, sub: number): number[] {
    return SPECTRAL_NM.map(nm => omegaForWavelength(wavelengthCells(nm), stencil, sub));
  }

  /** One step: sources, `sub` field updates per group, then the colour's average. */
  step(s: SpectralStep): void {
    const gl = this.gl, S = this.srcP, P = this.stepP, I = this.intenP, sub = s.sub;
    const om = this.omegas(s.stencil, sub);
    gl.viewport(0, 0, this.width, this.height);
    for (let g = 0; g < GROUPS; g++) {
      const ord = this.order[g], tex = this.tex[g], fbo = this.fbo[g];
      // sources: "now" with the sources applied, into a spare
      gl.useProgram(S.pr);
      gl.uniform1i(S.u.cur, 0);
      gl.uniform1i(S.u.srcA, 2);
      gl.uniform1i(S.u.srcB, 3);
      gl.uniform1f(S.u.t, s.time);
      gl.uniform1f(S.u.srcBlend, 0.1 / sub);
      gl.uniform4f(S.u.omega, om[4 * g], om[4 * g + 1], om[4 * g + 2], om[4 * g + 3]);
      bind(gl, 0, tex[ord[1]]);
      bind(gl, 2, s.srcA);
      bind(gl, 3, s.srcB);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[ord[2]]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // the applied field is "now" for the first sub-step; the plain one is free to be written over
      this.order[g] = [ord[0], ord[2], ord[1]];
      gl.useProgram(P.pr);
      gl.uniform1i(P.u.field, 0);
      gl.uniform1i(P.u.prev, 1);
      gl.uniform1i(P.u.mat, 2);
      gl.uniform2i(P.u.size, this.width, this.height);
      gl.uniform1f(P.u.c2Scale, 1 / (sub * sub));
      gl.uniform1f(P.u.dPow, 1 / sub);
      gl.uniform1f(P.u.use4th, s.stencil === "4th" ? 1 : 0);
      const d = SPECTRAL_NM.slice(4 * g, 4 * g + 4).map(nm => dispersionFactor(nm, this.exaggerate));
      gl.uniform4f(P.u.disp, d[0], d[1], d[2], d[3]);
      bind(gl, 2, s.mat);
      for (let k = 0; k < sub; k++) {
        const o = this.order[g];
        bind(gl, 0, tex[o[1]]);
        bind(gl, 1, tex[o[0]]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[o[2]]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        // the next field becomes "now", "now" (with its sources) becomes "a step ago"
        this.order[g] = [o[1], o[2], o[0]];
      }
    }
    gl.useProgram(I.pr);
    gl.uniform1i(I.u.u0, 0);
    gl.uniform1i(I.u.u1, 1);
    gl.uniform1i(I.u.inten, 2);
    gl.uniformMatrix4x3fv(I.u.w0, false, weights(0));
    gl.uniformMatrix4x3fv(I.u.w1, false, weights(1));
    gl.uniform1f(I.u.alpha, s.alpha);
    bind(gl, 0, this.tex[0][this.order[0][1]]);
    bind(gl, 1, this.tex[1][this.order[1][1]]);
    bind(gl, 2, this.inten[this.intenCur]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.intenFbo[1 - this.intenCur]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.intenCur = 1 - this.intenCur;
    if (this.probes.length) this.sampleProbes();
  }

  private sampleProbes(): void {
    const gl = this.gl, P = this.probeP, n = Math.min(MAX_PROBES, this.probes.length);
    if (this.histFill >= HISTORY) this.flushProbes();
    gl.useProgram(P.pr);
    gl.uniform1i(P.u.u0, 0);
    gl.uniform1i(P.u.u1, 1);
    const pos = new Int32Array(MAX_PROBES * 2);
    this.probes.slice(0, n).forEach((q, i) => {
      pos[2 * i] = Math.max(0, Math.min(this.width - 1, Math.round(q.x)));
      pos[2 * i + 1] = Math.max(0, Math.min(this.height - 1, Math.round(q.y)));
    });
    gl.uniform2iv(P.u["pos[0]"], pos);
    bind(gl, 0, this.tex[0][this.order[0][1]]);
    bind(gl, 1, this.tex[1][this.order[1][1]]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.histFbo);
    gl.viewport(this.histFill, 0, 1, GROUPS * n);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.viewport(0, 0, this.width, this.height);
    this.histFill++;
  }

  private flushProbes(): void {
    const gl = this.gl, n = this.histFill, np = Math.min(MAX_PROBES, this.probes.length);
    if (!n || !np) { this.histFill = 0; return; }
    const buf = new Float32Array(n * GROUPS * np * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.histFbo);
    gl.readPixels(0, 0, n, GROUPS * np, gl.RGBA, gl.FLOAT, buf);
    for (let p = 0; p < np; p++) {
      const list = this.pending[p] ?? (this.pending[p] = []);
      for (let k = 0; k < n; k++) {
        const v: number[] = [];
        for (let g = 0; g < GROUPS; g++) for (let c = 0; c < 4; c++) v.push(buf[((2 * p + g) * n + k) * 4 + c]);
        list.push(v);
      }
    }
    this.histFill = 0;
  }

  /** Each probe's values since the last call: per probe, one array of eight (violet first) per step. */
  readProbes(): number[][][] {
    this.flushProbes();
    const out = this.probes.map((_, i) => this.pending[i] ?? []);
    this.pending = [];
    return out;
  }

  /** Binds what the display needs (textures 0..2 and the weights; the caller sets the rest of the uniforms). */
  bindForDisplay(): void {
    const gl = this.gl, P = this.showP;
    gl.uniform1i(P.u.u0, 4);
    gl.uniform1i(P.u.u1, 5);
    gl.uniform1i(P.u.inten, 6);
    gl.uniformMatrix4x3fv(P.u.w0, false, weights(0));
    gl.uniformMatrix4x3fv(P.u.w1, false, weights(1));
    bind(gl, 4, this.tex[0][this.order[0][1]]);
    bind(gl, 5, this.tex[1][this.order[1][1]]);
    bind(gl, 6, this.inten[this.intenCur]);
  }

  /** The eight fields u now in a rectangle (8 values per cell, violet first). Reads back from the GPU: use sparingly. */
  readField(x: number, y: number, w = 1, h = 1): Float32Array {
    const gl = this.gl, out = new Float32Array(w * h * CHANNELS), buf = new Float32Array(w * h * 4);
    for (let g = 0; g < GROUPS; g++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[g][this.order[g][1]]);
      gl.readPixels(x, y, w, h, gl.RGBA, gl.FLOAT, buf);
      for (let i = 0; i < w * h; i++) for (let k = 0; k < 4; k++) out[i * CHANNELS + 4 * g + k] = buf[i * 4 + k];
    }
    return out;
  }

  /** The averaged colour (linear red, green, blue, and 1) of every cell, read back from the GPU. Slow. */
  readColour(): Float32Array {
    const gl = this.gl, buf = new Float32Array(this.width * this.height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.intenFbo[this.intenCur]);
    gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.FLOAT, buf);
    return buf;
  }
}
