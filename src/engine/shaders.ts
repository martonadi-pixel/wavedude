// Wave Dude 2D web - GLSL for the wave step, the probes and the display.
// GPL-3.0-or-later. The step is the wave_step / apply_sources / apply_object_sources kernels of GpuWaveSimulator.vb.

export const VS = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// textures (all RGBA32F, one texel per cell, row 0 = top row of the scene):
//   state  r = u, g = previous u, b = intensity stage 1, a = intensity stage 2
//   mat    r = c^2, g = damping d, b = refractive index (display), a = absorber amount without the edge (display)
//   srcA   r = angular frequency, g = amplitude, b = phase, a = mode (0 none, 1 continuous, 2 gaussian, 3 square)
//   srcB   r = on cycles, g = off cycles, b = detach step (-1 never), a = soft gain (0 = the source holds its cell)
export const SOURCE_GLSL = `
uniform sampler2D srcA, srcB;
uniform float t;
const float PI = 3.14159265358979;
const float DETACH_RAMP = 30.0;

// how strongly a source drives at time t (amplitude x switch-on ramp x pulse shape x detach fade); false when it no
// longer drives (detached). The ramp and the pulses are timed by the source's own frequency.
bool sourceEnvelope(vec4 a, vec4 b, out float e) {
  float fade = 1.0;
  if (b.z >= 0.0) {
    float since = t - b.z;
    if (since >= DETACH_RAMP) return false;
    if (since > 0.0) fade = 1.0 - since / DETACH_RAMP;
  }
  float omega = a.r, env = 1.0;
  // continuous sources switch on smoothly over two periods: a sudden start leaves a slow wake behind
  if (a.a < 1.5) { float tr = 4.0 * PI / max(omega, 1e-4); if (t < tr) env = 0.5 - 0.5 * cos(PI * t / tr); }
  if (a.a > 1.5) {
    float on = b.r, off = b.g, period = on + off;
    if (period > 0.0) {
      // start at the beginning of the "on" span (ComputePulsePosition)
      float clock = omega * t / (2.0 * PI) + off;
      float cyc = floor(clock / period);
      float pos = clock - period * cyc;
      if (a.a < 2.5) {
        if (pos < off) env = 0.0;
        else {
          float sigma = max(on / 6.0, 1e-6);
          float dd = (pos - off - on / 2.0) / sigma;
          // shifted so it starts and ends at exactly zero (a plain Gaussian cut at 3 sigma jumps by 1.1%)
          env = max(0.0, (exp(-0.5 * dd * dd) - 0.011109) / (1.0 - 0.011109));
        }
      } else {
        float shifted = pos - off;
        if (shifted < 0.0 && cyc > 0.0) shifted += period;
        float dFall = shifted - on, dRise = shifted;
        if (dRise > period / 2.0) dRise -= period;
        env = (0.5 + atan(dRise / 0.35) / PI) * (0.5 - atan(dFall / 0.35) / PI);
      }
    }
  }
  e = a.g * env * fade;
  return true;
}

// value a source drives its cell towards at time t; false when it no longer drives (detached)
bool sourceValue(vec4 a, vec4 b, out float v) {
  float e;
  if (!sourceEnvelope(a, b, e)) return false;
  v = sin(a.b + a.r * t) * e;
  return true;
}`;

// the sources' pass, once per step (before the first sub-step): the field with every source applied, u * 0.9 + v * 0.1
// at a held source cell. The step then reads one float per neighbour instead of looking up the sources nine times.
export const SOURCES_FS = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform float srcBlend;
out vec4 o;
${SOURCE_GLSL}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  float u = texelFetch(state, p, 0).r;
  vec4 a = texelFetch(srcA, p, 0);
  float v;
  if (a.a > 0.5) {
    vec4 b = texelFetch(srcB, p, 0);
    // a held source pulls its cell towards its value (0.1 per step, shared out over the sub-steps); a soft one adds
    if (sourceValue(a, b, v)) u = b.a > 0.0 ? u + v * b.a * srcBlend * 10.0 : u * (1.0 - srcBlend) + v * srcBlend;
  }
  o = vec4(u, 0.0, 0.0, 1.0);
}`;

export const STEP_FS = `#version 300 es
precision highp float;
uniform sampler2D state, mat, field;
uniform ivec2 size;
uniform float c2Scale, dPow, alpha, applySrc, track, use4th;
out vec4 o;
// the field as the step sees it: 0 outside the domain; on the sources' sub-step, the field the sources' pass made
float U(ivec2 p) {
  if (p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y) return 0.0;
  return applySrc > 0.5 ? texelFetch(field, p, 0).r : texelFetch(state, p, 0).r;
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 st = texelFetch(state, p, 0);
  vec4 m = texelFetch(mat, p, 0);
  float uc = U(p), lap;
  // like the OpenCL kernel: only the outermost ring falls back to 3x3 (cells beyond the edge read as 0, the border).
  // The cross is scaled by 0.316, the 3x3 kernel's long-wave factor, so both stencils give waves the same speed
  // (the Windows app does not scale it, and its waves then run 1.78 times faster)
  if (use4th > 0.5 && p.x >= 1 && p.y >= 1 && p.x < size.x - 1 && p.y < size.y - 1) {
    lap = 0.316 * ((-1.0 / 12.0) * (U(p + ivec2(-2, 0)) + U(p + ivec2(2, 0)) + U(p + ivec2(0, -2)) + U(p + ivec2(0, 2)))
        + (4.0 / 3.0) * (U(p + ivec2(-1, 0)) + U(p + ivec2(1, 0)) + U(p + ivec2(0, -1)) + U(p + ivec2(0, 1)))
        - 5.0 * uc);
  } else {
    lap = 0.066 * (U(p + ivec2(-1, -1)) + U(p + ivec2(1, -1)) + U(p + ivec2(-1, 1)) + U(p + ivec2(1, 1)))
        + 0.184 * (U(p + ivec2(-1, 0)) + U(p + ivec2(1, 0)) + U(p + ivec2(0, -1)) + U(p + ivec2(0, 1)))
        - uc;
  }
  float nv = uc + (uc - st.g) * pow(m.g, dPow) + lap * m.r * c2Scale;
  // a wall (fully absorbing cell) holds the field at zero: it reflects every wave completely, whatever its thickness
  // or frequency (as a damped cell it let ~10% through a 4-cell wall and swallowed a third)
  if (m.a > 0.999) nv = 0.0;
  if (track < 0.5) { o = vec4(nv, uc, st.b, st.a); return; }
  // two cascaded one-pole filters of u^2 (WaveSimulator: _intensityStage1, _intensity)
  float s1 = st.b * alpha + nv * nv * (1.0 - alpha);
  float s2 = st.a * alpha + s1 * (1.0 - alpha);
  o = vec4(nv, uc, s1, s2);
}`;

// point probes: the fragment at (column k, row p) gets probe p's value; drawn into a 1-column viewport per step
export const PROBE_POINT_FS = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform ivec2 pos[8];
uniform int quantity[8];
uniform float intensityScale;
out vec4 o;
void main() {
  int k = int(gl_FragCoord.y);
  vec4 st = texelFetch(state, pos[k], 0);
  float v = quantity[k] == 0 ? st.r : (st.b * 0.5 + st.a * 0.5) * intensityScale;
  o = vec4(v, 0.0, 0.0, 1.0);
}`;

// line probes: row k is line k, column i the i-th cell along it.
//   mode 0 (read): the value along the line now, or the running total for an integrating line
//   mode 1 (accumulate, once per step): total + intensity, for the lines whose recording has started
export const PROBE_LINE_FS = `#version 300 es
precision highp float;
uniform sampler2D state, acc;
uniform vec4 lines[4];
uniform int count[4];
uniform int quantity[4];
uniform int integ[4];
uniform int recording[4];
uniform int mode;
uniform float intensityScale;
out vec4 o;
void main() {
  int k = int(gl_FragCoord.y), i = int(gl_FragCoord.x);
  if (i >= count[k]) { o = vec4(0.0); return; }
  vec4 L = lines[k];
  float f = count[k] > 1 ? float(i) / float(count[k] - 1) : 0.0;
  ivec2 p = ivec2(floor(mix(L.xy, L.zw, f) + 0.5));
  vec4 st = texelFetch(state, p, 0);
  float inten = (st.b * 0.5 + st.a * 0.5) * intensityScale;
  float total = texelFetch(acc, ivec2(i, k), 0).r;
  if (mode == 1) { o = vec4(total + (recording[k] == 1 ? inten : 0.0), 0.0, 0.0, 1.0); return; }
  float v = integ[k] == 1 ? total : quantity[k] == 0 ? st.r : inten;
  o = vec4(v, 0.0, 0.0, 1.0);
}`;

// the field's colour at a cell (one wave): the colour scheme's table, indexed like ColorLut / FrameRenderer
const MONO_WAVE = `
uniform sampler2D state, lut;
uniform float intensityScale;
vec3 waveColor(ivec2 p) {
  vec4 st = texelFetch(state, p, 0);
  float idx;
  if (mode < 0.5) {
    // ColorLut.FieldIndex
    idx = floor(clamp(st.r * brightness, -1.0, 1.0) * 127.0 + 127.0);
  } else {
    // FrameRenderer.RenderIntensity: sqrt(I) * brightness
    float v = (st.b * 0.5 + st.a * 0.5) * intensityScale;
    idx = v > 0.0 ? floor(min(sqrt(v) * brightness, 1.0) * 254.0) : 0.0;
  }
  return texelFetch(lut, ivec2(int(idx), 0), 0).rgb;
}`;

/** The display: the waves' colour (waveColor), materials, sources and outlines, zoomed and panned. */
export const displayShader = (wave: string): string => `#version 300 es
precision highp float;
uniform sampler2D mat, srcA;
uniform ivec2 size;
uniform float mode, brightness, showMaterial, showSources, freqScale, outlines;
uniform vec2 offset;        // cell coordinate at the top-left corner of the canvas
uniform float cellsPerPx;   // cells per device pixel
uniform float canvasH;
uniform vec3 background;
out vec4 o;

vec3 hue(float level) {     // the spectrum colour of a source level (physics.ts levelColorRgb)
  float h = clamp((level - 1.0) / 254.0, 0.0, 1.0) * 280.0 / 60.0;
  float c = 0.8, x = c * (1.0 - abs(mod(h, 2.0) - 1.0)), m = 0.2;
  vec3 r = h < 1.0 ? vec3(c, x, 0) : h < 2.0 ? vec3(x, c, 0) : h < 3.0 ? vec3(0, c, x) : h < 4.0 ? vec3(0, x, c) : vec3(x, 0, c);
  return r + m;
}

${wave}

vec3 cellColor(vec2 cell) {
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(size.x) || cell.y >= float(size.y)) return background;
  ivec2 p = ivec2(cell);
  vec4 m = texelFetch(mat, p, 0);
  vec3 col = waveColor(p);
  if (showMaterial > 0.5) {
    float glassAmt = clamp((m.b - 1.0) / 1.5, 0.0, 1.0);
    col = mix(col, col * 0.75 + vec3(0.10, 0.22, 0.30), glassAmt * 0.8);
    col = mix(col, vec3(0.42, 0.38, 0.33), clamp(m.a, 0.0, 1.0) * 0.85);
  }
  if (showSources > 0.5) {
    vec4 a = texelFetch(srcA, p, 0);
    if (a.a > 0.5) col = hue(a.r / (0.5 * freqScale) * 255.0);
  }
  return col;
}

// refractive index and absorber amount at a cell (x < 0: outside the scene)
vec2 matAt(vec2 cell) {
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= float(size.x) || cell.y >= float(size.y)) return vec2(-1.0);
  vec4 m = texelFetch(mat, ivec2(cell), 0);
  return vec2(m.b, m.a);
}

// outline colour where the material changes within a pixel or so (screen space, so lines stay thin at any zoom);
// alpha 0 = no edge here
vec4 outline(vec2 px) {
  vec2 c = matAt(offset + px * cellsPerPx);
  if (c.x < 0.0) return vec4(0.0);
  // ranges over +-1.25 pixels (near) and +-2.5 pixels (far): a real edge (a jump) is as big near as far, a smooth
  // gradient (a GRIN lens, the laser housing) only half as big near, so it is not outlined
  float nMin = c.x, nMax = c.x, aMin = c.y, aMax = c.y, fnMin = c.x, fnMax = c.x, faMin = c.y, faMax = c.y;
  for (int k = 0; k < 8; k++) {
    float r = k < 4 ? 1.25 : 2.5;
    int j = k - (k / 4) * 4;
    vec2 d = (j == 0 ? vec2(1.0, 0.0) : j == 1 ? vec2(-1.0, 0.0) : j == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * r;
    vec2 q = matAt(offset + (px + d) * cellsPerPx);
    if (q.x < 0.0) continue;
    if (k < 4) { nMin = min(nMin, q.x); nMax = max(nMax, q.x); aMin = min(aMin, q.y); aMax = max(aMax, q.y); }
    fnMin = min(fnMin, q.x); fnMax = max(fnMax, q.x); faMin = min(faMin, q.y); faMax = max(faMax, q.y);
  }
  bool nEdge = nMax - nMin > 0.025 && nMax - nMin > 0.75 * (fnMax - fnMin);
  bool aEdge = aMax - aMin > 0.1 && aMax - aMin > 0.75 * (faMax - faMin);
  if (nEdge && nMax > 3.0) return vec4(0.95, 0.95, 1.0, 1.0);                   // mirrors (very dense glass)
  if (nEdge) return vec4(0.35, 0.92, 1.0, 1.0);                                  // glass, lenses, prisms
  if (aEdge) return vec4(1.0, 0.72, 0.3, 1.0);                                   // walls and absorbers
  return vec4(0.0);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, canvasH - gl_FragCoord.y);
  if (cellsPerPx <= 1.0) {
    o = vec4(cellColor(offset + px * cellsPerPx), 1.0);
  } else {
    // zoomed out: average a few samples per pixel instead of skipping cells (no moire)
    vec3 acc = vec3(0.0);
    for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++)
      acc += cellColor(offset + (px - 0.5 + (vec2(i, j) + 0.5) / 3.0) * cellsPerPx);
    o = vec4(acc / 9.0, 1.0);
  }
  if (outlines > 0.5) {
    vec4 e = outline(px);
    o.rgb = mix(o.rgb, e.rgb, e.a * 0.9);
  }
}`;

export const DISPLAY_FS = displayShader(MONO_WAVE);

// ------------------------------------------------------------------------------------------ 3D view
// A grid mesh whose height is read from the state texture in the vertex shader: crests are hills, troughs valleys,
// walls stand up as blocks. Colours come from the same colour table as the 2D view.
export const MESH_VS = `#version 300 es
precision highp float;
uniform sampler2D state, mat, srcA, lut;
uniform ivec2 size;           // simulation cells
uniform ivec2 mesh;           // mesh vertices
uniform vec2 world;           // half extent of the scene in world units (x, z)
uniform float mode, brightness, intensityScale, amp, wallH, showMaterial, showSources, freqScale, outlines;
uniform mat4 mvp;
out vec3 vNormal;
out vec3 vPos;
out vec3 vColor;
out float vWall;

ivec2 cellOf(ivec2 g) { return clamp(ivec2(vec2(g) * vec2(size - 1) / vec2(max(mesh - 1, ivec2(1))) + 0.5), ivec2(0), size - 1); }

float heightAt(ivec2 g) {
  ivec2 p = cellOf(g);
  vec4 m = texelFetch(mat, p, 0);
  if (showMaterial > 0.5 && m.a > 0.5) return wallH;
  vec4 st = texelFetch(state, p, 0);
  if (mode < 0.5) return tanh(st.r * brightness) * amp;
  float v = (st.b * 0.5 + st.a * 0.5) * intensityScale;
  return min(sqrt(max(v, 0.0)) * brightness, 1.0) * amp;
}

vec3 posOf(ivec2 g) {
  vec2 f = vec2(g) / vec2(max(mesh - 1, ivec2(1)));
  return vec3((f.x - 0.5) * 2.0 * world.x, heightAt(g), (f.y - 0.5) * 2.0 * world.y);
}

vec3 hue(float level) {
  float h = clamp((level - 1.0) / 254.0, 0.0, 1.0) * 280.0 / 60.0;
  float c = 0.8, x = c * (1.0 - abs(mod(h, 2.0) - 1.0)), m = 0.2;
  vec3 r = h < 1.0 ? vec3(c, x, 0) : h < 2.0 ? vec3(x, c, 0) : h < 3.0 ? vec3(0, c, x) : h < 4.0 ? vec3(0, x, c) : vec3(x, 0, c);
  return r + m;
}

void main() {
  ivec2 g = ivec2(gl_VertexID % mesh.x, gl_VertexID / mesh.x);
  vec3 p = posOf(g);
  vec3 dx = posOf(min(g + ivec2(1, 0), mesh - 1)) - posOf(max(g - ivec2(1, 0), ivec2(0)));
  vec3 dz = posOf(min(g + ivec2(0, 1), mesh - 1)) - posOf(max(g - ivec2(0, 1), ivec2(0)));
  vNormal = normalize(cross(dz, dx));
  vPos = p;

  ivec2 c = cellOf(g);
  vec4 st = texelFetch(state, c, 0), m = texelFetch(mat, c, 0);
  float idx;
  if (mode < 0.5) idx = floor(clamp(st.r * brightness, -1.0, 1.0) * 127.0 + 127.0);
  else {
    float v = (st.b * 0.5 + st.a * 0.5) * intensityScale;
    idx = v > 0.0 ? floor(min(sqrt(v) * brightness, 1.0) * 254.0) : 0.0;
  }
  vec3 col = texelFetch(lut, ivec2(int(idx), 0), 0).rgb;
  vWall = 0.0;
  if (showMaterial > 0.5) {
    float glassAmt = clamp((m.b - 1.0) / 1.5, 0.0, 1.0);
    col = mix(col, col * 0.75 + vec3(0.10, 0.22, 0.30), glassAmt * 0.8);
    if (m.a > 0.5) { col = vec3(0.55, 0.52, 0.48); vWall = 1.0; }
    else col = mix(col, vec3(0.42, 0.38, 0.33), clamp(m.a, 0.0, 1.0) * 0.85);
  }
  if (showSources > 0.5) {
    vec4 a = texelFetch(srcA, c, 0);
    if (a.a > 0.5) col = hue(a.r / (0.5 * freqScale) * 255.0);
  }
  if (outlines > 0.5) {
    // the material differs from a neighbouring vertex: an edge of glass, a mirror or a wall
    // as in 2D: a jump between neighbouring vertices is an edge, a smooth gradient is not
    float nMin = m.b, nMax = m.b, aMin = m.a, aMax = m.a, fnMin = m.b, fnMax = m.b, faMin = m.a, faMax = m.a;
    for (int k = 0; k < 8; k++) {
      int r = k < 4 ? 1 : 2, j = k - (k / 4) * 4;
      ivec2 d = (j == 0 ? ivec2(1, 0) : j == 1 ? ivec2(-1, 0) : j == 2 ? ivec2(0, 1) : ivec2(0, -1)) * r;
      vec4 q = texelFetch(mat, cellOf(clamp(g + d, ivec2(0), mesh - 1)), 0);
      if (k < 4) { nMin = min(nMin, q.b); nMax = max(nMax, q.b); aMin = min(aMin, q.a); aMax = max(aMax, q.a); }
      fnMin = min(fnMin, q.b); fnMax = max(fnMax, q.b); faMin = min(faMin, q.a); faMax = max(faMax, q.a);
    }
    bool nEdge = nMax - nMin > 0.025 && nMax - nMin > 0.75 * (fnMax - fnMin);
    bool aEdge = aMax - aMin > 0.1 && aMax - aMin > 0.75 * (faMax - faMin);
    if (nEdge && nMax > 3.0) col = vec3(0.95, 0.95, 1.0);
    else if (nEdge) col = vec3(0.35, 0.92, 1.0);
    else if (aEdge) col = vec3(1.0, 0.72, 0.3);
  }
  vColor = col;
  gl_Position = mvp * vec4(p, 1.0);
}`;

export const MESH_FS = `#version 300 es
precision highp float;
uniform vec3 eye;
in vec3 vNormal;
in vec3 vPos;
in vec3 vColor;
in float vWall;
out vec4 o;
void main() {
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 l = normalize(vec3(0.45, 0.8, 0.35));
  vec3 v = normalize(eye - vPos);
  float diff = max(dot(n, l), 0.0);
  float spec = pow(max(dot(reflect(-l, n), v), 0.0), 48.0) * (1.0 - vWall);
  // a dark colour (zero field) still shows its shape through the light and a faint sky reflection
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0) * (1.0 - vWall);
  // dark-water base and sky reflection, so flat (zero-field, black) water still reads as a lit surface
  vec3 water = vec3(0.10, 0.13, 0.17) * (0.35 + 0.65 * diff) * (1.0 - vWall);
  vec3 col = vColor * (0.5 + 0.6 * diff) + water + vec3(0.6) * spec + vec3(0.20, 0.27, 0.36) * fres;
  o = vec4(col, 1.0);
}`;
