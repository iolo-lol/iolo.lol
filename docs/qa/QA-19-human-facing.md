kind: iolo-qa/v1
id: QA-19-human-facing
spec: SPEC-19-human-facing-website
related_issue: "#18"
status: passed
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
| SPEC-19 REQ-001 | Canonical `https://iolo.lol/` form is the link origin in generated pages/metadata; Pages custom domain configured to iolo.lol | integration | inspect generated canonical `<link>`/meta + Pages API cname | all links use `https://iolo.lol/` | pass | generated build (ADR-0004) |
| SPEC-19 REQ-002 | Home page explains what iolo.lol is and what Signals are, in user language | editorial + integration | read generated/deployed `/` | identity + Signals explanation present | pass | site + deployment |
| SPEC-19 REQ-003 | Signals index lists both Signals with human names, value summary, freshness | editorial + integration | read `/signals/`; parse names/dates | Gemini + DeepSeek human labels, values, freshness | pass | generated pages |
| SPEC-19 REQ-004 | Recent-changes view lists canonical changes newest first with human dates/names | data + integration | read `/changes/`; compare with history docs | all published changes, newest first | pass | site + `data/signals` |
| SPEC-19 REQ-005 | Signal detail page shows current state, last change, freshness, source before verification metadata | editorial + integration | DOM order check on `/signals/<id>/` | current values first; hashes not dominant | pass | generated pages |
| SPEC-19 REQ-006 | Readable history view derived from canonical history.v1 with provenance secondary | data + integration | read `/signals/<id>/history/`; diff against history.json | entries match; provenance present, secondary | pass | site + data |
| SPEC-19 REQ-007 | Internal ids/hashes not dominant; human labels primary | editorial | HTML inspection of index/detail/history | raw ids only as secondary labels | pass | generated pages |
| SPEC-19 REQ-008 | Every public page has title, description, stable canonical URL | integration | headless DOM per page | present and stable | pass | headless render |
| SPEC-19 REQ-009 | Mobile (360 px) and desktop layouts usable | scenario | headless Chromium 360 px and 1280 px; overflow check | no horizontal overflow, nav/main present | pass | headless render |
| SPEC-19 REQ-010 | Static generation from canonical data only; API/feed/sitemap/Pages/QA intact | compatibility + data | fresh checkout `pnpm generate`; diff API JSON vs data files; feed/sitemap | identical; surfaces intact | pass | local run + Pages |
| SPEC-19 REQ-011 | Human labels are product-owned presentation; renderer applies generically | review + unit | inspect meta map + renderer; fallback-id unit test | no contract change; generic rendering | pass | checkout |

## Data/editorial evidence plan

QA reads the deployed pages and compares every published value and date with
the product-owned canonical `data/signals/*.json` and `.history.json` files
at the accepted commit (byte-identical API output verified), and
cross-checks the two official source pages. Human names ("Gemini 3.7
Flash", "DeepSeek V4 Flash") match the official provider/product naming.

## Acceptance gate

QA-19 passes when all rows pass with fresh evidence, and the deployed build
at the accepted commit matches the canonical data.

## Known evidence boundary

The `iolo.lol` domain currently resolves to a non-service address from the
QA network; direct `https://iolo.lol/` verification is blocked (SPEC-19
Q-001). QA verified the identical build at the Pages project URL, the
configured custom domain state via the Pages API, and that every generated
link uses the canonical origin; the redirect to the canonical domain is a
transitional CDN edge state that clears after DNS lands (ADR-0004).
