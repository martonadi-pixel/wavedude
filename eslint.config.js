// Lint: the recommended JavaScript and TypeScript rules, type-only imports kept apart, and the layers of src/: each
// folder may only import from the folders below it (core < engine < view < circuits, project < sim < components, app <
// features < main.ts). Some imports are allowed for types only (allowTypeImports). Import cycles are checked by
// scripts/check-cycles.mjs.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/** A no-restricted-imports rule from regexes on the import path: [regex, message, typesAllowed?]. */
const only = (...rules) => ({
  "no-restricted-imports": "off",
  "@typescript-eslint/no-restricted-imports": ["error", {
    patterns: rules.map(([regex, message, types]) => ({ regex, message, ...(types ? { allowTypeImports: true } : {}) })),
  }],
});
const UP = "^(\\.\\./)+";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".claude"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" }],
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  // ---------------------------------------------------------------- the layers of src/
  { files: ["src/core/**/*.ts"], rules: only(["^\\.\\./", "core is plain maths and data: it imports nothing from the rest of the app."]) },
  { files: ["src/engine/**/*.ts"], rules: only(["^\\.\\./(?!core/)", "engine (the GPU) builds on core only."]) },
  { files: ["src/view/**/*.ts"], rules: only(
    ["^\\.\\./(?!core/)", "view builds on core (and engine's types) only."],
    ["^\\.\\./engine/", "view may use engine's types only.", true]) },
  { files: ["src/circuits/**/*.ts"], rules: only(
    ["^\\.\\./(?!core/)", "circuits build on core (and the types of sim and view) only."],
    ["^\\.\\./(sim|view)/", "circuits may use the types of sim and view only.", true]) },
  { files: ["src/project/**/*.ts"], rules: only(
    ["^\\.\\./(?!core/|circuits/)", "project builds on core and circuits (and sim's types) only."],
    ["^\\.\\./sim/", "project may use sim's types only.", true]) },
  { files: ["src/sim/**/*.ts"], rules: only(["^\\.\\./(components|app|features|main)\\b", "sim is below the interface: no components, app or pages."]) },
  { files: ["src/components/**/*.ts"], rules: only(["^\\.\\./(?!core/)", "components are plain interface pieces: core at most."]) },
  { files: ["src/app/**/*.ts"], rules: only([`^\\.\\./(features|main)\\b`, "app is the shell the pages use; it does not know the pages."]) },
  { files: ["src/features/**/*.ts"], rules: only(
    [`${UP}main\\b`, "pages do not import main.ts."],
    [`${UP}app/`, "pages use the app shell's types only (the shell is passed in).", true]) },
  // pages do not reach into each other (the Learn library lists the experiments; tests may check links both ways)
  { files: ["src/features/experiments/**/*.ts"], ignores: ["**/*.test.ts"], rules: only(
    [`${UP}(sandbox|colors|learn)/`, "experiments do not import other pages."], [`${UP}main\\b`, "pages do not import main.ts."],
    [`${UP}app/`, "pages use the app shell's types only (the shell is passed in).", true]) },
  { files: ["src/features/sandbox/**/*.ts", "src/features/colors/**/*.ts"], rules: only(
    [`${UP}(experiments|sandbox|colors|learn)/`, "pages do not import other pages."], [`${UP}main\\b`, "pages do not import main.ts."],
    [`${UP}app/`, "pages use the app shell's types only (the shell is passed in).", true]) },
  // ---------------------------------------------------------------- scripts and browser tests run in Node
  { files: ["scripts/**/*.mjs", "tests/**/*.mjs"], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
);
