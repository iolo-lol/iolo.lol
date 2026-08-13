# Public contract schemas

Canonical, language-neutral public contracts for iolo.lol, expressed as
[JSON Schema draft 2020-12](https://json-schema.org/draft/2020-12/schema).
The engine repository consumes these files as the public contract source of
truth; see [`docs/architecture.md`](../../docs/architecture.md).

## Conventions

- One contract per file, named `<name>.v<major>.schema.json`, for example
  `result.v1.schema.json`.
- `$id` is `https://iolo.lol/contracts/<name>/v<major>` and matches the file
  name.
- Every schema declares `title`, `description`, and at least one valid
  `examples` entry. The validation suite executes the examples.
- A breaking change to a contract is a new major version (a new file), never
  an in-place edit of an accepted contract.

## Adding a contract

1. Add `<name>.v1.schema.json` following the conventions above.
2. Run `pnpm check` — the suite validates the schema and its examples.
3. TS types and product-repo validators are derived when the first contract
   is accepted ([iolo.lol#7](https://github.com/iolo-lol/iolo.lol/issues/7)).
