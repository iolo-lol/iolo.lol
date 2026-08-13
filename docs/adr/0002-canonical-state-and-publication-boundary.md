# ADR-0002: Canonical signal state and publication boundary

- Status: Accepted
- Date: 2026-08-14
- Related: [Issue #2](https://github.com/iolo-lol/iolo.lol/issues/2),
  [Issue #7](https://github.com/iolo-lol/iolo.lol/issues/7),
  [ADR-0001](0001-cross-repo-boundary.md),
  [SPEC-7-signal-contract](../specs/SPEC-7-signal-contract.md)

## Context

The first Signal vertical slice must expose a canonical result through a read
API and web surface ([#2](../AGENTS.md)). M0 established that public contracts
are product-owned and that the product surface must not depend on engine
internals (ADR-0001). M1 must decide where canonical signal state lives and
how it changes over time, so that the engine can produce results without the
product surface depending on the private engine, and without the engine
self-authorizing publication.

## Decision

- Canonical signal state is **product-owned data**: one file per Signal,
  `data/signals/<signalId>.json`, committed in the product repository, each
  holding a Result conforming to a product-owned contract
  (`result.v1.schema.json`). The public surface (API and web) reads only these
  files.
- The engine **produces** canonical payloads: its pipeline emits the payload
  and a verdict (`unchanged` or `change`). It never writes to the product
  repository directly.
- **Publication** is an explicit governed action: a canonical payload enters
  the product repository through a reviewed change (commit/PR) performed by an
  authorized actor (human, or the controller executing an already-authorized
  write). The engine, its agents, and automated/AI components have no direct
  write path into the product repository; this preserves the rule that
  automated components produce Results and publication authority is enforced
  by an explicit boundary.
- The canonical file is updated only when the observed values differ from the
  current canonical values; an unchanged observation leaves the file untouched.

Deliberately not decided here: automated publication scheduling, provenance
history, change history, and idempotent publish/reconciliation machinery are
M2 candidates and require evidence from the accepted M1 slice.

## Consequences

- The public surface remains valid and testable without any engine access,
  satisfying ADR-0001. The engine's output is verifiable against the same
  contract the surface consumes.
- Publication requires a governed product-repo change; in M1 this is manual.
  M2 may automate the decision and delivery path behind the same boundary.
- The engine must be able to read the current canonical state (or receive it)
  to compute the change verdict; the product repository remains the source of
  truth for that state.
- Duplicate/inconsistent canonical states are prevented by the contract
  (additionalProperties: false) and by the change-verdict rule, not by any
  engine-side write locking.

## Compatibility impact

No existing contract changes. The public contract surface gains `result.v1`
(see SPEC-7-signal-contract). Engine consumption path (ADR-0001) is
unchanged: engine consumes product-owned contracts and now also reads
product-owned canonical state.

## Open questions

Whether the change verdict and canonical update can be fully automated
(engine-initiated, policy-checked) without violating the publication boundary
is answered by M2 evidence (iolo.lol#3).
