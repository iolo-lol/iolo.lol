kind: iolo-qa/v1
id: QA-20-cloudflare-deployment
spec: SPEC-20-cloudflare-deployment
related_issue: "#20"
status: passed
owner: QA
freshness: live
---

# Post-M4 QA proof strategy — Cloudflare Workers Static Assets deployment

Proves SPEC-20-cloudflare-deployment for the acceptance gate iolo.lol#20. QA
verifies the migration independently of Engineer summaries: the repository
deployment configuration, the dry-run/CI evidence, and the live Cloudflare
production surface.

## Verification record (2026-08-17)

The current `main` commit is `0669f3d`. `wrangler.jsonc` is assets-only (no
`main`, no bindings), `pnpm deploy` runs the SvelteKit build and
`wrangler deploy`, and CI run [32002782148](https://github.com/iolo-lol/iolo.lol/actions/runs/32002782148)
passes both `check` and `deploy-dry-run`. Cloudflare independently reports the
`iolo-lol` Worker with Static Assets and route `iolo.lol/*`, an enabled custom
domain, and Workers Builds connected to `iolo-lol/iolo.lol` on `main`; the
latest Workers Build for `0669f3d` succeeded. The Pages workflow has been
removed after cutover.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-20 REQ-001 | Generated site deploys reproducibly via Workers Static Assets from the public repo | integration + compatibility | fresh checkout: `pnpm install --frozen-lockfile`, `pnpm --filter @iolo.lol/web build`, `npx wrangler deploy --dry-run`, `pnpm deploy` | dry-run success; asset manifest equals generated `apps/web/build`; local, CI, and Workers Builds identical | pass | checkout + CI + successful Workers Build for `0669f3d` |
| SPEC-20 REQ-002 | `https://iolo.lol/` serves the human-facing product with valid TLS and stable canonical URLs via Cloudflare | integration + scenario | browser User-Agent route crawl; TLS certificate check; canonical URL crawl | 200, valid certificate, canonical URLs | pass | live Cloudflare Worker route and custom domain; curl is intentionally blocked by a zone security rule |
| SPEC-20 REQ-003 | Signal pages, `api/v1/*`, `feed.xml`, `sitemap.xml` reachable and match generated outputs | data + integration | compare live API/feed/sitemap with generated `apps/web/build` and probe Signal pages | byte-identical; all endpoints 200 | pass | live Cloudflare surface; API, feed, and sitemap byte-identical; Signal pages return 200 |
| SPEC-20 REQ-004 | Static asset delivery requires no Worker script | review | inspect `wrangler.jsonc` (no `main`, no bindings) | assets-only configuration | pass | config file (no `main`; dry-run reports "No bindings found") |
| SPEC-20 REQ-005 | Production does not depend on GitHub Pages; workflow removed or clearly temporary fallback | review + compatibility | inspect `.github/workflows/` and live Worker route | fallback removed after cutover | pass | `.github/workflows/pages.yml` is absent; production route is Cloudflare Workers Static Assets |
| SPEC-20 REQ-006 | GitHub CI green and validates deployable output | compatibility | GitHub Actions run 32002782148 at the accepted commit | check + deploy-dry-run jobs green | pass | CI runs on `main` at `0669f3d` |
| SPEC-20 REQ-007 | QA verifies Cloudflare deployment against canonical data and M4 human-facing behavior | scenario + data | browser User-Agent crawl over Cloudflare URLs; compare values/dates with `data/signals/*` | matches accepted M4 behavior | pass | live home, Signals, detail pages, API, feed, and sitemap verified |

## Data/editorial evidence plan

QA compares every deployed page value and date with product-owned canonical
`data/signals/*.json` and `.history.json` files at the accepted commit
(byte-identical API, feed, and sitemap output), and re-checks the M4
human-facing flows (home / Signals index / detail / history / changes, feed,
sitemap) on the Cloudflare surface.

## Acceptance gate

QA-20 passes because every row passes with fresh evidence on the Cloudflare
production surface, CI is green at the accepted commit, and the Pages
fallback workflow is removed.

## Known evidence boundary

Cloudflare account configuration, Workers Builds connection, custom-domain
binding, DNS pointing, and the live canonical surface are verified. The zone
has a custom security rule that blocks the `curl` User-Agent; browser
User-Agent requests are the valid live-surface probe. All seven requirements
pass and Issue #20 is complete.
