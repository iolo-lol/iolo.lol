# ADR-0005: Production runtime — Cloudflare Workers Static Assets

- Status: Accepted
- Date: 2026-08-15
- Related: [Issue #20](https://github.com/iolo-lol/iolo.lol/issues/20),
  [ADR-0003](0003-public-runtime-static-hosting.md) (superseded),
  [ADR-0004](0004-canonical-domain-and-human-ia.md),
  [SPEC-20-cloudflare-deployment](../specs/SPEC-20-cloudflare-deployment.md)

## Context

M3/M4 served the public surface from GitHub Pages (ADR-0003) and fixed the
canonical origin at `https://iolo.lol/` (ADR-0004). Cloudflare continues to
support Pages, but its current guidance recommends Workers Static Assets for
new static/full-stack projects. iolo.lol needs only static assets and
generated JSON/feed/sitemap output, so the serving runtime can move to
Workers Static Assets without introducing request-time Worker logic. Issue
#20 directs the migration and prefers Cloudflare Workers Builds/Git
integration from the public repository unless a better external path is
recorded; none is.

## Decision

1. **Serving runtime**: the production surface is deployed as **Cloudflare
   Workers Static Assets** (assets-only). `wrangler.jsonc` at the repository
   root declares the assets directory (`apps/web/build`, produced by the
   SvelteKit static build — [engine#44](https://github.com/iolo-lol/engine/issues/44)),
   trailing-slash HTML handling, and the generated 404 page; it declares no
   `main` entry, so
   static asset delivery does not require a Worker script. If concrete
   evidence later shows a Worker is necessary, that is a new decision.
2. **Build/deploy path**: deployment uses **Cloudflare Workers Builds/Git
   integration** from the public `iolo-lol/iolo.lol` repository. The root
   directory is the repository root; the deploy command is the repository's
   `pnpm deploy` script (SvelteKit static build + `wrangler deploy`). Workers
   Builds installs dependencies from the pnpm lockfile and deploys on push to
   `main`; non-production branch builds create preview versions, preserving
   review capability without a dynamic backend.
3. **Canonical origin**: `https://iolo.lol/` remains the canonical production
   origin (ADR-0004 unchanged). A Cloudflare custom domain binds `iolo.lol`
   to the Worker; pointing the domain's DNS at Cloudflare is a
   domain-administration action outside repository scope. The SvelteKit
   static build preserves the stable paths: `/signals/...`, `api/v1/...`,
   `feed.xml`, `sitemap.xml`.
4. **GitHub Pages**: the Pages deployment becomes a temporary fallback during
   cutover only. `.github/workflows/pages.yml` is retained and marked as such;
   it is removed once QA verifies the Cloudflare production surface and DNS
   serves `iolo.lol` from Cloudflare.
5. **CI**: GitHub Actions remains the repository CI (`pnpm check`) and gains
   a deploy dry-run job (`wrangler deploy --dry-run`) proving the generated
   site is a reproducible Workers Static Assets deployment without publishing.

Deliberately not decided here: moving ingestion/scheduling into Cloudflare,
adding any Worker runtime surface, DNS provider/record specifics (a
domain-administration decision), and changing canonical Signal data or
contracts.

## Consequences

- The production surface is served by Cloudflare's recommended static path
  with near-zero operating cost and no runtime operations; the surface still
  updates by the same governed publication flow (ADR-0002).
- Deployment is reproducible and reviewable from the public repository; the
  same `wrangler.jsonc` and `pnpm deploy` are used locally and by Workers
  Builds.
- A temporary Pages fallback keeps the existing serving path live during
  cutover; removing it is follow-up after QA verification.
- Cloudflare account configuration and `iolo.lol` DNS pointing remain
  external operator/domain-administration actions; acceptance records them as
  an evidence boundary until they land.

## Compatibility impact

Public API paths, contracts, canonical URLs, feed, and sitemap are unchanged.
`feed.xml` and `sitemap.xml` link origins remain `https://iolo.lol/`.
Static-file content types follow Cloudflare's extension mapping
(`application/json`, `application/xml`); the Atom feed is byte-identical to
the generated output, and its serving content type is verified in QA-20 as an
evidence boundary. GitHub Pages remains available as a fallback during
cutover.

## Open questions

- None for the architecture; Cloudflare account creation, Workers Builds
  connection, custom-domain binding, and DNS pointing are tracked as
  operator/domain-administration actions (SPEC-20 Q-001/Q-002).
