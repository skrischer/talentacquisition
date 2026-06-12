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
| 4 | Pipeline board | [spec](specs/spec-pipeline-board.md) | [#5](https://github.com/skrischer/talentacquisition/milestone/5) |
| 5 | Follow-ups (Wiedervorlage) | [spec](specs/spec-follow-ups.md) | [#4](https://github.com/skrischer/talentacquisition/milestone/4) |
| 6 | Dashboard KPIs | [spec](specs/spec-dashboard-kpis.md) | [#6](https://github.com/skrischer/talentacquisition/milestone/6) |
| 7 | Talent-pool consent & retention | — | — |

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

## Current focus

**Phase 7: Talent-pool consent & retention** (next to `/plan` — the last unplanned phase)

The MVP closer: an explicit consent record (`accepted` + `answered_at`) and a
retention job over `deletion_review_date`. Phase 2 already ships the
`talent_pool_consent` table and the `deletion_review_date` column; Phase 7 wires
the consent-capture workflow, the `status = 'talent_pool'` ⇒ accepted-consent
invariant, and the scheduled retention scan plus the service-role client it
needs. Once planned, the roadmap is fully specced.

Phases 1–6 are planned. Most recently **Phase 6 — Dashboard KPIs** (spec
`READY`, milestone [#6](https://github.com/skrischer/talentacquisition/milestone/6),
steps #41–#44; visualization via shadcn `chart`/recharts). Implementation still
follows the dependency edges — Phase 6's views wait on Phases 1–2, its card
labels on Phase 3.

## North star

Replace the Excel as the system of record so every application is carried
reliably through the process and no candidate is lost.
