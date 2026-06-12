# Spec: Talent-pool consent & retention (Phase 7)

> Status: READY
> Created: 2026-06-12

The MVP closer. It wires the explicit talent-pool **consent** record (the
`talent_pool_consent` table shipped in Phase 2) and enforces the
`status = 'talent_pool'` ⇒ accepted-consent invariant, and adds a scheduled
**retention** scan over the `deletion_review_date` column that surfaces due
candidates for recruiter review. Pragmatic by design: it provides the consent
and deletion/review machinery the GDPR posture needs **without** legally
determining retention periods (a vision non-goal).

## Outcome

- [ ] A recruiter can record a talent-pool consent for a candidate — `accepted`,
      `state` (draft/sent/answered), `answered_at`, optional proof metadata — from
      the candidate detail, writing the `talent_pool_consent` row server-side
      through the RLS-scoped client (principles 4 + 6); at most one consent row per
      candidate (the Phase 2 unique FK).
- [ ] A DB trigger enforces the invariant both ways: a candidate cannot hold
      `status = 'talent_pool'` without an `accepted = true` consent row, and a
      consent row cannot be un-accepted/deleted while its candidate is
      `talent_pool`; a violation (from the form, a server action, or raw SQL) is
      rejected at the database (principle 4).
- [ ] A scheduled **pg_cron** job runs daily over `deletion_review_date`
      (Europe/Berlin) and records candidates whose review date is due/overdue into
      a review queue — a scheduled job, not an ad-hoc query (principle 5); it
      performs no destructive action on its own.
- [ ] A recruiter sees the due-for-review candidates (a dashboard "Löschprüfung"
      card + a review list) and resolves each: extend the review date (Phase 3
      form), mark reviewed/keep, or anonymize the candidate (PII scrubbed, the enum
      columns + `created_at` retained so Phase 6 KPIs are unaffected — principle 7).
- [ ] `deletion_review_date` stays recruiter-set (the Phase 3 form already edits
      it); Phase 7 does not auto-derive a retention period — legal periods stay
      parked (vision non-goal).
- [ ] No service-role key is introduced anywhere in app code; the retention job
      runs in-database (SECURITY DEFINER under pg_cron), so no external service-role
      client exists (principle 6). `npm run lint` / `npm run build` pass with no
      `any`; regenerated types are committed.

## Scope

### In scope

- **Consent invariant (DB triggers)** — a migration adding (a) a trigger on
  `candidate` (`BEFORE INSERT OR UPDATE OF status`) that raises when
  `status = 'talent_pool'` and no `talent_pool_consent` row with `accepted = true`
  exists for the candidate, and (b) a trigger on `talent_pool_consent`
  (`BEFORE UPDATE OF accepted / BEFORE DELETE`) that raises when the change would
  leave a `talent_pool` candidate without accepted consent. **No `INSERT` trigger on
  `talent_pool_consent` is needed**: a candidate can only reach `talent_pool` via
  trigger (a), which already requires an `accepted = true` row to exist, and the
  Phase 2 unique FK forbids a second consent row — so there is no path to insert an
  unaccepted consent against an already-`talent_pool` candidate. The recruiter
  workflow therefore records consent **before** setting the status (within a
  transaction, trigger (a)'s lookup sees only statements that already ran, so the
  consent insert must precede the status update); the consent-capture UI enforces
  that ordering. Regenerate types.
- **Consent capture UI + server action** — a "Talentpool-Einwilligung" panel +
  action on the candidate detail (`app/(app)/candidates/[id]`) to create/update the
  consent row (`state`, `accepted`, `answered_at`, optional proof metadata),
  server-side via the Phase 1 RLS client and the Phase 3 `lib/db` convention (a new
  `src/lib/db/consent.ts`). German labels via a `consent_state` label map extending
  the Phase 3 `src/lib/candidates` maps. The recruiter records consent obtained
  out-of-band — there is no candidate-facing flow (vision out-of-scope).
- **Retention scan (pg_cron + review queue)** — split into **two migrations** so a
  missing extension never leaves a half-applied migration:
  - **Migration 7a (safe without `pg_cron`)**: the `deletion_review` queue table
    (`candidate_id`, `due_date`, `created_at`, `resolved_at`, `resolution`) with RLS
    (authenticated full, anon none); a SECURITY DEFINER SQL function selecting
    candidates with `deletion_review_date <= (now() AT TIME ZONE 'Europe/Berlin')::date`
    and upserting the unresolved ones into the queue. The function **intentionally
    bypasses RLS** (SECURITY DEFINER) because it is an internal write-only job, not
    a user read; it touches only the non-PII join keys (`candidate_id`,
    `deletion_review_date`), so the bypass is audited and safe.
  - **Migration 7b (the schedule)**: the `cron.schedule(...)` daily call, guarded by
    `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
    THEN ... END IF; END $$` so it is a no-op (not a hard failure) if the extension
    is not yet enabled. Runs cleanly once the human prerequisite (enable `pg_cron`)
    is delivered.

  This is the Odoo `data_recycle` review-queue pattern (prior-art §4, reuse).
  Regenerate types after 7a.
- **Retention review UI + resolve action** — a dashboard "Löschprüfung fällig"
  card + a review list of unresolved queue rows (`resolved_at IS NULL`) joined to
  their candidates, and a per-row resolve server action with three outcomes:
  - **extend the review date** — links to the Phase 3 edit form; once the date is
    in the future the next scan no longer re-queues it, and the open queue row is
    marked `resolved_at = now()`, `resolution = 'extended'`.
  - **mark reviewed / keep** — sets `resolved_at = now()`, `resolution = 'keep'` on
    the queue row; the row is **retained for audit** (soft-resolution), it just
    leaves the unresolved list.
  - **anonymize** the candidate (the gate-decided removal action) — a server action
    overwrites the PII fields (`first_name`, `last_name`, `email`, `phone`, `notes`,
    `team_proposal`, `documents_path`) with fixed placeholders, removes/voids any
    `talent_pool_consent` row, and sets `resolution = 'removed'`; the enum columns
    and `created_at` are retained so Phase 6 KPIs are unaffected (principle 7). This
    is the data-removal capability Phase 3 explicitly deferred to Phase 7 — realized
    as anonymization rather than a hard row delete.

  All resolutions are server actions through the RLS-scoped client.

### Out of scope

- Candidate-facing consent collection, a public consent page, or automated
  consent-request emails — vision non-goals (no candidate login, no automated
  candidate email); the recruiter records consent obtained externally.
- Auto-deriving retention periods from status/date (e.g. "rejected → delete after
  N months") — that legally determines GDPR periods, a vision non-goal; the review
  date stays recruiter-set.
- Automated destructive retention (a job that deletes/anonymizes without review) —
  unless the gate explicitly selects it; the default is flag-for-review.
- A general configurable retention-rule engine (Odoo `data_recycle`'s full rule
  model) — reference-only; the MVP scans the single `deletion_review_date` column.
- Any new consent/retention **column** on `candidate` beyond what Phase 2 shipped;
  this phase adds only the `deletion_review` queue table, triggers, and the job.
- A service-role client / `SUPABASE_SERVICE_ROLE_KEY` — the in-DB pg_cron approach
  needs none.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Depends on Phase 2 and Phase 3.** Phase 2 (`spec-data-model.md`, milestone #2)
  supplies the `talent_pool_consent` table, the `consent_state` enum,
  `deletion_review_date`, and the `talent_pool` status value. Phase 3
  (`spec-candidate-management.md`, milestone #3) supplies the candidate
  detail/list/form, the `src/lib/db` data-access convention, and the enum label
  maps this phase extends. **Implementation waits until those land**; the design is
  independent and specced now.
- **Principle 4** — consent is an explicit record; no talent-pool status without an
  accepted consent, enforced at the DB (trigger). This mirrors the constitution's
  DB-enforcement pattern (the principle-1 rejection-reason `CHECK`); the invariant
  is cross-table, so a trigger rather than a `CHECK`.
- **Principle 5** — retention runs as a scheduled job over `deletion_review_date`,
  not ad hoc: pg_cron in-database, daily.
- **Principle 6** — no service-role key in app code. The retention job runs in-DB
  (SECURITY DEFINER under pg_cron), so no external service-role client is shipped.
  (This diverges from the Phase 2 spec's anticipated "service-role client it needs"
  — the in-DB choice is strictly cleaner and ships no key; recorded in the decision
  log.)
- **Timezone** — the due-date comparison casts `now() AT TIME ZONE 'Europe/Berlin'`
  to `::date`, consistent with the Phase 5/6 Europe/Berlin handling.
- Recruiter-only, no candidate-facing surface (internal tool); German UI copy,
  English identifiers/SQL; design tokens (principle 8); TypeScript `strict`, no
  `any`.
- Reuse the Phase 3 `lib/db` + label-map conventions and the Phase 5/6
  dashboard-card pattern rather than introducing parallel shapes.

## Human prerequisites

- [ ] Enable the **`pg_cron`** extension on the Supabase project (Dashboard →
      Database → Extensions → `pg_cron`, or `create extension if not exists
      pg_cron;`). Required before the retention-scan schedule (migration 7b, the
      `cron.schedule` call) activates; migration 7a applies without it and 7b is a
      guarded no-op until it is enabled. **Confirmed at the gate: the user enables
      `pg_cron` before the retention issues are implemented.** No other secret,
      provisioning, or account is needed; **no service-role key**.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Consent invariant enforced by DB triggers, both directions (candidate status→talent_pool needs accepted consent; consent cannot be un-accepted/deleted while talent_pool) | Principle 4 + the principle-1 DB-enforcement precedent; cross-table, so a trigger not a `CHECK`. Both directions are needed for the invariant to hold at all times | 2026-06-12 |
| Retention mechanism = pg_cron in-database SECURITY DEFINER function, daily, over `deletion_review_date` | Principle 5 (scheduled, not ad hoc) + prior-art §4 (Odoo `data_recycle` pg_cron over the date column); in-DB so no service-role client is shipped (principle 6) | 2026-06-12 |
| Scan cadence = daily | `deletion_review_date` is a `date` (not a timestamp), so sub-daily precision is meaningless; daily is sufficient and avoids needless DB load | 2026-06-12 |
| The retention job only flags due candidates into a `deletion_review` queue; it performs no destructive action itself | Vision parks legal periods; destructive auto-action under legal uncertainty is inappropriate for the MVP | 2026-06-12 |
| `deletion_review_date` stays recruiter-set; no auto-derived retention period | Vision non-goal: "does not legally determine GDPR retention periods" | 2026-06-12 |
| Consent recorded by the recruiter out-of-band; no candidate-facing flow | Vision non-goals: no candidate login, no automated candidate email | 2026-06-12 |
| Diverge from the Phase 2 spec's anticipated service-role retention client — use in-DB pg_cron instead | Ships no service-role key (principle 6), keeps retention logic in SQL next to the data; the Phase 2 spec deferred the mechanism to this phase. The Phase 7 implementation reconciles the now-superseded "service-role (retention job) bypasses RLS" wording in `spec-data-model.md` (its RLS + Risks sections) so the archived design stays accurate | 2026-06-12 |
| Surfacing = a dashboard "Löschprüfung" card + a review list | Mirrors the Phase 5 Wiedervorlage / Phase 6 KPI dashboard-card pattern (reuse) | 2026-06-12 |
| Removal action = **anonymize**: scrub the PII fields (`first_name`, `last_name`, `email`, `phone`, `notes`, `team_proposal`, `documents_path`) to fixed placeholders, keep the row with its enum columns + `created_at`; mark it anonymized (e.g. `resolution = 'removed'` on the queue row). The talent_pool consent row, if any, is removed/voided with the PII | Decided at the spec-acceptance gate. KPI continuity (principle 7) is the deciding criterion: Phase 6's aggregate views count `candidate` rows, so anonymize keeps the non-PII columns and the historical KPIs (applications per month, by source, …) stay accurate, while still erasing the personal data (GDPR-sound, prior-art §4 frappe blueprint) | 2026-06-12 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 7 — Talent-pool consent & retention (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`) with the regenerated types.
- [ ] Migration 7a applies on the Phase 2/3 schema **without `pg_cron` enabled** —
      it creates the consent triggers, the `deletion_review` queue table + RLS, and
      the SECURITY DEFINER retention function with no error.
- [ ] Migration 7b is a clean no-op when `pg_cron` is absent (the `pg_extension`
      guard) and, once `pg_cron` is enabled, registers the daily `cron.schedule`
      entry; neither path leaves a half-applied migration.
- [ ] Setting a candidate to `status = 'talent_pool'` without an accepted consent
      row is rejected by the trigger (from the form, the server action, and raw
      SQL); after recording an accepted consent the same change succeeds.
- [ ] Un-accepting (`accepted = false`) or deleting a consent row while its
      candidate is `talent_pool` is rejected by the trigger.
- [ ] A second `talent_pool_consent` row for the same `candidate_id` violates the
      Phase 2 unique FK.
- [ ] Running the retention function manually queues exactly the candidates with
      `deletion_review_date <= today` (Europe/Berlin) and skips future/null dates;
      an `anon`-key query against `deletion_review` is denied, an `authenticated`
      query succeeds.
- [ ] The dashboard card + review list show the due candidates; resolving by
      extending the date removes the row from the queue on the next scan, marking
      reviewed clears it, and removing applies the gate-decided action.
- [ ] Anonymizing a candidate overwrites every PII field (`first_name`,
      `last_name`, `email`, `phone`, `notes`, `team_proposal`, `documents_path`)
      with placeholders and removes/voids its `talent_pool_consent` row, while the
      enum columns and `created_at` are retained — re-running the Phase 6 KPI views
      yields the same counts as before the anonymization.
- [ ] No service-role key appears in app code or the client bundle; the retention
      job runs in-DB under pg_cron.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `pg_cron` not enabled when 7b runs | 7b is `pg_extension`-guarded, so it is a clean no-op (no migration failure); the schedule simply stays inactive until the user enables `pg_cron` (confirmed at the gate, before the retention issues are implemented) |
| The cross-table consent triggers block legitimate edits or are hard to reason about | Triggers are scoped to `status` changes and to consent accept/delete only; every direction is covered by an explicit Verification case |
| Removal could lose KPI history for removed candidates | Resolved at the gate in favour of **anonymize** — PII is scrubbed but the row's enum columns + `created_at` stay, so Phase 6 KPIs are unaffected (principle 7) |
| Anonymization placeholders collide with real data or break NOT NULL columns | Use fixed sentinel placeholders for the NOT NULL PII (`first_name`/`last_name`); nullable PII (`email`/`phone`/`notes`/`team_proposal`/`documents_path`) is set to NULL |
| The new trigger surprises the Phase 3 form's existing free `talent_pool` selection | The consent-capture UI lands with the trigger so the recruiter can record consent first; the form surfaces the server action's error clearly |
| Auto-destruction under unclear legal periods | Default is flag-for-review; the job never destroys on its own |
| Due-date misbuckets at the UTC/midnight boundary | Compare `::date` in Europe/Berlin, consistent with Phase 5/6 |
| Implementation blocked because Phase 2/3 are unmerged | Sequencing is explicit; issues depend on #14 (Phase 2) and the Phase 3 detail/list/data-access issues; design is specced now |

## Decision log

- 2026-06-12: Planning kickoff for Phase 7 (plan loop) — the roadmap's last
  unplanned phase, the MVP closer. Consent and retention both build on Phase 2
  (the `talent_pool_consent` table + `deletion_review_date` already exist) and
  Phase 3 (candidate detail/list/form). The consent invariant is DB-trigger
  enforced (principle 4, mirroring the principle-1 DB pattern); retention is
  pg_cron in-database (principle 5 + prior-art §4), which ships no service-role key
  (principle 6) and diverges deliberately from the Phase 2 spec's anticipated
  service-role client. One genuinely-open decision — the removal action
  (hard-delete vs. anonymize) — deferred to the spec-acceptance gate.
- 2026-06-12: Review gate — split the retention migration into 7a (table/RLS/
  function, safe without `pg_cron`) + 7b (`cron.schedule`, `pg_extension`-guarded
  no-op); justified the omitted `INSERT`-on-consent trigger (unique FK + trigger (a)
  close it) and recorded the consent-before-status ordering; documented the
  SECURITY DEFINER RLS bypass as intentional/audited; reframed the removal decision
  around KPI continuity (principle 7); recorded the daily cadence; specified the
  mark-reviewed/extended/removed queue resolutions.
- 2026-06-12: Spec-acceptance gate (AskUserQuestion) — removal action resolved to
  **anonymize** (scrub PII, retain the row's enum columns + `created_at` so Phase 6
  KPIs stay accurate — principle 7; GDPR-sound personal-data erasure, prior-art §4).
  Human prerequisite confirmed: the user enables the `pg_cron` extension before the
  retention issues are implemented. Spec accepted and flipped READY.
- 2026-06-12: Implementation (issues #53–#56). Decisions made while building:
  - The consent-invariant trigger functions pin `set search_path = ''` (all refs
    schema-qualified) — Supabase `function_search_path_mutable` hardening on the
    integrity triggers.
  - **Anonymize** "voids" the consent by nulling `proof_metadata` **and**
    `answered_at` via an UPDATE that does not touch `accepted` (so the #53
    trigger never fires), rather than deleting/un-accepting the row — which the
    invariant forbids while the candidate is `talent_pool`, a status anonymize
    must keep for KPI continuity. Anonymize also nulls the candidate's
    `deletion_review_date` so the next scan does not re-queue the anonymized row.
  - The retention scan is an in-database pg_cron `SECURITY DEFINER` function with
    a partial unique index (`one open row per candidate`) as the upsert target;
    the schedule (7b) is `pg_extension`-guarded. Ships no service-role key
    (principle 6); the archived `spec-data-model.md` service-role wording was
    reconciled accordingly.
- 2026-06-12: Milestone QA gate **accepted** (UI check). `pg_cron` enabled on the
  remote project and the three migrations pushed (`supabase db push`) at the gate,
  registering the daily `deletion-review-daily` job. Spec archived; milestone #7
  closed. **This closes the MVP feature set (Phases 1–8 by content).**
