import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { signalsDir } from "./signals-dir.js";

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		// Absolute path of the canonical signal state, injected at build time
		// (see src/lib/signals.ts).
		__IOLO_SIGNALS_DIR__: JSON.stringify(signalsDir),
	},
});
