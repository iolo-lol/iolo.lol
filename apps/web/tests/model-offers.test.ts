import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildModelOffers, offersFromSignalsDir } from "../src/lib/model-offers.js";
import { DEFAULT_SIGNALS_DIR } from "../src/lib/signals.js";

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
    // twenty-four canonical Signals -> twenty-four offers across the groups
    expect(totalOffers).toBe(24);
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
    // only DeepSeek V4 Flash and the four Claude exact counterparts have
    // more than one offer
    const multi = doc.groups.filter((g) => g.offers.length > 1);
    expect(multi.map((g) => g.identityId)).toEqual([
      "deepseek-v4-flash",
      "fable-5",
      "opus-5",
      "sonnet-5",
      "haiku-4.5",
    ]);
  });

  it("resolves each Claude identity to exactly one group with two offers (Anthropic + DeepInfra)", () => {
    const doc = offersFromSignalsDir(DEFAULT_SIGNALS_DIR);
    const deepInfraHash =
      "sha256:d8c69b68339e1fd766a5832ef405ea76d26291f7065a32b108de3f8e210cebd4";
    for (const [
      identityId,
      anthropicSignalId,
      deepInfraSignalId,
    ] of [
      ["fable-5", "anthropic-fable-5-usage-rates", "deepinfra-claude-fable-5-usage-rates"],
      ["opus-5", "anthropic-opus-5-usage-rates", "deepinfra-claude-opus-5-usage-rates"],
      ["sonnet-5", "anthropic-sonnet-5-usage-rates", "deepinfra-claude-sonnet-5-usage-rates"],
      ["haiku-4.5", "anthropic-haiku-4.5-usage-rates", "deepinfra-claude-haiku-4-5-usage-rates"],
    ]) {
      const groups = doc.groups.filter((g) => g.identityId === identityId);
      expect(groups).toHaveLength(1);
      const group = groups[0]!;
      expect(group.developer).toBe("Anthropic");
      expect(group.offers).toHaveLength(2);
      expect(group.offers.map((o) => o.provider)).toEqual([
        "Anthropic",
        "DeepInfra",
      ]);
      const firstParty = group.offers.find(
        (o) => o.signalId === anthropicSignalId,
      );
      // Anthropic first-party conditional statements preserved verbatim
      for (const dim of firstParty!.dimensions) {
        for (const s of dim.statements) {
          expect(s.note).toBe("Save 50% with batch processing.");
        }
      }
      const deepInfra = group.offers.find(
        (o) => o.signalId === deepInfraSignalId,
      );
      expect(deepInfra!.source.url).toBe("https://deepinfra.com/pricing");
      expect(deepInfra!.source.contentHash).toBe(deepInfraHash);
      // DeepInfra serves no cached-input price for Claude rows
      expect(deepInfra!.dimensions.map((d) => d.name).sort()).toEqual([
        "input-price",
        "output-price",
      ]);
      const byName = new Map(
        deepInfra!.dimensions.map((d) => [d.name, d]),
      );
      if (identityId === "sonnet-5") {
        // the sonnet-5 DeepInfra offer carries the verbatim authoritative
        // promotional condition on both statements (blocker fix #38)
        expect(byName.get("input-price")?.statements).toEqual([
          {
            value: 2,
            note: "Promotional launch pricing in effect through August 31, 2026",
          },
        ]);
        expect(byName.get("output-price")?.statements).toEqual([
          {
            value: 10,
            note: "Promotional launch pricing in effect through August 31, 2026",
          },
        ]);
      } else {
        // the other three Claude counterparts declare no condition
        expect(byName.get("input-price")?.statements).toEqual([
          { value: expect.any(Number), note: "" },
        ]);
        expect(byName.get("output-price")?.statements).toEqual([
          { value: expect.any(Number), note: "" },
        ]);
      }
    }
    // unrelated single-offer groups are unchanged
    const gemini = doc.groups.find((g) => g.identityId === "gemini-3.7-flash");
    expect(gemini?.offers).toHaveLength(1);
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
            "../../../packages/contracts/schemas/model-offers.v1.schema.json",
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
