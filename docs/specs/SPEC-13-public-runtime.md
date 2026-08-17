kind: iolo-spec/v1
id: SPEC-13-public-runtime
title: Public runtime for the first Signal
status: accepted
related_issue: "#13"
owner: PM
freshness: live
---

## Goal

Put the accepted Signal API/web/history surface online at a stable iolo.lol
production URL with the smallest reproducible architecture, without engine
implementation at request time.

## Requirements

- REQ-001: The product repository contains a reproducible static-site build
  (`pnpm --filter @iolo.lol/web build`, the SvelteKit static application under
  `apps/web`) that renders the canonical state under `data/signals/` into a
  deployable directory with the same JSON semantics as the local server:
  `index.html`, `api/v1/signals.json`, `api/v1/signals/<signalId>.json`, and
  `api/v1/signals/<signalId>.history.json` (paths mirror the product-owned
  data files).
- REQ-002: The surface is published to GitHub Pages (build from workflow)
  with stable paths `https://iolo-lol.github.io/iolo.lol/` and the
  `/api/v1/...` paths above; deployment runs on push to `main` and via manual
  dispatch.
- REQ-003: Generation and deployment use only the product repository; no
  engine repository access at build or request time.
- REQ-004: Deployed JSON output is equivalent to the product-owned canonical
  data; the rendered page shows values, source URL, `fetchedAt`,
  `contentHash`, and the change history.
- REQ-005: Product validation, generator tests, and CI remain green; the
  generator is covered by tests using fixture canonical data.

## Non-goals

- Site redesign, frontend framework, custom domain, dynamic API, or any
  request-time runtime.
- Expanding Signal coverage or moving engine logic into the product repo.

## Architecture constraints and references

- ADR-0003 (public runtime): static hosting decision and path contract.
- ADR-0002: canonical state is product-owned data entered via governed
  publication; the static site reads only that state.

## Dependencies

- Accepted canonical/history data from M2 (already in `data/signals/`).
- GitHub Pages enabled for the product repository (admin configuration).

## Unresolved questions

- None.
