import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compileSchema, getValidator } from "../src/index.js";

const schemasDir = fileURLToPath(new URL("../schemas", import.meta.url));

function schemaFiles(): string[] {
  return readdirSync(schemasDir)
    .filter((name) => name.endsWith(".schema.json"))
    .sort();
}

describe("public contract schemas", () => {
  it("every schema is valid JSON Schema 2020-12", () => {
    const meta = getValidator().getSchema(
      "https://json-schema.org/draft/2020-12/schema",
    );
    if (!meta) {
      throw new Error("2020-12 meta-schema is not registered");
    }
    for (const file of schemaFiles()) {
      const schema = JSON.parse(
        readFileSync(path.join(schemasDir, file), "utf8"),
      );
      const valid = meta(schema) as boolean;
      expect(valid, `${file} must be valid JSON Schema 2020-12`).toBe(true);
    }
  });

  it("every schema declares examples and validates them", () => {
    const schemas = schemaFiles().map((file) => ({
      file,
      schema: JSON.parse(
        readFileSync(path.join(schemasDir, file), "utf8"),
      ) as { $id?: string; examples?: unknown[] },
    }));
    for (const { schema } of schemas) {
      if (schema.$id) getValidator().addSchema(schema as never);
    }
    for (const { file, schema } of schemas) {
      const validate = compileSchema(schema as never);
      const examples: unknown[] = schema.examples ?? [];
      expect(
        examples.length,
        `${file} must declare at least one example`,
      ).toBeGreaterThan(0);
      for (const example of examples) {
        const ok = validate(example);
        expect(
          ok,
          `${file} example must validate: ${validate.errors?.[0]?.message ?? ""}`,
        ).toBe(true);
      }
    }
  });
});

describe("validator machinery", () => {
  it("compiles and validates an inline schema", () => {
    const validate = compileSchema({
      type: "object",
      required: ["value"],
      properties: { value: { type: "string" } },
      additionalProperties: false,
    });
    expect(validate({ value: "ok" })).toBe(true);
    expect(validate({ value: 1 })).toBe(false);
  });
});
