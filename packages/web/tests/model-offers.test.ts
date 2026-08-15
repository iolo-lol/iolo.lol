import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildModelOffers, offersFromSignalsDir } from "../src/model-offers.js";
import { DEFAULT_SIGNALS_DIR } from "../src/server.js";

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
 * These tests drive the real offers projection against the real canonical
 * Signal files in data/signals/ — no fixtures, no mocked inputs.
 */

describe("model-offers projection (real canonical Signals)", () => {
  it("groups every canonical Signal into exactly one identity", () => {
    const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const totalOffers = doc.groups.reduce((n, g) => n + g.offers.length, 0);
    // twelve canonical Signals -> twelve offers across the groups
    expect(totalOffers).toBe(12);
    const bySignal = new Map(
      doc.groups.flatMap((g) => g.offers.map((o) => [o.signalId, g])),
    );
    for (const g of doc.groups) {
      for (const o of g.offers) {
        expect(bySignal.get(o.signalId)?.identityId).toBe(g.identityId);
        expect(o.source.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect(o.dimensions.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves DeepSeek V4 Flash to one identity with two authoritative offers", () => {
    const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const flash = doc.groups.find((g) => g.identityId === "deepseek-v4-flash");
    expect(flash).toBeDefined();
    expect(flash!.developer).toBe("DeepSeek");
    expect(flash!.offers.map((o) => o.provider)).toEqual([
      "DeepSeek",
      "DeepInfra",
    ]);
    const firstParty = flash!.offers.find(
      (o) => o.signalId === "deepseek-v4-flash-usage-rates",
    );
    // conditional statements preserved verbatim
    expect(firstParty!.dimensions.length).toBe(3);
    const cacheHit = firstParty!.dimensions.find(
      (d) => d.name === "input-price-cache-hit",
    );
    expect(cacheHit!.statements).toHaveLength(3);
    expect(cacheHit!.statements[0]).toEqual({
      value: 0.0028,
      note: "through 16:00 UTC on August 16, 2026",
    });
    const deepInfra = flash!.offers.find(
      (o) => o.signalId === "deepinfra-deepseek-v4-flash-usage-rates",
    );
    expect(deepInfra!.provider).toBe("DeepInfra");
    expect(deepInfra!.source.url).toBe("https://deepinfra.com/pricing");
    const diInput = deepInfra!.dimensions.find((d) => d.name === "input-price");
    expect(diInput!.statements).toEqual([{ value: 0.09, note: "" }]);
  });

  it("never groups Flash/Pro/Max or family siblings as exact-equivalent", () => {
    const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const ids = doc.groups.map((g) => g.identityId);
    for (const id of [
      "deepseek-v4-flash",
      "deepseek-v4-pro",
      "gpt-5.6-sol",
      "gpt-5.6-terra",
      "gpt-5.6-luna",
      "qwen3.8-max",
      "qwen3.8-2.4t-a95b",
    ]) {
      expect(ids).toContain(id);
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("deepseek-v4-flash-0731");
    // only DeepSeek V4 Flash has more than one offer
    const multi = doc.groups.filter((g) => g.offers.length > 1);
    expect(multi.map((g) => g.identityId)).toEqual(["deepseek-v4-flash"]);
  });

  it("preserves developer-vs-provider attribution for hosted models", () => {
    const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const cases: { identityId: string; host: string }[] = [
      { identityId: "deepseek-v4-flash", host: "DeepInfra" },
      { identityId: "deepseek-v4-pro", host: "DeepInfra" },
      { identityId: "kimi-k3", host: "DeepInfra" },
      { identityId: "qwen3.8-max", host: "DeepInfra" },
      { identityId: "qwen3.8-2.4t-a95b", host: "Together AI" },
    ];
    for (const { identityId, host } of cases) {
      const group = doc.groups.find((g) => g.identityId === identityId);
      expect(group).toBeDefined();
      const hosted = group!.offers.find((o) => o.provider === host);
      expect(hosted, `${identityId} must have a ${host} offer`).toBeDefined();
      // the host is never presented as the model developer
      expect(group!.developer).not.toBe(host);
    }
    // the first-party DeepSeek offer correctly has provider == developer
    const flash = doc.groups.find((g) => g.identityId === "deepseek-v4-flash");
    const firstParty = flash!.offers.find(
      (o) => o.provider === "DeepSeek",
    );
    expect(firstParty).toBeDefined();
    expect(flash!.developer).toBe("DeepSeek");
  });

  it("generates byte-identical output across two runs", () => {
    const first = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const second = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    expect(JSON.stringify(first, null, 2)).toBe(
      JSON.stringify(second, null, 2),
    );
  });

  it("validates against model-offers.v1.schema.json", () => {
    const schema = JSON.parse(
      readFileSync(
        fileURLToPath(
          new URL(
            "../../contracts/schemas/model-offers.v1.schema.json",
            import.meta.url,
          ),
        ),
        "utf8",
      ),
    );
    const ajv = new Ajv2020Ctor({ strict: true, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const ok = validate(doc);
    expect(ok, validate.errors?.[0]?.message ?? "schema validation failed").toBe(
      true,
    );
  });
});

describe("model-offers projection (pure function)", () => {
  function signal(signalId: string, value = 1) {
    return {
      schemaVersion: 1,
      signalId,
      observedAt: "2026-08-16T00:00:00Z",
      source: {
        url: `https://example.com/${signalId}`,
        fetchedAt: "2026-08-16T00:00:00Z",
        contentHash:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
      values: [
        {
          name: "input-price",
          unit: "per-1m-tokens",
          currency: "USD",
          statements: [{ value, note: "" }],
        },
      ],
    };
  }

  it("skips offers whose canonical Signal is absent", () => {
    // first-party V4 Flash only: the DeepInfra offer is not yet published
    const doc = buildModelOffers([signal("deepseek-v4-flash-usage-rates")]);
    const flash = doc.groups.find((g) => g.identityId === "deepseek-v4-flash");
    expect(flash?.offers.map((o) => o.provider)).toEqual(["DeepSeek"]);
  });
});
