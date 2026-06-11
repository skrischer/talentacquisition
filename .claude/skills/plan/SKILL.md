---
name: plan
description: Drive a single planning cycle end-to-end — survey readiness, sort open decisions into precedent/constraint/genuinely-open, draft a spec from the template (the local single source of truth), open and review its PR via the in-session Agent tool, resolve the one genuinely-open decision, flip it READY, merge, then create the GitHub milestone and issues and update the roadmap. Use when the user runs /plan <scope> or asks to plan a phase / write a spec from readiness to a READY spec with issues. Reads docs/workflow.md for project specifics.
---

# /plan — drive one planning cycle to a READY spec + issues

Orchestrates the readiness -> `READY` spec -> milestone + issues cycle. Specs
are the **local single source of truth**; milestones and issues are created on
GitHub from them. The argument is the scope to plan, e.g. `/plan dashboard-kpis`.

This is the planning-side sibling to `/implement`. Both read **`docs/workflow.md`**
(the workflow contract, produced by `/inception`) for the repo, base branch,
project board, commands, naming, and status markers — never hardcode them. If
`docs/workflow.md` is missing, stop and tell the user to run `/inception` first.

**Autonomy:** survey, draft the spec, open the PR, and run the review
autonomously. **Stop and hand off at two gates** — the genuinely-open decision
(resolve via `AskUserQuestion`, never guess) and the merge gate — and on any
error or blocker.

## Preconditions

- A GitHub repo is required (the chain creates milestones and issues). Confirm
  with `gh repo view`; if there is none, stop.
- The base branch must have at least one commit — the spec PR worktree is
  branched from it (`git worktree add ... <base>`), which fails on an unborn
  branch. Check `git rev-parse --verify "<base>" 2>/dev/null`; if it fails, stop
  and ask the user to make the initial commit first (`/inception`'s close-out
  offers this).
- Run from the main checkout on the base branch, with a clean tree. Check
  `git rev-parse --abbrev-ref HEAD` and `git status -sb`; if not on a clean base
  branch, stop and ask.

## 1. Readiness

- `docs/roadmap.md` is the queue — it names the sequenced phases and which is
  the current focus. Orient on it first; if the scope argument is empty, the
  roadmap's current-focus phase is what to plan.
- Survey existing specs, open issues and milestones:
  ```
  gh api repos/:owner/:repo/milestones --jq '.[]|"\(.number) \(.title) [\(.state)] open=\(.open_issues)"'
  gh issue list --state open
  ```
- Decide whether this is actually a planning session. If a `READY` spec already
  covers the scope (with a milestone and issues), there is nothing to plan —
  point the user at `/implement <issue#>`. Never act against a `DRAFT`.

## 2. Resolve decisions before writing

Sort every open design question into three buckets — most "open" questions are
not actually open:

1. **Precedent-decided** — backed by reference implementations in
   `docs/prior-art.md` (if the project keeps one). Adopt and record in the spec.
2. **Constraint-determined** — derivable from this codebase, `docs/constitution.md`,
   or `CLAUDE.md`. Decide it and record the rationale.
3. **Genuinely open** — neither precedent nor constraint settles it. These are
   the only ones that block `READY`; they are resolved at the review gate
   (step 5), not guessed now.

> Check bucket 2 against the codebase and constitution before declaring anything
> "open" — most "open" decisions turn out to be already determined.

## 3. Draft the spec

- From `templates/spec-template.md` (next to this skill) into
  `docs/specs/spec-<scope>.md`. Bound the scope tightly. Put settled decisions
  in **Prior decisions** with rationale; mark each genuinely-open point
  explicitly (e.g. an `OPEN — resolved at the review gate` row). **No step list
  inside the spec** — steps live as issues. The `Outcome` list is done-criteria,
  not a progress mirror. Everything in `docs/` is written in English.

## 4. Worktree and PR

- Create a docs worktree off the base branch (paths/branch from `docs/workflow.md`):
  ```
  base=<base branch from workflow.md>
  wt=../<repo>-worktrees/docs-<scope>
  git worktree add "$wt" -b docs/<scope> "$base"
  ```
- Write the spec into the worktree, then operate **only** via `git -C "$wt"`,
  never `cd` — `git -C` targets the worktree's branch directly and sidesteps any
  push-guard on the main checkout.
  ```
  git -C "$wt" add docs/specs/spec-<scope>.md
  git -C "$wt" commit -m "docs(spec): ..."
  git -C "$wt" push -u origin docs/<scope>
  gh pr create --base "$base" --head docs/<scope> --title "docs(spec): ..." --body "..."
  ```
- A `docs:` spec PR closes no issue.

## 5. Review gate + resolve the open decision

- Review the spec with a **fresh context via the Agent tool**
  (`general-purpose` or `code-reviewer`), seeded with the PR diff and the
  decision docs (`docs/constitution.md`, `docs/prior-art.md`, any sibling spec
  it builds on). Ask for a verdict whose first line is `VERDICT: READY` or
  `VERDICT: NEEDS CHANGES`, with blocking vs non-blocking findings. The Agent
  tool runs in-session — never shell out to a billed CLI.
- Address the findings. **STOP:** resolve each genuinely-open decision via
  `AskUserQuestion` — do not guess. Bake the answer into the spec (the Prior
  decisions row and a Decision log entry).
- Flip the header `DRAFT` -> `READY` **in the same PR** (the PR is the review
  checkpoint). Commit and push.

## 6. Merge gate (STOP)

- Ask the human to confirm the merge. On confirmation, merge remote-first:
  wait for green checks, squash-merge, then remove the worktree and branch and
  fast-forward the local base branch.
  ```
  gh pr checks <n> --watch          # wait for green
  gh pr merge <n> --squash --delete-branch
  git worktree remove "$wt"
  git checkout "$base" && git pull --ff-only
  ```

## 7. Milestone and issues (only AFTER the spec merges)

- The spec path must resolve on the **default branch**, so it must be merged
  first. Then create the milestone and one issue per implementable step, each
  referencing the spec path:
  ```
  gh api repos/:owner/:repo/milestones -f title="<Milestone>" \
    -f description="Design: docs/specs/spec-<scope>.md"
  gh issue create --title "[<scope>] <step>" --milestone "<Milestone>" \
    --body "Goal: ...\nAcceptance:\n- [ ] ...\n\nSpec: docs/specs/spec-<scope>.md"
  ```
  One issue per step, each with a `Goal:` line and an `Acceptance:` checklist
  mirroring the spec's Verification. If `docs/workflow.md` names a Project board,
  add each issue to it with Status `Todo`.

## 8. Roadmap (mandatory — closes the loop)

- Every plan cycle ends by updating `docs/roadmap.md` (seeded by `/inception`):
  fill the planned phase's **Spec** and **Milestone** links in the overview
  table, and move the **current-focus** pointer to the next phase. No status
  marker — the linked milestone is where status lives.
- Do this via its own `docs:` worktree + PR (steps 4 and 6 again). The `#NN`
  links only exist after step 7, which is why this is a separate PR from the
  spec. The cycle is not done until the roadmap reflects it.

## Close out

- When the spec's verification is fully met (the milestone's issues all close),
  move the spec to `docs/specs/archive/`, repoint any links, and add
  implementation decisions to its Decision log. The closed milestone is the
  "done" signal — do not add a status marker to the spec.

## If blocked

- Stop immediately and ask — no workarounds. Record the blocker on GitHub:
  comment on (and label) the affected issue and milestone. Do not add a status
  marker to the spec.
