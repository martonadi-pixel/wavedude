// Wave Dude 2D web - recording an MP4 video (MfVideoWriter.vb's job), with WebCodecs through Mediabunny.
// Frames are rendered one by one, not in real time, so a video can be longer or larger than the screen can show live.
// GPL-3.0-or-later. Mediabunny is MPL-2.0.

import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH, QUALITY_LOW, QUALITY_MEDIUM, QUALITY_VERY_HIGH,
  getFirstEncodableVideoCodec } from "mediabunny";
import type { Sim } from "../sim";

export interface VideoOptions {
  /** Number of video frames. */
  frames: number;
  /** Simulation steps between two frames (SimulationSettings.VisualizeEvery). */
  stepsPerFrame: number;
  fps: number;
  /** 1..100 like the Windows app's video quality. */
  quality: number;
  /** "scene": the whole scene, one pixel per cell (scaled down if larger than 4K); "view": what is on screen. */
  area: "scene" | "view";
  /** Draw sources, probes, rulers and labels into the video ("view" only). */
  overlay: boolean;
}

const MAX_PIXELS = 3840 * 2160;

export async function recordVideo(sim: Sim, o: VideoOptions, progress: (frame: number) => void, signal: AbortSignal): Promise<Blob> {
  const eng = sim.engine;
  let w: number, h: number;
  if (o.area === "scene") {
    const k = Math.min(1, Math.sqrt(MAX_PIXELS / (sim.scene.width * sim.scene.height)));
    w = Math.round(sim.scene.width * k);
    h = Math.round(sim.scene.height * k);
  } else {
    w = eng.canvas.width;
    h = eng.canvas.height;
  }
  // H.264 wants even sizes
  w -= w % 2;
  h -= h % 2;
  const quality = o.quality < 30 ? QUALITY_LOW : o.quality < 55 ? QUALITY_MEDIUM : o.quality < 80 ? QUALITY_HIGH : QUALITY_VERY_HIGH;
  const codec = await getFirstEncodableVideoCodec(["avc", "vp9", "av1", "hevc"], { width: w, height: h });
  if (!codec) throw new Error(`This browser cannot encode a ${w} × ${h} video. Try a smaller size or “What you see”.`);

  const frame = document.createElement("canvas");
  frame.width = w;
  frame.height = h;
  const g = frame.getContext("2d")!;
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const source = new CanvasSource(frame, { codec, quality, hardwareAcceleration: "prefer-software" });
  output.addVideoTrack(source, { frameRate: o.fps });

  sim.running = false;
  sim.exporting = true;
  try {
    await output.start();
    for (let i = 0; i < o.frames; i++) {
      if (signal.aborted) throw new DOMException("Recording cancelled.", "AbortError");
      if (i > 0) sim.advance(o.stepsPerFrame);
      if (o.area === "scene") {
        // one cell per pixel (or the scene scaled into 4K), without the screen's zoom
        eng.canvas.width = w;
        eng.canvas.height = h;
        eng.render({ ...sim.displayBase(), offsetX: 0, offsetY: 0, cellsPerPx: sim.scene.width / w });
        g.drawImage(eng.canvas, 0, 0, w, h);
      } else {
        sim.renderView();
        g.drawImage(eng.canvas, 0, 0, w, h, 0, 0, w, h);
        if (o.overlay) g.drawImage(sim.view.overlayCanvas, 0, 0, w, h, 0, 0, w, h);
      }
      await source.add(i / o.fps, 1 / o.fps);
      if (i % 4 === 0) { progress(i + 1); await new Promise(r => setTimeout(r, 0)); }
    }
    source.close();
    await output.finalize();
    progress(o.frames);
    return new Blob([(output.target as BufferTarget).buffer!], { type: "video/mp4" });
  } catch (e) {
    if (output.state === "started") await output.cancel();
    throw e;
  } finally {
    sim.exporting = false;
    sim.view.resize();
  }
}
