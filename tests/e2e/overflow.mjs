// No page is wider than the window at desktop widths (the header compacts).
import { chromium } from "playwright-core";
const base = (process.env.E2E_BASE ?? process.argv[2] ?? "http://localhost:4173/").replace(/\/?$/, "/");
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1024, height: 700 } });
let fails = 0;
for (const hash of ["#/sandbox", "#/experiment/double-slit", "#/learn"]) {
  for (const w of [1024, 900, 1100, 1280]) {
    await page.setViewportSize({ width: w, height: 700 });
    await page.goto(base + hash); await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const W = innerWidth, out = [];
      for (const e of document.querySelectorAll("body *")) {
        const b = e.getBoundingClientRect();
        if (b.right > W + 1 && b.width > 0 && getComputedStyle(e).position !== "fixed") out.push(`${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}.${[...e.classList].join(".")} right=${Math.round(b.right)} w=${Math.round(b.width)}`);
      }
      return { sw: document.documentElement.scrollWidth, W, out: out.slice(0, 6) };
    });
    console.log(hash, w, r.sw > r.W ? "OVERFLOW " + r.sw : "ok", r.out.join(" | "));
    if (r.sw > r.W) fails++;
  }
}
await browser.close();
process.exit(fails ? 1 : 0);
