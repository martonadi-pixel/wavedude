// Wave Dude 2D web - the Video section: render the run frame by frame into an MP4.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { h, slider, select, check, numberInput } from "../../components";

const video = { frames: 300, stepsPerFrame: 4, fps: 60, quality: 70, area: "scene" as "scene" | "view", overlay: true };

export function renderVideo(sim: Sim, box: HTMLElement): void {
  if (typeof VideoEncoder === "undefined") {
    box.replaceChildren(h("p", { class: "muted" }, "This browser cannot encode video (WebCodecs is missing). Chrome, Edge and recent Safari and Firefox can."));
    return;
  }
  const bar = h("progress", { max: video.frames, value: 0, hidden: true });
  const out = h("div", {});
  let abort: AbortController | null = null;
  const rec = h("button", { class: "primary" }, "⏺ Record MP4");
  const cancel = h("button", { hidden: true }, "Cancel");
  rec.addEventListener("click", async () => {
    abort = new AbortController();
    rec.disabled = true; cancel.hidden = false; bar.hidden = false; bar.max = video.frames; bar.value = 0;
    out.replaceChildren(h("p", { class: "muted" }, `Rendering ${video.frames} frames…`));
    try {
      // the encoder library is only loaded when a video is made
      const { recordVideo } = await import("./video");
      const blob = await recordVideo(sim, { ...video }, f => { bar.value = f; }, abort.signal);
      const url = URL.createObjectURL(blob);
      const name = `${(sim.project.name || "wave-dude").replace(/[^\w.-]+/g, "_")}.mp4`;
      // the preview is only made on request: some GPU drivers' video decoders upset the WebGL context
      const show = h("button", {}, "▶ Preview");
      show.addEventListener("click", () => show.replaceWith(h("video", { src: url, controls: true, autoplay: true, loop: true, class: "preview" })));
      out.replaceChildren(
        h("div", { class: "btns" }, h("a", { class: "btn primary", href: url, download: name }, `⬇ Download ${name} (${(blob.size / 1e6).toFixed(1)} MB)`), show));
    } catch (e) {
      out.replaceChildren(h("p", { class: "status no" }, (e as Error).name === "AbortError" ? "Recording cancelled." : (e as Error).message));
    } finally {
      rec.disabled = false; cancel.hidden = true; bar.hidden = true;
    }
  });
  cancel.addEventListener("click", () => abort?.abort());
  const overlay = check({ label: "Include sources, probes and measurements", value: video.overlay, help: "Only for “What you see”.", onChange: v => { video.overlay = v; } });
  overlay.classList.toggle("dim", video.area !== "view");
  box.replaceChildren(
    h("p", { class: "hint" }, "Renders frame by frame from the current state (not in real time), then gives you an MP4."),
    h("div", { class: "grid2" },
      numberInput({ label: "Frames", value: video.frames, min: 1, max: 100000, onChange: v => { video.frames = Math.max(1, Math.round(v)); } }),
      numberInput({ label: "Frames per second", value: video.fps, min: 1, max: 240, onChange: v => { video.fps = Math.min(240, Math.max(1, Math.round(v))); } })),
    numberInput({ label: "Steps between frames", value: video.stepsPerFrame, min: 1, max: 1000, help: "Visualize every N steps, as in the Windows app.", onChange: v => { video.stepsPerFrame = Math.max(1, Math.round(v)); } }),
    slider({ label: "Quality", min: 1, max: 100, step: 1, value: video.quality, onInput: v => { video.quality = v; } }),
    select({ label: "Picture", options: [["scene", "Whole scene, 1 pixel per cell"], ["view", "What you see (zoom, overlay)"]], value: video.area,
      onChange: v => { video.area = v as "scene" | "view"; overlay.classList.toggle("dim", video.area !== "view"); } }),
    overlay,
    h("div", { class: "btns rec" }, rec, cancel), bar, out);
}
