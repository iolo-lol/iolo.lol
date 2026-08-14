kind: iolo-qa/v1
id: QA-18-m4-acceptance
spec: M4 acceptance (iolo.lol#15)
related_issue: "#18"
status: passed
owner: QA
freshness: live
---

# M4 final QA acceptance — generalization, local orchestration, human product

Proves the full M4 acceptance gate (iolo.lol#18) with fresh evidence,
independently of Engineer summaries. The old pending GitHub-cron row from the
M3 gate is superseded: local Agent orchestration replaces it.

## Verification record

Reference commits: product `3ab331b` (docs/ADR), `6309345` (web), engine
`1351340` (ADR alignment), `362c7f3` (agent contract). CI green at each.
Runs performed 2026-08-14/15.

| # | Check | Evidence | Result |
| --- | --- | --- | --- |
| 1 | Gemini + DeepSeek published values match authoritative evidence | fixtures hash 3deb4f (gemini) / 1a8057 (deepseek); canonical files; live pages | pass |
| 2 | Deterministic reproduction from recorded evidence | `pnpm pipeline --fixture` both signals; contentHash matches | pass |
| 3 | Canonical/history correctness | generated + deployed API JSON byte-identical to `data/signals/*` (artifact check f20325...) | pass |
| 4 | No-false-change | local agent run 19:42: both unchanged, product hash stable | pass |
| 5 | No-write-on-error | local agent run 19:49 (unreachable): error verdicts, product hash 89dd2c unchanged | pass |
| 6 | Production human-facing website | Pages deployment serves new IA (home/signals/detail/history/changes) | pass |
| 7 | Usable homepage/index/detail/history flows | headless Chromium 360/1280 px, all pages, no horizontal overflow | pass |
| 8 | Canonical iolo.lol URLs | all links/canonical/feed/sitemap use `https://iolo.lol/` | pass (ADR-0004) |
| 9 | Atom feed + sitemap | valid Atom (2 entries, unique ids, newest first, provenance), 12-url sitemap | pass |
| 10 | At least one scheduled local Agent run | operator scheduling agent per hand-off contract | pending (external) |
| 11 | Control-plane Agent cannot bypass deterministic validation / PublishPolicy | agent routes every Signal through `runPipeline` readOnly; tests | pass |
| 12 | Private GitHub cron no longer required | live.yml has no schedule trigger; workflow_dispatch fallback (manual run 21:01, orchestrator github-actions) | pass |
| 13 | Product CI/Pages + engine CI at accepted commits | GitHub Actions runs green | pass |

## Architect confirmation

Recorded in `docs/qa/QA-18-architect-confirmation.md`: control plane / data
plane / publication plane cleanly separated; second source added no
unjustified generic infrastructure; website derives from product-owned
canonical data; static hosting remains appropriate.

## Acceptance gate

iolo.lol#18 passes when every row passes with fresh evidence (including the
scheduled local run from the operator's scheduling agent), Architect
confirms the plane boundaries (recorded), and PM records the post-M4
roadmap reassessment.

## Known evidence boundary

The `iolo.lol` domain resolves to a non-service address from the QA network;
direct `https://iolo.lol/` verification is blocked pending DNS (SPEC-19
Q-001, ADR-0004). The identical build is verified at the Pages project URL
and via the Pages deployment artifact; a transitional edge-cache 301 on some
project-URL paths is a CDN artifact of the custom-domain configuration
experiment, already resolved for all human-facing pages.
