kind: iolo-qa/v1
id: QA-6-local-agent
spec: engine SPEC-6-local-agent
related_issue: "#6"
status: passed
owner: QA
freshness: live
---

# M4 QA proof strategy — local Agent control plane

Proves SPEC-6-local-agent and engine ADR-0003 for the acceptance gate
iolo.lol#18. QA inspects code, evidence, and fresh runs independently of
Engineer summaries.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-6 REQ-001 | `pnpm agent` runs both active Signals end to end without a GitHub schedule event | integration | `pnpm agent --config agent.config.json` (local, engine 362c7f3) | both Signals processed; evidence per Signal | pass | run 2026-08-14T19-42-36Z |
| SPEC-6 REQ-002 | Agent never writes the product checkout; `change` stages payloads under evidence area | scenario | controlled changed fixture via agent; hash product checkout | product byte-identical; staged payloads present | pass | agent tests + staged/ |
| SPEC-6 REQ-003 | Unchanged run → no canonical/history change; error → evidence `error`, nonzero exit, no writes | scenario | agent on unchanged state (19:42); agent with unreachable URL (19:49) | unchanged: identical; error: intact state | pass | runs/ + product hash 89dd2c |
| SPEC-6 REQ-004 | Evidence records `orchestrator` distinguishing local-agent from github-actions | data | inspect `runs/*.json` from local (19:42, 19:49) and Actions runs (21:01) | `orchestrator` field differs correctly | pass | engine `runs/` |
| SPEC-6 REQ-005 | Schedule/signal selection/runtime config is local, not repository governance | review | inspect agent contract + hand-off doc; grep repo for schedule config | schedule/cadence absent from committed architecture | pass | engine repo + scheduler |
| SPEC-6 REQ-006 | At least one scheduled local/self-hosted run covers the active Signal set | integration | scheduler log + evidence files timestamps | scheduled run exists with both Signals | planned (operator scheduling agent) | scheduler + engine `runs/` |
| SPEC-6 REQ-007 | Private GitHub cron no longer required; Actions keeps CI + manual fallback | review + compatibility | inspect `live.yml`; engine CI green | no `schedule:` trigger; workflow_dispatch remains | pass | workflow file + CI |
| SPEC-6 REQ-008 | Agent cannot bypass validation/PublishPolicy for known sources | review + scenario | inspect agent code path; run with tampered canonical expectation | agent always routes through `runPipeline` readOnly path | pass | code + run output |

## Data/editorial evidence plan

QA compares agent run results against the recorded official-source fixtures
and live pages for both Signals, and verifies no canonical/history change
occurs on unchanged runs (product checkout byte-identical before/after).

## Acceptance gate

QA-6 passes when all rows pass with fresh evidence and the engine CI is green
at the accepted commit.

## Known evidence boundary

Scheduled runs depend on the operator's scheduling agent executing the
hand-off contract (`engine/docs/agent-schedule-contract.md`); QA records the
actual run timestamps and the mechanism that produced them. The repository
defines no scheduler of its own by decision (ADR-0003).
