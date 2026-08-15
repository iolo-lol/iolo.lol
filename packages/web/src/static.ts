import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SIGNALS_DIR,
  loadHistory,
  loadSignal,
  signalIds,
} from "./server.js";
import {
  renderChanges,
  renderCompare,
  renderHome,
  renderNotFound,
  renderOffers,
  renderSignalDetail,
  renderSignalHistory,
  renderSignalsIndex,
} from "./pages.js";
import { comparisonFromSignalsDir } from "./compare.js";
import { changesFromSignalsDir } from "./changes.js";
import { offersFromSignalsDir } from "./model-offers.js";
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
 * Render the canonical signal state into the human-facing static site with
 * the same page semantics as the local server: home, Signals index, Signal
 * detail and history pages, recent-changes page, and a 404 page. API paths
 * mirror the product-owned data files: api/v1/signals.json (list),
 * api/v1/signals/<id>.json (canonical), api/v1/signals/<id>.history.json
 * (history). Also generates the Atom change feed and the sitemap from
 * product-owned canonical history.
 */
export function generateSite(
  signalsDir: string,
  outDir: string,
  siteBase: string = DEFAULT_SITE_BASE,
): string[] {
  const written: string[] = [];

  const pageFiles: { html: string; path: string; render: () => string }[] = [
    { html: "index.html", path: "index.html", render: () => renderHome(signalsDir) },
    { html: "signals/index.html", path: "signals/index.html", render: () => renderSignalsIndex(signalsDir) },
    { html: "compare/index.html", path: "compare/index.html", render: () => renderCompare(signalsDir) },
    { html: "offers/index.html", path: "offers/index.html", render: () => renderOffers(signalsDir) },
    { html: "changes/index.html", path: "changes/index.html", render: () => renderChanges(signalsDir) },
    { html: "404.html", path: "404.html", render: () => renderNotFound() },
  ];
  for (const id of signalIds(signalsDir)) {
    pageFiles.push({
      html: `signals/${id}/index.html`,
      path: `signals/${id}/index.html`,
      render: () => renderSignalDetail(signalsDir, id) ?? renderNotFound(),
    });
    try {
      loadHistory(signalsDir, id);
      pageFiles.push({
        html: `signals/${id}/history/index.html`,
        path: `signals/${id}/history/index.html`,
        render: () => renderSignalHistory(signalsDir, id) ?? renderNotFound(),
      });
    } catch {
      // signal without history: no history page
    }
  }
  for (const page of pageFiles) {
    writeText(outDir, page.path, page.render());
    written.push(page.path);
  }

  writeJson(outDir, path.join("api", "v1", "signals.json"), {
    signals: signalIds(signalsDir),
  });
  written.push("api/v1/signals.json");

  writeJson(
    outDir,
    path.join("api", "v1", "comparisons", "index.json"),
    comparisonFromSignalsDir(signalsDir),
  );
  written.push("api/v1/comparisons/index.json");

  writeJson(
    outDir,
    path.join("api", "v1", "changes", "index.json"),
    changesFromSignalsDir(signalsDir),
  );
  written.push("api/v1/changes/index.json");

  writeJson(
    outDir,
    path.join("api", "v1", "model-offers", "index.json"),
    offersFromSignalsDir(signalsDir),
  );
  written.push("api/v1/model-offers/index.json");

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

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const signalsDir = process.env.SIGNALS_DIR ?? DEFAULT_SIGNALS_DIR;
  const outDir = process.env.OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
  const siteBase = process.env.SITE_BASE ?? DEFAULT_SITE_BASE;
  const files = generateSite(signalsDir, outDir, siteBase);
  for (const file of files) console.log(`generated ${file}`);
  console.log(`static site generated into ${outDir}`);
}
