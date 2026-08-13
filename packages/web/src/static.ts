import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_SIGNALS_DIR, loadHistory, loadSignal, renderPage, signalIds } from "./server.js";

export const DEFAULT_OUTPUT_DIR = fileURLToPath(
  new URL("../site", import.meta.url),
);

function writeJson(outDir: string, relPath: string, body: unknown): void {
  const file = path.join(outDir, relPath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`);
}

/**
 * Render the canonical signal state into a static site with the same JSON
 * semantics as the local server. API paths mirror the product-owned data
 * files: api/v1/signals.json (list), api/v1/signals/<id>.json (canonical),
 * api/v1/signals/<id>.history.json (history).
 */
export function generateSite(
  signalsDir: string,
  outDir: string,
): string[] {
  const written: string[] = [];

  const indexFile = path.join(outDir, "index.html");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(indexFile, renderPage(signalsDir));
  written.push("index.html");

  writeJson(outDir, path.join("api", "v1", "signals.json"), {
    signals: signalIds(signalsDir),
  });
  written.push("api/v1/signals.json");

  for (const id of signalIds(signalsDir)) {
    writeJson(
      outDir,
      path.join("api", "v1", "signals", `${id}.json`),
      loadSignal(signalsDir, id),
    );
    written.push(`api/v1/signals/${id}.json`);
    try {
      writeJson(
        outDir,
        path.join("api", "v1", "signals", `${id}.history.json`),
        loadHistory(signalsDir, id),
      );
      written.push(`api/v1/signals/${id}.history.json`);
    } catch {
      // signal without history: no history endpoint
    }
  }
  return written;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const signalsDir = process.env.SIGNALS_DIR ?? DEFAULT_SIGNALS_DIR;
  const outDir = process.env.OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
  const files = generateSite(signalsDir, outDir);
  for (const file of files) console.log(`generated ${file}`);
  console.log(`static site generated into ${outDir}`);
}
