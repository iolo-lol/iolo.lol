# iolo.lol Cross-repo Architecture and Contract Ownership

Status: live contract for [iolo.lol#5](https://github.com/iolo-lol/iolo.lol/issues/5);
roadmap/planning authority updated by [iolo-lol/engine#8](https://github.com/iolo-lol/engine/issues/8)

This document defines the durable boundary between the product repository and
the engine repository, who owns which contracts, where roadmap/planning
authority lives, the direction dependencies may flow, where ADRs live, how
scheduled Agent execution composes, and how cross-repo issue references are
written.

## Roadmap and planning authority

`iolo-lol/engine` is the project control plane: product roadmap, milestones,
architecture decisions, execution issues, private operational logic, and
cross-repo implementation coordination live there. `iolo-lol/iolo.lol` is the
public presentation/distribution surface: the SvelteKit static web
application (fully prerendered, no SSR), read-only
generated API/feed/sitemap artifacts, and public schemas or generated data
required by that surface. It is not the project-management or roadmap
authority.

- New product/milestone issues are created in `engine` even when
  implementation requires a PR in the public frontend repository.
- Public-repo issues are reserved for genuinely public-repository-local
  concerns when there is a concrete reason to expose them there; they are not
  the default planning surface.
- Engine issues reference frontend implementation PRs (for example
  `iolo-lol/iolo.lol#<n>` in the issue record) without duplicating issue
  state; the engine issue remains the roadmap record, and the PR is the
  delivery.
- No duplicate roadmap/status source is introduced in this repository.
  Historical milestone reassessments under `docs/roadmap/` are point-in-time
  records, not live roadmap state.

## The boundary

The split is based on **visibility and operational responsibility**, not
frontend/backend layering.

| Repository | Visibility | Responsibility |
| --- | --- | --- |
| `iolo-lol/iolo.lol` | Public product surface | Public presentation/distribution: public contracts, web/API presentation, community-facing surfaces. Not the roadmap or planning authority |
| `iolo-lol/engine` | Private | Roadmap/architecture control plane, ingestion, automation, editorial logic, operational implementation |

A component belongs to the engine when it is operational implementation or
processes private data. A component belongs to the product repository when it
is part of the public product surface, even if it is backend code. Public
contracts must not require private engine implementation details.

## Web application architecture

The deployable public web application converges on **SvelteKit + TypeScript +
static generation** ([iolo-lol/engine#44](https://github.com/iolo-lol/engine/issues/44)):
a fully prerendered static application in `apps/web` (`@sveltejs/adapter-static`,
no SSR and no request-time logic) that renders the human-facing routes and the
static `/api/v1/*`, `feed.xml`, and `sitemap.xml` artifacts from the canonical
`data/signals` state through the same deterministic pure projections. The
production runtime remains Cloudflare Workers Static Assets, assets-only
(ADR-0005). Stable pure projection/data modules stay plain TypeScript and are
not framework-coupled.

## Contract ownership

| Contract class | Owner | Notes |
| --- | --- | --- |
| Public product contracts (Signals schema, web/API contracts, community-facing formats) | `iolo-lol/iolo.lol` | Consumed by the engine; changes require a product-repo change |
| Canonical signal state (`data/signals/*.json`) | `iolo-lol/iolo.lol` | Product-owned data conforming to public contracts; produced by the engine, entered only through the governed publication boundary ([ADR-0002](adr/0002-canonical-state-and-publication-boundary.md)) |
| Engine-internal contracts (ingestion, automation, editorial pipelines) | `iolo-lol/engine` | Never published; may change without a public surface change |
| Cross-repo boundary contract (this document) | `iolo-lol/iolo.lol` | The boundary decision is a public contract |

## Dependency direction

- Public contracts flow **from the product repository to the engine**: the
  engine consumes the product repo's public contracts.
- The engine implements and operates against those contracts but never
  publishes, forks, or unilaterally changes them.
- The product repository does not depend on engine internals. Public surfaces
  and contracts remain valid without any engine implementation detail.
- The engine may run independently of the product repo's presentation layer,
  but its external-facing outputs must conform to product-owned contracts.

## Scheduled Agent execution

Recurring automation is a composition, not a fixed runtime. The durable model
is:

```text
Schedule -> Agent Runner -> Job -> Tools -> Sink
```

- **Schedule** decides when work runs.
- **Agent Runner** provides reasoning/routing when the job needs it.
- **Job** is the durable repository-owned specification of the work.
- **Tools** perform deterministic fetch/extract/validate/update operations.
- **Sink** is the governed API/Git/data destination.

`Job`, `Tools`, and `Sink` are durable project assets. `Schedule` and
`Agent Runner` are replaceable execution profiles unless an issue explicitly
standardizes one.

Valid compositions include Agent-app-native scheduling that sends a short
prompt before running repository tooling, host cron/systemd/container launchers
that invoke an Agent CLI, scheduled GitHub Actions for suitable work, and
Cloudflare Cron for lightweight periodic HTTP/check/trigger work. Manual runs
use the same job contract. The architecture does not privilege one direction:
`Agent scheduler -> shell/tool` and `host scheduler -> Agent CLI -> tool` are
both valid.

Choose an execution profile using correctness, privacy, observability,
maintenance, and recurring cost. Public GitHub-hosted execution may be useful
when the work genuinely belongs in a public repository; private logic or data
must not be moved public merely to reduce runtime cost. Cloud runtimes must
justify cadence and compute cost rather than becoming the default for every
periodic task.

Words such as `automatic`, `scheduled`, `daily`, `hourly`, `periodic`, and
`recurring` describe behavior/cadence only. They do not select GitHub Actions,
Cloudflare Cron, an OS scheduler, a particular Agent app, or any other runtime.
Scheduled prompts should normally be short invocations that resolve durable
job/tool definitions from the repository instead of duplicating the job spec.

See [ADR-0006: Composable scheduled Agent execution](adr/0006-composable-agent-execution.md).

## ADR ownership

- ADRs that affect public contracts, the product surface, or the cross-repo
  boundary live in `iolo-lol/iolo.lol` under [`docs/adr/`](adr/README.md).
- ADRs that affect only private engine implementation and operations live in
  `iolo-lol/engine`.
- A decision that changes the boundary itself is a product-repo ADR and
  supersedes any engine-internal assumption to the contrary.

## Cross-repo issue references

- References to an issue in the other repository use the qualified form
  `owner/repo#number`, for example `iolo-lol/engine#1`.
- Unqualified `#number` references an issue in the current repository.
- Parent/sub-issue links and `Depends on:` / `Related roadmap:` lines use the
  same qualified form so the roadmap record in engine stays readable from
  either repository.

## Related authorities

* [Architecture decision records](adr/README.md), especially
  [ADR-0001: Cross-repo boundary and contract ownership](adr/0001-cross-repo-boundary.md),
  [ADR-0002: Canonical signal state and publication boundary](adr/0002-canonical-state-and-publication-boundary.md), and
  [ADR-0006: Composable scheduled Agent execution](adr/0006-composable-agent-execution.md)
* [Agent Team contract](agent-team.md)
* [Repository routing guide](../AGENTS.md)
* [Engine control-plane decision iolo-lol/engine#8](https://github.com/iolo-lol/engine/issues/8)
* [GitHub issue iolo.lol#1](https://github.com/iolo-lol/iolo.lol/issues/1) and [#5](https://github.com/iolo-lol/iolo.lol/issues/5)
