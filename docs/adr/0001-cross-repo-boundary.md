# ADR-0001: Cross-repo boundary and contract ownership

- Status: Accepted
- Date: 2026-08-14
- Related: [Issue #1](https://github.com/iolo-lol/iolo.lol/issues/1),
  [Issue #5](https://github.com/iolo-lol/iolo.lol/issues/5)

## Context

iolo.lol is being bootstrapped across two empty repositories, `iolo-lol/iolo.lol`
and `iolo-lol/engine`, with no code yet. The project needs a stable boundary
between the public product surface and the private operational implementation
before the first Signal contract and its vertical slice are built. The split
must be durable so contracts, ADRs, and issue references stay unambiguous
across both repositories.

## Decision

Split the project by **visibility and operational responsibility**, not by
frontend/backend layering.

- `iolo-lol/iolo.lol` owns the public product surface: product, public
  contracts (Signals schema, web/API contracts, community-facing formats),
  web/API presentation, and community-facing content.
- `iolo-lol/engine` owns the private operational implementation: ingestion,
  automation, editorial logic, and operations.

Public contracts are owned by the product repository and flow to the engine,
which consumes them. The engine never publishes, forks, or unilaterally changes
public contracts. The product repository does not depend on engine internals;
public contracts remain valid without any private implementation detail.

ADRs that affect public contracts, the product surface, or the cross-repo
boundary live in the product repository under `docs/adr/`. ADRs that affect
only private engine implementation and operations live in the engine
repository. A boundary-changing decision is always a product-repo ADR.

Cross-repo issue references use the qualified form `owner/repo#number`;
unqualified `#number` refers to the current repository.

Deliberately not decided here: repository visibility timing (tracked by
[iolo.lol#11](https://github.com/iolo-lol/iolo.lol/issues/11)), the content of
the first Signal contract (tracked by
[iolo.lol#7](https://github.com/iolo-lol/iolo.lol/issues/7)), and workspace or
CI details (tracked by [iolo.lol#6](https://github.com/iolo-lol/iolo.lol/issues/6)
and [iolo-lol/engine#1](https://github.com/iolo-lol/engine/issues/1)).

## Consequences

Each repository has one clear owner for each contract class, so a change
either stays inside its repo or is a product-repo change. The engine can
evolve privately without changing public behavior, and the public surface can
be released without exposing engine internals. The cost is a deliberate
cross-repo review whenever a public contract changes: the engine must be
updated to consume the new contract.

## Compatibility impact

Public contracts must not require private engine implementation details.
Compatibility of a public contract is judged against the contract document in
this repository, never against an engine artifact.

## Open questions

The first real Signal will test whether the boundary is drawn at the right
height; adjustments must go through a new ADR in this repository.
