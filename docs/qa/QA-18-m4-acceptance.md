kind: iolo-qa/v1
id: QA-18-m4-acceptance
spec: M4 acceptance (iolo.lol#15)
related_issue: "#18"
status: running
owner: QA
freshness: live
---

# M4 final QA acceptance — generalization, local orchestration, human product

Proves the full M4 acceptance gate (iolo.lol#18) with fresh evidence,
independently of Engineer summaries. The old pending GitHub-cron row from the
M3 gate is superseded: local Agent orchestration replaces it.

## Verification record

Reference commits: product `6309345` (web), engine `362c7f3` (agent
contract), `1351340` (ADR alignment). CI green at each. Runs performed
2026-08-14/15 local.

| # | Check | Evidence | Result |
| --- | --- | --- | --- |
| 1 | Gemini + DeepSeek published values match authoritative evidence | fixtures hash 3deb4f (gemini) / 1a8057 (deepseek); canonical files; live pages | pass (QA-16/QA-5 chain) |
| 2 | Deterministic reproduction from recorded evidence | `pnpm pipeline --fixture` both signals; contentHash matches | pass |
| 3 | Canonical/history correctness | generated API JSON byte-identical to `data/signals/*` | pass |
| 4 | No-false-change | local agent run 19:42: both unchanged, product hash stable | pass |
| 5 | No-write-on-error | local agent run 19:49 (unreachable): error verdicts, product hash 89dd2c unchanged | pass |
| 6 | Production human-facing website | Pages deployment serves new IA (home/signals/detail/history/changes) | pass (QA-19) |
| 7 | Usable homepage/index/detail/history flows | headless Chromium 360/1280 px, all pages, no overflow | pass (QA-19) |
| 8 | Canonical iolo.lol URLs | all links/canonical/feed/sitemap use `https://iolo.lol/` | pass (QA-19, ADR-0004) |
| 9 | Atom feed + sitemap | valid, one entry per change, unique ids, timestamps, provenance links | pass (QA-19/QA-16) |
| 10 | At least one unattended local Agent run | operator scheduling agent per hand-off contract | planned (QA-6 REQ-006) |
| 11 | Control-plane Agent cannot bypass deterministic validation / PublishPolicy | agent routes every Signal through `runPipeline` readOnly; tests | pass (QA-6) |
| 12 | Private GitHub cron no longer required | live.yml has no schedule trigger; workflow_dispatch fallback | pass (QA-6) |
| 13 | Product CI/Pages + engine CI at accepted commits | GitHub Actions runs green | pass |

## Acceptance gate

iolo.lol#18 passes when every row passes with fresh evidence (including the
scheduled local run from the operator's scheduling agent), Architect
confirms the plane boundaries, and PM records the post-M4 roadmap
reassessment.
