// The 3D view draws the surface (the picture keeps its size when the tool rail is put away).
import { start, check } from "./lib.mjs";

const t = await start({ width: 1366, height: 768 });
for (const hash of ["#/sandbox", "#/experiment/splash", "#/experiment/double-slit"]) {
  await t.goto(hash, 800);
  await t.play();
  await t.page.waitForTimeout(800);
  await t.page.click('button.seg:has-text("3D")'); await t.page.waitForTimeout(400);
  const r = await t.ev(() => {
    const s = window.waveDude, gl = s.engine.gl;
    s.renderView();
    const err = gl.getError(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    // pixels that are not the background
    let lit = 0;
    for (let i = 0; i < px.length; i += 4) if (Math.abs(px[i] - 18) + Math.abs(px[i + 1] - 18) + Math.abs(px[i + 2] - 20) > 12) lit++;
    return { dim: s.dim, glError: err, w, h, lit: +(lit / (w * h)).toFixed(3) };
  });
  check(r.dim === "3d" && r.glError === 0 && r.w > 300 && r.h > 200 && r.lit > 0.1, `${hash}: the surface is drawn in 3D`, r);
  await t.page.click('button.seg:has-text("2D")');
}
await t.done();
