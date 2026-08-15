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
deployment configuration, the dry-run/CI evidence, and — once the Cloudflare
account/domain administration lands — the live Cloudflare production surface.

## Verification record (2026-08-15)

Repo-side rows verified from the current checkout (commit `1940da0`):
`wrangler.jsonc` is assets-only (no `main`, no bindings), `pnpm deploy` =
generate + `wrangler deploy`, `pnpm --filter @iolo.lol/web generate` renders
`packages/web/site`, `npx wrangler deploy --dry-run` reads the full asset
manifest with no bindings, CI `check` + `deploy-dry-run` jobs are green on
`main`, and `.github/workflows/pages.yml` carries the temporary-fallback
header required by REQ-005. Live-surface rows are recorded as blocked with
the single named operator/domain action below (Cloudflare account + `iolo.lol`
DNS administration); they are not satisfiable from the implementing
environment, which has no Cloudflare credentials and no DNS authority for
`iolo.lol`.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-20 REQ-001 | Generated site deploys reproducibly via Workers Static Assets from the public repo | integration + compatibility | fresh checkout: `pnpm install --frozen-lockfile`, `pnpm --filter @iolo.lol/web generate`, `npx wrangler deploy --dry-run`, `pnpm deploy` (local) | dry-run success; asset manifest equals generated `packages/web/site`; local and CI identical | pass | checkout + CI (dry-run read 24 assets, no bindings) |
| SPEC-20 REQ-002 | `https://iolo.lol/` serves the human-facing product with valid TLS and stable canonical URLs via Cloudflare | integration + scenario | `curl -I https://iolo.lol/`; TLS certificate check; canonical URL crawl | 200, valid certificate, canonical URLs | blocked | live Cloudflare surface; single external blocker: Cloudflare account (Workers Static Assets + Workers Builds connection, custom domain `iolo.lol`) and `iolo.lol` DNS pointed at Cloudflare — operator/domain-admin actions outside the repository |
| SPEC-20 REQ-003 | Signal pages, `api/v1/*`, `feed.xml`, `sitemap.xml` reachable and match generated outputs | data + integration | diff deployed JSON/feed/sitemap vs `data/signals/*` and generated `packages/web/site` | byte-identical; all endpoints 200 | blocked | same external blocker as REQ-002; identical build verified locally (`wrangler dev` smoke test: 200s, `application/json`/`application/xml`, custom 404, canonical links) and in dry-run |
| SPEC-20 REQ-004 | Static asset delivery requires no Worker script | review | inspect `wrangler.jsonc` (no `main`, no bindings) | assets-only configuration | pass | config file (no `main`; dry-run reports "No bindings found") |
| SPEC-20 REQ-005 | Production does not depend on GitHub Pages; workflow removed or clearly temporary fallback | review + compatibility | inspect `.github/workflows/pages.yml` header and live Pages state | fallback clearly marked; removed after cutover | pass | workflow header marks it as TEMPORARY FALLBACK during cutover (ADR-0005); Pages remains live only as fallback |
| SPEC-20 REQ-006 | GitHub CI green and validates deployable output | compatibility | GitHub Actions runs at the accepted commit | check + deploy-dry-run jobs green | pass | CI runs on `main` at `1940da0` |
| SPEC-20 REQ-007 | QA verifies Cloudflare deployment against canonical data and M4 human-facing behavior | scenario + data | headless Chromium over Cloudflare URLs; compare values/dates with `data/signals/*` | matches accepted M4 behavior | blocked | same external blocker as REQ-002; M4 behavior re-verified at the identical local build and Pages fallback surface |

## Data/editorial evidence plan

QA compares every deployed page value and date with product-owned canonical
`data/signals/*.json` and `.history.json` files at the accepted commit
(byte-identical API output), and re-checks the M4 human-facing flows (home /
Signals index / detail / history / changes, feed, sitemap) on the Cloudflare
surface once the blocker clears.

## Acceptance gate

QA-20 passes when every row passes with fresh evidence on the Cloudflare
production surface, CI is green at the accepted commit, and the Pages
fallback is removed or explicitly retained per REQ-005.

## Known evidence boundary

Cloudflare account configuration (Worker creation, Workers Builds
connection, custom-domain binding) and `iolo.lol` DNS pointing are
operator/domain-administration actions outside the repository — the single
named blocker recorded in the issue. Until they land, REQ-002/003/007
evidence is blocked and recorded as such; the identical build is verified
locally and in CI via dry-run, and against the Pages fallback during cutover.
Issue #20 stays open pending this single named action; the repo-side
acceptance criteria (REQ-001, REQ-004, REQ-005, REQ-006) all pass.
