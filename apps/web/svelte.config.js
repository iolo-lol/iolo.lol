import path from "node:path";
import { fileURLToPath } from "node:url";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { signalIds, signalsDir } from "./signals-dir.js";

// Every data-driven route is prerendered from the real canonical signal ids
// (deterministic, read at config time from the repo-root data/signals dir).
const signalEntries = signalIds(signalsDir).flatMap((id) => [
  `/signals/${id}/`,
  `/signals/${id}/history/`,
  `/api/v1/signals/${id}.json`,
  `/api/v1/signals/${id}.history.json`,
]);

// Adapter output directory. Redirectable via OUTPUT_DIR so a second build can
// be diffed for byte-identical determinism (and tests can drive the shipped
// build into a temp directory).
const outDir = process.env.OUTPUT_DIR
  ? path.resolve(process.env.OUTPUT_DIR)
  : fileURLToPath(new URL("./build", import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: outDir, assets: outDir }),
    // Pinned app version: SvelteKit's default is `Date.now().toString()`,
    // which makes `_app/version.json`, the `__sveltekit_*` client id, and the
    // `_app/immutable/entry/start.*.js` filename differ between every build.
    // A constant version (assets are content-hashed and the static site has
    // no service worker) makes builds byte-identical and deterministic.
    version: { name: "0.0.0" },
    prerender: {
      // `/404.html` is the static 404 artifact served by Cloudflare
      // (`not_found_handling: "404-page"`); every other route is reached via
      // crawl (`*`) or the explicit data-driven entries above.
      entries: ["*", "/404.html", ...signalEntries],
    },
  },
};

export default config;
