# iolo.lol Cross-repo Architecture and Contract Ownership

Status: live contract for [iolo.lol#5](https://github.com/iolo-lol/iolo.lol/issues/5)

This document defines the durable boundary between the product repository and
the engine repository, who owns which contracts, the direction dependencies
may flow, where ADRs live, and how cross-repo issue references are written.

## The boundary

The split is based on **visibility and operational responsibility**, not
frontend/backend layering.

| Repository | Visibility | Responsibility |
| --- | --- | --- |
| `iolo-lol/iolo.lol` | Public product surface | Product, public contracts, web/API presentation, community-facing surfaces |
| `iolo-lol/engine` | Private | Ingestion, automation, editorial logic, operational implementation |

A component belongs to the engine when it is operational implementation or
processes private data. A component belongs to the product repository when it
is part of the public product surface, even if it is backend code. Public
contracts must not require private engine implementation details.

## Contract ownership

| Contract class | Owner | Notes |
| --- | --- | --- |
| Public product contracts (Signals schema, web/API contracts, community-facing formats) | `iolo-lol/iolo.lol` | Consumed by the engine; changes require a product-repo change |
| Canonical signal state (`data/signals/*.json`) | `iolo-lol/iolo.lol` | Product-owned data conforming to public contracts; produced by the engine, entered only through the governed publication boundary ([ADR-0002](adr/0002-canonical-state-and-publication-boundary.md)) |
| Engine-internal contracts (ingestion, automation, editorial pipelines) | `iolo-lol/engine` | Never published; may change without a public surface change |
| Cross-repo boundary contract (this document) | `iolo-lol/iolo.lol` | The boundary decision is a public contract |

## Dependency direction

- Public contracts flow **from the product repository to the engine**: the
  engine consumes the product repo's public contracts.
- The engine implements and operates against those contracts but never
  publishes, forks, or unilaterally changes them.
- The product repository does not depend on engine internals. Public surfaces
  and contracts remain valid without any engine implementation detail.
- The engine may run independently of the product repo's presentation layer,
  but its external-facing outputs must conform to product-owned contracts.

## ADR ownership

- ADRs that affect public contracts, the product surface, or the cross-repo
  boundary live in `iolo-lol/iolo.lol` under [`docs/adr/`](adr/README.md).
- ADRs that affect only private engine implementation and operations live in
  `iolo-lol/engine`.
- A decision that changes the boundary itself is a product-repo ADR and
  supersedes any engine-internal assumption to the contrary.

## Cross-repo issue references

- References to an issue in the other repository use the qualified form
  `owner/repo#number`, for example `iolo-lol/engine#1`.
- Unqualified `#number` references an issue in the current repository.
- Parent/sub-issue links and `Depends on:` / `Related roadmap:` lines use the
  same qualified form so the roadmap stays readable from either repository.

## Related authorities

* [Architecture decision records](adr/README.md), especially
  [ADR-0001: Cross-repo boundary and contract ownership](adr/0001-cross-repo-boundary.md)
* [Agent Team contract](agent-team.md)
* [Repository routing guide](../AGENTS.md)
* [GitHub issue iolo.lol#1](https://github.com/iolo-lol/iolo.lol/issues/1) and [#5](https://github.com/iolo-lol/iolo.lol/issues/5)
