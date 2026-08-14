import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SIGNALS_DIR,
  loadHistory,
  loadSignal,
  renderPage,
  signalIds,
} from "./server.js";
import { DEFAULT_SITE_BASE, generateFeed, generateSitemap } from "./feed.js";

export const DEFAULT_OUTPUT_DIR = fileURLToPath(
  new URL("../site", import.meta.url),
);

function writeJson(outDir: string, relPath: string, body: unknown): void {
  const file = path.join(outDir, relPath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`);
}

function writeText(outDir: string, relPath: string, body: string): void {
  const file = path.join(outDir, relPath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, body);
}

/**
 * Render the canonical signal state into a static site with the same JSON
 * semantics as the local server. API paths mirror the product-owned data
 * files: api/v1/signals.json (list), api/v1/signals/<id>.json (canonical),
 * api/v1/signals/<id>.history.json (history). Also generates the Atom change
 * feed and the sitemap from product-owned canonical history.
 */
export function generateSite(
  signalsDir: string,
  outDir: string,
  siteBase: string = DEFAULT_SITE_BASE,
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

  writeText(outDir, path.join("feed.xml"), generateFeed(signalsDir, siteBase));
  written.push("feed.xml");

  writeText(
    outDir,
    path.join("sitemap.xml"),
    generateSitemap(signalsDir, siteBase),
  );
  written.push("sitemap.xml");

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
  const siteBase = process.env.SITE_BASE ?? DEFAULT_SITE_BASE;
  const files = generateSite(signalsDir, outDir, siteBase);
  for (const file of files) console.log(`generated ${file}`);
  console.log(`static site generated into ${outDir}`);
}
