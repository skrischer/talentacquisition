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
| 3 | Candidate management | — | — |
| 4 | Pipeline board | — | — |
| 5 | Follow-ups (Wiedervorlage) | — | — |
| 6 | Dashboard KPIs | — | — |
| 7 | Talent-pool consent & retention | — | — |

A phase gets a Spec link once `/plan` drafts it, and a Milestone link once it is
`READY`. The milestone (open/closed + issue progress) is where status lives.

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

**Phase 2: Data model** (planned; implementation gated behind Phase 1)

The schema spine — 10 enum types, the `candidate` table with the
stage/status/priority separation and rejection-reason CHECK, the
`talent_pool_consent` table, `deletion_review_date`, RLS, and generated types.
Spec is `READY` and milestone
[#2](https://github.com/skrischer/talentacquisition/milestone/2) holds the six
steps. Implementation waits on Phase 1 (milestone
[#1](https://github.com/skrischer/talentacquisition/milestone/1), in progress)
landing the Supabase wiring. Next phase to `/plan` is **3 — Candidate
management**.

## North star

Replace the Excel as the system of record so every application is carried
reliably through the process and no candidate is lost.
