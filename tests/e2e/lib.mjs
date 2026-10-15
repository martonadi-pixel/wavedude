// Wave Dude 2D web - what the browser tests share: a headless Chrome with WebGL, the page, and checks that fail the
// run. The site must already be served (npm run build && npm run preview); E2E_BASE says where (default
// http://localhost:4173/). window.waveDude is the running simulation.
// GPL-3.0-or-later.

import { createRequire } from "node:module";
import path from "node:path";

/** playwright-core from the project, or from the folder E2E_PLAYWRIGHT_FROM (whose node_modules has it). */
function playwright() {
  const from = [import.meta.url, process.env.E2E_PLAYWRIGHT_FROM && path.resolve(process.env.E2E_PLAYWRIGHT_FROM) + "/"].filter(Boolean);
  for (const f of from) {
    try { return createRequire(f)("playwright-core"); } catch { /* next */ }
  }
  console.error("playwright-core not found: npm i -D playwright-core, or set E2E_PLAYWRIGHT_FROM to a folder whose node_modules has it.");
  process.exit(2);
}

export const BASE = (process.env.E2E_BASE ?? "http://localhost:4173/").replace(/\/?$/, "/");
const CHROME = process.env.E2E_CHROME ?? "/usr/bin/google-chrome";
/** Scratch folder for downloads. */
export const TMP = process.env.E2E_TMP ?? path.join(process.env.TMPDIR ?? "/tmp", "wave-dude-e2e");

/** Opens Chrome with a page; errors on the page (and console errors) are collected and fail the test in done(). */
export async function start({ width = 1440, height = 900, downloads = false } = {}) {
  const { chromium } = playwright();
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width, height }, acceptDownloads: downloads });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  const t = {
    browser, page, errors,
    /** Runs f(arg) in the page. */
    ev: (f, arg) => page.evaluate(f, arg),
    /** Goes to a page of the app ("#/sandbox") and waits a moment for it to set up. */
    goto: async (hash, ms = 600) => { await page.goto(BASE + hash); await page.waitForTimeout(ms); },
    /** Pages open paused: starts the run. */
    play: () => page.evaluate(() => window.waveDude.play()),
    /** Waits until the run has stopped (an experiment that runs ahead to a step stops there). */
    idle: (timeout = 120000) => page.waitForFunction(() => !window.waveDude.running, null, { timeout }),
    /** Waits until the run is no longer fast-forwarding. */
    settle: async (timeout = 120000) => { await page.waitForTimeout(300); await page.waitForFunction(() => !window.waveDude.preparing, null, { timeout }); await page.waitForTimeout(400); },
    /** The live readout of the experiment step, on one line. */
    readout: async () => (await page.locator("#step-readout").innerText().catch(() => "")).replace(/\s+/g, " "),
    /** Sets the i-th experiment slider (rebuilds or updates live, like dragging it). */
    setParam: (i, v) => page.locator(".params input[type=range]").nth(i).evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); }, String(v)),
    /** Clicks the step dot whose title matches (or the i-th). */
    step: async which => {
      const dots = page.locator(".dots .dot");
      if (typeof which === "number") { await dots.nth(which).click(); }
      else {
        const n = await dots.count();
        for (let i = 0; i < n; i++) if (which.test(await dots.nth(i).getAttribute("title") ?? "")) { await dots.nth(i).click(); break; }
      }
      await page.waitForTimeout(250);
    },
    /** Sandbox: replaces the scene from the Scene tab ("empty", a demo, or a ready-made circuit like "c-andor"). */
    startFrom: async id => {
      await page.locator(".tab", { hasText: "Scene" }).click();
      await page.locator('select[aria-label="Start from"]').selectOption(id);
      await page.waitForTimeout(300);
      await page.locator(".tab", { hasText: "Objects" }).click();
    },
    /** Sandbox: saves the project (💾 Save) to a file and opens it again; returns the file's path. */
    saveAndOpen: async name => {
      const fs = await import("node:fs");
      fs.mkdirSync(TMP, { recursive: true });
      const [dl] = await Promise.all([page.waitForEvent("download"), page.locator("#header-tools button", { hasText: "Save" }).click()]);
      const file = path.join(TMP, name);
      await dl.saveAs(file);
      await page.locator('input[type=file][accept=".zip,.json,image/*"]').setInputFiles(file);
      await page.waitForTimeout(1500);
      return file;
    },
    /** Types the answer into the step's task and returns the feedback. */
    answer: async value => {
      await page.fill(".task input", String(value));
      await page.click(".task .primary");
      await page.waitForTimeout(200);
      return { ok: await page.locator(".task .explain.ok").count() > 0, text: (await page.locator(".task .explain").innerText()).slice(0, 200) };
    },
    /** Checks that nothing went wrong on the page, closes the browser and sets the exit code. */
    done: async () => {
      check(errors.length === 0, "no errors on the page", errors.slice(0, 3).join(" | "));
      await browser.close();
    },
  };
  return t;
}

/** A check: prints ✓ or ✗ with what was seen, and makes the test fail when it does not hold. */
export function check(ok, what, seen) {
  console.log(`${ok ? "  ✓" : "  ✗"} ${what}${seen === undefined || seen === "" ? "" : ` — ${typeof seen === "string" ? seen : JSON.stringify(seen)}`}`);
  if (!ok) process.exitCode = 1;
  return ok;
}

/** |a - b| <= tol. */
export const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;

/** The first number after `label` in a text (e.g. num("R = 0.75%", "R =")). */
export function num(text, label) {
  const i = label ? text.indexOf(label) : 0;
  if (i < 0) return NaN;
  const m = text.slice(i + (label?.length ?? 0)).match(/-?\d+(\.\d+)?(e[+-]?\d+)?/i);
  return m ? +m[0] : NaN;
}
