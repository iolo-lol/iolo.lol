kind: iolo-qa/v1
id: QA-6-local-agent
spec: engine SPEC-6-local-agent
related_issue: "#6"
owner: QA
freshness: live
---

# M4 QA proof strategy — local Agent control plane

Proves SPEC-6-local-agent and engine ADR-0003 for the acceptance gate
iolo.lol#18. QA inspects code, evidence, and fresh runs independently of
Engineer summaries.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-6 REQ-001 | `pnpm agent` runs both active Signals end to end without a GitHub schedule event | integration | `pnpm agent --product <checkout> --evidence <dir>` (local) | both Signals processed; evidence per Signal | planned | local run + engine checkout |
| SPEC-6 REQ-002 | Agent never writes the product checkout; `change` stages payloads under evidence area | scenario | controlled changed fixture via agent; hash product checkout | product byte-identical; staged payloads present | planned | run evidence |
| SPEC-6 REQ-003 | Unchanged run → no canonical/history change; error → evidence `error`, nonzero exit, no writes | scenario | agent on unchanged state; agent with unreachable URL | unchanged: identical; error: intact state | planned | run evidence + hashes |
| SPEC-6 REQ-004 | Evidence records `orchestrator` distinguishing local-agent from github-actions | data | inspect `runs/*.json` from local and prior Actions runs | `orchestrator` field differs correctly | planned | engine `runs/` |
| SPEC-6 REQ-005 | Schedule/signal selection/runtime config is local, not repository governance | review | inspect plist + agent options; grep repo for schedule config | schedule/cadence absent from committed architecture | planned | engine repo + host |
| SPEC-6 REQ-006 | At least one unattended scheduled local run covers the active Signal set | integration | launchd log + evidence files timestamps | unattended run exists with both Signals | planned | host + engine `runs/` |
| SPEC-6 REQ-007 | Private GitHub cron no longer required; Actions keeps CI + manual fallback | review + compatibility | inspect `live.yml`; engine CI green | no `schedule:` trigger; workflow_dispatch remains | planned | workflow file + CI |
| SPEC-6 REQ-008 | Agent cannot bypass validation/PublishPolicy for known sources | review + scenario | inspect agent code path; run with tampered canonical expectation | agent always routes through `runPipeline` readOnly path | planned | code + run output |

## Data/editorial evidence plan

QA compares agent run results against the recorded official-source fixtures
and live pages for both Signals, and verifies no canonical/history change
occurs on unchanged runs (product checkout byte-identical before/after).

## Acceptance gate

QA-6 passes when all rows pass with fresh evidence and the engine CI is green
at the accepted commit.

## Known evidence boundary

Unattended runs depend on the host machine running with the plist loaded;
QA records the actual run timestamps and the mechanism that produced them.
