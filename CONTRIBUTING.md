# Contributing to iolo.lol

iolo.lol is a community-facing product. Contributions are welcome through
GitHub issues and pull requests. Private ingestion, automation, and editorial
implementation live in the separate `iolo-lol/engine` repository and are not
part of this contribution path.

The repository is licensed under
[AGPL-3.0-or-later](LICENSE); by contributing you agree to license your
contribution under the same terms.

## Getting started

1. Read the [repository routing guide](AGENTS.md).
2. For multi-role work, read the [Agent Team contract](docs/agent-team.md).
3. Find the active issue that describes the work and its acceptance criteria.
   GitHub issues are the roadmap; do not invent scope outside them.

## Local setup and validation

Requires Node.js >= 24 and pnpm.

```sh
pnpm install
pnpm check   # typecheck + contract/schema validation tests
```

A change is ready for a pull request when `pnpm check` passes and the diff is
focused on the issue it addresses. CI runs the same checks on every pull
request.

## Public contracts

Public contracts are JSON Schema files in
`packages/contracts/schemas/`; see the
[contract conventions](packages/contracts/schemas/README.md). A breaking
change to a contract is a new major version, never an in-place edit of an
accepted contract.

## Reporting issues

Open an issue with a clear description of the problem or missing behavior and,
where relevant, the acceptance condition you expect. Issues are routed through
the [Agent Team model](docs/agent-team.md).
