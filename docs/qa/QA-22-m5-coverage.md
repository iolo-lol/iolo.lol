kind: iolo-qa/v1
id: QA-22-m5-coverage
spec: SPEC-22-m5-coverage
related_issue: "#22"
status: in-progress
owner: QA
freshness: live
---

# M5 QA proof strategy — five-Signal coverage

Proves SPEC-22-m5-coverage for the acceptance gate iolo.lol#22, independently
of Engineer summaries: engine fixture reproduction, live Agent runs across the
five-Signal set, governed publication into the product repo, the generated
five-Signal site, and both repos' CI.

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| SPEC-22 REQ-001 | Three new Signals accepted with private extractors, provenance fixtures, and reproducing tests | review + unit + integration | read engine signal map + `fixtures/<signal>/{page.html,provenance.json}`; `pnpm --filter @iolo.lol/pipeline test` twice | 5 signals; sha256 + fetchedAt recorded; extractor + e2e tests green on both runs | pass | engine checkout; fixture hashes `ead567c4` (xai), `a922377c` (cohere), `a0bb04f9` (together) |
| SPEC-22 REQ-002 | Five Signals canonical + history in product `data/signals/` via governed publication | data + compatibility | staged payloads from agent runs validated against result.v1/history.v1; committed to product repo; contracts unchanged (empty diff) | 5 `*.json`/`*.history.json` pairs; contract schemas untouched | pass | engine `runs/staged/` + product `data/signals/` + `git diff packages/contracts/schemas` |
| SPEC-22 REQ-003 | Human site/API/feed/sitemap correct for five Signals | integration + data | `pnpm --filter @iolo.lol/web generate`; diff generated API vs `data/signals/*`; grep pages/feed/sitemap | 5 ids in signals.json; all detail/history pages; 5 feed entries; canonical URLs; byte-identical API | pass | generated `packages/web/site` + captured `site.txt` |
| SPEC-22 REQ-004 | No forbidden infrastructure; PublishPolicy writes only on `change` | review + unit | full diff of both repos; `planPublication`/`commitPublication` tests | no registry/crawler/LLM/queue/D1/KV/R2/dynamic backend; unchanged contracts | pass | diffs + pipeline publication-policy tests |
| SPEC-22 REQ-005a | All five Signals match authoritative source evidence | data + editorial | extractor output vs recorded page content (fixtures + live fetches) | values verbatim from official pages | pass | fixture provenance + live run evidence |
| SPEC-22 REQ-005b | Deterministic reproduction | integration | `pnpm --filter @iolo.lol/pipeline pipeline --signal <id> --fixture <dir>` twice per new signal | identical contentHash == provenance sha256, identical values | pass | `fixture-repro.log` |
| SPEC-22 REQ-005c | Unchanged-run/no-false-change | scenario | local Agent run twice (pre-publication) and once post-publication | unchanged verdicts stable; no spurious change; new signals `change` only while canonical absent | pass | `agent-run-1.json`, `agent-run-2.json`, post-publication run |
| SPEC-22 REQ-005d | Error/no-write | scenario | unreachable-source agent run (fixture-error harness) | error evidence recorded; product checkout untouched | pass | engine error-run evidence + agent tests |
| SPEC-22 REQ-005e | Local Agent across the expanded set | integration | `pnpm --filter @iolo.lol/pipeline agent --config <engine>/agent.config.json` | 5 signalIds, per-signal evidence, `orchestrator: local-agent`, exit 0 | pass | `runs/agent-*.json` |
| SPEC-22 REQ-005f | Governed publication | compatibility | agent never writes product checkout; payloads staged then committed after validation | staged-only until validated; canonical+history committed together | pass | agent tests + `runs/staged/` + product commits |
| SPEC-22 REQ-005g | Canonical/history correctness | data | contract validation of every staged payload; history entries carry provenance | valid result.v1/history.v1; entries have source hash/fetchedAt/url | pass | validation script + product data |
| SPEC-22 REQ-005h | Human website/API/feed/sitemap correctness | integration + scenario | generated pages; `wrangler deploy --dry-run`; local `wrangler dev` route probe | all pages 200, JSON/XML content types, custom 404, canonical links | pass | dry-run (42 assets) + dev-server probe |
| SPEC-22 REQ-005i | Cloudflare production deployment | integration | live Cloudflare surface checks (blocked) + identical-build dry-run | REQ-002/003/007 of QA-20 | blocked | single external action named in #20 (Cloudflare account + `iolo.lol` DNS) |
| SPEC-22 REQ-005j | Product + engine CI green | compatibility | GitHub Actions on both repos at accepted commits | green | in-progress | CI runs after push |
| SPEC-22 REQ-006 | Post-M5 reassessment resolves five candidates, none implemented | review | read `docs/roadmap/post-m5-reassessment.md` | all five directions resolved; no implementation | planned | reassessment doc |

## Data/editorial evidence plan

QA compares every extracted value with the recorded page content (fixture
provenance sha256 and the live fetched pages) and re-checks the human-facing
flows (home / Signals index / detail / history / changes, feed, sitemap) for
the five-Signal set, plus the Cloudflare deployment surface once the #20
blocker clears.

## Acceptance gate

QA-22 passes when every row passes with fresh evidence, both repos' CI is
green at the accepted commits, and the post-M5 reassessment resolves the five
candidate directions without implementing any.

## Known evidence boundary

The Cloudflare production surface rows stay blocked by the single named
operator/domain action in #20 (account + `iolo.lol` DNS); the identical build
is verified via dry-run and local dev-server probes. The operator scheduling
agent for a genuinely unattended scheduled run is a named external dependency
(engine scheduling hand-off contract); in-environment evidence is
local-Agent-orchestrated run records.
