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
| 3 | Candidate management | [spec](specs/archive/spec-candidate-management.md) | [#3](https://github.com/skrischer/talentacquisition/milestone/3) |
| 4 | Pipeline board | [spec](specs/archive/spec-pipeline-board.md) | [#5](https://github.com/skrischer/talentacquisition/milestone/5) |
| 5 | Follow-ups (Wiedervorlage) | [spec](specs/archive/spec-follow-ups.md) | [#4](https://github.com/skrischer/talentacquisition/milestone/4) |
| 6 | Dashboard KPIs | [spec](specs/archive/spec-dashboard-kpis.md) | [#6](https://github.com/skrischer/talentacquisition/milestone/6) |
| 7 | Talent-pool consent & retention | [spec](specs/archive/spec-talent-pool-retention.md) | [#7](https://github.com/skrischer/talentacquisition/milestone/7) |
| 8 | CI & acceptance deploys | [spec](specs/spec-ci-acceptance-deploys.md) | [#8](https://github.com/skrischer/talentacquisition/milestone/8) |
| 9 | Design system & component library | [spec](specs/spec-design-system.md) | [#9](https://github.com/skrischer/talentacquisition/milestone/9) |
| 10 | Screen implementation | [spec](specs/spec-screen-implementation.md) | [#10](https://github.com/skrischer/talentacquisition/milestone/10) |

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
- **9 — Design system & component library.** Input is the Paper design
  hand-off (styleguide + screens for all pages): adopt the styleguide's design
  tokens in `globals.css` — superseding the vendored `mag` tokens; the
  constitution's styling row and tech-debt entry change with it — and build
  the component library on shadcn/ui: every element the screens need (buttons,
  badges, form controls, table, cards, navigation, …), each matched against
  the styleguide. No page changes yet. Prerequisite: the Paper design is
  finalized.
- **10 — Screen implementation.** Implement every page to match the Paper
  screens using the Phase-9 library — after the MVP scope trim the screens ARE
  the target state: login, app shell/navigation, candidate list/detail/form,
  pipeline board, dashboard, and the follow-up surfaces. The screens'
  functional deltas are part of this phase and must be explicit issues in the
  spec, not subsumed under styling. None needs a migration — all are UI plus
  server actions on existing columns: the dedicated Wiedervorlage page with
  Erledigt/Verschieben actions (clear/set `next_step` + `follow_up_date`; no
  task table), global header search routing to the candidate list, additional
  list filters (stage, source) with client-side pagination, the
  email-or-phone-required form rule, and KPI stat-row figures derived from
  existing views (active A-candidates, month-over-month delta, rejection rate
  without trend). Depends on Phase 9 and on the functional pages from
  Phases 1/3–6.

## Current focus

**Roadmap fully planned** — every phase (1–10) now has a `READY` spec and a
milestone; there is nothing left for `/plan`. What remains is **implementation**:
`/loopkit:implement` drives the open milestones — Phase 7 (talent-pool consent &
retention, [#7](https://github.com/skrischer/talentacquisition/milestone/7)),
Phase 8 (CI & acceptance deploys,
[#8](https://github.com/skrischer/talentacquisition/milestone/8)), Phase 9
(design system, [#9](https://github.com/skrischer/talentacquisition/milestone/9)),
and Phase 10 (screen implementation,
[#10](https://github.com/skrischer/talentacquisition/milestone/10)) — following
the dependency edges (Phase 10's screens depend on Phase 9's components; the
dashboard / detail retention cards on Phase 7 #56).

Most recently planned: **Phase 10 — Screen implementation** (spec `READY`,
milestone [#10](https://github.com/skrischer/talentacquisition/milestone/10),
steps #101–#108). Every page is rebuilt to the final Paper screens on the Phase-9
library — app shell / nav (sidebar + mobile bottom-tab + header search), login,
candidate list / detail / form, board, dashboard, and the dedicated Wiedervorlage
page — all responsive, with the functional deltas as explicit issues
(Erledigt / Verschieben, stage / source filters + client pagination, the
email-or-phone rule, the KPI stat row, label-copy reconciliation). No migration;
the chart / views stay Phase 6, retention stays Phase 7 (slotted via
`Depends on #56`).

Implementation note: Phases 1–2 milestones have completed (their specs are
archived); the remaining milestones run in parallel, each phase's first issues
gated on the schema (Phase 2, done) and the surfaces they extend (Phases 1/3).

Implementation still follows the dependency edges — each phase's first issues wait
on the schema (Phase 2) and the surfaces they extend (Phases 1/3).

## North star

Replace the Excel as the system of record so every application is carried
reliably through the process and no candidate is lost.
