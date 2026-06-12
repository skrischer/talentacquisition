# Spec: Follow-ups (Wiedervorlage) (Phase 5)

> Status: READY
> Created: 2026-06-11

The surfacing layer over the existing `next_step` / `follow_up_date` columns: a
pure date-bucket utility that classifies a follow-up date relative to today
(overdue / due-today / due-this-week / upcoming), and read-only surfacing of
overdue and due candidates so none lives only in an email inbox. No new schema,
no scheduled job, no proactive email — the column already exists (Phase 2) and is
edited via the Phase 3 form; this phase only makes due items visible.

## Outcome

- [ ] A pure date-bucket utility classifies a `follow_up_date` relative to
      "today" (Europe/Berlin) into `overdue` / `due_today` / `due_this_week` /
      `upcoming` / `none`, with German labels from a shared map; it is unit-checkable
      with an injected reference date (no hidden `new Date()` inside the predicate).
- [ ] Candidates with an `overdue`, `due_today`, or `due_this_week` (rolling
      next-7-days) follow-up are surfaced in **both** a dashboard "Wiedervorlage"
      card and a candidate-list treatment (overdue/due highlight + "nur fällige"
      filter), sorted by `follow_up_date` ascending, each row showing the candidate
      name, `next_step`, and the follow-up date and linking to the candidate
      detail.
- [ ] Overdue follow-ups are visually distinct from merely due-soon ones, styled
      from design tokens — no hardcoded hex (principle 8).
- [ ] A candidate with a `null` `follow_up_date` is never surfaced as due;
      rescheduling by editing the date in the Phase 3 form removes it from the due
      set — there is no separate snooze/complete action.
- [ ] No proactive email, no scheduled job / pg_cron, and no new table or column
      are introduced; the feature is read-only over the existing column.
- [ ] `npm run lint` and `npm run build` pass with no `any`; all candidate-data
      access stays server-side (principle 6).

## Scope

### In scope

- **Date-bucket utility** — `src/lib/candidates/follow-up.ts`: a `FollowUpBucket`
  union (`overdue` | `due_today` | `due_this_week` | `upcoming` | `none`), a pure
  `bucketFor(followUpDate, today)` classifier, a German label map covering the
  three **surfaced** buckets (`overdue`, `due_today`, `due_this_week`; `upcoming`
  and `none` are classification-only and never rendered in this phase), and a
  comparator for sorting due items by date ascending. "Today" is passed in
  (resolved once, server-side, in Europe/Berlin) so the predicate is deterministic
  and testable. Classification compares **calendar-date components** (year /
  month / day) in Europe/Berlin — never `Date` millisecond instants — so DST and
  midnight never shift a bucket. `due_this_week` is the **rolling next-7-days**
  window (today through today + 6, inclusive), not a calendar week to Sunday.
- **Due-follow-ups read path** — no new query. The dashboard card and the list
  treatment both derive the due set from the Phase 3 `list()` result (which
  already loads all rows for the small single-team dataset) by applying the bucket
  utility and the ascending comparator in TypeScript — consistent with Phase 3's
  no-pagination / client-side-filtering decisions. No `listDueFollowUps()` helper
  is added unless the dataset later outgrows a whole-table read.
- **Surfacing** — **both** surfaces (decided at the review gate):
  - a **dashboard "Wiedervorlage" card** on the Phase 1 dashboard listing
    overdue + due candidates (name, `next_step`, follow-up date, bucket marker),
    each linked to detail, sorted by `follow_up_date` ascending then `last_name`;
    no row cap in the MVP (small dataset); and/or
  - a **candidate-list treatment** extending the Phase 3
    `components/candidates/candidate-table.tsx`: an overdue/due highlight on the
    follow-up-date cell driven by the **same bucket utility** (one date-
    classification source, not a second date parse), plus a "nur fällige
    Wiedervorlagen" client-side toggle **AND-composed** with the existing Phase 3
    status / priority / name filters over the same loaded rows.

  Both surfaces show `overdue` + `due_today` + `due_this_week` and hide
  `upcoming` / `none`.
- **A follow-up indicator** — a small token-styled badge/marker distinguishing
  `overdue` from `due_today` / `due_this_week`, reused wherever follow-ups surface.

### Out of scope

- Editing `next_step` / `follow_up_date` — the **Phase 3** form owns the write
  path; rescheduling is editing the date there (no snooze/complete here).
- A dedicated `task` table or multiple open tasks per candidate — architecture
  "Later (not MVP)"; the MVP follow-up is the single column pair.
- Proactive reminders: scheduled Supabase function / pg_cron over `follow_up_date`,
  and any automated email to staff or candidates — architecture "Later", and
  automated candidate emails are a vision non-goal.
- Dashboard KPI cards (applications per month, by source/status/…) — **Phase 6**;
  this phase adds only the follow-up card to the dashboard.
- Pipeline board — **Phase 4**.
- Repeat/recurrence intervals on follow-ups (FreeATS `repeat_interval`) — not MVP.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Depends on Phase 2, Phase 3, and Phase 1.** Phase 2 (`spec-data-model.md`)
  supplies `next_step` (text) and `follow_up_date` (date) on `candidate`; Phase 3
  (`spec-candidate-management.md`, milestone #3) supplies the data-access module,
  the list/table, and the form that edits these fields; Phase 1 supplies the app
  shell and the dashboard placeholder the card lands on. **Implementation waits
  until those land**; the design is independent and is specced now.
- No schema change — the columns already exist (Phase 2). This phase adds read
  paths and UI only.
- Reuse, do not duplicate: extend the Phase 3 `src/lib/db/candidates.ts` and
  `candidate-table.tsx` rather than introduce parallel modules.
- The date-bucket logic follows the atomic-crm tasks-predicate pattern
  (prior-art §3): pure predicates over the due date, no snooze — rescheduling is
  editing the date.
- "Today" is resolved server-side in **Europe/Berlin** (the org's timezone) and
  passed into the pure predicate, so a `date`-only comparison does not misbucket
  around midnight / server-UTC boundaries.
- No new dependency for date math — use native `Date` / `Intl`; the stack has no
  date library and the constitution prefers native APIs.
- Reads are server-side through the RLS-scoped client (principle 6); the
  client-side "nur fällige" filter operates over already-loaded list rows.
- Design tokens for the overdue/due styling (principle 8); German UI copy,
  English identifiers; TypeScript `strict`, no `any`.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Date-bucket predicates over `follow_up_date` (`overdue`/`due_today`/`due_this_week`/`upcoming`/`none`), pure with an injected "today" | atomic-crm `tasksPredicate` pattern (prior-art §3, reuse); purity makes it testable | 2026-06-11 |
| UI surfacing only — no proactive email or scheduled job; rescheduling = editing the date, no snooze/complete | atomic-crm (no snooze); EspoCRM/Monica cron delivery is reference-only and deferred; architecture "Later (not MVP)"; automated candidate email is a vision non-goal | 2026-06-11 |
| No new schema/table/column; reuse the Phase 2 columns and the Phase 3 data-access + table modules | Phase 2 already ships `next_step`/`follow_up_date`; avoids parallel modules and a premature `task` table | 2026-06-11 |
| "Today" resolved server-side in Europe/Berlin and passed into the predicate; classification on calendar-date components, not `Date` instants | German org; `date`-only buckets must not flip at UTC midnight / DST | 2026-06-11 |
| `due_this_week` = rolling next-7-days window (today .. today + 6, inclusive) | Matches a recruiter's forward horizon; a calendar-week-to-Sunday resets mid-week and is less useful; atomic-crm does not pin the window | 2026-06-11 |
| Surface in **both** a dashboard "Wiedervorlage" card and the candidate-list treatment (highlight + "nur fällige" filter) | Stakeholder decision at the gate; matches the roadmap "list/dashboard" intent and the vision goal that nothing lives only in an inbox | 2026-06-11 |
| Surface `overdue` + `due_today` + `due_this_week` (rolling next-7-days); `upcoming` / `none` are not shown | Stakeholder decision at the gate; gives lead time for the 24–48h A-candidate response (vision success criteria) | 2026-06-11 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 5 — Follow-ups (Wiedervorlage) (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`).
- [ ] `bucketFor` returns `overdue` for a past date, `due_today` for today,
      `due_this_week` for a date within the next-7-days window, `upcoming` beyond
      it, and `none` for `null` — all relative to an injected reference date.
- [ ] A candidate with a past `follow_up_date` appears in both the dashboard card
      and (highlighted) the candidate list, flagged overdue; one due today is
      flagged due-today; one due within the next 7 days appears as due-this-week;
      one due in 10 days and one with `null` appear in neither surface.
- [ ] The "nur fällige" list toggle narrows the table to due/overdue rows and
      composes (AND) with an active status/priority filter.
- [ ] Editing a surfaced candidate's `follow_up_date` to a future date (Phase 3
      form) removes it from the due set on reload.
- [ ] Overdue and due-soon items are visually distinguishable and use design
      tokens (no hardcoded hex).
- [ ] The diff adds no file under `supabase/migrations/` and no cron / Supabase
      Edge Function — the feature is read-only over the existing column.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Timezone/midnight boundary misbuckets a `date` value | "Today" resolved once server-side in Europe/Berlin and injected into the pure predicate; never compare against client clock |
| Surfacing logic drifts from the Phase 3 list semantics | Same bucket utility powers both the dashboard card and the list highlight; one source of truth |
| Implementation blocked because Phase 3 (and 1/2) are unmerged | Sequencing is explicit; issues created now, worked only after Phase 3's list/form/data-access land |
| Scope creep into proactive reminders | Explicitly out of scope; proactive reminders remain an architecture "Later" item behind a scheduled function |
| Dashboard card vs Phase 6 KPI cards collide on the same page | The follow-up card is a distinct read; Phase 6 adds aggregate cards alongside it, no shared state |

## Decision log

- 2026-06-11: Planning kickoff for Phase 5 (`/plan 5`), planned ahead of Phase 4
  at the user's choice. The columns exist (Phase 2) and are edited in Phase 3, so
  this phase is purely a read/surfacing layer. Date-bucketing adopts the
  atomic-crm tasks-predicate pattern (prior-art §3); proactive reminders and a
  task table stay out (architecture "Later", vision non-goal). Two scope
  decisions (surfacing location, time horizon) marked OPEN for the review gate.
- 2026-06-11: Review gate — dropped the redundant `listDueFollowUps()` query (the
  due set derives from the Phase 3 `list()` result + the bucket utility, matching
  Phase 3's whole-table read); pinned the `due_this_week` window to a rolling
  next-7-days and the classification to calendar-date components in Europe/Berlin;
  specified the "nur fällige" filter as AND-composed with the existing Phase 3
  filters with the bucket utility as the single highlight source; set the card
  sort (`follow_up_date` asc, then `last_name`) with no MVP row cap; scoped the
  German label map to the three surfaced buckets only.
- 2026-06-11: Review gate (AskUserQuestion) — resolved both open decisions:
  surface in **both** the dashboard card and the candidate-list treatment; time
  horizon = `overdue` + `due_today` + `due_this_week` (rolling next-7-days). Spec
  flipped to READY.
- 2026-06-12: Implemented #28-#31 (PRs #82, #84, #85, #86), each Verify+Build
  green and in-session review `APPROVE`. `bucketFor` classifies on the UTC
  day-index of the ISO calendar-date components (DST- and server-timezone-
  immune); `resolveToday()` is the single clock read (Europe/Berlin) and is
  injected server-side. `due_this_week` is day-diff `1..6` (today is
  `due_today`). The badge (#29) is the single render of a bucket, reused by the
  dashboard card (#30) and the list cell (#31); the list filter and highlight
  call the same `bucketFor`, no second date parse. No migration, cron, or Edge
  Function — read-only over the existing column.
- 2026-06-12: Milestone QA gate accepted ("Sieht gut aus"). Confirmed at the
  gate: the follow-up surfaces derive from `list()` and are **status-
  independent** by design — a candidate in any status with a due
  `follow_up_date` surfaces; no status scoping was added. Milestone #4 closed.
