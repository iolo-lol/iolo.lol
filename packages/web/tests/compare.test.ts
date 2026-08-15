import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildComparison, comparisonFromSignalsDir } from "../src/compare.js";
import { DEFAULT_SIGNALS_DIR } from "../src/server.js";

// ajv publishes CJS whose default-export types are interop-fragile under
// NodeNext module resolution; bridge via createRequire with structural types.
interface SchemaValidator {
  (data: unknown): boolean;
  errors?: { message?: string }[] | null;
}
type AjvConstructor = new (opts?: Record<string, unknown>) => {
  compile(schema: unknown): SchemaValidator;
};
type FormatsPlugin = (ajv: unknown, options?: unknown) => unknown;
const require = createRequire(import.meta.url);
const Ajv2020Ctor = require("ajv/dist/2020.js").default as AjvConstructor;
const addFormats = require("ajv-formats").default as FormatsPlugin;

/**
 * These tests drive the real projection function against the real canonical
 * Signal files in data/signals/ — no fixtures, no mocked inputs.
 */

describe("comparison projection (from real canonical Signals)", () => {
  it("projects all five canonical Signals with identity and provenance", () => {
    const doc = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    expect(doc.entries.map((e) => e.signalId)).toEqual([
      "cohere-command-r-plus-08-2024-usage-rates",
      "deepseek-v4-flash-usage-rates",
      "gemini-3.7-flash-usage-rates",
      "together-qwen3.8-2.4t-a95b-usage-rates",
      "xai-grok-4.6-usage-rates",
    ]);
    for (const entry of doc.entries) {
      expect(entry.provider.length).toBeGreaterThan(0);
      expect(entry.model.length).toBeGreaterThan(0);
      expect(entry.source.url.startsWith("https://")).toBe(true);
      expect(entry.source.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(entry.dimensions.length).toBeGreaterThan(0);
    }
  });

  it("preserves every DeepSeek window statement verbatim per dimension", () => {
    const doc = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const deepseek = doc.entries.find(
      (e) => e.signalId === "deepseek-v4-flash-usage-rates",
    );
    expect(deepseek).toBeDefined();
    const dims = new Map(deepseek!.dimensions.map((d) => [d.name, d]));
    for (const name of [
      "input-price-cache-hit",
      "input-price-cache-miss",
      "output-price",
    ]) {
      const dim = dims.get(name);
      expect(dim, `${name} must be present`).toBeDefined();
      expect(dim!.statements).toHaveLength(3);
      expect(dim!.statements.map((s) => s.note)).toEqual([
        "through 16:00 UTC on August 16, 2026",
        "off-peak from 16:00 UTC on August 16, 2026",
        "peak (01:00 - 04:00 and 06:00 - 10:00 UTC (all other hours are off-peak)) from 16:00 UTC on August 16, 2026",
      ]);
      expect(dim!.statements.map((s) => s.value).every((v) => v > 0)).toBe(
        true,
      );
    }
    // exact canonical values, in canonical reading order
    expect(dims.get("input-price-cache-hit")!.statements.map((s) => s.value)).toEqual([
      0.0028, 0.007, 0.014,
    ]);
    expect(dims.get("input-price-cache-miss")!.statements.map((s) => s.value)).toEqual([
      0.14, 0.22, 0.44,
    ]);
    expect(dims.get("output-price")!.statements.map((s) => s.value)).toEqual([
      0.28, 0.66, 1.32,
    ]);
  });

  it("preserves both Gemini dated statements (temporary/future-effective)", () => {
    const doc = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const gemini = doc.entries.find(
      (e) => e.signalId === "gemini-3.7-flash-usage-rates",
    );
    expect(gemini).toBeDefined();
    const input = gemini!.dimensions.find((d) => d.name === "input-price");
    expect(input!.statements).toEqual([
      { value: 0.75, note: "through December 31, 2026." },
      { value: 1.5, note: "starting January 1, 2027." },
    ]);
    const output = gemini!.dimensions.find((d) => d.name === "output-price");
    expect(output!.statements).toEqual([
      { value: 3.75, note: "through December 31, 2026." },
      { value: 7.5, note: "starting January 1, 2027." },
    ]);
  });

  it("keeps the Together cached-input rate with its note and simple prices simple", () => {
    const doc = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const together = doc.entries.find(
      (e) => e.signalId === "together-qwen3.8-2.4t-a95b-usage-rates",
    );
    const cached = together!.dimensions.find(
      (d) => d.name === "input-price-cache-hit",
    );
    expect(cached!.statements).toEqual([{ value: 0.5, note: "cached" }]);

    for (const signalId of [
      "cohere-command-r-plus-08-2024-usage-rates",
      "xai-grok-4.6-usage-rates",
      "together-qwen3.8-2.4t-a95b-usage-rates",
    ]) {
      const entry = doc.entries.find((e) => e.signalId === signalId);
      for (const dim of entry!.dimensions) {
        expect(
          dim.statements.length,
          `${signalId} ${dim.name} must stay a simple single statement`,
        ).toBe(1);
      }
    }
  });

  it("does not invent a single current value where a note-qualified statement exists", () => {
    const doc = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    for (const entry of doc.entries) {
      for (const dim of entry.dimensions) {
        // every statement from the canonical source survives; nothing is
        // reduced, flattened, or guessed
        expect(dim.statements.length).toBeGreaterThanOrEqual(1);
        for (const s of dim.statements) {
          expect(typeof s.value).toBe("number");
          expect(typeof s.note).toBe("string");
        }
      }
    }
  });

  it("generates byte-identical output across two runs", () => {
    const first = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const second = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    expect(JSON.stringify(first, null, 2)).toBe(JSON.stringify(second, null, 2));
  });
});

describe("comparison projection contract conformance", () => {
  it("validates against comparison.v1.schema.json", () => {
    const schema = JSON.parse(
      readFileSync(
        fileURLToPath(
          new URL(
            "../../contracts/schemas/comparison.v1.schema.json",
            import.meta.url,
          ),
        ),
        "utf8",
      ),
    );
    const ajv = new Ajv2020Ctor({ strict: true, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const doc = comparisonFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const ok = validate(doc);
    expect(ok, validate.errors?.[0]?.message ?? "schema validation failed").toBe(
      true,
    );
  });

  it("keeps statement reading order (first = currently applicable)", () => {
    // Statements must survive in canonical reading order; sorting them would
    // change which value is "current". The real canonical DeepSeek and Gemini
    // documents above already pin the exact order; this asserts the contract
    // invariant on the pure function with a constructed input.
    const doc = buildComparison([
      {
        schemaVersion: 1,
        signalId: "z-test-signal",
        observedAt: "2026-08-15T00:00:00Z",
        source: {
          url: "https://example.com/pricing",
          fetchedAt: "2026-08-15T00:00:00Z",
          contentHash:
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        values: [
          {
            name: "output-price",
            unit: "per-1m-tokens",
            currency: "USD",
            statements: [
              { value: 10, note: "first" },
              { value: 1, note: "second" },
            ],
          },
        ],
      },
    ]);
    expect(doc.entries[0]!.dimensions[0]!.statements).toEqual([
      { value: 10, note: "first" },
      { value: 1, note: "second" },
    ]);
  });
});
