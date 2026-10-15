// Wave Dude 2D web - the shape of the "How it works" library: categories, pages, and per-level sections.
// GPL-3.0-or-later.

/** Who a section is written for. Readers pick a level; they see that level and the ones below it. */
export type LearnLevel = "kids" | "school" | "university" | "research";

export interface LearnSection {
  level: LearnLevel;
  /** Optional heading shown above the section. */
  title?: string;
  /** HTML: p, ul/ol/li, b, i, h4, table, sup/sub, code/pre, inline <svg>; classes: formula, aside, fact, home, diagram. */
  html: string;
}

export interface LearnPage {
  id: string;
  title: string;
  /** One sentence for the table of contents. */
  summary: string;
  sections: LearnSection[];
  /** Experiments that show this page's idea (ids from src/experiments). */
  tryIt?: { experiment: string; label: string }[];
  /** Further reading: books, articles, sites (plain text or "Title — URL"). */
  sources?: string[];
}

export interface LearnCategory {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  pages: LearnPage[];
}
