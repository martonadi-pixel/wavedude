// Wave Dude 2D web - small WebGL2 helpers: programs, float textures and framebuffers.
// GPL-3.0-or-later.

import { VS } from "./shaders";

export interface Program { pr: WebGLProgram; u: Record<string, WebGLUniformLocation> }

/** Compiles and links a program; its uniforms by name. */
export function program(gl: WebGL2RenderingContext, fs: string, vs = VS): Program {
  const pr = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
    gl.attachShader(pr, s);
  }
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) ?? "link error");
  const u: Record<string, WebGLUniformLocation> = {};
  const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const a = gl.getActiveUniform(pr, i)!;
    u[a.name] = gl.getUniformLocation(pr, a.name)!;
  }
  return { pr, u };
}

/** A texture read texel by texel (no filtering, no wrapping). */
export function texture(gl: WebGL2RenderingContext, w: number, h: number, internal: number, format: number, type: number, data: ArrayBufferView | null): WebGLTexture {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

export function framebuffer(gl: WebGL2RenderingContext, t: WebGLTexture): WebGLFramebuffer {
  const f = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return f;
}

export function bind(gl: WebGL2RenderingContext, unit: number, t: WebGLTexture): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
}
