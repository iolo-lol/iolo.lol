import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  MODEL_IDENTITIES,
  identityForEverySignal,
  identityForSignal,
} from "../src/lib/model-identity.js";
import { signalIds, DEFAULT_SIGNALS_DIR } from "../src/lib/signals.js";

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

describe("model identity mapping (product-owned, M10 #25)", () => {
  it("maps every current canonical Signal to exactly one identity", () => {
    const ids = signalIds(DEFAULT_SIGNALS_DIR);
    expect(ids.length).toBeGreaterThan(0);
    expect(identityForEverySignal(ids)).toBe(true);
    const allSignals = MODEL_IDENTITIES.flatMap((i) =>
      i.offers.map((o) => o.signalId),
    );
    expect(new Set(allSignals).size).toBe(allSignals.length); // no duplicate signal
    for (const id of ids) {
      const identity = identityForSignal(id);
      expect(identity.offers.length).toBeGreaterThanOrEqual(1);
      expect(identity.offers.some((o) => o.signalId === id)).toBe(true);
    }
  });

  it("resolves DeepSeek V4 Flash to one exact identity with two provider offers", () => {
    const identity = identityForSignal("deepseek-v4-flash-usage-rates");
    expect(identity.id).toBe("deepseek-v4-flash");
    expect(identity.name).toBe("DeepSeek V4 Flash");
    expect(identity.developer).toBe("DeepSeek");
    expect(identity.offers.map((o) => o.provider)).toEqual([
      "DeepSeek",
      "DeepInfra",
    ]);
    // the DeepInfra offer points at the M10 same-source signal
    expect(identity.offers[1]?.signalId).toBe(
      "deepinfra-deepseek-v4-flash-usage-rates",
    );
  });

  it("never groups Flash/Pro/Max or family siblings as exact-equivalent", () => {
    const ids = MODEL_IDENTITIES.map((i) => i.id).sort();
    expect(ids).toContain("deepseek-v4-flash");
    expect(ids).toContain("deepseek-v4-pro");
    expect(ids).toContain("gpt-5.6-sol");
    expect(ids).toContain("gpt-5.6-terra");
    expect(ids).toContain("gpt-5.6-luna");
    expect(ids).toContain("qwen3.8-max");
    expect(ids).toContain("qwen3.8-2.4t-a95b");
    // every distinct identity is distinct
    expect(new Set(ids).size).toBe(ids.length);
    // the dated DeepSeek-V4-Flash-0731 variant is NOT a mapped identity
    expect(ids).not.toContain("deepseek-v4-flash-0731");
  });

  it("names the developer separately from the provider for hosted models", () => {
    for (const signalId of [
      "deepinfra-kimi-k3-usage-rates",
      "deepinfra-deepseek-v4-pro-usage-rates",
      "deepinfra-qwen3.8-max-usage-rates",
      "together-qwen3.8-2.4t-a95b-usage-rates",
    ]) {
      const identity = identityForSignal(signalId);
      expect(identity.developer).not.toBe(identity.offers[0]?.provider);
    }
  });

  it("resolves each Claude identity to two offers (Anthropic + DeepInfra), developer Anthropic", () => {
    const claudeIdentities: [string, string, string][] = [
      ["anthropic-fable-5-usage-rates", "fable-5", "deepinfra-claude-fable-5-usage-rates"],
      ["anthropic-opus-5-usage-rates", "opus-5", "deepinfra-claude-opus-5-usage-rates"],
      ["anthropic-sonnet-5-usage-rates", "sonnet-5", "deepinfra-claude-sonnet-5-usage-rates"],
      ["anthropic-haiku-4.5-usage-rates", "haiku-4.5", "deepinfra-claude-haiku-4-5-usage-rates"],
    ];
    for (const [signalId, identityId, deepInfraSignalId] of claudeIdentities) {
      const identity = identityForSignal(signalId);
      expect(identity.id).toBe(identityId);
      expect(identity.developer).toBe("Anthropic");
      expect(identity.offers.map((o) => o.provider)).toEqual([
        "Anthropic",
        "DeepInfra",
      ]);
      // the DeepInfra offer points at the M12 same-source signal
      expect(identity.offers[1]?.signalId).toBe(deepInfraSignalId);
      // the host (DeepInfra) is never presented as the model developer
      expect(identity.developer).not.toBe("DeepInfra");
    }
  });
});

describe("model-offers.v1 contract conformance", () => {
  it("validates its own examples", () => {
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
    for (const example of schema.examples ?? []) {
      const ok = validate(example);
      expect(
        ok,
        validate.errors?.[0]?.message ?? "example validation failed",
      ).toBe(true);
    }
  });
});
