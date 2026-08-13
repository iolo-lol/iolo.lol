# ADR-0003: Public runtime — static hosting of canonical signal state

- Status: Accepted
- Date: 2026-08-14
- Related: [Issue #12](https://github.com/iolo-lol/iolo.lol/issues/12),
  [Issue #13](https://github.com/iolo-lol/iolo.lol/issues/13),
  [ADR-0002](0002-canonical-state-and-publication-boundary.md),
  [SPEC-13-public-runtime](../specs/SPEC-13-public-runtime.md)

## Context

M2 proved the product-owned Signal surface (read API, web page, change
history) serving canonical state from `data/signals/*` with durable
provenance. M3 must make that surface reachable through a stable production
URL. The canonical data is product-owned committed JSON; the web surface is a
tiny Node server with no request-time engine dependency (ADR-0001/0002). The
milestone deliberately avoids site redesign, source expansion, and new
runtime infrastructure without evidence.

## Decision

Host the public surface as a **static site on GitHub Pages**
(`build_type: workflow`) served from the product repository:

- A reproducible generator in `packages/web` renders the canonical state into
  a deployable directory: `index.html` (same rendering as the local server)
  and API files with the same JSON semantics as the local server's endpoints,
  at paths that mirror the product-owned data files:
  `api/v1/signals.json` (list), `api/v1/signals/<signalId>.json` (canonical),
  and `api/v1/signals/<signalId>.history.json` (history). The `.json` suffix
  avoids file/directory path collisions on a static filesystem and gives
  consumers an unambiguous content type.
- Deployment is triggered by a push to `main` (and manual dispatch for
  verification): install product dependencies, run the generator, upload the
  artifact, publish via `actions/deploy-pages`. No engine repository access is
  used at build or request time.
- The stable production paths are
  `https://iolo-lol.github.io/iolo.lol/` and the `/api/v1/...` paths above.
  No custom domain is configured.
- The API is served as static JSON files; there is no request-time server,
  queue, database, or function runtime.

Deliberately not decided here: a custom domain, a dynamic/server-side API, a
CDN beyond GitHub's, and any other runtime; each requires new evidence.

## Consequences

- Near-zero operating cost and no runtime operations; the surface updates by
  the same governed publication flow that enters canonical state (ADR-0002).
- Deployment is reproducible and reviewable from the product repository.
- Enabling Pages for the repository is repository administration
  (configuration), not a change to the public/private boundary.

## Compatibility impact

Public API paths and contracts are unchanged from the accepted M2 surface;
the generator and the local server consume the same product-owned data with
the same semantics.

## Open questions

Whether a custom domain or dynamic hosting becomes necessary is a product
decision for a later milestone, informed by M3 operating evidence
(iolo.lol#12).
