# ADR-0004: Canonical production domain and human-facing information architecture

- Status: Accepted
- Date: 2026-08-15
- Related: [Issue #19](https://github.com/iolo-lol/iolo.lol/issues/19),
  [Issue #18](https://github.com/iolo-lol/iolo.lol/issues/18),
  [ADR-0003](0003-public-runtime-static-hosting.md),
  [SPEC-19-human-facing-website](../specs/SPEC-19-human-facing-website.md)

## Context

M1–M3 optimized the public surface for correctness and verification: a single
QA/reference page rendered canonical signal state with raw ids, timestamps,
and hashes, served from `https://iolo-lol.github.io/iolo.lol/`. M4 adds enough
real Signal data (two providers, two structurally different sources) to
warrant a first human-facing information experience. The issue requires that
`https://iolo.lol/` (or an Architect-approved canonical production form under
that domain) resolve to the human-facing product, with the GitHub Pages
project URL remaining an implementation detail.

The iolo.lol domain is registered (registrar: Spaceship). From the current
network environment, DNS for `iolo.lol` resolves to a non-service address, so
end-to-end resolution cannot be verified from this host; the GitHub Pages
project URL is the verified serving point.

## Decision

1. **Canonical domain**: `https://iolo.lol/` is the canonical production
   origin for the human-facing product and for every public link the site
   generates (navigation, canonical metadata, sitemap, Atom feed links,
   pages). The GitHub Pages project URL
   (`https://iolo-lol.github.io/iolo.lol/`) is an implementation/deployment
   detail, not the canonical origin.
2. **Serving path**: GitHub Pages remains the static serving runtime
   (ADR-0003 unchanged). The Pages custom domain is configured to
   `iolo.lol` so that once DNS points `iolo.lol` at GitHub Pages
   (`CNAME iolo.lol → iolo-lol.github.io`), the canonical origin serves the
   site. DNS configuration is a domain-administration action outside
   repository scope; until it resolves, the Pages project URL still serves
   the identical build, and links/metadata continue to use the canonical
   `https://iolo.lol/` origin so no link rewriting is needed when DNS lands.
3. **Information architecture**: the web package is rebuilt from a single
   QA/reference page into a small static multi-page information product,
   derived entirely from product-owned canonical data:
   - `/` — home: what iolo.lol is, what Signals are, current Signals with
     human names and freshness, recent meaningful changes.
   - `/signals/` — Signals index: every published Signal with a human
     provider/model label, current value summary, freshness, and source link.
   - `/signals/<signalId>/` — Signal detail: readable current state (value
     statements), last meaningful change, freshness, authoritative source;
     verification metadata (content hash, fetchedAt, raw ids) in a secondary
     "verification" section.
   - `/signals/<signalId>/history/` — readable change history derived from
     the canonical `history.v1` document, newest first, with provenance
     secondary.
   - Machine surfaces unchanged: `api/v1/signals.json`,
     `api/v1/signals/<id>.json`, `api/v1/signals/<id>.history.json`,
     `feed.xml`, `sitemap.xml` — all now linked with canonical iolo.lol URLs.
4. **Human labels**: human-readable names are product-owned presentation
   state in the web package (a small `signal meta` map keyed by signal id,
   e.g. "Gemini 3.7 Flash — usage rates", "DeepSeek V4 Flash — usage
   rates"). They never enter canonical data or public contracts
   (`additionalProperties: false` in result.v1/history.v1 is preserved), and
   the renderer applies labels generically to every Signal; a Signal without
   a label falls back to its id with a stable marker, so the site never
   breaks when a Signal is added.
5. **Frameless static rendering**: generation stays a dependency-free Node
   static-site generator in `packages/web` (ADR-0003); no framework, CMS,
   auth, design system, analytics, or dynamic runtime is introduced.

Deliberately not decided here: DNS provider changes, the final DNS record
form (CNAME vs ALIAS vs A records) is a domain-administration decision; a
reverse proxy, CDN beyond GitHub Pages, and dynamic/server-side API each
require new evidence.

## Consequences

- The public product has one canonical origin (`https://iolo.lol/`); all
  human and machine links are stable across the DNS transition and remain
  valid when the domain lands.
- QA can verify the canonical-data correctness of the deployed build at the
  Pages URL while DNS resolution remains an external dependency; acceptance
  records the network limitation as an evidence boundary.
- Static hosting, near-zero operating cost, and governed-publication flow
  from ADR-0002/0003 are preserved.
- The web package grows from one renderer to a small page set; tests cover
  page generation, canonical-data fidelity, feed, and sitemap.

## Compatibility impact

Public API paths and contracts are unchanged. `feed.xml` and `sitemap.xml`
change their link origins from the GitHub Pages project URL to
`https://iolo.lol/`; existing feed consumers are expected to update, and
QA-18 verifies the new canonical links, uniqueness, timestamps, and
provenance. The deployed Pages surface remains the serving implementation
until DNS lands.

## Open questions

- None for the architecture; DNS landing is tracked as a domain
  administration action (see SPEC-19 Q-001).
