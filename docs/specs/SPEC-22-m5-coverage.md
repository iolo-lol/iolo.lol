kind: iolo-spec/v1
id: SPEC-22-m5-coverage
title: Expand Signal coverage to five providers
status: in-progress
related_issue: "#22"
owner: PM
freshness: live
---

## Goal

Advance iolo.lol through one bounded M5 milestone: expand the AI
usage/pricing Signal vertical from the two accepted providers (Google Gemini,
DeepSeek) to a useful multi-provider coverage set of exactly five, reusing
the accepted engine pipeline, contracts, and human-facing site unchanged,
then stop for reassessment.

## Requirements

- REQ-001: Exactly three new Signals are accepted into the engine signal map
  (five total), each with a source-specific deterministic extractor kept
  private in the engine, a pinned fixture with provenance (URL, fetchedAt,
  sha256), and unit tests reproducing extraction deterministically.
- REQ-002: All five Signals expose canonical Result + history in the public
  repo's `data/signals/`, entered only via the governed publication path
  (agent-staged payloads validated against result.v1/history.v1 before
  commit), conforming to the unchanged contracts.
- REQ-003: The existing human-facing IA (index/detail/history/recent-changes),
  Atom feed, sitemap, canonical JSON/API artifacts, provenance, and stable
  URLs work for the five-Signal coverage with no new UI concepts.
- REQ-004: No Source Registry, LLM extraction fallback, generic crawling,
  queues/workflows, hosted scheduling, D1/KV/R2, dynamic web backend, or
  website redesign is introduced; the local Agent routes work but does not
  become the source of canonical facts and does not bypass deterministic
  validation or PublishPolicy.
- REQ-005: Independent QA records an evidence-backed verdict for: all five
  Signals vs authoritative source evidence; deterministic reproduction;
  unchanged/no-false-change; error/no-write; local Agent across the expanded
  set; governed publication; canonical/history correctness; human
  site/API/feed/sitemap; Cloudflare production deployment; both repos' CI.
- REQ-006: A post-M5 reassessment resolves the five candidate directions
  (Source Registry; comparison/discovery UI; broader provider/topic
  expansion; AI-assisted discovery/extraction; first Oddity) without
  implementing any, and creates only the next milestone supported by M5
  operating evidence.

## PM selection rationale (2026-08-15)

Three sources selected from live evidence probing, not a vendor checklist:

| Signal | Source | User value | First-party authority | Stability | Structural diversity | Deterministic extraction |
| --- | --- | --- | --- | --- | --- | --- |
| `xai-grok-4.6-usage-rates` | https://docs.x.ai/docs/models | Frontier model usage rates | xAI official developer docs | Stable docs URL | Per-model card (Context/Input/Output/Reasoning rows) | Server-rendered card; verified fixture sha256 `ead567c4...` |
| `cohere-command-r-plus-08-2024-usage-rates` | https://cohere.com/pricing | Enterprise LLM usage rates | Official Cohere pricing page | Stable prose pattern across all listed Command models | Prose/paragraph pricing (only non-table source) | Exact sentence match; Sanity CMS script payload stripped (visible copy authoritative) |
| `together-qwen3.8-2.4t-a95b-usage-rates` | https://www.together.ai/pricing | Most-used open-weight family; hosted price is what users pay | Together AI official pricing (authoritative for its own API prices) | Static server-rendered table | Multi-model table with cached-input price column | Table row parse; verified fixture sha256 `a0bb04f9...` |

Rejected after probing: OpenAI (HTTP 403), Anthropic (geo-blocked "App
unavailable in region"), Mistral/Moonshot/Zhipu (client-side rendered, no
pricing in raw HTML), AWS Bedrock (prices loaded by JS). All model names are
verbatim from the recorded pages.

## Non-goals

- Reopening or redefining accepted M4 or the QA-20 Cloudflare cutover.
- Implementing any of the five post-M5 candidates (they are resolved in the
  reassessment only).
- Website redesign or new UI concepts unless expanded coverage demonstrates a
  concrete usability problem (none is assumed).
- LLM extraction fallback, generic crawling, queues/workflows, hosted
  scheduling, D1/KV/R2, dynamic web backend, or changing
  result.v1/history.v1 contracts / canonical data semantics.
- Adding more than exactly three new Signals.

## Architecture constraints and references

- ADR-0002: canonical state is product-owned data entered through the
  governed publication boundary; the engine stages, the product commits.
- ADR-0005: production runtime is Cloudflare Workers Static Assets
  (unchanged for M5); the site generator renders any canonical data set.
- Engine ADR-0003 (local Agent control plane): the Agent selects and routes
  due work; it never writes the product checkout and never bypasses
  deterministic validation or PublishPolicy.
- result.v1 / history.v1: unchanged; new Signals reuse them as-is.

## Dependencies

- Accepted engine pipeline, contracts, and site renderer (generalized by the
  second Signal; M5 adds map entries, extractors, fixtures, tests, config,
  and meta labels only).
- Cloudflare account/DNS for the live QA rows (already named as the sole
  blocker in #20; unchanged for M5).

## Unresolved questions

- None for the product scope; the QA-20 Cloudflare blocker and the operator
  scheduling-agent dependency remain named external actions (recorded in
  QA-20 and QA-22 evidence boundaries).
