# Post-M6 roadmap reassessment

Status: recorded by PM for iolo-lol/engine#12 acceptance
Date: 2026-08-15
Owner: PM

## Evidence from the M6 comparison product

- The M6 product hypothesis — a dense, provenance-aware comparison surface
  creates more user value than adding more isolated provider Signals — was
  tested against the accepted five-Signal set and holds. `/compare/` renders
  all five providers in one scan-friendly table (sorted dimensions, currently
  applicable statement first, conditional pricing visible verbatim), and the
  static `/api/v1/comparisons/index.json` derives from the same projection.
- The projection is faithful and deterministic: every canonical statement
  survives verbatim in canonical reading order (DeepSeek cache hit/miss ×
  peak/off-peak windows, Gemini temporary/future-effective pairs, Together
  cached-input), simple prices stay single-statement, and two full site
  generations are byte-identical. QA-12 records pass evidence for every row.
- The surface adds no operational complexity: pure-function projection, two
  routes and one static artifact file over the same module, no dynamic
  backend, no new runtime/scheduler, canonical data untouched.
- The comparison also re-confirmed the M5 feasibility boundary for the
  alternative direction: several high-value sources are still not
  deterministically extractable from raw HTML, so provider expansion remains
  bounded by page structure, not demand.

## Candidate directions

| Candidate | M6 evidence | Decision |
| --- | --- | --- |
| Deepen comparison/discovery | The surface demonstrates clear utility (dense comparison, conditional pricing, provenance) and is unconstrained by the extraction-feasibility ceiling; concrete low-risk deepening exists — basic sorting/filtering of the delivered table (permitted by #11 scope, not yet delivered), currency handling, per-provider drill-down polish — all without new infrastructure | **Next milestone** — the M6 hypothesis was confirmed; deepen the demonstrated vertical |
| Broader provider/model coverage | Comparison now makes additional coverage valuable, but expansion is bounded by deterministic-extraction feasibility (M5 evidence: OpenAI 403, Anthropic geo-blocked, client-side-rendered pages); #12 cautions against continuing provider expansion by default | Defer — revisit when a deterministically extractable candidate source is identified |
| First Oddity | No demand evidence for Oddities; a product bet, not an evidence-based bottleneck | Defer — unchanged from the post-M5 reassessment |

## Decision

The next milestone is **deepening comparison/discovery** because the M6
comparison surface demonstrated clear utility and the vertical is not blocked
by the documented extraction-feasibility ceiling that bounds provider
expansion. The first concrete deepening is basic sorting/filtering of the
comparison table (a capability #11's scope explicitly left as "only where it
materially helps"), keeping the same pure projection, the same static
deployment, and the same zero-new-infrastructure constraint. Provider
expansion resumes only when a deterministically extractable candidate source
is identified; the first Oddity stays deferred pending demand evidence.

No M7+ backlog is created beyond this single milestone; the three candidates
above are resolved and none of the other two is implemented now.
