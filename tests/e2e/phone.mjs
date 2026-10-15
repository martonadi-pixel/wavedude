// Phones and tablets: the picture takes most of the screen and nothing overflows sideways.
import { chromium } from "playwright-core";
const base = (process.env.E2E_BASE ?? process.argv[2] ?? "http://localhost:4173/").replace(/\/?$/, "/");
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
let fails = 0;
for (const [w, hgt] of [[390, 844], [360, 640], [844, 390], [768, 1024]]) {
  const page = await browser.newPage({ viewport: { width: w, height: hgt }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  for (const hash of ["#/sandbox", "#/experiment/double-slit"]) {
    await page.goto(base + hash); await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const r = id => { const e = document.querySelector(id); if (!e || e.hidden || !e.offsetParent && e.id !== "app") return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)]; };
      return { header: r("header"), panel: r("#panel"), opts: r("#tool-options"), view: r("#view"), rail: r(".rail"), toolbar: r("#toolbar"), graphs: r("#graphs"),
        docH: document.documentElement.scrollHeight, hscroll: document.documentElement.scrollWidth > window.innerWidth + 1, toolbarScrollW: document.querySelector("#toolbar").scrollWidth };
    });
    const vh = m.view?.[1] ?? 0;
    console.log(`${w}x${hgt} ${hash.padEnd(26)} view ${vh}px (${Math.round(100 * vh / hgt)}%) ${JSON.stringify(m)}`);
    if (m.hscroll) { console.log("  FAIL horizontal page scroll"); fails++; }
  }
  await page.close();
}
await browser.close();
process.exit(fails ? 1 : 0);
