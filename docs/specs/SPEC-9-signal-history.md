kind: iolo-spec/v1
id: SPEC-9-signal-history
title: Public provenance and change history
status: specified
related_issue: "#9"
owner: PM
freshness: live
---

## Goal

Expose a Signal's change history through the product-owned contract and
public surfaces so consumers and QA can see where a published result came from
and how it changed over time — without exposing engine implementation.

## Requirements

- REQ-001: The product repository defines `packages/contracts/schemas/history.v1.schema.json`
  per schema conventions. It holds `schemaVersion`, `signalId`, and an ordered
  `entries` array; each entry carries `publishedAt` and a `result` that `$ref`s
  `https://iolo.lol/contracts/result/v1`. The suite validates the schema, its
  examples, and the cross-schema reference.
- REQ-002: Canonical history state is product-owned data at
  `data/signals/<signalId>.history.json`, one file per Signal, conforming to
  `history.v1`. The public surface reads only these files.
- REQ-003: The read API exposes `GET /api/v1/signals/:signalId/history`
  returning the `history.v1` document (404 for unknown signals).
- REQ-004: The web surface shows the change history for the first Signal,
  including each published result's values and its provenance (source URL,
  `fetchedAt`, `contentHash`) and `publishedAt`.
- REQ-005: The product repository builds and tests from a clean checkout with
  no engine access (no engine types in history contract or surfaces).

## Non-goals

- Scheduling, retry machinery, deduplication beyond history-append semantics.
- Multiple signals, source registry evolution, AI extraction.
- Engine-side storage or execution exposed publicly.

## Architecture constraints and references

- ADR-0001, ADR-0002: canonical state (latest and history) is product-owned
  data entered through the governed publication boundary.
- SPEC-7-signal-contract: the `result.v1` contract referenced by history.
- Engine counterpart: SPEC-3-history (engine repo).

## Dependencies

- SPEC-3-history implementation (engine#3) producing history documents.
- history.v1 published before the first history publication.

## Unresolved questions

- None.
