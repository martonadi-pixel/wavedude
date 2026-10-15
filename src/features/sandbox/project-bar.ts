// Wave Dude 2D web - the Sandbox's project in the header: its name, Save, Open (a .zip, files or a folder), and its
// description in a small pop-up.
// GPL-3.0-or-later.

import type { Sim } from "../../sim/sim";
import { openProject, applyProject, saveProject } from "../../project/project";
import { h, menuButton, download } from "../../components";

/** A short message on the picture (saved, opened, an error). */
export function toast(msg: string, kind: "ok" | "no" | "" = ""): void {
  const host = document.getElementById("view");
  if (!host) return;
  host.querySelectorAll(".toast.note").forEach(t => t.remove());
  const t = h("div", { class: `toast note ${kind}`, role: "status" }, msg);
  host.append(t);
  setTimeout(() => t.remove(), kind === "no" ? 9000 : 5000);
}

export function projectBar(sim: Sim, opened: () => void): HTMLElement {
  const openFiles = h("input", { type: "file", accept: ".zip,.json,image/*", multiple: true, hidden: true });
  const openFolder = h("input", { type: "file", hidden: true });
  openFolder.setAttribute("webkitdirectory", "");
  const doOpen = async (list: FileList | null) => {
    if (!list?.length) return;
    try {
      toast("Opening…");
      const p = await openProject([...list]);
      applyProject(sim, p);
      sim.owner = "sandbox";
      sim.hold();
      name.value = sim.project.name;
      opened();
      toast(`Opened “${p.meta.name}”.${p.warnings.length ? " " + p.warnings.join(" ") : ""}`, p.warnings.length ? "" : "ok");
    } catch (e) { toast((e as Error).message, "no"); }
    openFiles.value = ""; openFolder.value = "";
  };
  openFiles.addEventListener("change", () => void doOpen(openFiles.files));
  openFolder.addEventListener("change", () => void doOpen(openFolder.files));
  const save = async () => {
    try {
      const { blob, fileName } = await saveProject(sim);
      download(blob, fileName);
      toast(`Saved ${fileName}. Unzip it into your Windows projects folder to open it there.`, "ok");
    } catch (e) { toast((e as Error).message, "no"); }
  };
  const name = h("input", { type: "text", class: "proj-name", value: sim.project.name, placeholder: "Untitled", "aria-label": "Project name", spellcheck: "false",
    "data-help": "The project's name (also the name of the saved .zip)." });
  name.addEventListener("change", () => { sim.project.name = name.value.trim() || "Untitled"; name.value = sim.project.name; });
  const desc = h("button", { type: "button", class: "icon-btn", "aria-label": "Description", "data-help": "What this project is about (saved with it)." }, "📝");
  desc.addEventListener("click", () => {
    if (document.querySelector(".desc-pop")) { document.querySelector(".desc-pop")!.remove(); return; }
    const ta = h("textarea", { rows: 4, "aria-label": "Project description", placeholder: "What is this project about?" }, sim.project.description);
    ta.addEventListener("input", () => { sim.project.description = ta.value; });
    const r = desc.getBoundingClientRect();
    const pop = h("div", { class: "desc-pop popover", role: "dialog", "aria-label": "Project description" }, h("div", { class: "eyebrow" }, "Description"), ta);
    pop.style.setProperty("--x", `${Math.max(8, r.left - 120)}px`);
    pop.style.setProperty("--y", `${r.bottom + 6}px`);
    document.body.append(pop);
    ta.focus();
    const close = (e: Event) => { if (!(e.target as HTMLElement).closest(".desc-pop") && e.target !== desc) { pop.remove(); document.removeEventListener("pointerdown", close); } };
    document.addEventListener("pointerdown", close);
    pop.addEventListener("keydown", e => { if (e.key === "Escape") pop.remove(); });
  });
  return h("div", { class: "project-bar" },
    h("span", { class: "eyebrow" }, "Project"), name, desc,
    h("button", { type: "button", class: "primary", onclick: () => void save(), "data-help": "Download the project as a .zip in the Windows app's format (configuration.json + scene image)." }, "💾 Save"),
    menuButton("📂 Open ▾", () => [
      { label: "Open a project (.zip or files)…", help: "A .zip of a project folder, or its configuration.json together with the scene image.", run: () => openFiles.click() },
      { label: "Open a project folder…", help: "A project folder of the Windows app.", run: () => openFolder.click() },
    ], { "data-help": "Open a project: a .zip, its files, or a whole folder." }),
    openFiles, openFolder);
}
