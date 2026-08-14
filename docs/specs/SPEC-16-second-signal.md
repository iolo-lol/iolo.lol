kind: iolo-spec/v1
id: SPEC-16-second-signal
title: Second Signal — DeepSeek usage rates
status: specified
related_issue: "#16"
owner: PM
freshness: live
---

## Goal

Add one second authoritative AI-service Signal whose source structure differs
meaningfully from the Gemini reference, proving the public Signal model
generalizes without changing public contracts.

## PM selection rationale (recorded)

- **Source**: DeepSeek API official pricing page
  `https://api-docs.deepseek.com/quick_start/pricing` (static docs site,
  VitePress).
- **Why a useful generalization test**: the data representation is
  structurally different from Gemini — one transposed table (metric rows ×
  model columns) instead of per-model card sections; cache-hit/cache-miss
  input price fields; current prices plus an announced peak/off-peak billing
  switch with an effective date (multi-statement normalization); different
  provider platform and CDN (also tests network determinism).
- **Observable Signal**: `deepseek-v4-flash-usage-rates` — DeepSeek API model
  usage rates for `deepseek-v4-flash`, per 1M tokens, USD.
- **Normalized fields** (each with statements in reading order):
  - `input-price-cache-hit` — current, then off-peak/peak from the announced
    effective date.
  - `input-price-cache-miss` — same shape.
  - `output-price` — same shape.
  - Notes carry the source's own temporal/period qualifiers (effective date,
    peak hours).
- **Non-goals**: multi-model coverage (single reference model mirrors M1);
  other DeepSeek metrics (context length, concurrency, rate limits); other
  providers in M4.

## Requirements

- REQ-001: The second Signal's canonical Result and history validate against
  the existing product-owned `result.v1` and `history.v1` contracts (reused
  unchanged unless the Architect records a real semantic gap).
- REQ-002: Product-owned canonical state `data/signals/deepseek-v4-flash-usage-rates.json`
  and `.history.json` hold the published Result/history, entered through the
  governed publication boundary.
- REQ-003: The existing API and web surfaces expose the second Signal with
  full provenance (source URL, `fetchedAt`, `contentHash`) without code
  changes beyond the static generator's generic data rendering.
- REQ-004: The first Signal (gemini) behavior remains byte-compatible in
  canonical data and live surfaces.
- REQ-005: QA can trace published values back to the recorded official-source
  evidence (fixture + provenance).

## Non-goals

- Contract changes absent a demonstrated semantic gap.
- Generic source registry, broad coverage, AI extraction, site redesign.

## Architecture constraints and references

- ADR-0001/0002/0003 (product): contract ownership, canonical state, governed
  publication, static runtime.
- Engine counterpart: SPEC-5-second-source (engine repo).

## Dependencies

- engine#5 implementation producing the second Result/history.
- Accepted M3 surface (Pages + generator).

## Unresolved questions

- None.
