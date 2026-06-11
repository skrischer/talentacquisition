# Prior Art

> Descriptive, living document. Indexed BY CONCERN, not by project. Add
> entries whenever new references surface; gaps are fine.
>
> Researched 2026-06-11 (time-boxed, breadth over completeness). Verdicts:
> `reuse` = code/patterns adoptable for our stack; `reference-only` = study
> the concept, do not port; `avoid` = cautionary example.

## 1. Data model: pipeline stage vs. candidate status

### freeats/freeats

- Path: `app/models/placement.rb`, `app/models/position_stage.rb`
- License: MIT
- Verdict: reference-only — Rails/Postgres, not our stack, but the cleanest
  domain model in the set.
- Date: 2026-06-11
- Notes: A `Placement` join entity (`belongs_to :position, :position_stage,
  :candidate`) keeps the pipeline **stage** separate from a three-value
  **status** enum (`qualified` / `reserved` / `disqualified`), and validates
  that only disqualified placements carry a `disqualify_reason`. This is
  exactly the separation our Excel conflates — adopt it: a candidate has a
  stage (where in the process) AND an orthogonal status/priority, and a
  rejection reason is only required when rejected.

### opencats/OpenCATS

- Path: `constants.php` (repo root)
- License: AGPL-3.0
- Verdict: avoid — instructive counter-example.
- Date: 2026-06-11
- Notes: Models the pipeline as one hardcoded ordinal status ladder
  (`NoContact=100`, `Contacted=200`, … `Placed=800`, with `650`/`700` reserved
  for rejection outcomes). A single linear enum that mixes stage and outcome —
  the rigidity we want to avoid. Confirms the FreeATS separation is the better
  call.

## 2. Kanban / pipeline board UX

### marmelab/atomic-crm

- Path: `src/components/atomic-crm/deals/` (`DealColumn.tsx`, `DealCard.tsx`,
  `stages.ts`), `src/components/atomic-crm/root/defaultConfiguration.ts`
- License: MIT
- Verdict: reuse — near-exact stack match (React + TypeScript + shadcn/ui +
  Tailwind + Supabase; only Vite vs. our Next.js differs).
- Date: 2026-06-11
- Notes: Strongest single reference. A record carries a `stage` string plus a
  numeric `index` for within-column ordering; a cross-column drag persists both
  in one update. Stages are app-level config (`defaultDealStages`), not a DB
  table, with terminal stages flagged separately. Closest thing to a working
  template for our board — study its components and Supabase data-provider
  wiring directly.

### odoo/odoo (addons/hr_recruitment)

- Path: `addons/hr_recruitment/` (`hr.recruitment.stage`, `hr.applicant`)
- License: LGPL-3.0
- Verdict: reference-only — concept, not code (Python/ORM).
- Date: 2026-06-11
- Notes: Stages are configurable records (`sequence` for order, `fold` to
  collapse a column, `hired_stage` to mark the terminal hire). Each card also
  has an orthogonal `kanban_state` (`normal` / `blocked` / `done`). Good
  vocabulary for "stage semantics are data, not code" if we ever make stages
  user-editable — for the MVP a fixed set is enough.

### twentyhq/twenty, braiekhazem/react-kanban-kit

- Path: `packages/twenty-front/src/modules/object-record/record-board/`
  (Twenty); whole repo (react-kanban-kit)
- License: AGPL-3.0 (Twenty) / MIT (react-kanban-kit)
- Verdict: reference-only — Twenty is a heavyweight metadata engine; overkill.
- Date: 2026-06-11
- Notes: Twenty models a stage as a colored SELECT field and derives columns as
  "view groups" — elegant but far more machinery than we need. react-kanban-kit
  is a small TS board on Atlassian's pragmatic-drag-and-drop with a normalized
  id-keyed state map — a fallback if we want a ready-made DnD board instead of
  building one.

## 3. Follow-up (Wiedervorlage) and reminders

### marmelab/atomic-crm (tasks)

- Path: `src/components/atomic-crm/tasks/tasksPredicate.ts`,
  `TasksListByDueDate.tsx`, `dashboard/TasksList.tsx`
- License: MIT
- Verdict: reuse — same stack, directly portable.
- Date: 2026-06-11
- Notes: Tasks carry `due_date` / `done_date`; date-bucket predicates
  (`isOverdue`, `isDueToday`, `isDueThisWeek`, …) drive surfacing, and a
  `follow-up` task type exists. No snooze — rescheduling = editing the due date.
  Maps 1:1 onto our "Wiedervorlage am" + "nächster Schritt" columns.

### freeats/freeats (task model)

- Path: `app/models/task.rb`
- License: MIT
- Verdict: reference-only — Rails, but a tidy schema.
- Date: 2026-06-11
- Notes: Polymorphic `taskable` (attaches to candidate or position), required
  `due_date`, `repeat_interval` enum (`never`/`daily`/…), `overdue?` predicate,
  `pending` scopes. Confirms the minimal reminder schema.

### espocrm/espocrm, monicahq/monica

- Path: `application/Espo/Modules/Crm/Jobs/SendEmailReminders.php` (EspoCRM);
  `app/Models/ContactReminder.php` + `ProcessScheduledContactReminders` (Monica)
- License: AGPL-3.0 (EspoCRM) / AGPL-3.0 (Monica)
- Verdict: reference-only — delivery pattern, not code.
- Date: 2026-06-11
- Notes: Both poll a reminder table on a cron (`remindAt <= now` /
  `scheduled_at <= now`) rather than scheduling per-reminder timers, and
  Monica separates reminder *definition* from *delivery* (re-scheduling the next
  occurrence after firing). If we ever send proactive reminders, implement as a
  Supabase scheduled function / pg_cron over a due-date column — for the MVP,
  surfacing overdue items in the UI (the Atomic CRM predicate approach) is
  enough.

## 4. GDPR-conscious candidate data handling

### odoo/odoo (addons/data_recycle)

- Path: `addons/data_recycle/models/data_recycle_model.py`,
  `data_recycle_record.py`
- License: LGPL-3.0
- Verdict: reuse (pattern) — almost exactly our retention requirement.
- Date: 2026-06-11
- Notes: A rule = (target table, filter `domain`, a timestamp field, an age
  `delta`, an action of `archive` vs `delete`). Matching records are queued into
  a review list; a manual or automatic mode then executes. Reimplement as a
  `retention_rule` + `deletion_candidate` review queue driven by pg_cron over
  our "Löschdatum / Prüfdatum" column — copy the model, not the ORM code.

### frappe/frappe (personal_data_deletion_request)

- Path: `frappe/website/doctype/personal_data_deletion_request/`
- License: MIT
- Verdict: reference-only — anonymize-don't-delete blueprint.
- Date: 2026-06-11
- Notes: Status flow `Pending Verification → Pending Approval → On Hold →
  Deleted`; execution **anonymizes** (overwrites fields from an
  anonymization-value map, SQL-scrubs free text) rather than hard-deleting, so
  referential structure survives. Useful blueprint for "delete after rejection"
  if we prefer anonymization over row deletion. Assumes public self-service
  requests; ours is recruiter-triggered.

### OCA/data-protection (privacy_consent)

- Path: `privacy_consent/models/privacy_consent.py`
- License: AGPL-3.0
- Verdict: reference-only — schema reference for consent (AGPL blocks reuse).
- Date: 2026-06-11
- Notes: A `privacy.consent` row per subject: `state` (`draft`/`sent`/
  `answered`), `accepted` bool, `answered_at`, proof metadata (IP/time). Maps
  cleanly onto our talent-pool opt-in — model a consent record per candidate
  with `accepted` + `answered_at` + audit metadata. Do not depend on the AGPL
  module; mirror the shape.

## 5. KPI dashboard (counts grouped by enum / month)

### frappe/hrms (hiring_vs_attrition_count)

- Path: `hrms/hr/dashboard_chart_source/hiring_vs_attrition_count/`
- License: GPL-3.0
- Verdict: reference-only — the group-by-date-COUNT pattern is the takeaway.
- Date: 2026-06-11
- Notes: Metric = a date field grouped by month/year with `COUNT`, returning
  `{labels: [...periods], datasets: [{name, values: [...]}]}`. Our
  "applications per month" is the same shape — in Supabase use
  `date_trunc('month', created_at)` group-by, return parallel labels/values
  arrays.

### horilla/horilla-hr (recruitment dashboard)

- Path: `recruitment/views/dashboard.py`, `recruitment/pipeline_grouper.py`
- License: LGPL-2.1
- Verdict: reference-only — funnel data shape; avoid its per-bucket query
  anti-pattern.
- Date: 2026-06-11
- Notes: Computes candidates-per-stage, conversion rate, acceptance ratio,
  monthly hiring — but via per-bucket Python `.count()` round-trips. Our A/B/C/D
  priority counts, status counts and rejection-reason counts are all the same
  "count rows grouped by an enum column" shape; push them into single SQL
  aggregates (`select status, count(*) … group by status`) or a Supabase
  view/RPC instead of one query per bucket. No source/rejection-reason taxonomy
  in Horilla — that part we design ourselves from the Excel's `Listen` sheet.
