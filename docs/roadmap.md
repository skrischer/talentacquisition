# talentacquisition — Roadmap

> Living document: the sequenced queue of phases. The hand-off to `/plan`, which
> picks the next phase, creates its spec + issues, and links them back here.
> No status markers — progress lives in the GitHub issues and milestones each
> phase links to. Specs (created by `/plan`) carry only `DRAFT`/`READY`.

## Phase overview

| Phase | Name | Spec | Milestone |
|---|---|---|---|
| 1 | Foundation & Auth | [spec](specs/spec-foundation-auth.md) | [#1](https://github.com/skrischer/talentacquisition/milestone/1) |
| 2 | Data model | [spec](specs/spec-data-model.md) | [#2](https://github.com/skrischer/talentacquisition/milestone/2) |
| 3 | Candidate management | [spec](specs/spec-candidate-management.md) | [#3](https://github.com/skrischer/talentacquisition/milestone/3) |
| 4 | Pipeline board | — | — |
| 5 | Follow-ups (Wiedervorlage) | [spec](specs/spec-follow-ups.md) | [#4](https://github.com/skrischer/talentacquisition/milestone/4) |
| 6 | Dashboard KPIs | — | — |
| 7 | Talent-pool consent & retention | — | — |

A phase gets a Spec link once `/plan` drafts it, and a Milestone link once it is
`READY`. The milestone (open/closed + issue progress) is where status lives.
GitHub milestone numbers are sequential and no longer track phase numbers
(phases were planned out of order): Phase 5 is milestone `#4`. Follow the linked
URL, not the number.

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

## Current focus

**Phase 5: Follow-ups (Wiedervorlage)** (planned; implementation gated behind Phases 1–3)

The Wiedervorlage surfacing layer over the existing `next_step` /
`follow_up_date` columns — a pure date-bucket utility (overdue / due-today /
due-this-week, rolling next 7 days) surfaced in **both** a dashboard
"Wiedervorlage" card and the candidate list (highlight + "nur fällige" filter).
No new schema, no scheduled job. Spec is `READY` and milestone
[#4](https://github.com/skrischer/talentacquisition/milestone/4) holds the four
steps (#28–#31). Implementation waits on Phases 1–3.

Phase 4 (Pipeline board) was planned in parallel; its spec
[`spec-pipeline-board.md`](specs/spec-pipeline-board.md) is merged, with its
milestone/issues being set up in that cycle. Next phase to `/plan` is
**6 — Dashboard KPIs**.

## North star

Replace the Excel as the system of record so every application is carried
reliably through the process and no candidate is lost.
