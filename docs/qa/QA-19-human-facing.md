kind: iolo-qa/v1
id: QA-19-human-facing
spec: SPEC-19-human-facing-website
related_issue: "#18"
status: planned
owner: QA
freshness: live
---

# M4 QA proof strategy — human-facing website

Proves SPEC-19-human-facing-website for the acceptance gate iolo.lol#18. QA
verifies both the human-facing web behavior and canonical-data correctness
from the current checkout, the deployed Pages surface, and fresh CI —
independently of Engineer summaries.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-19 REQ-001 | Canonical `https://iolo.lol/` form is the link origin in generated pages/metadata; Pages custom domain configured to iolo.lol | integration | inspect generated canonical `<link>`/meta + Pages API cname | cname `iolo.lol`; all links use `https://iolo.lol/` | planned | deployed build + Pages API |
| SPEC-19 REQ-002 | Home page explains what iolo.lol is and what Signals are, in user language | editorial + integration | curl deployed `/`; read copy | identity + Signals explanation present | planned | live deployment |
| SPEC-19 REQ-003 | Signals index lists both Signals with human names, value summary, freshness | editorial + integration | curl `/signals/`; parse names/dates | Gemini + DeepSeek human labels, values, freshness | planned | live deployment |
| SPEC-19 REQ-004 | Recent-changes view lists canonical changes newest first with human dates/names | data + integration | curl `/changes/` (or home section); compare with history docs | all published changes, newest first | planned | deployment + `data/signals` |
| SPEC-19 REQ-005 | Signal detail page shows current state, last change, freshness, source before verification metadata | editorial + integration | curl `/signals/<id>/`; DOM order | current values first; hashes not dominant | planned | live deployment |
| SPEC-19 REQ-006 | Readable history view derived from canonical history.v1 with provenance secondary | data + integration | curl `/signals/<id>/history/`; diff against history.json | entries match; provenance present, secondary | planned | deployment + data |
| SPEC-19 REQ-007 | Internal ids/hashes not dominant; human labels primary | editorial | HTML inspection of index/detail/history | raw ids only as secondary labels | planned | generated pages |
| SPEC-19 REQ-008 | Every public page has title, description, stable canonical URL | integration | curl each page; check `<title>`, meta description, canonical link | present and stable | planned | live deployment |
| SPEC-19 REQ-009 | Mobile (360 px) and desktop layouts usable | scenario | render pages in a 360 px viewport; check no horizontal overflow, readable text, working nav | usable | planned | browser render |
| SPEC-19 REQ-010 | Static generation from canonical data only; API/feed/sitemap/Pages/QA intact | compatibility + data | fresh checkout `pnpm generate`; diff API JSON vs data files; feed/sitemap | identical; surfaces intact | planned | local run + Pages |
| SPEC-19 REQ-011 | Human labels are product-owned presentation; renderer applies generically | review + unit | inspect meta map + renderer; add-fake-signal unit test | no contract change; generic rendering | planned | checkout |

## Data/editorial evidence plan

QA reads the deployed pages and compares every published value and date with
the product-owned canonical `data/signals/*.json` and `.history.json` files
at the accepted commit, and cross-checks the two official source pages where
the network allows. Human names ("Gemini 3.7 Flash", "DeepSeek V4 Flash")
must match the official provider/product naming.

## Acceptance gate

QA-19 passes when all rows pass with fresh evidence, and the deployed build
at the accepted commit matches the canonical data.

## Known evidence boundary

The `iolo.lol` domain currently resolves to a non-service address from the
QA network; direct `https://iolo.lol/` verification is blocked (SPEC-19
Q-001). QA verifies the identical build at the Pages project URL, the
configured custom domain via the Pages API, and that every generated link
uses the canonical origin, and records this boundary.
