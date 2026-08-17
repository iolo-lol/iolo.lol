# iolo.lol

Public presentation and distribution repository for iolo.lol: public
contracts, web/API presentation, and community-facing surfaces. The project
roadmap, milestone planning, and architecture decisions live in the private
`iolo-lol/engine` repository; this repository is not the planning or roadmap
authority.

- **Signals**: structured, continuously updated information.
- **Oddities**: short-lived or experimental interactive content.

## Workspace

A pnpm monorepo:

| Package | Purpose |
| --- | --- |
| `packages/contracts` | Shared public contracts (JSON Schema) and validation machinery |
| `apps/web` | SvelteKit static application (fully prerendered) for Cloudflare Workers Static Assets |

## Live surface

The human-facing website is published at the canonical
<https://iolo.lol/> through Cloudflare Workers Static Assets
(`wrangler.jsonc` + Workers Builds from this repository; see ADR-0005).

Routes:

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
`apps/web/src/lib/meta.ts`; they never change canonical data or contracts.

## Reproducible local validation

Requires Node.js >= 24 and pnpm.

```sh
pnpm install
pnpm check   # typecheck + contract/schema validation tests
pnpm --filter @iolo.lol/web build   # render the SvelteKit static site into apps/web/build
pnpm preview   # build, then serve the static site locally via wrangler dev
```

## Deployment

The site deploys to Cloudflare Workers Static Assets from this repository
(`wrangler.jsonc`; assets-only, no Worker script). Workers Builds runs
`pnpm deploy` (build + `wrangler deploy`) on push to `main`;
non-production branches produce preview versions. The same command performs a
manual deploy after authenticating with `wrangler login`. Validate a
deployment without publishing with `npx wrangler deploy --dry-run`.

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
