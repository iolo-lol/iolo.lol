# Post-M8 roadmap reassessment

Status: recorded by PM for iolo-lol/engine#20 acceptance
Date: 2026-08-15
Owner: PM

## Evidence from the M8 coverage expansion

- M8 expanded coverage from five to seven Signals by the feasibility-first
  path: OpenAI gpt-5.6-sol (first-party; the M5 403 blocker cleared — the
  pricing page now serves static USD-per-1M-tokens tables) and DeepInfra
  Kimi-K3 (hosted Moonshot model, Together-AI precedent). Both additions flow
  through the existing shared projections with product-owned labels only —
  no parallel logic, no architecture expansion. QA-20 records pass evidence
  for every row.
- The expansion proved the extraction machinery: two new table structures
  (OpenAI flagship tables; DeepInfra serverless tables) are now covered by
  deterministic extractors with fixtures and loud-failure tests. Those same
  structures hold additional high-value, low-maintenance candidates —
  OpenAI's gpt-5.6-terra and gpt-5.6-luna sit in the same flagship table as
  gpt-5.6-sol, and DeepInfra's page carries DeepSeek-V4-Pro, Qwen3.8-Max,
  and the rest of the Kimi family at the same per-1M-token format.
- Most remaining first-party providers are still feasibility-blocked
  (Anthropic geo-block, Groq/Cerebras/Mistral/Perplexity non-static per-token
  pricing, Moonshot/Zhipu/AWS client-rendered) — but each carries a recorded
  revisit condition from SPEC-10 that can clear with source changes.

## Candidate directions

| Candidate | M8 evidence | Decision |
| --- | --- | --- |
| Continue provider/model expansion | Additional high-value low-maintenance candidates remain: same-table models in the two proven sources (OpenAI gpt-5.6-terra/luna; DeepInfra DeepSeek-V4-Pro/Qwen3.8-Max/Kimi family) at near-zero marginal maintenance, plus SPEC-10 revisit conditions on Anthropic/Groq/Cerebras/Mistral/Perplexity that can clear; the M7 direction (expand coverage) is now proven feasible | **Next milestone** — continue expansion along the proven, low-maintenance path and re-probe the deferred revisit conditions |
| Improve coverage quality/depth for existing providers/models | The OpenAI signal already models 8 dimensions (short/long context, cached input, cache writes) faithfully; no demonstrated quality gap to justify pivoting from breadth | Defer — revisit only if comparison usability evidence shows a depth problem |
| Generalize the proven Signal pipeline to another vertical | No evidence a second information vertical is wanted or feasibly ingestible; a platform bet, not a demonstrated bottleneck | Defer — unchanged from the post-M6/post-M7 reassessments |
| Pause Signals and ship the first Oddity | No demand evidence for Oddities; a product bet, not an evidence-based bottleneck | Defer — unchanged from the post-M5/post-M6/post-M7 reassessments |

## Decision

The next milestone is **continuing provider/model expansion** because M8
proved the feasibility-first path and additional high-value low-maintenance
candidates remain: the two accepted source structures can absorb more models
at near-zero marginal cost, and the SPEC-10 deferred candidates (Anthropic,
Groq, Cerebras, Mistral, Perplexity) have recorded revisit conditions that
may clear. Expansion stays bounded by deterministic-extraction feasibility —
no aggregators, no browser automation, no new infrastructure.

No M9+ backlog is created beyond this single milestone; the four candidates
above are resolved and none of the other three is implemented now.
