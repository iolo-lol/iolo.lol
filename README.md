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
| `packages/web` | Read API + web surface; static-site generator for GitHub Pages |

## Live surface

The human-facing website is published at the canonical
<https://iolo.lol/> (GitHub Pages project URL
<https://iolo-lol.github.io/iolo.lol/> is the implementation/deployment
detail). Pages:

- `/` — home: what iolo.lol is, what Signals are, current Signals, recent changes
- `/signals/` — Signals index with human-readable names
- `/signals/<signalId>/` — Signal detail: current state, freshness, source
- `/signals/<signalId>/history/` — readable change history
- `/changes/` — recent changes across all Signals

Machine-readable endpoints:

- `api/v1/signals.json` — published signal ids
- `api/v1/signals/<signalId>.json` — canonical Result
- `api/v1/signals/<signalId>.history.json` — change history
- `feed.xml` — Atom change feed
- `sitemap.xml` — public page index

Canonical data lives in `data/signals/` and is entered through the governed
publication boundary (see `docs/adr/0002-canonical-state-and-publication-boundary.md`).
Human-readable signal names are product-owned presentation state in
`packages/web/src/meta.ts`; they never change canonical data or contracts.

## Reproducible local validation

Requires Node.js >= 24 and pnpm.

```sh
pnpm install
pnpm check   # typecheck + contract/schema validation tests
pnpm --filter @iolo.lol/web generate   # render the static site into packages/web/site
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the contribution path, local
validation, and public-contract conventions.

## License

Licensed under the [GNU Affero General Public License v3.0 or later](LICENSE)
(AGPL-3.0-or-later).

## Documentation

- [`AGENTS.md`](AGENTS.md) — repository routing guide
- [`docs/architecture.md`](docs/architecture.md) — cross-repo architecture and contract ownership
- [`docs/agent-team.md`](docs/agent-team.md) — Agent Team contract
- [`docs/adr/`](docs/adr/README.md) — architecture decision records
