kind: iolo-spec/v1
id: SPEC-20-cloudflare-deployment
title: Migrate public deployment to Cloudflare Workers Static Assets
status: accepted
related_issue: "#20"
owner: PM
freshness: live
---

## Goal

Move the production human-facing iolo.lol deployment from GitHub Pages to
Cloudflare Workers Static Assets (Cloudflare's current recommended static
deployment path), serving the accepted human-facing product from the
canonical `https://iolo.lol/` origin through Cloudflare, with no request-time
Worker logic.

## Requirements

- REQ-001: The generated site deploys reproducibly through Cloudflare Workers
  Static Assets from the public repository: a root `wrangler.jsonc` declares
  the assets directory with no Worker script, and the repository's `pnpm
  deploy` (generate + `wrangler deploy`) produces the same output locally and
  in Workers Builds.
- REQ-002: `https://iolo.lol/` serves the accepted human-facing product with
  valid TLS and stable canonical URLs through Cloudflare.
- REQ-003: Signal pages, `api/v1/*` JSON artifacts, `feed.xml`, and
  `sitemap.xml` are reachable on the Cloudflare-hosted production surface and
  match the generated public-repository outputs.
- REQ-004: Static asset delivery does not require a Worker script.
- REQ-005: Production no longer depends on GitHub Pages; its workflow is
  removed or clearly retained only as a temporary fallback during cutover.
- REQ-006: Existing GitHub CI remains green and validates the deployable
  output (`wrangler deploy --dry-run`).
- REQ-007: QA independently verifies the Cloudflare deployment against the
  same product-owned canonical data and human-facing behavior accepted in M4.

## Non-goals

- Reopening or redefining accepted M4.
- Moving ingestion/scheduling into Cloudflare.
- Adding Worker request handlers, SSR, D1, KV, R2, Queues, Workflows, or
  Cron merely because deployment moved to Cloudflare.
- Redesigning the accepted human-facing website.
- Changing canonical Signal data/contracts.

## Architecture constraints and references

- ADR-0005 (production runtime): Workers Static Assets serving decision;
  supersedes ADR-0003's GitHub Pages runtime while static hosting and the
  governed publication flow (ADR-0002) are preserved.
- ADR-0004: `https://iolo.lol/` is the canonical origin; all links and
  metadata use it.
- ADR-0002: canonical state is product-owned data entered through the
  governed publication boundary; the site reads only that state.

## Dependencies

- Cloudflare account with Workers Static Assets and Workers Builds access
  (operator action).
- Domain administration for `iolo.lol` DNS pointing at Cloudflare
  (domain-administration action).

## Unresolved questions

None. Cloudflare Workers Static Assets, Workers Builds, the `iolo.lol` custom
domain, and the live canonical surface were verified in QA-20.
