import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateSite } from "../src/static.js";
import { DEFAULT_SIGNALS_DIR, signalIds } from "../src/server.js";

const REAL_RESULT = JSON.parse(
  readFileSync(
    path.join(DEFAULT_SIGNALS_DIR, "gemini-3.7-flash-usage-rates.json"),
    "utf8",
  ),
) as { signalId: string };

const REAL_HISTORY = JSON.parse(
  readFileSync(
    path.join(DEFAULT_SIGNALS_DIR, "gemini-3.7-flash-usage-rates.history.json"),
    "utf8",
  ),
);

describe("static site generator", () => {
  it("renders the human-facing pages and API files from canonical data", () => {
    const outDir = mkdtempSync(path.join(tmpdir(), "iolo-static-"));
    const ids = signalIds(DEFAULT_SIGNALS_DIR);
    const files = generateSite(DEFAULT_SIGNALS_DIR, outDir);
    const expected = [
      "index.html",
      "signals/index.html",
      "changes/index.html",
      "404.html",
      ...ids.flatMap((id) => [
        `signals/${id}/index.html`,
        `signals/${id}/history/index.html`,
      ]),
      "api/v1/signals.json",
      "feed.xml",
      "sitemap.xml",
      ...ids.flatMap((id) => [
        `api/v1/signals/${id}.json`,
        `api/v1/signals/${id}.history.json`,
      ]),
    ];
    expect(files).toEqual(expected);

    const home = readFileSync(path.join(outDir, "index.html"), "utf8");
    expect(home).toContain("Gemini 3.7 Flash usage rates");
    expect(home).toContain("DeepSeek V4 Flash usage rates");
    expect(home).toContain("Grok 4.6 usage rates");
    expect(home).toContain("Command R+ 08-2024 usage rates");
    expect(home).toContain("Qwen3.8-2.4T-A95B usage rates");
    expect(home).toContain("What are Signals?");

    expect(
      JSON.parse(readFileSync(path.join(outDir, "api/v1/signals.json"), "utf8")),
    ).toEqual({ signals: ids });
    expect(
      JSON.parse(
        readFileSync(
          path.join(
            outDir,
            "api/v1/signals/gemini-3.7-flash-usage-rates.json",
          ),
          "utf8",
        ),
      ),
    ).toEqual(REAL_RESULT);
    expect(
      JSON.parse(
        readFileSync(
          path.join(
            outDir,
            "api/v1/signals/gemini-3.7-flash-usage-rates.history.json",
          ),
          "utf8",
        ),
      ),
    ).toEqual(REAL_HISTORY);
  });

  it("renders detail and history pages for each signal", () => {
    const outDir = mkdtempSync(path.join(tmpdir(), "iolo-static-"));
    generateSite(DEFAULT_SIGNALS_DIR, outDir);
    const detail = readFileSync(
      path.join(
        outDir,
        "signals/gemini-3.7-flash-usage-rates/index.html",
      ),
      "utf8",
    );
    expect(detail).toContain("Current state");
    expect(detail).toContain("Input price");
    expect(detail).toContain("0.75 USD per 1M tokens");
    expect(detail).toContain("ai.google.dev/gemini-api/docs/pricing");
    expect(detail).toContain("Verification details");
    expect(detail).toContain("Content hash:");
    const history = readFileSync(
      path.join(
        outDir,
        "signals/gemini-3.7-flash-usage-rates/history/index.html",
      ),
      "utf8",
    );
    expect(history).toContain("change history");
    expect(history).toContain("sha256:");
  });

  it("uses the canonical iolo.lol origin in canonical links and feed/sitemap", () => {
    const outDir = mkdtempSync(path.join(tmpdir(), "iolo-static-"));
    generateSite(DEFAULT_SIGNALS_DIR, outDir);
    const home = readFileSync(path.join(outDir, "index.html"), "utf8");
    expect(home).toContain('rel="canonical" href="https://iolo.lol/"');
    const sitemap = readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
    expect(sitemap).toContain("<loc>https://iolo.lol/</loc>");
    expect(sitemap).toContain(
      "<loc>https://iolo.lol/signals/gemini-3.7-flash-usage-rates/</loc>",
    );
    const feed = readFileSync(path.join(outDir, "feed.xml"), "utf8");
    expect(feed).toContain(
      "https://iolo.lol/signals/gemini-3.7-flash-usage-rates/history/",
    );
  });

  it("skips history for a signal without one and renders from any data dir", () => {
    const signalsDir = mkdtempSync(path.join(tmpdir(), "iolo-signals-"));
    const outDir = mkdtempSync(path.join(tmpdir(), "iolo-static-"));
    const minimal = {
      schemaVersion: 1,
      signalId: "x",
      observedAt: "2026-08-14T00:00:00Z",
      source: {
        url: "https://example.com/source",
        fetchedAt: "2026-08-14T00:00:00Z",
        contentHash:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
      values: [],
    };
    mkdirSync(signalsDir, { recursive: true });
    writeFileSync(path.join(signalsDir, "x.json"), JSON.stringify(minimal));
    const files = generateSite(signalsDir, outDir);
    expect(files).toEqual([
      "index.html",
      "signals/index.html",
      "changes/index.html",
      "404.html",
      "signals/x/index.html",
      "api/v1/signals.json",
      "feed.xml",
      "sitemap.xml",
      "api/v1/signals/x.json",
    ]);
    expect(
      existsSync(path.join(outDir, "signals/x/history/index.html")),
    ).toBe(false);
  });
});
