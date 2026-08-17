import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Build-time canonical signal state (repo-root `data/signals`), resolved from
 * this unbundled config module and injected into the SvelteKit/Vite and Vitest
 * builds so dev, build, preview, and tests all read the same directory
 * regardless of how the app modules are bundled.
 */
export const signalsDir = fileURLToPath(
  new URL("../../data/signals", import.meta.url),
);

/** Deterministic signal-id list for a signals directory. */
export function signalIds(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json") && !name.endsWith(".history.json"))
    .map((name) => name.replace(/\.json$/, ""))
    .sort();
}
