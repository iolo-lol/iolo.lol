kind: iolo-spec/v1
id: SPEC-19-human-facing-website
title: Human-facing Signals website
status: accepted
related_issue: "#19"
owner: PM
freshness: live
---

## Goal

Turn the public iolo.lol surface from a QA/reference renderer into a website
that a first-time visitor can read, understand, navigate, and return to,
without repository or project context. The site is the human information
experience for the two M4 Signals; machines keep the existing API, feed, and
canonical data unchanged.

## PM definition of the minimum human information experience

A first-time visitor to `https://iolo.lol/` must be able to answer, from the
public pages alone:

1. **What is this?** iolo.lol tracks structured facts — "Signals" — about AI
   services, directly from official sources, with the sources recorded.
2. **What is being tracked?** A Signals index names each Signal and its
   provider/model in human language.
3. **What changed recently?** The home page and a recent-changes view list
   published changes with dates and human summaries.
4. **What is the current state?** Each Signal detail page shows the current
   values first, readably.
5. **When was it last checked?** Freshness (last observation) is visible on
   index and detail pages.
6. **Which authoritative source supports it?** Each detail page links the
   official source; verification metadata (content hash, raw timestamps,
   internal ids) is present but secondary.

Human-readable provider/model labels are the primary names everywhere;
internal Signal ids and content hashes never dominate the reading flow.

## Requirements

- REQ-001: `https://iolo.lol/` (Architect-approved canonical production form
  under the iolo.lol domain) resolves to the human-facing product; the GitHub
  Pages project URL is not required knowledge for visitors.
- REQ-002: The home page states what iolo.lol is and what Signals are in
  user language, without repository or contract context.
- REQ-003: A Signals index (home and/or dedicated page) exposes every
  published Signal with a human-readable name and provider/model label,
  current values summary, and freshness.
- REQ-004: A recent-changes view lists published canonical changes with
  human-readable dates, signal names, and value summaries, newest first.
- REQ-005: Each Signal has a detail page with readable current state
  (current value statements), last meaningful change, freshness (observed and
  fetched times), and a link to the authoritative source, before any
  verification metadata.
- REQ-006: Each Signal has a readable change-history view derived from the
  canonical `history.v1` document, with provenance (source URL, fetchedAt,
  contentHash) available but secondary.
- REQ-007: Internal Signal ids, content hashes, and raw schema fields never
  dominate the reading flow; human labels are primary on index, detail, and
  history pages.
- REQ-008: Every public page has an appropriate title, description, and a
  stable canonical URL under `https://iolo.lol/` suitable for sitemap/feed
  links.
- REQ-009: Mobile and desktop layouts are usable (readable text, working
  navigation, no horizontal overflow on a 360 px viewport).
- REQ-010: The site is statically generated from product-owned canonical data
  (`data/signals/*`) only; no engine access at build or request time; the
  machine API (`api/v1/*`), Atom feed, sitemap, Pages deployment, and QA
  traceability remain intact.
- REQ-011: Human labels are product-owned presentation state; they do not
  change canonical data or public contracts, and they apply to every Signal
  without per-Signal special-casing in the renderer.

## Non-goals

- Authentication, personalization, CMS, large design system, complex
  analytics dashboard, or dynamic backend.
- Replacing or weakening canonical data/contracts or QA evidence.
- Changing the machine API surface or public contracts.

## Architecture constraints and references

- Product ADR-0003 (static hosting) and the Architect-approved canonical URL
  decision for the iolo.lol domain.
- Product ADR-0002: canonical state is product-owned data entered through the
  governed publication boundary; the site reads only that state.
- result.v1 / history.v1 contracts: the site renders these documents; it does
  not fork them.

## Dependencies

- Accepted M4 canonical/history data for both Signals (in `data/signals/`).
- Architect decision on the canonical iolo.lol URL form and Pages custom
  domain configuration.

## Unresolved questions

- Q-001 [verification]: how to verify the iolo.lol domain from the current
  network environment where DNS resolution returns a non-service address.
