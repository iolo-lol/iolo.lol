import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { changesFromSignalsDir } from "../src/lib/changes.js";
import { comparisonFromSignalsDir } from "../src/lib/compare.js";
import { offersFromSignalsDir } from "../src/lib/model-offers.js";
import { signalMeta } from "../src/lib/meta.js";
import { DEFAULT_SIGNALS_DIR, signalIds } from "../src/lib/signals.js";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/**
 * These tests drive the SHIPPED SvelteKit static build (`adapter-static`
 * full prerender) into a fresh output directory and assert the real artifacts:
 * complete file set, equality with the pure-module projections, the 404 page,
 * and source/freshness/provenance content on a signal detail page. They
 * replace the old generator (`static.ts`) and dev-server (`server.ts`) tests.
 */

function buildSite(outDir: string): void {
  execFileSync("pnpm", ["--filter", "@iolo.lol/web", "build"], {
    cwd: REPO_ROOT,
    env: { ...process.env, OUTPUT_DIR: outDir },
    stdio: "pipe",
  });
}

let outDir: string;

beforeAll(() => {
  outDir = mkdtempSync(path.join(tmpdir(), "iolo-svelte-build-"));
  buildSite(outDir);
});

describe("shipped SvelteKit static build", () => {
  it("prerenders every expected artifact from the real canonical data", () => {
    const ids = signalIds(DEFAULT_SIGNALS_DIR);
    expect(ids).toHaveLength(24);
    const expected = [
      "index.html",
      "signals/index.html",
      "compare/index.html",
      "offers/index.html",
      "changes/index.html",
      "404.html",
      ...ids.flatMap((id) => [
        `signals/${id}/index.html`,
        `signals/${id}/history/index.html`,
      ]),
      "api/v1/signals.json",
      "api/v1/comparisons/index.json",
      "api/v1/changes/index.json",
      "api/v1/model-offers/index.json",
      "feed.xml",
      "sitemap.xml",
      ...ids.flatMap((id) => [
        `api/v1/signals/${id}.json`,
        `api/v1/signals/${id}.history.json`,
      ]),
    ];
    for (const rel of expected) {
      expect(existsSync(path.join(outDir, rel)), `${rel} must exist`).toBe(true);
    }
  });

  it("static artifacts equal the pure-module projections", () => {
    expect(
      JSON.parse(readFileSync(path.join(outDir, "api/v1/signals.json"), "utf8")),
    ).toEqual({ signals: signalIds(DEFAULT_SIGNALS_DIR) });
    expect(
      JSON.parse(
        readFileSync(path.join(outDir, "api/v1/comparisons/index.json"), "utf8"),
      ),
    ).toEqual(comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR));
    expect(
      JSON.parse(readFileSync(path.join(outDir, "api/v1/changes/index.json"), "utf8")),
    ).toEqual(changesFromSignalsDir(DEFAULT_SIGNALS_DIR));
    expect(
      JSON.parse(
        readFileSync(path.join(outDir, "api/v1/model-offers/index.json"), "utf8"),
      ),
    ).toEqual(offersFromSignalsDir(DEFAULT_SIGNALS_DIR));
    // a per-signal artifact equals the canonical file
    expect(
      JSON.parse(
        readFileSync(
          path.join(outDir, "api/v1/signals/gemini-3.7-flash-usage-rates.json"),
          "utf8",
        ),
      ),
    ).toEqual(
      JSON.parse(
        readFileSync(
          path.join(DEFAULT_SIGNALS_DIR, "gemini-3.7-flash-usage-rates.json"),
          "utf8",
        ),
      ),
    );
  });

  it("renders a 404 page and signal detail pages with source/freshness/provenance", () => {
    const notFound = readFileSync(path.join(outDir, "404.html"), "utf8");
    expect(notFound).toContain("404");
    expect(notFound).toContain("That page does not exist.");

    const detail = readFileSync(
      path.join(outDir, "signals/gemini-3.7-flash-usage-rates/index.html"),
      "utf8",
    );
    expect(detail).toContain("Gemini 3.7 Flash usage rates");
    expect(detail).toContain("Current state");
    expect(detail).toContain("Freshness and source");
    expect(detail).toContain("Authoritative source");
    expect(detail).toContain("ai.google.dev/gemini-api/docs/pricing");
    expect(detail).toContain("Verification details");
    expect(detail).toContain("Content hash");
    expect(detail).toContain("sha256:");
  });

  it("keeps the sonnet-5 promotional condition and both providers on the offers page, and lists every signal on the home page", () => {
    const offers = readFileSync(path.join(outDir, "offers/index.html"), "utf8");
    expect(offers).toContain(
      "Promotional launch pricing in effect through August 31, 2026",
    );
    expect(offers).toContain("developer: Anthropic");
    expect(offers).toContain("Anthropic API");
    expect(offers).toContain("DeepInfra hosted");

    const home = readFileSync(path.join(outDir, "index.html"), "utf8");
    for (const id of signalIds(DEFAULT_SIGNALS_DIR)) {
      expect(home, `${id} must be listed on the home page`).toContain(
        signalMeta(id).title,
      );
    }
  });
});
