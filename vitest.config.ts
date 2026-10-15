import { defineConfig } from "vitest/config";

// unit tests for the parts that need no browser (physics, painting, sources, project files)
export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
