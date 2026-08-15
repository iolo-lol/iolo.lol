# Post-M5 roadmap reassessment

Status: recorded by PM for iolo.lol#22 acceptance
Date: 2026-08-15
Owner: PM

## Evidence from the five-Signal product

- Five live Signals (Gemini 3.7 Flash, DeepSeek V4 Flash, Grok 4.6, Command
  R+ 08-2024, Qwen3.8-2.4T-A95B usage rates) with canonical Result + history
  entered through the governed publication path; local Agent runs across the
  five-Signal set record `orchestrator=local-agent` and stage payloads
  without writing the product checkout.
- Three new source structures generalized cleanly (per-model card, prose
  sentence, multi-model table with cached-input column) with deterministic
  fixture reproduction (contentHash == recorded sha256) and no contract,
  renderer, or PublishPolicy change.
- The expansion also surfaced a hard constraint: several high-value sources
  are not deterministically extractable from raw HTML — OpenAI (HTTP 403),
  Anthropic (geo-blocked "App unavailable in region"), Mistral/Moonshot/Zhipu
  (client-side rendered), AWS Bedrock (prices loaded by JS). Provider
  selection is bounded by page structure, not by demand.

## Candidate directions

| Candidate | M5 evidence | Decision |
| --- | --- | --- |
| Minimal Source Registry | Five explicit map entries with bespoke extractors; zero generic machinery; no coordination pain point observed (each source still needs bespoke extraction) | Defer — revisit only when a shared extraction need or coordination problem appears (no threshold adopted) |
| Better comparison/discovery UI | Five cards on the index remain readable; no overflow or navigation problem demonstrated at five | Defer — revisit when coverage grows or site-usage evidence shows a concrete usability problem |
| Broader provider/topic expansion | The pipeline, agent, contracts, and renderer generalized to five structurally diverse sources with no code change beyond map/extractor/fixture/meta; remaining expansion is bounded by deterministic-extraction feasibility | **Next milestone** — the demonstrated bottleneck is coverage; expand within the vertical to additional deterministically extractable sources, reusing the proven pipeline unchanged |
| AI-assisted discovery/extraction | No evidence the deterministic extractors fail (all five reproduce from pinned fixtures); an LLM dependency would weaken the core guarantee | Defer — reconsider only if a high-value source proves not deterministically extractable |
| First Oddity | No demand evidence; a product bet, not a bottleneck | Defer |

## Decision

The next milestone is **expanding Signal coverage within the AI
usage/pricing vertical**, reusing the accepted engine pipeline, contracts,
and static site unchanged — the only candidate that removes the demonstrated
coverage gap with low risk and no new infrastructure, now proven to
generalize across five structurally diverse sources. It is constrained by
deterministic-extraction feasibility: candidate sources must be probed for
static, first-party pricing pages before acceptance, exactly as in M5.

No M6+ backlog is created beyond this single milestone; the five candidates
above are resolved and none of them is implemented now.
