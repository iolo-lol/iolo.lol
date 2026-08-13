import Ajv2020, { type Schema } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export type { Schema } from "ajv/dist/2020.js";

let shared: Ajv2020 | null = null;

/**
 * Shared Ajv instance (JSON Schema draft 2020-12) with default formats
 * registered. Reused across compilations to cache compiled schemas.
 */
export function getValidator(): Ajv2020 {
  if (!shared) {
    shared = new Ajv2020({ strict: true, allErrors: true });
    addFormats(shared);
  }
  return shared;
}

/**
 * Compile a public contract schema into a validate function.
 */
export function compileSchema(schema: Schema) {
  return getValidator().compile(schema);
}
