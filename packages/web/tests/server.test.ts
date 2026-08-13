import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp, loadSignal, signalIds } from "../src/server.js";

const FIXTURE_RESULT = {
  schemaVersion: 1,
  signalId: "gemini-3.7-flash-usage-rates",
  observedAt: "2026-08-14T00:00:00Z",
  source: {
    url: "https://ai.google.dev/gemini-api/docs/pricing",
    fetchedAt: "2026-08-14T00:00:00Z",
    contentHash:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  values: [
    {
      name: "input-price",
      unit: "per-1m-tokens",
      currency: "USD",
      statements: [
        { value: 0.75, note: "through December 31, 2026" },
        { value: 1.5, note: "starting January 1, 2027" },
      ],
    },
    {
      name: "output-price",
      unit: "per-1m-tokens",
      currency: "USD",
      statements: [
        { value: 3.75, note: "through December 31, 2026" },
        { value: 7.5, note: "starting January 1, 2027" },
      ],
    },
  ],
};

let signalsDir: string;
let server: ReturnType<typeof createApp>;
let baseUrl: string;

beforeAll(async () => {
  signalsDir = mkdtempSync(path.join(tmpdir(), "iolo-web-test-"));
  mkdirSync(signalsDir, { recursive: true });
  writeFileSync(
    path.join(signalsDir, "gemini-3.7-flash-usage-rates.json"),
    JSON.stringify(FIXTURE_RESULT, null, 2),
  );
  server = createApp(signalsDir);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no port");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

describe("read API", () => {
  it("lists published signal ids", async () => {
    const res = await fetch(`${baseUrl}/api/v1/signals`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      signals: ["gemini-3.7-flash-usage-rates"],
    });
  });

  it("returns the canonical Result for a signal", async () => {
    const res = await fetch(
      `${baseUrl}/api/v1/signals/gemini-3.7-flash-usage-rates`,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(FIXTURE_RESULT);
  });

  it("returns 404 for an unknown signal", async () => {
    const res = await fetch(`${baseUrl}/api/v1/signals/nope`);
    expect(res.status).toBe(404);
  });
});

describe("web surface", () => {
  it("renders values with provenance", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("gemini-3.7-flash-usage-rates");
    expect(html).toContain("0.75");
    expect(html).toContain("through December 31, 2026");
    expect(html).toContain("ai.google.dev/gemini-api/docs/pricing");
    expect(html).toContain("sha256:aaaa");
  });

  it("escapes signal data in HTML", async () => {
    const hostile = "a\"<script>b</script>";
    writeFileSync(
      path.join(signalsDir, `${hostile.replaceAll(/[^a-z0-9-]/gi, "-")}.json`),
      JSON.stringify({ ...FIXTURE_RESULT, signalId: hostile }),
    );
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    expect(html).not.toContain("<script>");
  });
});

describe("data helpers", () => {
  it("lists only .json files", () => {
    expect(signalIds(signalsDir)).toContain("gemini-3.7-flash-usage-rates");
  });

  it("loads a signal file", () => {
    expect(loadSignal(signalsDir, "gemini-3.7-flash-usage-rates")).toEqual(
      FIXTURE_RESULT,
    );
  });
});
