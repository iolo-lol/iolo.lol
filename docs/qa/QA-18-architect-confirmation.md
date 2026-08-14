# M4 Architect confirmation — plane boundaries and generalization

Status: recorded for the iolo.lol#18 acceptance gate
Date: 2026-08-15
Owner: Architect

## 1. Plane separation

The three planes remain cleanly separated, recorded in engine ADR-0003:

- **Local Agent control plane** (engine): decides when work runs and which
  Signals are active (runtime config), and invokes the deterministic
  engine. It has no write path to canonical state. Verified: `agent.ts`
  routes every Signal through `runLive` → `runPipeline` with `readOnly`,
  `validateResult`, and `planPublication`; the Agent cannot bypass Result
  validation or PublishPolicy; it cannot directly invent canonical values
  (tests + run evidence).
- **Deterministic engine data plane** (engine `packages/pipeline`): owns
  fetch → extract → normalize → validate → diff → publication policy for
  known sources; reproducible from recorded fixtures with matching content
  hashes.
- **Public publication plane** (`iolo-lol/iolo.lol`): owns canonical state,
  contracts, website, API, feed, sitemap, and Pages deployment; entered
  only through governed publication (product ADR-0002). The engine stages
  payloads under its evidence area; verified byte-identical canonical API
  output and no product writes.

## 2. Second source without unjustified generic infrastructure

Adding DeepSeek added a second `SignalSpec` entry and one deterministic
extractor in the engine; no generic source registry, no scheduler platform,
no hosted runtime, and no contract changes were introduced. Public contracts
(`result.v1`, `history.v1`) were reused unchanged. Confirmed.

## 3. Human-facing website derives from canonical data

The rebuilt web package (`packages/web`) is a dependency-free static
generator that reads only `data/signals/*` (canonical Results and history
documents). API JSON output is byte-identical to the canonical files;
human-readable labels live in product-owned presentation state
(`packages/web/src/meta.ts`) and never enter canonical data or contracts.
No parallel truth source exists. Confirmed.

## 4. Static hosting remains appropriate

GitHub Pages static hosting (ADR-0003) still serves the product with
near-zero operating cost and no request-time runtime; the canonical iolo.lol
origin is the link/metadata origin (ADR-0004) with the Pages project URL as
the serving implementation until DNS lands. No evidence warrants a dynamic
runtime. Confirmed.

## 5. Boundary decisions recorded

- Product ADR-0004: canonical domain + human-facing IA.
- Engine ADR-0003: local Agent control plane + plane boundaries.
- Engine ADR-0002 marked superseded for routine ingestion.

## Verdict

Architect confirms the M4 architecture for acceptance: control plane /
data plane / publication plane are cleanly separated; the second source
added no unjustified generic infrastructure; the website derives from
product-owned canonical data; static hosting remains appropriate.
