import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildChanges, changesFromSignalsDir } from "../src/changes.js";
import { DEFAULT_SIGNALS_DIR, signalIds } from "../src/server.js";

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
 * These tests drive the real projection against the real canonical Signal
 * current+history files in data/signals/ — no fixtures, no mocked inputs —
 * plus pure-function invariants of the diff mechanism on representative
 * consecutive snapshots.
 */

describe("changes projection (real canonical Signals)", () => {
  it("runs over all sixteen canonical Signals and emits zero observed records from single-snapshot history", () => {
    // the projection loads every canonical current+history file in data/signals/
    const ids = signalIds(DEFAULT_SIGNALS_DIR);
    expect(ids).toHaveLength(16);
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const observed = doc.records.filter((r) => r.kind === "observed");
    expect(observed).toEqual([]);
    // every record carries provenance and presentation identity
    for (const record of doc.records) {
      expect(record.provider.length).toBeGreaterThan(0);
      expect(record.model.length).toBeGreaterThan(0);
      expect(record.source.url.startsWith("https://")).toBe(true);
      expect(record.source.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  it("emits no change records for the single-snapshot M9 additions", () => {
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    for (const id of [
      "openai-gpt-5.6-terra-usage-rates",
      "openai-gpt-5.6-luna-usage-rates",
      "deepinfra-deepseek-v4-pro-usage-rates",
      "deepinfra-qwen3.8-max-usage-rates",
    ]) {
      // no future-effective notes and no consecutive snapshots: no records
      expect(doc.records.filter((r) => r.signalId === id)).toEqual([]);
    }
  });

  it("emits exactly the canonical upcoming records", () => {
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const upcoming = doc.records.filter((r) => r.kind === "upcoming");
    expect(
      upcoming.map((r) => `${r.signalId}/${r.dimension.name}`),
    ).toEqual([
      "deepseek-v4-flash-usage-rates/input-price-cache-hit",
      "deepseek-v4-flash-usage-rates/input-price-cache-miss",
      "deepseek-v4-flash-usage-rates/output-price",
      "gemini-3.7-flash-usage-rates/input-price",
      "gemini-3.7-flash-usage-rates/output-price",
    ]);
  });

  it("preserves Gemini before/after values with verbatim notes and no invented instant", () => {
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const input = doc.records.find(
      (r) =>
        r.signalId === "gemini-3.7-flash-usage-rates" &&
        r.dimension.name === "input-price",
    );
    expect(input!.dimension.before).toEqual([
      { value: 0.75, note: "through December 31, 2026." },
    ]);
    expect(input!.dimension.after).toEqual([
      { value: 1.5, note: "starting January 1, 2027." },
    ]);
    // date-only note: no safe instant, verbatim note keeps it unambiguous
    expect(input!.effectiveAt).toBeUndefined();
    expect(input!.provider).toBe("Google");
    expect(input!.model).toBe("Gemini 3.7 Flash");
    expect(input!.source.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);

    const output = doc.records.find(
      (r) =>
        r.signalId === "gemini-3.7-flash-usage-rates" &&
        r.dimension.name === "output-price",
    );
    expect(output!.dimension.before).toEqual([
      { value: 3.75, note: "through December 31, 2026." },
    ]);
    expect(output!.dimension.after).toEqual([
      { value: 7.5, note: "starting January 1, 2027." },
    ]);
  });

  it("preserves DeepSeek one before + both conditional after values verbatim", () => {
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    for (const name of [
      "input-price-cache-hit",
      "input-price-cache-miss",
      "output-price",
    ]) {
      const record = doc.records.find(
        (r) =>
          r.signalId === "deepseek-v4-flash-usage-rates" &&
          r.dimension.name === name,
      );
      expect(record, `${name} must be present`).toBeDefined();
      expect(record!.dimension.before).toHaveLength(1);
      expect(record!.dimension.after.map((s) => s.note)).toEqual([
        "off-peak from 16:00 UTC on August 16, 2026",
        "peak (01:00 - 04:00 and 06:00 - 10:00 UTC (all other hours are off-peak)) from 16:00 UTC on August 16, 2026",
      ]);
      expect(record!.effectiveAt).toBe("2026-08-16T16:00:00Z");
    }
    const hit = doc.records.find(
      (r) =>
        r.signalId === "deepseek-v4-flash-usage-rates" &&
        r.dimension.name === "input-price-cache-hit",
    );
    expect(hit!.dimension.before).toEqual([
      { value: 0.0028, note: "through 16:00 UTC on August 16, 2026" },
    ]);
    expect(hit!.dimension.after.map((s) => s.value)).toEqual([0.007, 0.014]);
  });

  it("never treats a concurrent condition (Together cached) as a change", () => {
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const together = doc.records.filter(
      (r) => r.signalId === "together-qwen3.8-2.4t-a95b-usage-rates",
    );
    expect(together).toEqual([]);
    const cohere = doc.records.filter(
      (r) => r.signalId === "cohere-command-r-plus-08-2024-usage-rates",
    );
    expect(cohere).toEqual([]);
    const xai = doc.records.filter(
      (r) => r.signalId === "xai-grok-4.6-usage-rates",
    );
    expect(xai).toEqual([]);
  });
});

describe("changes projection diff mechanism (pure function)", () => {
  function snapshot(
    signalId: string,
    values: {
      name: string;
      unit: string;
      currency: string;
      statements: { value: number; note: string }[];
    }[],
    publishedAt: string,
  ) {
    return {
      publishedAt,
      result: {
        schemaVersion: 1,
        signalId,
        observedAt: publishedAt,
        source: {
          url: "https://example.com/pricing",
          fetchedAt: publishedAt,
          contentHash:
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        values,
      },
    };
  }

  function input(historyEntries: ReturnType<typeof snapshot>[]) {
    return {
      signal: {
        schemaVersion: 1,
        signalId: "z-test-signal",
        observedAt: historyEntries.at(-1)!.result.observedAt,
        source: historyEntries.at(-1)!.result.source,
        values: historyEntries.at(-1)!.result.values,
      },
      history: {
        schemaVersion: 1,
        signalId: "z-test-signal",
        entries: historyEntries,
      },
    };
  }

  it("a materially differing pair emits one record with correct before/after", () => {
    const doc = buildChanges([
      input([
        snapshot(
          "z-test-signal",
          [
            {
              name: "input-price",
              unit: "per-1m-tokens",
              currency: "USD",
              statements: [{ value: 1, note: "" }],
            },
          ],
          "2026-08-01T00:00:00Z",
        ),
        snapshot(
          "z-test-signal",
          [
            {
              name: "input-price",
              unit: "per-1m-tokens",
              currency: "USD",
              statements: [{ value: 2, note: "" }],
            },
          ],
          "2026-08-02T00:00:00Z",
        ),
      ]),
    ]);
    expect(doc.records).toHaveLength(1);
    const record = doc.records[0]!;
    expect(record.kind).toBe("observed");
    expect(record.dimension.before).toEqual([{ value: 1, note: "" }]);
    expect(record.dimension.after).toEqual([{ value: 2, note: "" }]);
    expect(record.publishedAt).toBe("2026-08-02T00:00:00Z");
    expect(record.observedAt).toBe("2026-08-02T00:00:00Z");
  });

  it("an identical pair emits no record", () => {
    const same = snapshot(
      "z-test-signal",
      [
        {
          name: "input-price",
          unit: "per-1m-tokens",
          currency: "USD",
          statements: [{ value: 1, note: "" }],
        },
      ],
      "2026-08-01T00:00:00Z",
    );
    const doc = buildChanges([
      input([same, { ...same, publishedAt: "2026-08-02T00:00:00Z" }]),
    ]);
    expect(doc.records).toEqual([]);
  });

  it("statement/order-only differences emit no record", () => {
    const doc = buildChanges([
      input([
        snapshot(
          "z-test-signal",
          [
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
          "2026-08-01T00:00:00Z",
        ),
        snapshot(
          "z-test-signal",
          [
            {
              name: "output-price",
              unit: "per-1m-tokens",
              currency: "USD",
              statements: [
                { value: 1, note: "second" },
                { value: 10, note: "first" },
              ],
            },
          ],
          "2026-08-02T00:00:00Z",
        ),
      ]),
    ]);
    // same material (value, note) multiset -> no change
    expect(doc.records).toEqual([]);
  });

  it("added and removed dimensions emit records with an empty side", () => {
    const doc = buildChanges([
      input([
        snapshot(
          "z-test-signal",
          [
            {
              name: "input-price",
              unit: "per-1m-tokens",
              currency: "USD",
              statements: [{ value: 1, note: "" }],
            },
          ],
          "2026-08-01T00:00:00Z",
        ),
        snapshot(
          "z-test-signal",
          [
            {
              name: "input-price",
              unit: "per-1m-tokens",
              currency: "USD",
              statements: [{ value: 1, note: "" }],
            },
            {
              name: "output-price",
              unit: "per-1m-tokens",
              currency: "USD",
              statements: [{ value: 5, note: "" }],
            },
          ],
          "2026-08-02T00:00:00Z",
        ),
      ]),
    ]);
    expect(doc.records).toHaveLength(1);
    expect(doc.records[0]!.dimension.name).toBe("output-price");
    expect(doc.records[0]!.dimension.before).toEqual([]);
    expect(doc.records[0]!.dimension.after).toEqual([
      { value: 5, note: "" },
    ]);
  });
});

describe("changes projection determinism", () => {
  it("generates byte-identical output across runs", () => {
    const first = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const second = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    expect(JSON.stringify(first, null, 2)).toBe(
      JSON.stringify(second, null, 2),
    );
  });
});

describe("changes projection contract conformance", () => {
  it("validates against changes.v1.schema.json", () => {
    const schema = JSON.parse(
      readFileSync(
        fileURLToPath(
          new URL(
            "../../contracts/schemas/changes.v1.schema.json",
            import.meta.url,
          ),
        ),
        "utf8",
      ),
    );
    const ajv = new Ajv2020Ctor({ strict: true, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const doc = changesFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const ok = validate(doc);
    expect(ok, validate.errors?.[0]?.message ?? "schema validation failed").toBe(
      true,
    );
  });
});
