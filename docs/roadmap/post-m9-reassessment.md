# Post-M9 roadmap reassessment

Status: recorded by PM for iolo-lol/engine#23 acceptance
Date: 2026-08-15
Owner: PM

## Evidence from the M9 same-source expansion

- M9 grew coverage from seven to eleven Signals at near-zero marginal
  source-maintenance cost by reusing the two proven source shapes: GPT-5.6
  Terra and GPT-5.6 Luna complete the OpenAI flagship family, and
  DeepSeek-V4-Pro and Qwen3.8-Max are the remaining high-value DeepInfra
  models (Kimi-K3 already covered in M8). The OpenAI and DeepInfra parsers
  were parameterized through shared model-selection/price-parsing helpers —
  no copied parsers, no generic registry. QA-23 records pass evidence for
  every row.
- The same-source well is now near the "clearly useful" bar: the OpenAI
  flagship table is fully harvested, and the remaining DeepInfra rows are
  older/lower-value generations (DeepSeek-V3.x, Llama-4, gemma-4, phi-4,
  Nemotron) that would be catalog padding.
- **The M9 evidence triggers the M10 activation gate (#24)**: the same exact
  models are now represented through multiple authoritative providers/routes.
  DeepSeek V4 Flash exists as a first-party Signal
  (`deepseek-v4-flash-usage-rates` from api-docs.deepseek.com) *and* in the
  DeepInfra table (`DeepSeek-V4-Flash`); Gemini 3.5 Flash / 2.5 Flash exist
  first-party *and* in the DeepInfra table; Claude models appear via DeepInfra
  (claude-opus-5, claude-sonnet-5) while Anthropic first-party remains
  geo-blocked. With four hosted (DeepInfra) Signals, provider-vs-developer
  attribution is a real comparison concern — the two-part question "what does
  this exact model cost through each authoritative provider?" is now
  answerable and material.

## Candidate directions

| Candidate | M9 evidence | Decision |
| --- | --- | --- |
| Continue same-source breadth | The OpenAI flagship family is complete and the remaining DeepInfra rows are lower-value older generations; substantial high-value zero-cost models do not remain | Defer — the same-source well is near saturation at the clearly-useful bar |
| **Activate the M10 model/provider identity and routing plan** | M9 evidence satisfies #24's activation gate: the same exact models (DeepSeek V4 Flash, Gemini 3.5 Flash, …) are represented through multiple authoritative providers/routes, and hosted-model coverage makes provider-vs-developer ambiguity materially relevant to comparison | **Next milestone** — activate #24: separate model identity from provider routes over the existing canonical Signals |
| Return to feasibility-first new-provider scouting | The SPEC-10 revisit conditions (Anthropic geo-block, Groq/Cerebras/Mistral non-static pricing) have not cleared; new-provider scouting offers less certain value than resolving the now-material cross-provider overlap | Defer — revisit when a revisit condition clears |
| Pause this vertical and pursue another Signal or Oddity | Marginal value of same-source expansion is falling, but the M10 question is higher-value than a pause; Oddities still lack demand evidence | Defer — unchanged |

## Decision

The next milestone is **activating M10** (engine #24): separating model
identity from provider routes so iolo.lol can answer "what does this exact
model cost through each authoritative provider?", derived from the existing
canonical Signals — never a second truth source, no new infrastructure. The
activation gate named in #24 is met by M9 evidence (same exact models through
multiple authoritative providers/routes; hosted-model provider-vs-developer
ambiguity now material). M10's exact surface is defined by #24 when it is
planned; no M10 implementation happens in this milestone.

No M11+ backlog is created beyond this single milestone; the four candidates
above are resolved.
