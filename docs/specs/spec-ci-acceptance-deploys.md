# Spec: CI & acceptance deploys (Phase 8)

> Status: DRAFT
> Created: 2026-06-12

Deterministic machine gates that do not depend on an attended session: a GitHub
Actions workflow running the project's Verify (and Build) on every PR, and an
automation that pushes a frozen acceptance branch when a milestone's last issue
closes so Vercel deploys a stable preview for the milestone QA gate. Infrastructure
only — it adds no product behaviour and updates the workflow contract's Gates
section to match.

## Outcome

- [ ] A GitHub Actions CI workflow runs on every pull request (and on push to
      `main`): `npm ci`, then `npm run verify` (eslint + `tsc --noEmit`) and
      `npm run build`, on a pinned Node version. A red run is visible on the PR;
      a green run is the machine half of the per-PR gate.
- [ ] An acceptance-deploy workflow, triggered when an issue closes, detects that
      the issue's milestone now has zero open issues and pushes a frozen
      `qa/milestone-<n>` branch from the current `main`, which Vercel deploys as the
      stable preview for that milestone's QA gate — without any attended-session
      step.
- [ ] `docs/workflow.md`'s Gates section reflects reality: the per-PR machine gate
      is the CI workflow (Verify + Build) plus the in-session agent review; the
      milestone QA gate consumes the `qa/milestone-<n>` Vercel preview.
- [ ] The autonomous loops still merge without a human PR review; the only added
      merge dependency is the gate-decided branch-protection posture (below).
- [ ] No application code or schema changes; the diff is `.github/workflows/*`,
      `docs/workflow.md`, and (per the gate) branch-protection configuration.

## Scope

### In scope

- **CI workflow** — `.github/workflows/ci.yml`, triggered on `pull_request`
  (any base) and `push: { branches: [main] }` — **not** a bare `on: [push]` (which
  would run on every branch): checkout, setup-node (pinned **Node 20 LTS** — the repo
  declares no `engines`, and Next.js 15 / React 19 require Node ≥ 18.18), `npm ci`,
  `npm run verify`, `npm run build`. Pin the marketplace actions
  (`actions/checkout`, `actions/setup-node`) at least by major tag. The build step
  receives `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` from GitHub Actions repository variables (they are
  public `NEXT_PUBLIC_*` values, already shipped in the client bundle — not secrets).
  The job is named `ci` so it can be referenced as a required status check.
- **Acceptance-deploy workflow** — `.github/workflows/acceptance-deploy.yml`,
  `on: issues: types: [closed]`, `permissions: contents: write`, with a
  `concurrency: { group: qa-milestone-${{ ...milestone number... }}, cancel-in-progress: false }`
  block so two near-simultaneous closes in the same milestone serialise instead of
  racing. Steps: read the closed issue's milestone; if it has one, determine
  completion by **listing the milestone's still-open issues**
  (`gh issue list --milestone <n> --state open`) and treating a count of `0` as
  complete — with one short retry to absorb GitHub's eventual-consistency lag on the
  just-closed issue (avoids the false-negative where the milestone still reports the
  closing issue as open). On completion, push `qa/milestone-<n>` at the current
  `main` SHA, tolerating "already exists" (`git push ... || true`) so a redundant run
  is a harmless no-op. Uses the default `GITHUB_TOKEN` — no PAT.
- **Branch protection (per the gate decision)** — if enforcement is chosen,
  configure `main` branch protection via `gh api` to **require the `ci` status
  check** green before merge, while **not** requiring a human PR review (so the
  autonomous loops still squash-merge once CI is green). Only the `ci` check is
  required — explicitly **not** the Vercel deploy check (which is red until the
  app is deployable, Phase 1 #7, and would otherwise block docs PRs).
- **Workflow-contract update** — edit `docs/workflow.md` so it matches reality:
  the per-PR machine gate is the `ci` GitHub Actions check (Verify + Build), not a
  local-only `npm run verify`; and the milestone QA gate bullet (today
  "QA-gate default check: `UI check`") names the `qa/milestone-<n>` Vercel preview
  as the surface the human checks. Touch Commands only if a command name changes
  (it does not).

### Out of scope

- A test job — the project's Test command is `none yet`; CI runs Verify + Build
  only. The workflow is structured so a `test` step slots in later without redesign.
- Application code, schema, or product behaviour — this phase is infrastructure.
- A bespoke Vercel deployment pipeline / custom Vercel GitHub Action — the existing
  Vercel ↔ GitHub integration already deploys pushed branches; this phase only
  pushes the `qa/*` branch.
- Release tagging, changelogs, semantic-version automation, environment promotion.
- Auto-merge / merge-queue automation — the loops own merging; CI only gates it.
- Secrets management beyond the two public `NEXT_PUBLIC_*` build variables.

## Constraints

Reference `docs/constitution.md` and `docs/workflow.md` rather than restating them.

- **Mostly self-contained infrastructure.** It needs only the Phase 1 scaffold
  (already merged: `package.json` with `verify`/`build`, `package-lock.json`) and
  Vercel being connected (Phase 1). It does not depend on any feature phase and can
  be implemented immediately; it should land **before the first milestone QA gate**
  so the acceptance-deploy automation is in place when a milestone completes.
  **No backfill** for already-closed milestones (e.g. milestone #2, already
  completed and its spec archived): the acceptance-deploy workflow only fires on a
  future `issues: closed` event, so past completions get no retroactive
  `qa/milestone-<n>` branch and need none — the automation serves the milestones
  (#3–#7 and later) that complete after it lands.
- CI runs exactly the project's defined gates (`docs/workflow.md` Commands +
  constitution Quality gates): `npm run verify` (eslint + `tsc --noEmit`) and
  `npm run build`. No `any`, no new lint rules — CI enforces the existing ones.
- `npm ci` (the lockfile is committed); pinned Node 20 (no `engines` field to read).
- The acceptance-deploy branch is `qa/milestone-<n>` — the automation has the
  GitHub **milestone** number, not the roadmap phase number (the two diverge; see
  the roadmap note), so the concrete branch keys off the milestone. This realises
  the roadmap's `qa/phase-<n>` intent.
- Workflows use the default `GITHUB_TOKEN` with least-privilege `permissions:`
  blocks; no PAT, no service-role key (constitution principle 6 is unaffected — CI
  never touches candidate data).
- Branch protection (if enforced) requires the `ci` check only and no human review,
  so the autonomous merge model in `docs/workflow.md` is preserved.

## Human prerequisites

- [ ] **Build variables** — `NEXT_PUBLIC_SUPABASE_URL` and
      `NEXT_PUBLIC_SUPABASE_ANON_KEY` available to CI as GitHub Actions **repository
      variables** so `npm run build` runs. They are public values (already in the
      client bundle); the loop can set them from `.env.local` via `gh variable set`
      if repo-admin token access is available — otherwise the user adds them under
      Settings → Secrets and variables → Actions → Variables.
- [ ] **Vercel branch deploys** — confirm Vercel deploys pushed `qa/*` branches
      (Vercel's default deploys all branches; confirm it was not restricted to PRs
      only).
- [ ] **Branch protection (only if the gate chooses enforcement)** — either confirm
      the loop's GitHub token has admin to set branch protection via `gh api`, or the
      user applies the rule (require `ci`, no required review). If neither, the
      branch-protection issue is parked `blocked:human`. **Apply the rule only after
      the first `ci` run has reported the `ci` check on a PR against `main`** — GitHub
      silently treats a required check it has never seen as "waiting", so enabling it
      before the check name is registered leaves the gate inactive (hence the
      branch-protection issue depends on the CI workflow being merged and run once).

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| CI runs `npm run verify` + `npm run build` (not a test step yet) on PR + push-to-main | These are the project's defined gates (`docs/workflow.md`, constitution Quality gates); Test is `none yet`. PR catches before merge, push-to-main catches anything that slipped | 2026-06-12 |
| Pin Node 20 LTS in CI | No `engines` field; Next.js 15 / React 19 need Node ≥ 18.18; 20 LTS is the safe current default | 2026-06-12 |
| Build env = the two `NEXT_PUBLIC_*` Supabase values as GitHub Actions **variables**, not secrets | They are public (shipped in the client bundle); treating them as variables is honest and lets the loop set them from `.env.local` | 2026-06-12 |
| Acceptance branch = `qa/milestone-<n>`, pushed by an `issues: closed` workflow when the milestone hits `open_issues == 0`, using `GITHUB_TOKEN` | Vercel already deploys pushed branches, so a branch push is the whole mechanism; the automation has the milestone number (phase numbers diverge from milestone numbers); no PAT needed | 2026-06-12 |
| Two separate workflow files (`ci.yml`, `acceptance-deploy.yml`) | Distinct triggers and permissions; clearer than one multiplexed workflow | 2026-06-12 |
| Update `docs/workflow.md` Gates section in this phase | The roadmap intent requires the contract to match the new machine gates | 2026-06-12 |
| OPEN — branch-protection posture: **enforce** (require the `ci` check to merge, no required human review) vs. **advisory** (CI reports but does not block; the loop's judgment + agent review remain the merge decision) | Neither precedent nor constraint settles the policy; enforcing makes CI a real gate but means the loops wait for green CI on every PR (incl. docs). Recommendation: enforce, requiring only `ci` (never the Vercel deploy). Resolved at the spec-acceptance gate | — |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 8 — CI & acceptance deploys (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run verify` / `npm run build` still pass locally (the phase changes no
      app code).
- [ ] Opening a PR triggers the `ci` workflow; it runs `npm ci`, `npm run verify`,
      and `npm run build` on Node 20 and reports a green/red status check on the PR.
- [ ] A PR that introduces a type error or lint error makes `ci` red; a clean PR
      makes it green.
- [ ] `npm run build` succeeds in CI with the two `NEXT_PUBLIC_*` variables present
      (and the failure mode is clear if they are absent).
- [ ] Closing the last open issue of a milestone triggers the acceptance-deploy
      workflow, which pushes `qa/milestone-<n>` from `main`; closing a non-last issue
      does not. Vercel shows a preview deployment for the pushed branch.
- [ ] (If enforcement chosen) `main` cannot be merged into while `ci` is red; a
      docs-only PR with a red Vercel deploy but green `ci` can still be merged (only
      `ci` is required); no human PR review is required, so the loops still
      auto-merge.
- [ ] `docs/workflow.md`'s Gates section describes the CI machine gate and the
      `qa/milestone-<n>` acceptance preview, matching the shipped workflows.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `npm run build` fails in CI for missing `NEXT_PUBLIC_*` vars | Provide them as Actions variables (human prerequisite / loop-settable from `.env.local`); the env vars are read in factory functions, so absence fails only at build-time prerender — the variables remove the ambiguity |
| Branch protection accidentally requires the red Vercel check and blocks all merges | Require **only** the `ci` check by name; explicitly exclude the Vercel deploy check (Phase 1 #7 owns deployability) |
| Branch protection requiring human review would break the autonomous loops | The rule requires status checks only, no required reviewers; documented and verified |
| Two near-simultaneous closes in a milestone both push (or the close's eventual-consistency lag misses the trigger) | A `concurrency` group per milestone serialises the runs; completion is detected by listing the milestone's still-open issues (count 0) with one short retry for consistency lag; the push tolerates "already exists" — so the worst case is a harmless redundant no-op, never a missed branch |
| A `GITHUB_TOKEN` push does not trigger downstream Actions | Intended and not a problem here: the `GITHUB_TOKEN` suppression applies only to downstream **GitHub Actions** workflow triggers, not to third-party GitHub App webhooks. Vercel deploys via its own GitHub App, which receives the push event normally — so no `VERCEL_TOKEN`/custom-deploy-action is needed |
| Vercel restricted to PR deploys only, so `qa/*` does not deploy | Human prerequisite to confirm Vercel deploys all/branch pushes |
| Enforcement adds CI latency to every merge, including docs PRs | Accepted as the cost of a deterministic gate; CI on a docs PR still runs fast (verify + build, ~minutes); decided at the gate |

## Decision log

- 2026-06-12: Planning kickoff for Phase 8 (plan loop) — the infrastructure phase
  the user inserted into the roadmap. CI runs the project's existing gates
  (`npm run verify` + `npm run build`) as GitHub Actions; an `issues: closed`
  workflow pushes a frozen `qa/milestone-<n>` branch on milestone completion for a
  stable Vercel QA preview; `docs/workflow.md` Gates is updated to match. One
  genuinely-open decision — the branch-protection posture (enforce vs. advisory) —
  deferred to the spec-acceptance gate.
- 2026-06-12: Review gate — added a `concurrency` group + open-issue-listing (with a
  consistency retry) to the acceptance-deploy workflow to close the double-close
  race / missed-trigger window; clarified that `GITHUB_TOKEN`-push suppression hits
  only downstream Actions, not Vercel's GitHub App webhook (no `VERCEL_TOKEN`
  needed); noted no backfill for already-closed milestone #2; made the CI triggers
  explicit (`push: { branches: [main] }`); recorded that branch protection must be
  applied only after the `ci` check has reported once; widened the workflow.md
  update to the QA-gate bullet.
