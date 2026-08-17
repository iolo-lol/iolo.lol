import { defineConfig } from "vitest/config";
import { signalsDir } from "./signals-dir.js";

export default defineConfig({
  define: {
    __IOLO_SIGNALS_DIR__: JSON.stringify(signalsDir),
  },
  test: {
    include: ["tests/**/*.test.ts"],
    // the build-level test drives the shipped SvelteKit build
    testTimeout: 180_000,
    hookTimeout: 180_000,
  },
});
