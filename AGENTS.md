# AGENTS.md

iolo.lol is the product repository for the iolo.lol project. It owns the
public product surface: public contracts, web/API presentation, and
community-facing content. The private `iolo-lol/engine` repository owns
ingestion, automation, editorial logic, and operational implementation.

This is a routing guide, not a project status page and not a replacement for
issues, architecture, or test documentation.

## Coordination and scope

For multi-role work, read the [Agent Team contract](docs/agent-team.md) for
role authority, workflow, blocked routes, spec/QA-plan schemas, and evidence
traceability. GitHub issues remain the product scope and roadmap; do not copy
their state into `docs/`.

Before editing, read the active issue and acceptance criteria, inspect the
branch and working-tree status, and identify the authoritative artifact: the
issue, an accepted [ADR](docs/adr/README.md), a contract in
[`docs/architecture.md`](docs/architecture.md), or the matching engine
contract. Preserve unrelated or concurrent changes. Keep public interfaces
product-repo-owned; do not leak private engine implementation details into
public contracts.

## Cross-repo boundary

- `iolo-lol/iolo.lol` (this repo): product, public contracts, web/API
  presentation, community-facing surfaces.
- `iolo-lol/engine`: private ingestion, automation, editorial logic, and
  operational implementation.

The split is based on visibility and operational responsibility, not
frontend/backend layering. Public contracts live here and are consumed by the
engine; the engine never publishes or changes public contracts on its own.
See [`docs/architecture.md`](docs/architecture.md) and its ADRs.

## Signals and Oddities

- **Signals**: structured, continuously updated information.
- **Oddities**: short-lived or experimental interactive content.

Where a feature publishes external facts, QA verifies both software behavior
and the data/editorial evidence; see the [Agent Team contract](docs/agent-team.md).

## Validation and delivery

Follow the verification path named by the active issue and its QA plan rather
than treating a build, health check, or single test as proof of acceptance.
State the evidence level and boundary.

For implementation work, review the complete diff, run `git diff --check`,
stage only task-owned files, and make a focused commit by default. Preserve
unrelated dirt. Do not push, rewrite history, delete data, publish artifacts,
or modify remote issues unless explicitly requested. Never commit credentials,
private runtime data, or unreviewed generated/third-party material.
