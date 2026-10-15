// Wave Dude 2D web - fails when the modules of src/ import each other in a circle. Only imports that exist at run time
// count: `import type` and imports of types only are erased by TypeScript and cannot form a cycle. Dynamic import()
// is left out too (it loads later, on demand).
//   node scripts/check-cycles.mjs   (part of npm run check)
// GPL-3.0-or-later.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : /\.ts$/.test(e.name) && !/\.(test|d)\.ts$/.test(e.name) ? [p] : [];
  });
}

/** The file a relative import points at (x.ts or x/index.ts), or null for a package. */
function resolve(from, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const p of [base, `${base}.ts`, path.join(base, "index.ts")]) if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  return null;
}

/** Imports and re-exports of a file that remain in the JavaScript. */
function valueImports(file) {
  const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, false);
  const out = [];
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause;
      // a bare `import "./x"` runs the module; a clause with only types is erased
      const typesOnly = !!c && (c.isTypeOnly || (!c.name && !!c.namedBindings && ts.isNamedImports(c.namedBindings) &&
        c.namedBindings.elements.length > 0 && c.namedBindings.elements.every(e => e.isTypeOnly)));
      if (!typesOnly) out.push(st.moduleSpecifier.text);
    } else if (ts.isExportDeclaration(st) && st.moduleSpecifier) {
      const typesOnly = st.isTypeOnly || (!!st.exportClause && ts.isNamedExports(st.exportClause) &&
        st.exportClause.elements.length > 0 && st.exportClause.elements.every(e => e.isTypeOnly));
      if (!typesOnly) out.push(st.moduleSpecifier.text);
    }
  }
  return out;
}

const graph = new Map(files(src).map(f => [f, valueImports(f).map(s => resolve(f, s)).filter(Boolean)]));

// strongly connected components (Tarjan): any with more than one module, or a module importing itself, is a cycle
let index = 0;
const idx = new Map(), low = new Map(), stack = [], on = new Set(), cycles = [];
function visit(v) {
  idx.set(v, index); low.set(v, index); index++;
  stack.push(v); on.add(v);
  for (const w of graph.get(v) ?? []) {
    if (!idx.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); }
    else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
  }
  if (low.get(v) === idx.get(v)) {
    const scc = [];
    let w;
    do { w = stack.pop(); on.delete(w); scc.push(w); } while (w !== v);
    if (scc.length > 1 || (graph.get(v) ?? []).includes(v)) cycles.push(scc);
  }
}
for (const v of graph.keys()) if (!idx.has(v)) visit(v);

const rel = p => path.relative(root, p);
if (cycles.length) {
  console.error(`Import cycles in src/ (${cycles.length}):`);
  for (const c of cycles) {
    const set = new Set(c);
    console.error(`  ${c.map(rel).join(", ")}`);
    for (const f of c) for (const g of graph.get(f)) if (set.has(g)) console.error(`      ${rel(f)} → ${rel(g)}`);
  }
  process.exit(1);
}
console.log(`No import cycles (${graph.size} modules).`);
