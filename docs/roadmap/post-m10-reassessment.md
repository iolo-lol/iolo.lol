# Post-M10 roadmap reassessment

Status: recorded by PM for iolo-lol/engine#28 acceptance
Date: 2026-08-16
Owner: PM

## Evidence from the M10 identity/offer product

- M10 separated exact model identity from provider offers: every canonical
  Signal now maps to one identity (developer + provider offers) via
  product-owned metadata, and the `/offers/` page + `/api/v1/model-offers/index.json`
  derive from canonical Signals + that metadata — no copied datastore, no
  ontology. QA-28 records pass evidence for every row.
- Exactly ONE exact-model multi-provider group is provable within M10
  boundaries: DeepSeek V4 Flash (DeepSeek first-party + DeepInfra hosted).
  The offers view for that group is genuinely useful — first-party cached
  input \$0.0028–\$0.014 (peak/off-peak conditional) versus DeepInfra
  \$0.018 cached — and the developer-vs-provider distinction is clear.
- The binding constraint is **the availability of authoritative routes for
  the same exact models**. No further exact overlap is provable from the
  current canonical set plus existing sources: DeepInfra's other rows
  (Gemini 3.5 Flash / 2.5 Flash, Claude models, DeepSeek dated variants,
  Qwen variants) have no exact first-party counterpart in the canonical set
  (first-party Gemini is 3.7 Flash; Anthropic first-party is geo-blocked;
  the -0731 dated variant is explicitly not groupable). Same-source
  expansion is near-saturated (M9), so direction 1's premise ("more
  authoritative overlaps are available") is not supported by current
  evidence.

## Candidate directions

| Candidate | M10 evidence | Decision |
| --- | --- | --- |
| Expand exact-model provider-route coverage | The offer view is useful, but no additional exact-model overlap is currently provable from existing sources and the current canonical set (DeepInfra's other hosted models lack exact first-party counterparts; Anthropic remains blocked) | Defer — no more overlaps are available without new authoritative routes |
| Improve general comparison/discovery now that identity is explicit | The identity layer is live, but no concrete usability gap in the general comparison was demonstrated in M10 | Defer — revisit if a specific gap emerges |
| **Return to feasibility-first new-provider scouting** | Offer coverage is limited by missing authoritative routes — the M10 result demonstrates this directly (one provable group; all other candidates lack a second route); the SPEC-10 revisit conditions (Anthropic geo-block, Groq/Cerebras/Mistral/Perplexity non-static pricing) are the concrete path to more routes and thus more exact-model groups | **Next milestone** — re-probe the deferred authoritative sources to unlock more provider routes and canonical Signals |
| Pause AI pricing and pursue another Signal vertical or first Oddity | Marginal value is not falling (the offer view proves useful), and Oddities still lack demand evidence | Defer — unchanged |

## Decision

The next milestone is **returning to feasibility-first new-provider scouting**
because the M10 offer view's coverage is limited by missing authoritative
routes — directly demonstrated by the single provable exact-model group. The
SPEC-10 deferred candidates (Anthropic, Groq, Cerebras, Mistral, Perplexity)
carry recorded revisit conditions; re-probing them with current evidence is
the concrete path to more authoritative routes, more canonical Signals, and
therefore more exact-model offer groups. Scouting stays bounded by
deterministic-extraction feasibility and the existing non-goals.

No M11+ backlog is created beyond this single milestone; the four candidates
above are resolved.
