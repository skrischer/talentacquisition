# talentacquisition — Roadmap

> Living document: the sequenced queue of phases. The hand-off to `/plan`, which
> picks the next phase, creates its spec + issues, and links them back here.
> No status markers — progress lives in the GitHub issues and milestones each
> phase links to. Specs (created by `/plan`) carry only `DRAFT`/`READY`.

## Phase overview

| Phase | Name | Spec | Milestone |
|---|---|---|---|
| 1 | Foundation & Auth | [spec](specs/archive/spec-foundation-auth.md) | [#1](https://github.com/skrischer/talentacquisition/milestone/1) |
| 2 | Data model | [spec](specs/archive/spec-data-model.md) | [#2](https://github.com/skrischer/talentacquisition/milestone/2) |
| 3 | Candidate management | [spec](specs/spec-candidate-management.md) | [#3](https://github.com/skrischer/talentacquisition/milestone/3) |
| 4 | Pipeline board | [spec](specs/spec-pipeline-board.md) | [#5](https://github.com/skrischer/talentacquisition/milestone/5) |
| 5 | Follow-ups (Wiedervorlage) | [spec](specs/spec-follow-ups.md) | [#4](https://github.com/skrischer/talentacquisition/milestone/4) |
| 6 | Dashboard KPIs | [spec](specs/spec-dashboard-kpis.md) | [#6](https://github.com/skrischer/talentacquisition/milestone/6) |
| 7 | Talent-pool consent & retention | [spec](specs/spec-talent-pool-retention.md) | [#7](https://github.com/skrischer/talentacquisition/milestone/7) |
| 8 | CI & acceptance deploys | [spec](specs/spec-ci-acceptance-deploys.md) | [#8](https://github.com/skrischer/talentacquisition/milestone/8) |

A phase gets a Spec link once `/plan` drafts it, and a Milestone link once it is
`READY`. The milestone (open/closed + issue progress) is where status lives.
GitHub milestone numbers are sequential and no longer track phase numbers
(phases were planned out of order): Phase 4 is milestone `#5`, Phase 5 is
milestone `#4`. Follow the linked URL, not the number.

## Phase intent

- **1 — Foundation & Auth.** Next.js (App Router) scaffold, Tailwind v4 with the
  design tokens vendored from `mag`, shadcn/ui base, typed Supabase clients
  (server + browser), Supabase Auth login, and an RLS-protected app shell —
  internal users only. The walking skeleton that builds and deploys.
- **2 — Data model.** Migrations for the spine: the `candidate` table, enums
  derived from professional ATS references, the stage / status / priority
  separation, the rejection-reason check constraint, the `talent_pool_consent`
  table, `deletion_review_date`, RLS policies, and generated types. Most of the
  DB-layer architecture principles are enforced here.
- **3 — Candidate management.** List/table + detail view + create/edit form
  (react-hook-form + zod). Replaces the Excel `Bewerber-ATS` sheet — the core
  and the first visible win.
- **4 — Pipeline board.** Kanban grouped by stage (atomic-crm pattern); a drag
  persists the stage and within-column order in one update.
- **5 — Follow-ups (Wiedervorlage).** Next step + follow-up date, with overdue
  items surfaced on the list/dashboard so no candidate lives only in an inbox.
- **6 — Dashboard KPIs.** Postgres views + dashboard cards: applications per
  month, by source, by priority, by status, by rejection reason — computed as
  SQL aggregates, no manual counting.
- **7 — Talent-pool consent & retention.** Explicit consent record (`accepted` +
  `answered_at`) and a retention job over `deletion_review_date`. Closes the MVP.
- **8 — CI & acceptance deploys.** Deterministic machine gates outside the
  attended loops: GitHub Actions running Verify/Build (and tests once they
  exist) on every PR, plus a milestone-completion automation — when a
  milestone's last issue closes, push `qa/phase-<n>` from `main` so Vercel
  deploys a frozen preview for the milestone QA gate. Updates the workflow
  contract's Gates section accordingly.

## Current focus

**Roadmap fully planned — all eight phases have a `READY` spec and a milestone.**
Focus is implementation; `/loopkit:implement` drives the unblocked Todo issues and
progress lives in the linked milestones. There is no next phase to `/plan` until
new phases are added below.

Most recently planned: **Phase 8 — CI & acceptance deploys** (infrastructure; spec
`READY`, milestone [#8](https://github.com/skrischer/talentacquisition/milestone/8),
steps #63–#66). A GitHub Actions `ci` workflow (verify + build) becomes the per-PR
machine gate, **enforced via branch protection** (require `ci`, not the Vercel
deploy; no GitHub-native review — the in-session agent review stays the process
review gate, so the loops still auto-merge); an `issues: closed` automation pushes
`qa/milestone-<n>` on milestone completion for a frozen Vercel QA preview; and
`docs/workflow.md` Gates is updated to match. The loop sets the two public
`NEXT_PUBLIC_*` build variables from `.env.local`.

Implementation note: Phases 1–2 milestones have completed (their specs are
archived); the remaining milestones run in parallel, each phase's first issues
gated on the schema (Phase 2, done) and the surfaces they extend (Phases 1/3).

Implementation still follows the dependency edges — each phase's first issues wait
on the schema (Phase 2) and the surfaces they extend (Phases 1/3).

## North star

Replace the Excel as the system of record so every application is carried
reliably through the process and no candidate is lost.
