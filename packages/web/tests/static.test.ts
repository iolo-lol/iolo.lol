import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateSite } from "../src/static.js";
import { DEFAULT_SIGNALS_DIR } from "../src/server.js";

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
  it("renders index.html and API files from the committed canonical data", () => {
    const outDir = mkdtempSync(path.join(tmpdir(), "iolo-static-"));
    const files = generateSite(DEFAULT_SIGNALS_DIR, outDir);
    expect(files).toEqual([
      "index.html",
      "api/v1/signals.json",
      "api/v1/signals/gemini-3.7-flash-usage-rates.json",
      "api/v1/signals/gemini-3.7-flash-usage-rates.history.json",
    ]);

    expect(readFileSync(path.join(outDir, "index.html"), "utf8")).toContain(
      REAL_RESULT.signalId,
    );
    expect(
      JSON.parse(readFileSync(path.join(outDir, "api/v1/signals.json"), "utf8")),
    ).toEqual({ signals: ["gemini-3.7-flash-usage-rates"] });
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
        contentHash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
      values: [],
    };
    mkdirSync(signalsDir, { recursive: true });
    writeFileSync(path.join(signalsDir, "x.json"), JSON.stringify(minimal));
    const files = generateSite(signalsDir, outDir);
    expect(files).toEqual([
      "index.html",
      "api/v1/signals.json",
      "api/v1/signals/x.json",
    ]);
    expect(
      existsSync(path.join(outDir, "api/v1/signals/x.history.json")),
    ).toBe(false);
  });
});
