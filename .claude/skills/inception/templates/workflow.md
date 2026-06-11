# Workflow contract

> Operational contract for the `/plan` and `/implement` skills — the single
> source for the branch model, commands, and gates of this project. Filled
> during inception; both skills read it instead of hardcoding specifics.

## Repository

- GitHub repo: `<owner/repo>`
- Base / integration branch: `<main | develop>`
- GitHub Project board: `<url-or-number | none>`

`/plan` requires a GitHub repo; specs are the local single source of truth,
milestones and issues are created on GitHub from them.

## Worktrees

- `/implement` always works in a worktree — never in the main checkout.
- Path convention: `../<repo>-worktrees/<branch-with-slashes-as-dashes>`.
- Operate via `git -C <worktree>`, never `cd` into it (a `git -C ... push`
  does not start with `git push`, so it bypasses any push-guard on the main
  checkout).

## Commands

- Lint: `<e.g. npm run lint>`
- Test: `<e.g. npm test | none yet>`
- Build: `<e.g. npm run build>`

These are the verification gate. Run lint + test (+ build for app-affecting
changes) and fix until green before opening a PR.

## Branch and spec naming

- Branches: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`.
- Specs: `docs/specs/spec-<scope>.md` — the single source of truth for design.
- Completed specs: moved to `docs/specs/archive/` with the same name.

## Status

The only status markers in `docs/` are `DRAFT` and `READY`, and only in spec
headers. All progress status — in progress, done, blocked, deferred — lives in
the GitHub issues and milestones, the single source of truth for progress. A
completed spec is moved to `docs/specs/archive/`; its milestone closing is the
"done" signal.

## The chain: spec -> milestone -> issues -> PR

| Layer | Owns |
| ----- | ---- |
| `docs/specs/spec-*.md` | The design: why, what, done-criteria |
| GitHub milestone | The phase / grouping |
| GitHub issues | The steps — one issue per implementable step |

A PR closes an issue (`Closes #N`); the issue references its spec path. The
spec never lists steps; the issues never restate the design. The spec's
`Outcome` list is done-criteria, not a progress mirror.

## Gates

- `/plan`: in-session review gate -> resolve genuinely-open decisions
  (AskUserQuestion, never guess) -> human merge gate.
- `/implement`: in-session review gate -> **mandatory human QA gate** after the
  PR -> automated merge + cleanup only after the human confirms.
- QA-gate default check: `<review | UI check | smoke test>`.
