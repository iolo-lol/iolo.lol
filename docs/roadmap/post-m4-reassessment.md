# Post-M4 roadmap reassessment

Status: recorded by PM for iolo.lol#15 acceptance
Date: 2026-08-15
Owner: PM

## Evidence from the live Signals and the human-facing product

- Two live Signals (Gemini 3.7 Flash, DeepSeek V4 Flash usage rates), both
  unchanged for the whole M4 window; no false changes; errors preserve
  state; deterministic reproduction holds from recorded fixtures.
- The human-facing site is live with home / Signals index / detail /
  history / recent-changes flows, feed and sitemap on the canonical
  `https://iolo.lol/` origin, and canonical data byte-identical at the
  deployed surface.
- The local Agent contract works end to end; scheduling is delegated to the
  operator's scheduling agent; private GitHub cron is no longer required
  for routine ingestion.
- The next real change event in view: DeepSeek's announced peak/off-peak
  billing switch (effective 16:00 UTC 2026-08-16) — the first real
  canonical-change candidate since launch; it will exercise the governed
  change path.

## Bottleneck comparison

| Candidate | Assessment |
| --- | --- |
| Expanding Signals to more providers/topics | Highest product value: the site currently covers two providers in one vertical; coverage is the visible gap between "proof" and "a product people return to". Cheap: the engine pipeline, contracts, and site renderer already generalize (proven by the second Signal). |
| Minimal Source Registry | Premature with two sources; the engine's explicit signal map already routes work. Defer until coverage grows to several sources. |
| Improving discovery/distribution | Feed/sitemap/canonical URLs already shipped; the remaining distribution gap is DNS for the iolo.lol domain, an admin action, not a milestone. |
| AI-assisted discovery/extraction | No evidence the deterministic extractors fail; adding an LLM dependency now would weaken the core guarantee. Defer. |
| Launching the first Oddity | No demand evidence; a product bet, not a bottleneck. Defer. |
| Improving the website further | No usage evidence yet (site just launched); polish without usage data is speculative. Defer. |

## Decision

The next bounded milestone is **one milestone expanding Signal coverage to
additional providers/topics within the existing vertical**, reusing the
accepted engine pipeline, contracts, and static site unchanged. It is the
only candidate that removes a demonstrated product gap with low risk and no
new infrastructure.

No M5+ backlog is created beyond this single milestone. After it, the
operating evidence (real change events, coverage count, site usage) will
determine whether a Source Registry, distribution work, or the first Oddity
becomes the bottleneck.
