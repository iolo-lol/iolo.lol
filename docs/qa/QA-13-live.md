kind: iolo-qa/v1
id: QA-13-live
spec: SPEC-13-public-runtime
related_issue: "#14"
status: planned
owner: QA
freshness: live
---

# M3 QA proof strategy — first live Signal

Proves SPEC-13-public-runtime (product) and SPEC-4-live-execution (engine)
for the acceptance gate iolo.lol#14. All checks run against the current
checkout, the deployed surface, and fresh CI — independently of Engineer
summaries.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-13 REQ-001 | `pnpm generate` renders `site/` with `index.html` + API files from `data/signals/` only | unit | run generator on fresh checkout; inspect files | files exist, match data | planned | local run + product CI |
| SPEC-13 REQ-002 | Deployed surface reachable at `https://iolo-lol.github.io/iolo.lol/` and API paths | integration | `curl` the Pages URL, signals list, signal, history | 200 + JSON | planned | live Pages deployment |
| SPEC-13 REQ-003 | Deployment workflow uses only product repo | review | inspect `.github/workflows/pages.yml` | no engine access | planned | workflow file |
| SPEC-13 REQ-004 | Deployed JSON == product-owned canonical data; page shows values + provenance + history | data + integration | compare deployed JSON with `data/signals/*.json` (diff), curl page HTML | equal | planned | live deployment + checkout |
| SPEC-13 REQ-005 | Product CI green; generator tests pass | compatibility | product CI at accepted commit; `pnpm check` | pass | planned | CI run |
| SPEC-4 REQ-001 | `live` mode runs pipeline against live source with product checkout input | integration | engine `pnpm live --product <checkout> --evidence <file>` | evidence written, verdict recorded | planned | engine run |
| SPEC-4 REQ-002 | Evidence file contains run id, runAt, fetchedAt, contentHash, observedAt, verdict | data | inspect committed `runs/` files | all fields present | planned | engine repo runs/ |
| SPEC-4 REQ-003 | At least one recurring invocation without manual initiation | integration | GitHub Actions `schedule` run log for the accepted commit | scheduled run exists | planned | engine Actions |
| SPEC-4 REQ-004 | Unchanged run leaves product checkout byte-identical | scenario | hash product data files before/after a live run | identical | planned | run evidence + hashes |
| SPEC-4 REQ-005 | Change verdict stages payloads engine-side only, no product write | scenario | live run with a mutated fixture (controlled) | payload in engine evidence, product untouched | planned | run evidence |
| SPEC-4 REQ-006 | Error path: evidence `error`, nonzero exit, no state writes | scenario | live run with broken source (controlled dispatch) | evidence error + state intact | planned | run evidence |
| SPEC-4 REQ-007 | Engine CI green at accepted commit; M2 tests pass | compatibility | engine CI run | pass | planned | CI run |
| #12 criterion | Freshness/provenance on the live page reflects the latest observation | editorial | compare page rendered fetchedAt/observedAt with latest evidence | consistent | planned | live page + evidence |
| #12 criterion | QA records actual runtime mechanism, frequency, failure characteristics, cost | measurement | inspect workflow + runs + Actions usage | recorded in #12 | planned | evidence record |

## Acceptance gate

iolo.lol#14 passes when every row passes with fresh evidence, Architect
confirms the runtime/state/publication boundary (product-repo ADR-0003,
engine ADR-0002), and PM accepts #12 on the QA + Architect verdicts and
records the post-M3 roadmap reassessment.
