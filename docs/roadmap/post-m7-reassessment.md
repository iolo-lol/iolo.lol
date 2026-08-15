# Post-M7 roadmap reassessment

Status: recorded by PM for iolo-lol/engine#16 acceptance
Date: 2026-08-15
Owner: PM

## Evidence from the M7 change-discovery product

- The M7 product hypothesis — the strongest value in the vertical is a
  trustworthy stream of verified pricing changes and upcoming effective
  changes derived from data the project already maintains — was tested and
  holds. The changes projection emits records only where canonical evidence
  supports them (material diffs between consecutive published snapshots;
  future-effective statements declared by sources), and the public `/changes/`
  page, the `/api/v1/changes/index.json` artifact, and the feed all derive
  from that one projection. QA-16 records pass evidence for every row.
- The stream is currently sparse: with exactly one published snapshot per
  Signal, there are zero observed change records and five upcoming records
  (Gemini temporary/future-effective pairs; DeepSeek cache hit/miss ×
  peak/off-peak windows). The discovery surface is faithful and useful, but
  its value scales with the number of Signals whose history and future
  pricing are tracked.
- The comparison/discovery deepening requested by the post-M6 reassessment is
  delivered (M7); the remaining demonstrated bottleneck is coverage — the
  same binding constraint the post-M5 and post-M6 reassessments identified,
  bounded by deterministic-extraction feasibility (M5 evidence: OpenAI 403,
  Anthropic geo-blocked, client-side-rendered pages, AWS Bedrock JS-loaded).

## Candidate directions

| Candidate | M7 evidence | Decision |
| --- | --- | --- |
| Deepen change discovery/distribution | The M7 surface already meets its acceptance criteria (sections, before/after, conditions, effective-time, drill-down, artifact, feed); remaining deepening ideas are largely blocked by non-goals (no subscriptions/push/accounts) or marginal on top of the delivered surface | Defer — no material gap demonstrated beyond what M7 delivered |
| Expand provider/model coverage | The discovery surface now benefits materially from breadth: a change stream over five providers is sparse (0 observed + 5 upcoming records), and every additional deterministically extractable provider adds both history and upcoming changes to the stream; coverage is the documented, still-unresolved bottleneck | **Next milestone** — the M7 surface makes additional coverage the highest-leverage investment |
| Generalize the proven change pattern to another Signal vertical | The diff/future-effective machinery is generic over result.v1/history.v1 shapes, but no evidence shows another vertical is wanted or feasibly ingestible; it is a platform bet, not a demonstrated bottleneck | Defer — revisit only when a concrete second vertical with deterministically extractable sources is identified |
| Pause Signals and ship the first Oddity | No demand evidence for Oddities; a product bet, not an evidence-based bottleneck | Defer — unchanged from the post-M5/post-M6 reassessments |

## Decision

The next milestone is **expanding provider/model coverage** because the
change-discovery surface now makes additional coverage materially valuable:
the stream's utility is directly proportional to the number of tracked
Signals, and coverage remains the demonstrated, unresolved bottleneck. As in
M5, expansion is constrained by deterministic-extraction feasibility —
candidate sources must be probed for static, first-party pricing pages before
acceptance — and reuses the accepted engine pipeline, contracts, and static
site unchanged.

No M8+ backlog is created beyond this single milestone; the four candidates
above are resolved and none of the other three is implemented now.
