kind: iolo-spec/v1
id: SPEC-7-signal-contract
title: First Signal contract and public surface
status: accepted
related_issue: "#7"
owner: PM
freshness: live
---

## Goal

Define the minimal product-owned normalized Result contract, the canonical
state representation, and the read API + web surface for the first Signal, so
a single official source can flow end-to-end into a published, verifiable
result without leaking engine implementation details.

## Requirements

- REQ-001: The product repository defines `packages/contracts/schemas/result.v1.schema.json`
  following the schema conventions (JSON Schema 2020-12, `$id`
  `https://iolo.lol/contracts/result/v1`, `title`, `description`, at least one
  valid `examples` entry). The contract suite validates the schema and its
  examples.
- REQ-002: A Result must carry: `schemaVersion`, a stable `signalId`, an
  `observedAt` timestamp, source identity (`source.url`), observation metadata
  (`source.fetchedAt`, `source.contentHash`), and the normalized `values`. The
  contract must not require any engine implementation type.
- REQ-003: Canonical signal state is product-owned data committed under
  `data/signals/<signalId>.json` in the product repository. Each file holds one
  Result conforming to the contract. The public surface reads only this state.
- REQ-004: The read API (served by `packages/web`, port 3000) exposes
  `GET /api/v1/signals` (list of signal ids) and `GET /api/v1/signals/:signalId`
  (the canonical Result), both sourced from the canonical state files.
- REQ-005: The web surface `GET /` presents the first Signal's values together
  with its source URL, `fetchedAt`, and `contentHash`, so a displayed value is
  traceable to source evidence.
- REQ-006: An unchanged observation must not produce a false change: the
  canonical file is updated only when the observed values differ from the
  current canonical values.
- REQ-007: The product repository must build, typecheck, and test from a clean
  checkout without any engine repository access.

## Non-goals

- LLM extraction, AI fallback, broad discovery, or generic crawling.
- More than one Signal for M1 (see SPEC-2-reference-pipeline).
- Historical analytics, provenance history, or change history (M2).
- Monetization. Oddities.

## Architecture constraints and references

- ADR-0001 (cross-repo boundary): public contracts are product-owned and
  engine-consumed; product surfaces never depend on engine internals.
- ADR-0002 (canonical signal state and publication boundary): canonical state
  is product-owned data; the engine produces it; publication into the product
  repository is an explicit governed action.
- `docs/architecture.md` contract ownership table.
- Engine-side counterpart: SPEC-2-reference-pipeline (engine repo).

## Dependencies

- Accepted ADR-0002 (canonical state and publication boundary).
- Engine pipeline implementation for engine#2 must produce Results conforming
  to the contract defined here.

## Unresolved questions

- Q-001 [product]: Exact presentation copy and layout of the first web page;
  to be resolved by PM during implementation review. Non-blocking for REQ-005.
