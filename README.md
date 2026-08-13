# iolo.lol

Product repository for iolo.lol: public contracts, web/API presentation, and
community-facing surfaces. Private ingestion, automation, and editorial
implementation live in the separate `iolo-lol/engine` repository.

- **Signals**: structured, continuously updated information.
- **Oddities**: short-lived or experimental interactive content.

## Workspace

A pnpm monorepo:

| Package | Purpose |
| --- | --- |
| `packages/contracts` | Shared public contracts (JSON Schema) and validation machinery |

## Reproducible local validation

Requires Node.js >= 24 and pnpm.

```sh
pnpm install
pnpm check   # typecheck + contract/schema validation tests
```

## Documentation

- [`AGENTS.md`](AGENTS.md) — repository routing guide
- [`docs/architecture.md`](docs/architecture.md) — cross-repo architecture and contract ownership
- [`docs/agent-team.md`](docs/agent-team.md) — Agent Team contract
- [`docs/adr/`](docs/adr/README.md) — architecture decision records
