# iolo.lol Agent Team Contract

Status: active repository contract for [iolo.lol#4](https://github.com/iolo-lol/iolo.lol/issues/4), tracked by [iolo.lol#1](https://github.com/iolo-lol/iolo.lol/issues/1)

This contract coordinates PM, Architect, Engineer, and QA work through durable
repository state. It does not select or require a model, vendor, harness, or
orchestration service. The project roadmap and product record live in
`iolo-lol/engine` GitHub issues; this document defines how roles use that
record. Public-repo issues cover only public-repository-local concerns.

The same model applies to the `iolo-lol/engine` repository. Contract ownership
between the product and engine repositories is defined in
[`architecture.md`](architecture.md).

## Roles and authority

Each decision class has one final authority. A role may provide input to
another role, but input is not approval and an agent must not self-authorize a
decision owned elsewhere.

| Role | Final authority | Must not self-authorize |
| --- | --- | --- |
| PM | Product scope, priority, observable requirements, and product acceptance | Architecture contracts, implementation completion, or verification sufficiency |
| Architect | Architecture boundaries, public/internal contracts, dependency direction, and accepted ADRs | Product scope, implementation completion, or QA verdicts |
| Engineer | Implementation and implementation-level tests within the approved issue, spec, and architecture | Scope changes, ADR decisions, or final acceptance |
| QA | Verification strategy, data/editorial correctness, evidence sufficiency, and pass/fail of the stated requirements | Product behavior, architecture contracts, or implementation changes |

PM accepts a task only after QA has recorded an independent verification result.
QA evaluates the current checkout, tests, fixtures, and CI evidence rather than
the Engineer's self-report. A disagreement is routed to the role that owns the
decision class; it is not resolved by recursive delegation.

## iolo-specific QA responsibility

Where a feature publishes external facts (a Signal, editorial content, or any
community-facing claim), QA verifies both software behavior and the
data/editorial evidence behind the published facts. Software tests alone are
not sufficient evidence for a feature that states something about the world.

## Workflow and blocked routes

The normal state flow is:

```text
proposed -> specified -> architecture-review -> test-planned -> implementation
    -> verification -> accepted
```

PM may also move a task to `deferred` or `rejected`. Any active state may enter
one of these explicit blocked states:

| State | Use when | Owner and exit |
| --- | --- | --- |
| `blocked-product` | Scope, priority, requirement, or acceptance is unresolved | PM records the decision in the issue/spec, then returns to the affected state or defers/rejects |
| `blocked-architecture` | A boundary, public contract, dependency, or ADR decision is unresolved | Architect records or updates the ADR/spec decision, then returns to architecture review or rejects the design |
| `blocked-verification` | Required evidence, test environment, fixture provenance, or expected result is unresolved | QA records the evidence decision or missing prerequisite, then returns to test planning/verification |

The state owner records the transition and unresolved question in the durable
artifact. A blocked state is not a pass, and unavailable evidence is not an
implicit approval.

## Controller role

The controller (session routing and status infrastructure) is non-authoritative.
It may route sessions, collect durable outputs, perform deterministic status
checks, and execute approved repository writes. It does not make product,
architecture, implementation, or QA decisions.

## Authority ordering

Artifacts have different authority; lower-level evidence cannot silently
rewrite a higher-level requirement.

| Artifact | Authority and use |
| --- | --- |
| Active GitHub issue | PM-owned product scope, priority, and acceptance; issue state is not copied into `docs/` |
| Accepted ADR | Architect-owned architecture and contract decisions |
| Feature spec | PM-owned observable refinement of one issue, constrained by the issue and accepted ADRs |
| QA test plan | QA-owned proof strategy and requirement-to-evidence mapping; it cannot redefine behavior |
| Implementation | Engineer-owned current code within the approved contracts; it is evidence of behavior, not requirements |
| Tests and fixtures | Executable evidence of selected behavior, with provenance recorded where relevant |
| CI evidence | Fresh execution evidence for a commit; it does not establish scope, architecture, or acceptance by itself |

When artifacts conflict, stop at the affected decision class and route to its
owner. Do not silently make the implementation, a test, or a QA plan the new
source of truth.

## Feature spec schema

Use a spec when a change needs coordination across roles. The spec refines one
active issue; it does not become a second roadmap or add unapproved scope.
Requirement IDs are stable within the spec and must not be reused after a
requirement is removed.

```yaml
kind: iolo-spec/v1
id: SPEC-<issue>-<short-name>
title: <observable feature name>
status: proposed | specified | in-progress | verification | accepted | deferred
related_issue: "#<number>"
owner: PM
freshness: live | snapshot
as_of_commit: <40-hex commit> # required when freshness is snapshot
```

The body contains these sections:

```markdown
## Goal
<user-visible outcome>

## Requirements
- REQ-001: <observable behavior and acceptance condition>
- REQ-002: <observable behavior and acceptance condition>

## Non-goals
- <explicitly excluded behavior>

## Architecture constraints and references
- <accepted ADR or contract link, with the constraint it supplies>

## Dependencies
- <issue, fixture, external tool, or environment dependency, if any>

## Unresolved questions
- Q-001 [product|architecture|verification]: <question and owner>, if any
```

The `related_issue`, `REQ-*` IDs, and referenced ADRs make scope and decisions
traceable without copying the issue's roadmap state.

## QA test-plan schema

QA creates a companion plan after the requirements are stable. Each requirement
must have a row, including requirements whose evidence is currently blocked.

```yaml
kind: iolo-qa/v1
id: QA-<spec-id>
spec: SPEC-<issue>-<short-name>
related_issue: "#<number>"
status: planned | running | blocked | passed | failed
owner: QA
freshness: live | snapshot
as_of_commit: <40-hex commit> # required when freshness is snapshot
```

| Requirement ID | Observable check | Evidence layer | Command, fixture, or CI job | Expected result | Result | Evidence boundary |
| --- | --- | --- | --- | --- | --- | --- |
| `REQ-001` | <what QA checks> | unit / integration / compatibility / scenario / release / editorial | `<reproducible command or link>` | <pass condition> | planned / pass / fail / blocked | `<commit, report, or runtime>` |

For requirements that publish external facts, the plan includes a
data/editorial evidence row in addition to the software-behavior row. QA records
the exact checkout or commit, command, fixture/provenance identity, and relevant
report or test output. A plan describes how to prove a requirement; it cannot
weaken, reinterpret, or add product behavior. Fresh QA verification must inspect
current code/tests/CI independently of Engineer claims.

## Freshness and snapshots

Documents that describe a point-in-time analysis, generated output, or a
reviewed evidence set use `freshness: snapshot` and record an immutable
`as_of_commit` (or an equivalent content digest when no Git commit exists).
They must state what was observed and cannot be presented as current
implementation status. Live contracts use `freshness: live`; they do not make
historical evidence current.

## Related authorities

* [Cross-repo architecture and contract ownership](architecture.md) and its [ADRs](adr/README.md)
* [Repository routing guide](../AGENTS.md)
* [GitHub issue iolo.lol#1](https://github.com/iolo-lol/iolo.lol/issues/1) and [#4](https://github.com/iolo-lol/iolo.lol/issues/4)
