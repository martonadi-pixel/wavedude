// Wave Dude 2D web - the "How it works" library: 7 categories of pages, each page written for several levels.
// The reader picks a level and sees the sections for that level and the ones below it.
// GPL-3.0-or-later.

import { CATEGORIES } from ".";
import type { LearnCategory, LearnLevel, LearnPage } from "./types";
import { EXPERIMENTS } from "../experiments";
import { h } from "../../components";
import type { Shell } from "../../app/shell";

const LEVELS: { id: LearnLevel; label: string; who: string }[] = [
  { id: "kids", label: "Kids", who: "Ideas and pictures, no maths" },
  { id: "school", label: "School", who: "Simple formulas with worked examples" },
  { id: "university", label: "University", who: "Equations and derivations" },
  { id: "research", label: "Research", who: "Numerical methods and the literature" },
];
const STORE = "waveDude.learnLevel";
const rank = (l: LearnLevel) => LEVELS.findIndex(x => x.id === l);

function getLevel(): LearnLevel {
  try {
    const v = localStorage.getItem(STORE) as LearnLevel | null;
    if (v && rank(v) >= 0) return v;
  } catch { /* storage blocked */ }
  return "school";
}
function setLevel(l: LearnLevel): void {
  try { localStorage.setItem(STORE, l); } catch { /* storage blocked */ }
}

/** Every page in reading order, with its category. */
const ALL: { cat: LearnCategory; page: LearnPage }[] = CATEGORIES.flatMap(cat => cat.pages.map(page => ({ cat, page })));
let query = "";

export function openLearn(shell: Shell, catId?: string, pageId?: string): void {
  shell.showStage(false);
  shell.setGraph("none");
  shell.sim.running = false;
  const cat = CATEGORIES.find(c => c.id === catId);
  const page = cat?.pages.find(p => p.id === pageId);
  renderSidebar(shell, cat, page);
  const article = document.getElementById("article")!;
  if (cat && page) article.replaceChildren(renderPage(shell, cat, page));
  else if (cat) article.replaceChildren(renderCategory(cat));
  else article.replaceChildren(renderHome());
  article.scrollTop = 0;
}

function levelPicker(onChange: () => void): HTMLElement {
  const cur = getLevel();
  return h("div", { class: "levels" },
    h("div", { class: "lbl" }, "Explain it for:"),
    h("div", { class: "chips" }, ...LEVELS.map(l => h("button", {
      class: `chip lvl-${l.id === "university" ? "university" : l.id} ${cur === l.id ? "on" : ""}`, "data-help": l.who,
      onclick: () => { setLevel(l.id); onChange(); },
    }, l.label))));
}

function renderSidebar(shell: Shell, cat?: LearnCategory, page?: LearnPage): void {
  const rerender = () => openLearn(shell, cat?.id, page?.id);
  const search = h("input", { type: "search", placeholder: "Search the library…", value: query });
  const tree = h("nav", { class: "tree" });
  const drawTree = () => {
    const q = query.trim().toLowerCase();
    tree.replaceChildren(...CATEGORIES.map(c => {
      const pages = c.pages.filter(p => !q || `${p.title} ${p.summary}`.toLowerCase().includes(q));
      if (q && !pages.length) return h("span", {});
      const open = !!q || c.id === cat?.id;
      return h("details", { open },
        h("summary", {}, h("a", { href: `#/learn/${c.id}`, class: c.id === cat?.id && !page ? "on" : "" }, `${c.icon} ${c.title}`)),
        ...pages.map(p => h("a", { href: `#/learn/${c.id}/${p.id}`, class: `leaf ${p.id === page?.id ? "on" : ""}` }, p.title)));
    }));
  };
  search.addEventListener("input", () => { query = search.value; drawTree(); });
  drawTree();
  shell.panel.replaceChildren(
    h("h2", {}, h("a", { href: "#/learn", class: "plain" }, "How it works")),
    h("p", { class: "muted" }, `${ALL.length} pages in ${CATEGORIES.length} chapters: the physics, the maths, the simulation and the code.`),
    levelPicker(rerender), search, tree);
}

function renderHome(): HTMLElement {
  const lv = LEVELS[rank(getLevel())];
  return h("article", { class: "prose library" },
    h("h2", {}, "How it works"),
    h("p", {}, "Waves are everywhere: ripples on a pond, the sound of your voice, the light you read this by, the signal that brought this page to you. This library explains what waves are, how they behave, where we use them, the maths that describes them, and how this simulator computes them."),
    h("p", { class: "muted" }, `You are reading at ${lv.label} level (${lv.who.toLowerCase()}). Change it any time on the left.`),
    h("div", { class: "cats" }, ...CATEGORIES.map(c => h("a", { class: "cat", href: `#/learn/${c.id}` },
      h("span", { class: "icon" }, c.icon),
      h("b", {}, c.title),
      h("span", {}, c.blurb),
      h("small", {}, `${c.pages.length} pages`)))));
}

function renderCategory(c: LearnCategory): HTMLElement {
  return h("article", { class: "prose library" },
    h("div", { class: "crumbs" }, h("a", { href: "#/learn" }, "How it works"), " › ", c.title),
    h("h2", {}, `${c.icon} ${c.title}`),
    h("p", {}, c.blurb),
    h("ol", { class: "pagelist" }, ...c.pages.map(p => h("li", {},
      h("a", { href: `#/learn/${c.id}/${p.id}` }, h("b", {}, p.title)), h("br", {}), h("span", { class: "muted" }, p.summary)))));
}

function renderPage(shell: Shell, c: LearnCategory, p: LearnPage): HTMLElement {
  const level = getLevel();
  const shown = p.sections.filter(s => rank(s.level) <= rank(level));
  const hidden = p.sections.filter(s => rank(s.level) > rank(level));
  const i = ALL.findIndex(x => x.page === p);
  const prev = ALL[i - 1], next = ALL[i + 1];
  const levelOf = (l: LearnLevel) => LEVELS[rank(l)];
  const parts: (Node | null)[] = [
    h("div", { class: "crumbs" }, h("a", { href: "#/learn" }, "How it works"), " › ", h("a", { href: `#/learn/${c.id}` }, c.title)),
    h("h2", {}, p.title),
    h("p", { class: "lead" }, p.summary),
    ...shown.map(s => h("section", { class: `level-sec lv-${s.level}` },
      h("div", { class: "sec-head" }, h("span", { class: `badge lvl-${s.level}` }, levelOf(s.level).label), s.title ? h("h3", {}, s.title) : null),
      h("div", { html: s.html }))),
    hidden.length ? h("div", { class: "more-levels" },
      `There is more on this page for ${[...new Set(hidden.map(s => levelOf(s.level).label))].join(" and ")} readers. `,
      h("button", { onclick: () => { setLevel(hidden[hidden.length - 1].level); openLearn(shell, c.id, p.id); } }, "Show it")) : null,
    p.tryIt?.length ? h("div", { class: "tryit" }, h("b", {}, "Try it yourself: "),
      ...p.tryIt.filter(t => EXPERIMENTS.some(e => e.id === t.experiment)).map(t => h("a", { class: "try", href: `#/experiment/${t.experiment}` }, `▶ ${t.label}`))) : null,
    p.sources?.length ? h("details", { class: "sources" }, h("summary", {}, "Sources and further reading"),
      h("ul", {}, ...p.sources.map(src => h("li", { html: linkify(src) })))) : null,
    h("div", { class: "nav" },
      prev ? h("a", { class: "btn", href: `#/learn/${prev.cat.id}/${prev.page.id}` }, `← ${prev.page.title}`) : h("span", {}),
      next ? h("a", { class: "btn primary", href: `#/learn/${next.cat.id}/${next.page.id}` }, `${next.page.title} →`) : h("span", {})),
  ];
  return h("article", { class: "prose library" }, ...parts.filter((x): x is Node => x !== null));
}

/** Plain text with any http(s) URL turned into a link. */
function linkify(s: string): string {
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/https?:\/\/[^\s)]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
}
