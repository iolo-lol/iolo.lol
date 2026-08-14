# Architecture Decision Records

ADRs record decisions that affect iolo.lol's public contracts or the
cross-repo boundary. They complement, rather than replace, the normative
contracts in [`architecture.md`](../architecture.md) and the
[Agent Team contract](../agent-team.md).

## Conventions

* Files use a zero-padded sequence and a short title, for example
  `0001-cross-repo-boundary.md`.
* An ADR starts as `Proposed` and becomes `Accepted` when the decision is the
  repository's current contract. `Superseded` ADRs remain for history and link
  to the decision that replaces them.
* An accepted ADR is not rewritten to hide history. A material change gets a
  new ADR, and the old record links to it.
* Decisions state their scope, consequences, compatibility impact, and open
  questions. They describe observable constraints rather than implementation
  guesses.
* New ADRs should link to the affected architecture document and to any
  superseded or related decision.
* ADRs that affect only private engine implementation and operations belong in
  the `iolo-lol/engine` repository; see
  [`architecture.md`](../architecture.md) for ADR ownership.

## Index

* [ADR template](0000-template.md)
* [ADR-0001: Cross-repo boundary and contract ownership](0001-cross-repo-boundary.md)
* [ADR-0002: Canonical signal state and publication boundary](0002-canonical-state-and-publication-boundary.md)
* [ADR-0003: Public runtime — static hosting of canonical signal state](0003-public-runtime-static-hosting.md)
* [ADR-0004: Canonical production domain and human-facing information architecture](0004-canonical-domain-and-human-ia.md)
