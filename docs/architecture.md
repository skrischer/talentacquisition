# Architecture

> Structural, living document — the most volatile artifact. Update whenever a
> change alters components, boundaries, or flows. This is a greenfield seed,
> not a final design.

## Component map

| Component | Responsibility |
| --------- | -------------- |
| `app/(auth)/login` | Supabase Auth sign-in; internal users only |
| `app/(app)/candidates` | Candidate list/table + detail view — the core, replaces the Excel `Bewerber-ATS` sheet |
| `app/(app)/board` | Kanban pipeline board grouped by stage (atomic-crm pattern) |
| `app/(app)/dashboard` | KPI cards, replaces the Excel `Dashboard` sheet |
| `components/ui` | shadcn/ui primitives, vendored from `mag` |
| `components/candidates` | Candidate-specific components: form, table, status/priority badges |
| `lib/supabase` | Typed Supabase clients (server + browser) |
| `lib/db` | Typed data-access queries (candidates, KPIs) |
| `supabase/migrations` | SQL: tables, enums, KPI views, RLS policies |

## Data model (seed)

- **`candidate`** — one row per application, covering the Excel fields.
  Key constraints from the constitution:
  - `stage` (pipeline position) and `status` / `priority` (A/B/C/D) are
    separate columns, not one enum.
  - `rejection_reason` is required only when the status is a rejection
    (DB check constraint).
  - `documents_path` stores only a path/link to protected external storage —
    never the document itself.
  - `next_step` + `follow_up_date` live as columns on the row (mirrors the
    Excel "nächster Schritt" / "Wiedervorlage am").
  - `deletion_review_date` for retention.
- **`consent`** — talent-pool consent record: `candidate_id`, `accepted`,
  `answered_at`, audit metadata.
- **Enums** — derived from the Excel `Listen` sheet: source, qualification,
  recognition status, priority (A/B/C/D), stage, status, mobility, team status,
  hospitation result, rejection reason.
- **KPI views** — Postgres views aggregating `candidate`: per month, by source,
  by priority, by status, by rejection reason.

## Boundaries

- Client components never hold the service-role key; candidate-data access is
  server-side (server components / route handlers / server actions) through an
  RLS-scoped client.
- KPI logic lives in SQL (views), not in the client.
- Document storage is external; the app persists only the path.

## Key flows

1. **Intake** — a new application creates a `candidate` row (status = Neu, set
   priority, next step, follow-up date); it appears in the list and board.
2. **Follow-up (Wiedervorlage)** — overdue `follow_up_date` rows are surfaced
   on the dashboard/list; the recruiter acts and updates status/stage, next
   step, and follow-up date.
3. **Team handover** — set `team_proposal` + feedback-due; the email itself is
   sent outside the app; `team_status`/feedback is recorded back.
4. **Outcome** — status moves to hired, rejected (rejection reason required), or
   talent-pool (consent record required).
5. **KPIs** — views aggregate the candidate rows; the dashboard reads the views.
6. **Retention** — a scheduled job scans `deletion_review_date` and surfaces or
   handles due rows.

## Where new code goes

- New candidate field → migration in `supabase/migrations/` + regenerate types
  + update the form/table component.
- New enum value → migration (alter enum).
- New KPI → a Postgres view + a dashboard card.
- New page → `app/(app)/<feature>/`.
- New shared UI primitive → `components/ui/` (prefer copying from `mag`).

## Later (not MVP)

- Follow-ups as a dedicated `task` table (FreeATS / atomic-crm pattern) instead
  of columns, once multiple open tasks per candidate are needed.
- Proactive reminders via a Supabase scheduled function over `follow_up_date`.
