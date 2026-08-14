kind: iolo-qa/v1
id: QA-16-second-signal
spec: SPEC-16-second-signal
related_issue: "#18"
status: planned
owner: QA
freshness: live
---

# M4 QA proof strategy — second Signal and change feed

Proves SPEC-16-second-signal, SPEC-5-second-source (engine), and #17 (feed +
sitemap) for the acceptance gate iolo.lol#18. All checks use fresh evidence
independently of Engineer summaries.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-16 REQ-001/002 | Second Signal canonical + history validate against result.v1/history.v1 | data | Ajv validation against product schemas | valid | planned | product `data/signals/` |
| SPEC-16 REQ-003 | API/web expose the second Signal with provenance | integration | deployed Pages endpoints + page | 200, values + source + hashes | planned | live deployment |
| SPEC-16 REQ-004 | First Signal byte-compatible | data | diff deployed gemini JSON vs canonical | identical | planned | live + checkout |
| SPEC-16 REQ-005 | Published values traceable to official source | editorial | compare fixture page values (table + footnote) with canonical statements | match | planned | fixture hash |
| SPEC-5 REQ-001/002 | Fixture → Result values match the recorded page (current + peak/off-peak) | unit + editorial | engine `pnpm pipeline --signal deepseek-... --fixture` | statements match source | planned | engine run |
| SPEC-5 REQ-003 | contentHash == fixture sha256:1a8057...; deterministic reproduction | data | recompute hash, rerun fixture | match + identical values | planned | run output |
| SPEC-5 REQ-004 | Unchanged repeated processing → no canonical/history change | scenario | run twice with same canonical; hash compare | unchanged, byte-identical | planned | run logs |
| SPEC-5 REQ-005 | At least one recurring run for the second Signal, evidence with signalId | integration | engine Actions schedule/dispatch log + `runs/` evidence | run exists, signalId recorded | planned | Actions + runs/ |
| SPEC-5 REQ-006 | Controlled failure leaves state untouched + inspectable evidence | scenario | live-error-test against DeepSeek source | verdict error, no writes | planned | run evidence |
| SPEC-5 REQ-007 | Engine CI green; M1–M3 tests still pass | compatibility | engine CI at accepted commit | pass | planned | CI run |
| #17 | Feed valid (Atom), published changes once, stable ids/links, timestamps, provenance | data + integration | generator + feed parser; curl deployed feed | valid; entries = canonical changes; unique ids | planned | deployment + generator |
| #17 | Sitemap lists intended public surfaces | integration | curl deployed sitemap.xml | URLs + lastmod present | planned | deployment |
| #17 | Feed/sitemap reproducible from public repo only | compatibility | fresh product checkout, `pnpm generate` | identical outputs | planned | local run + Pages |
| #18 criterion | Current product CI/Pages + engine CI green | compatibility | GitHub Actions at accepted commits | success | planned | CI runs |

## Data/editorial evidence plan

QA reproduces both Signals from their recorded fixtures (content hashes
pinned in provenance records) and cross-checks the live official pages where
the network allows, with timestamps recorded. DeepSeek's footnote text
(effective date, peak hours) is part of the recorded page evidence.

## Acceptance gate

iolo.lol#18 passes when all rows pass with fresh evidence, Architect confirms
contract reuse and no unjustified generic infrastructure, and PM records the
post-M4 roadmap reassessment.
