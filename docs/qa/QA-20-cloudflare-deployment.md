kind: iolo-qa/v1
id: QA-20-cloudflare-deployment
spec: SPEC-20-cloudflare-deployment
related_issue: "#20"
status: planned
owner: QA
freshness: live
---

# Post-M4 QA proof strategy — Cloudflare Workers Static Assets deployment

Proves SPEC-20-cloudflare-deployment for the acceptance gate iolo.lol#20. QA
verifies the migration independently of Engineer summaries: the repository
deployment configuration, the dry-run/CI evidence, and — once the Cloudflare
account/domain administration lands — the live Cloudflare production surface.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-20 REQ-001 | Generated site deploys reproducibly via Workers Static Assets from the public repo | integration + compatibility | fresh checkout: `pnpm install --frozen-lockfile`, `pnpm --filter @iolo.lol/web generate`, `npx wrangler deploy --dry-run`, `pnpm deploy` (local) | dry-run success; asset manifest equals generated `packages/web/site`; local and CI identical | planned | checkout + CI |
| SPEC-20 REQ-002 | `https://iolo.lol/` serves the human-facing product with valid TLS and stable canonical URLs via Cloudflare | integration + scenario | `curl -I https://iolo.lol/`; TLS certificate check; canonical URL crawl | 200, valid certificate, canonical URLs | planned | live Cloudflare surface (blocked until DNS/account admin) |
| SPEC-20 REQ-003 | Signal pages, `api/v1/*`, `feed.xml`, `sitemap.xml` reachable and match generated outputs | data + integration | diff deployed JSON/feed/sitemap vs `data/signals/*` and generated `packages/web/site` | byte-identical; all endpoints 200 | planned | live surface + checkout |
| SPEC-20 REQ-004 | Static asset delivery requires no Worker script | review | inspect `wrangler.jsonc` (no `main`, no bindings) | assets-only configuration | planned | config file |
| SPEC-20 REQ-005 | Production does not depend on GitHub Pages; workflow removed or clearly temporary fallback | review + compatibility | inspect `.github/workflows/pages.yml` header and live Pages state | fallback clearly marked; removed after cutover | planned | workflow + repo |
| SPEC-20 REQ-006 | GitHub CI green and validates deployable output | compatibility | GitHub Actions runs at the accepted commit | check + deploy-dry-run jobs green | planned | CI runs |
| SPEC-20 REQ-007 | QA verifies Cloudflare deployment against canonical data and M4 human-facing behavior | scenario + data | headless Chromium over Cloudflare URLs; compare values/dates with `data/signals/*` | matches accepted M4 behavior | planned | live surface + checkout |

## Data/editorial evidence plan

QA compares every deployed page value and date with product-owned canonical
`data/signals/*.json` and `.history.json` files at the accepted commit
(byte-identical API output), and re-checks the M4 human-facing flows (home /
Signals index / detail / history / changes, feed, sitemap) on the Cloudflare
surface.

## Acceptance gate

QA-20 passes when all rows pass with fresh evidence on the Cloudflare
production surface, CI is green at the accepted commit, and the Pages
fallback is removed or explicitly retained per REQ-005.

## Known evidence boundary

Cloudflare account configuration (Worker creation, Workers Builds
connection, custom-domain binding) and `iolo.lol` DNS pointing are
operator/domain-administration actions outside the repository. Until they
land, REQ-002/003/007 evidence is blocked and recorded as such; the identical
build is verified locally and in CI via dry-run, and against the Pages
fallback during cutover.
