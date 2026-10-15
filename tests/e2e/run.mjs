// Wave Dude 2D web - runs the browser tests one after the other and fails if any of them does.
//   npm run e2e                 all of them
//   npm run e2e -- logic famous only these
// The site must already be served: npm run build && npm run preview (or E2E_BASE=<url>).
// GPL-3.0-or-later.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const all = fs.readdirSync(dir).filter(f => f.endsWith(".mjs") && f !== "lib.mjs" && f !== "run.mjs").map(f => f.slice(0, -4)).sort();
const pick = process.argv.slice(2);
const unknown = pick.filter(n => !all.includes(n));
if (unknown.length) { console.error(`no such test: ${unknown.join(", ")} (there are: ${all.join(", ")})`); process.exit(2); }
const tests = pick.length ? pick : all;

const failed = [];
const t0 = Date.now();
for (const name of tests) {
  const t = Date.now();
  console.log(`\n▶ ${name}`);
  const r = spawnSync(process.execPath, [path.join(dir, `${name}.mjs`)], { stdio: "inherit", env: process.env });
  const s = ((Date.now() - t) / 1000).toFixed(0);
  if (r.status === 0) console.log(`  passed (${s} s)`);
  else { console.log(`  FAILED (${s} s, exit ${r.status ?? r.signal})`); failed.push(name); }
}
console.log(`\n${tests.length - failed.length} of ${tests.length} passed in ${((Date.now() - t0) / 1000).toFixed(0)} s${failed.length ? ` — failed: ${failed.join(", ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
