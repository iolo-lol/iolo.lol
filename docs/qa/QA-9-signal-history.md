kind: iolo-qa/v1
id: QA-9-signal-history
spec: SPEC-9-signal-history
related_issue: "#10"
status: passed
owner: QA
freshness: live
---

# M2 QA proof strategy — trusted automated content pipeline

Proves SPEC-9-signal-history (product) and SPEC-3-history (engine) as the
acceptance gate for iolo.lol#10. Rows below also cover the M2 acceptance
criteria in iolo.lol#3 (traceable evidence chain, observations vs canonical
changes, no duplicate/inconsistent state, explicit publication boundary,
failure behavior, API/web representation).

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-9 REQ-001 | `history.v1.schema.json` exists, valid 2020-12, `$ref`s result/v1, examples validate | unit | product `pnpm check` (contracts tests) | pass | planned | product CI on reviewed commit |
| SPEC-9 REQ-002 | `data/signals/gemini-3.7-flash-usage-rates.history.json` exists, conforms to history.v1 | data | validate with Ajv against both schemas | valid | planned | product repo `data/` |
| SPEC-9 REQ-003 | `GET /api/v1/signals/:id/history` returns the history document | integration | start `packages/web`, curl route | 200 + JSON matching file | planned | local server run |
| SPEC-9 REQ-004 | Web page renders history entries with values + provenance + publishedAt | integration | `curl -s localhost:3000/` | entries visible | planned | local server run |
| SPEC-9 REQ-005 | Product clean-checkout build with no engine access | compatibility | fresh clone, install + `pnpm check` | pass | planned | clean checkout + product CI |
| SPEC-3 REQ-001/002 | On `change`: one history entry appended; document validates against history.v1 | scenario + unit | run pipeline `--canonical X --history H` twice: first run `change` then `unchanged` | first run appends exactly one entry; second appends none | planned | engine run logs + file hash |
| SPEC-3 REQ-003 | Repeated processing: no duplicate entries, state byte-identical | scenario | second run, compare file hashes | unchanged | planned | file hashes |
| SPEC-3 REQ-004 | Each entry's Result carries source url/fetchedAt/contentHash matching recorded evidence | editorial | recompute fixture sha256; compare with entry contentHash | match | planned | fixture provenance |
| SPEC-3 REQ-005 | Failure behavior: fetch error, parse error, validation error → no state change, nonzero exit, stderr message | scenario | run pipeline with missing fixture dir; with mutated malformed page; with corrupted contract | exit != 0, canonical/history untouched | planned | engine run logs |
| SPEC-3 REQ-005 | Publication policy: `unchanged` never writes; writes only after validation | scenario | covered by REQ-001/003 runs | pass | planned | run logs |
| SPEC-3 REQ-006 | CLI `--history` reports verdict and history state | integration | CLI run with both flags | exit 0, stdout JSON | planned | engine run |
| SPEC-3 REQ-007 | Engine CI green from clean checkout | compatibility | engine GitHub Actions on reviewed commit | success | planned | engine CI run |
| #3 criterion | Published change has a traceable evidence chain: source evidence → Result → canonical → history → API/web | editorial | compare fixture page values → history entry → API response → web page | chain consistent | planned | all layers |
| #3 criterion | History distinguishes observations from canonical changes | editorial | history has one entry per canonical change; unchanged runs add none | pass | planned | run logs + file |
| #3 criterion | Public surfaces show provenance/history without engine internals | contract review | inspect schema + API/web | no engine types | planned | product checkout |

## Acceptance gate

iolo.lol#10 passes when every row above passes against the current checkout
and fresh CI, Architect confirms the boundary (history contract product-owned,
canonical/history entered via governed publication), and PM accepts on the QA
verdict.
