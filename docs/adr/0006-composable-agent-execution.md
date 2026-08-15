# ADR-0006: Composable scheduled Agent execution

- Status: Accepted
- Date: 2026-08-15
- Related: [Cross-repo architecture](../architecture.md),
  [engine ADR-0004](https://github.com/iolo-lol/engine/blob/main/docs/adr/0004-composable-agent-execution.md),
  [engine issue #6](https://github.com/iolo-lol/engine/issues/6)

## Context

Earlier milestones proved recurring Signal execution first through GitHub-hosted
cron and later through a local/self-hosted Agent. Those were useful operating
experiments, but their wording allowed a runtime choice to harden into project
architecture. In particular, requirements such as `automatic`, `scheduled`,
`daily`, or `periodic` can cause implementation agents to infer that the
project must build or adopt GitHub Actions cron, Cloudflare Cron, launchd,
cron/systemd, or another specific scheduler.

The durable product requirement is simpler: iolo.lol needs unattended,
repeatable jobs that produce governed structured outputs at an appropriate
cadence and cost. The scheduler and Agent runtime are replaceable execution
concerns.

## Decision

iolo.lol uses a five-layer execution model:

```text
Schedule -> Agent Runner -> Job -> Tools -> Sink
```

The layers mean:

1. **Schedule** — decides *when* work should run.
2. **Agent Runner** — provides reasoning, routing, and exception handling.
3. **Job** — durable repository-owned specification of *what* should happen,
   including inputs, output expectations, validation, and stop conditions.
4. **Tools** — deterministic operations such as shell commands, fetchers,
   extractors, validators, and repository utilities.
5. **Sink** — governed destination such as an API, Git-backed canonical data,
   or another explicit product-owned contract.

`Job`, `Tools`, and `Sink` are durable project assets. `Schedule` and
`Agent Runner` are execution profiles unless an issue explicitly makes one of
them part of a durable contract.

### Prompt boundary

A scheduled prompt should normally be a small invocation, not a duplicated job
specification. For example:

```text
Run the AI pricing update job and handle any verified changes.
```

The Agent resolves the durable job/tooling from the repository. Changing the
job should not require editing every scheduler prompt.

### Supported execution compositions

No single composition is mandatory. Valid profiles include:

- **Agent-native**: an Agent app schedules a short prompt, then the Agent runs
  repository jobs/tools and writes through a governed sink.
- **Host-driven**: cron/systemd/container tooling launches an Agent CLI, which
  receives a short prompt and runs the same repository jobs/tools.
- **GitHub Actions**: scheduled Actions may run suitable jobs directly or
  invoke an Agent/CLI when the repository boundary, credentials, and cost make
  that the smallest responsible choice. Public execution should be preferred
  when the work can genuinely live in a public repository without leaking
  private logic, data, or credentials.
- **Cloudflare Cron**: suitable for lightweight periodic HTTP/check/trigger
  work when its cadence and runtime cost are justified. It is not an implicit
  home for expensive Agent reasoning merely because a task is periodic.
- **Manual/ad hoc**: any supported runner may invoke the same job contract for
  debugging, QA, or one-off operation.

The direction may be either `Agent scheduler -> shell/tooling` or
`host scheduler -> Agent CLI -> tooling`; neither direction is privileged by
the architecture.

### Cost and maintenance rule

Execution-profile selection is an architecture decision driven by measured or
credible operating constraints. Prefer the lowest-maintenance, lowest-cost
profile that satisfies correctness, privacy, reliability, and observability.
Do not make every recurring task depend on one hosted scheduler, and do not
move private implementation into a public repository solely to obtain cheaper
execution.

The words `automatic`, `scheduled`, `daily`, `hourly`, `periodic`, or
`recurring` specify behavior/cadence only. They do **not** select a scheduler,
Agent product, host, or cloud runtime.

### Publication authority

Execution composition does not change the publication boundary. Agents and
schedulers may produce Results, evidence, and publication candidates, but
canonical publication remains governed by the existing product-owned
contracts and publication policy.

## Consequences

- Agent apps with native scheduling can use very short prompts while durable
  behavior remains versioned in the repository.
- Shell/container/server launchers remain first-class and can invoke an Agent
  CLI when that is operationally simpler.
- GitHub Actions and Cloudflare Cron remain available rather than being banned,
  but they must earn their place through cost, privacy, and maintenance value.
- Historical M3/M4 runtime experiments remain valid evidence; they no longer
  define a mandatory long-term runner.
- Issues can state cadence without accidentally prescribing infrastructure.
- QA should verify the job contract and observable outputs independently from
  the selected execution profile, while also recording which profile actually
  produced the evidence.

## Compatibility impact

No public Result, history, API, feed, or canonical-data schema changes. This
changes the cross-repo architecture vocabulary and supersedes any implication
that routine production ingestion must be driven specifically by a local
macOS Agent or that hosted schedulers are categorically out of scope.

Engine operational documentation must conform to this decision. Existing
historical issues/ADRs may continue to describe the runtime used for their
milestone evidence.

## Open questions

- Whether a future job manifest needs a machine-readable schema should be
  decided only after multiple jobs demonstrate repeated structure that cannot
  be served by small Markdown/config contracts.
- Whether any individual Signal should receive a dedicated public scheduled
  repository is a per-job cost/privacy decision, not a default topology.
