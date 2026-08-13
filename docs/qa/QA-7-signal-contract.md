kind: iolo-qa/v1
id: QA-7-signal-contract
spec: SPEC-7-signal-contract
related_issue: "#8"
status: planned
owner: QA
freshness: live
---

# M1 QA proof strategy — first Signal vertical slice

Proves SPEC-7-signal-contract (product) and SPEC-2-reference-pipeline
(engine), the acceptance gate for iolo.lol#8. Every requirement row records a
reproducible check; evidence must be fresh (current checkout, current CI) and
independent of Engineer completion summaries.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-7 REQ-001 | `result.v1.schema.json` exists, is 2020-12-valid, declares `$id`/`title`/`description`, and its examples validate | unit | product repo: `pnpm check` (packages/contracts tests) | all schema tests pass | planned | product CI run on the reviewed commit |
| SPEC-7 REQ-002 | Contract requires `schemaVersion`, `signalId`, `observedAt`, `source.url`, `source.fetchedAt`, `source.contentHash`, `values`; schema contains no engine-only types | contract review + unit | inspect `packages/contracts/schemas/result.v1.schema.json`; schema tests | fields present as `required`; no engine types | planned | current product checkout |
| SPEC-7 REQ-003 | `data/signals/<signalId>.json` exists, holds a contract-conformant Result, committed in product repo | data | `pnpm exec` validate against schema (engine validator or contract tests) | canonical file validates | planned | product repo `data/` |
| SPEC-7 REQ-004 | `GET /api/v1/signals` lists the signal; `GET /api/v1/signals/:signalId` returns the canonical Result | integration | start `packages/web` server; `curl` both routes | 200 + JSON matching canonical file | planned | local server run |
| SPEC-7 REQ-005 | Web page shows values + source URL + `fetchedAt` + `contentHash` | integration | `curl -s localhost:3000/` | values and provenance visible in HTML | planned | local server run |
| SPEC-7 REQ-006 | Unchanged observation does not change canonical file | scenario | engine pipeline run twice against fixture with unchanged canonical | second run verdict `unchanged`, file bytes identical | planned | engine run log + file hash |
| SPEC-7 REQ-007 | Product builds from clean checkout with no engine access | compatibility | fresh clone of `iolo-lol/iolo.lol`, `pnpm install --frozen-lockfile && pnpm check` | pass | planned | local clean checkout + product CI |
| SPEC-2 REQ-001/002 | Fixture → Result for `gemini-3.7-flash` input/output price | unit + editorial | `pnpm pipeline:run --fixture ...` | Result values match the recorded source evidence | planned | engine run output |
| SPEC-2 REQ-003 | Engine Result validates against product-owned schema | unit | engine `pnpm check` | pass | planned | engine CI run |
| SPEC-2 REQ-004 | Determinism: same fixture twice → identical normalized values, verdict `unchanged`, canonical file untouched | scenario | run pipeline twice, deep-equal values; compare canonical file hash | identical values, no canonical change | planned | engine run log |
| SPEC-2 REQ-005 | Publication decision: unchanged input → `unchanged`; mutated fixture → `change` | scenario | run with fixture; run with a price-edited fixture copy | verdicts `unchanged` then `change` | planned | engine run logs |
| SPEC-2 REQ-006 | Recorded source evidence allows reproduction: fixture bytes hash = `source.contentHash` in Result | editorial | recompute SHA-256 of fixture; compare with Result `contentHash` | match | planned | fixture + provenance record |
| SPEC-2 REQ-007 | CLI end-to-end from fixture to verdict + canonical payload | integration | `pnpm pipeline:run --canonical <path>` | exit 0, payload printed, verdict recorded | planned | engine run |
| SPEC-2 REQ-008 | Engine CI green from clean checkout | compatibility | engine GitHub Actions on the reviewed commit | success | planned | engine CI run |
| Data/editorial evidence | Displayed price values match the official source page at observation time | editorial | compare Result values with the recorded Gemini pricing page section (fixture + live URL check) | values equal the page's paid-tier cells for the model | planned | fixture (contentHash) + live page |

## Data/editorial evidence plan

QA reproduces the published values from the recorded fixture (content hash
pinned in the provenance record) and, where the network allows, cross-checks
the live official page at `https://ai.google.dev/gemini-api/docs/pricing`.
Because live pages change, the fixture + hash is the binding reproduction
evidence; the live check is corroborating and reported with its own timestamp.

## Acceptance gate

iolo.lol#8 passes when: all rows above pass against the current checkout and
fresh CI; Architect confirms the cross-repo boundary (no engine types in
public contracts; canonical state entered via governed publication); PM
accepts on the QA verdict.
