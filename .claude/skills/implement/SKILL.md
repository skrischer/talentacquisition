---
name: implement
description: Drive a single issue through the full implementation cycle end-to-end — orient on the issue and its READY spec, create an isolated worktree, implement and verify, commit/push/open a PR, run an in-session review, stop for a mandatory human QA gate, then merge and clean up. Use when the user runs /implement <issue#> or asks to implement/work a specific issue from start to merged. Reads docs/workflow.md for project specifics.
---

# /implement — drive one issue from start to merged

Orchestrates the issue -> merged cycle using plain `git` + `gh`, parameterized
by **`docs/workflow.md`** (the workflow contract from `/inception`: repo, base
branch, worktree convention, lint/test/build commands, QA-gate default). Never
hardcode those — read the contract. If `docs/workflow.md` is missing, stop and
tell the user to run `/inception` first. The argument is the issue number, e.g.
`/implement 42`.

**Git autonomy:** implement, verify, commit, push and open the PR without
pausing. **Two mandatory stops:** the in-session review gate and the **human QA
gate** after the PR. Never merge until the human confirms after the QA gate —
and on any error or blocker.

## Preconditions

- Run from the main checkout on the base branch, with a clean tree. Check
  `git rev-parse --abbrev-ref HEAD` and `git status -sb`; if not on a clean base
  branch, stop and ask.

## 1. Orient

- `gh issue view <n>` — read the issue and its acceptance checklist.
- Read the referenced `docs/specs/spec-*.md`. It must be `READY` (never act on a
  `DRAFT`). The spec owns the design; the issue owns the step.
- A `feat:`/`fix:` PR must close an issue that traces to a spec. `chore:`/
  `docs:`/`refactor:`/`test:`/`ci:`/`build:`/`perf:` are exempt.

## 2. Plan first

- For non-trivial work, lay out a short plan and confirm the approach before
  implementing. Prefer reusing existing patterns; build the minimum the issue
  needs. Use AskUserQuestion only at a genuine fork — a decision the spec and
  code do not settle — not for choices with an obvious default.

## 3. Branch and worktree (always)

- Pick a branch from the contract's naming: `feat/<scope>`, `fix/<scope>`,
  or `chore/<scope>`.
- `/implement` always works in a worktree — never the main checkout:
  ```
  base=<base branch from workflow.md>
  wt=../<repo>-worktrees/<branch-dashes>
  git worktree add "$wt" -b <branch> "$base"
  ```
- Flip the issue to **In Progress** (Project board status, if the contract names
  a board).

## 4. Implement (in the worktree)

- Work in `$wt`. Read existing code first, reuse utilities, keep the change
  minimal. Follow the project `CLAUDE.md` and `docs/constitution.md` — those own
  the language-specific rules (forbidden patterns, boundaries, style); this
  skill does not restate them.

## 5. Verify

- In the worktree, run the contract's commands (`git -C "$wt"` or from inside
  the worktree): lint + test, plus build for app-affecting changes. Fix until
  green.

## 6. Commit, push, open the PR (no pause)

- Commit with Conventional Commits. The body references the spec and ends with
  `Closes #<n>`. Stage specific files; never blind `git add -A`.
- Push via `git -C "$wt" push -u origin <branch>` — phrased this way it does not
  start with `git push`, bypassing any push-guard. Never push to the base branch.
- `gh pr create --base "$base"` with a body that restates the change, the
  verification done, and `Closes #<n>`.

## 7. Review gate (in-session)

- Review the branch with a **fresh context via the Agent tool**
  (`general-purpose` or `code-reviewer`), seeded with the diff
  (`git -C "$wt" diff "$base"...HEAD`) and the constitution/CLAUDE.md rules. Ask
  for a verdict whose first line is `VERDICT: APPROVE` or
  `VERDICT: REQUEST_CHANGES`, with findings. The Agent tool runs in-session —
  never shell out to a billed CLI.
- On `REQUEST_CHANGES`, address the findings (back to step 4) and push the fix.
  Only an `APPROVE` (or explicit human override) clears this gate.

## 8. Human QA gate (STOP — mandatory)

- Always stop here for a human, regardless of change type. Derive concrete
  scenarios from the issue's acceptance checklist and the diff, and present them
  as a numbered list of what to do and what to look for — plus anything the
  reviewer flagged as worth eyeballing. The default check type is in
  `docs/workflow.md` (review / UI check / smoke test).
- For changes a human must run, hand over the exact commands with the real
  branch substituted. The branch is checked out in its worktree, so reuse it
  (`cd "$wt"`) rather than re-checking-out on the main checkout.
- Wait for the human's verdict. On a regression go back to step 4; otherwise
  proceed to the merge.

## 9. Merge and clean up (after the QA gate clears)

- Merge remote-first, then clean up:
  ```
  gh pr checks <n> --watch          # wait for green
  gh pr merge <n> --squash --delete-branch
  git worktree remove "$wt"
  git checkout "$base" && git pull --ff-only
  ```

## 10. Close out

- The merge auto-closes the issue (`Closes #<n>`); set the Project board status
  to Done if the contract names a board.
- Add any decisions made during implementation to the spec's Decision log.
- If the spec's verification is now fully met (its milestone's issues all
  closed), move the spec to `docs/specs/archive/` and update `docs/roadmap.md`.
  The closed milestone is the done signal — no status marker on the spec.

## If blocked

- Stop immediately and ask — no workarounds. Record the blocker on the issue
  (comment + label); do not add a status marker to the spec.
