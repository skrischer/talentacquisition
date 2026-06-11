# Spec: Data Model (Phase 2)

> Status: READY
> Created: 2026-06-11

The migration spine: enum types, the `candidate` table with the
stage/status/priority separation and rejection-reason check constraint, the
`talent_pool_consent` table, the `deletion_review_date` column, RLS policies for
internal-only access, and generated TypeScript types — derived from
professional ATS reference implementations, not from the legacy Excel.

## Outcome

- [ ] A Supabase migration workflow exists (`supabase/migrations/`) and applies
      cleanly to the provisioned project; re-running it on an empty database
      reproduces the full schema.
- [ ] All categorical fields are Postgres `enum` types (no stage/status config
      table — constitution principle 2); stage, status, and priority are three
      separate columns on `candidate`, never one folded enum (principle 1).
- [ ] A DB `CHECK` constraint enforces the biconditional
      `(status = 'rejected') = (rejection_reason IS NOT NULL)` — a rejection
      reason exists exactly when, and only when, the candidate is rejected
      (principle 1).
- [ ] `candidate` stores only a `documents_path` text link to external storage —
      no document bytes in the database (principle 3).
- [ ] A `talent_pool_consent` table records explicit consent (`accepted`,
      `state`, `answered_at`, audit metadata) and supports at most one consent
      row per candidate (unique FK); row population is the Phase 7 workflow
      (principle 4).
- [ ] Every `candidate` row carries a nullable `deletion_review_date` column for
      the Phase 7 retention job to scan (principle 5).
- [ ] RLS is enabled on `candidate` and `talent_pool_consent`; the `authenticated`
      role has full access, `anon` has none, and no policy or migration ships the
      service-role key to client code (principle 6).
- [ ] Generated TypeScript types for the schema exist under `src/lib/supabase`
      and `npm run build` / `npm run lint` pass with them (no `any`).

## Scope

### In scope

- A Supabase local migration workflow: the `supabase/` directory, an initial
  migration under `supabase/migrations/`, and a documented `supabase gen types`
  step. Phase 1 deliberately left the schema empty and set up no migration
  tooling, so it is established here.
- The 10 enum types in **Data model design** below.
- The `candidate` table: identity/contact, the four classification enums, the
  stage/status/priority separation with `stage_order`, the rejection-reason
  check constraint, team-proposal/feedback and trial-day fields, the
  Wiedervorlage columns (`next_step`, `follow_up_date`), `deletion_review_date`,
  `documents_path`, `notes`, and `created_at`/`updated_at` with an update
  trigger.
- The `talent_pool_consent` table and its FK + uniqueness to `candidate`.
- RLS enablement and `authenticated`-role policies on both tables.
- Generated TypeScript types committed under `src/lib/supabase`.

### Out of scope

- KPI views / aggregates — **Phase 6** (additive Postgres views on this spine).
- The consent-capture workflow and the `status = 'talent_pool'` ⇒
  accepted-consent invariant enforcement — **Phase 7** (this phase ships the
  table; Phase 7 wires the workflow).
- The retention job that scans `deletion_review_date` and the service-role
  client it needs — **Phase 7** (this phase ships only the column).
- The board's drag-to-reorder write path — **Phase 4** (this phase ships the
  `stage` + `stage_order` columns it persists into).
- Candidate list/detail/form UI — **Phase 3**.
- Seed/sample data and any migration of legacy Excel rows.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- Depends on Phase 1 (`spec-foundation-auth.md`, PR #1) for the Supabase project
  wiring and typed clients; **implementation of this phase's issues waits until
  Phase 1 is merged**. The design is independent and can be specced now.
- Auth model from Phase 1: passwordless magic-link, users provisioned in the
  Supabase dashboard, **no roles**. Therefore every authenticated user is
  internal recruiting staff, and RLS reduces to "`authenticated` may do
  everything, `anon` nothing" — no per-role policy matrix in the MVP.
- Phase 1 introduces no service-role key. The retention job's service-role
  access (which bypasses RLS) is a Phase 7 concern; this phase adds no
  service-role client or env var.
- Postgres `enum` types per principle 2 and `docs/architecture.md` ("new enum
  value → migration (alter enum)"). Prior art (Odoo, FreeATS) uses config *rows*
  for evolving reasons/stages; the MVP's fixed-enum choice is a deliberate
  trade-off recorded below.
- TypeScript `strict`, no `any` (Conventions); identifiers/comments/migrations in
  English, enum UI labels in German.
- Migrations live in `supabase/migrations/`; generated types under
  `src/lib/supabase` (the `src/` layout and `@/lib` alias from Phase 1).

## Data model design

Enum identifiers are English (stored values); the German UI label is the copy
shown to recruiters. Sources cite the prior-art reference each value set is
synthesized from.

### Pipeline and orthogonal classification (precedent-decided)

`pipeline_stage` — fixed, ordered; synthesized from Odoo `hr_recruitment` default
stages + atomic-crm + FreeATS, collapsed for a small-org care flow. Terminal
stages are flagged by an app-level constant (`TERMINAL_STAGES = ['hired']`,
atomic-crm `defaultDealPipelineStatuses` pattern), never inside the status enum.

| identifier | German label |
|---|---|
| `new` | Neu / Eingang |
| `screening` | Sichtung |
| `phone_screen` | Telefonkontakt |
| `interview` | Vorstellungsgespräch |
| `trial_day` | Hospitation |
| `offer` | Angebot |
| `hired` | Eingestellt |

`candidate_status` — orthogonal to stage; synthesized from FreeATS placement
status (`qualified`/`reserved`/`disqualified`) plus talent-pool/withdrawn. A
rejected candidate keeps the stage they dropped out at (preserves "rejected
during interview" reporting).

| identifier | German label | notes |
|---|---|---|
| `active` | In Bearbeitung | default |
| `on_hold` | Zurückgestellt | FreeATS `reserved` |
| `hired` | Eingestellt | terminal-positive |
| `rejected` | Abgesagt | requires `rejection_reason` |
| `talent_pool` | Talentpool | needs a consent record (Phase 7 invariant) |
| `withdrawn` | Zurückgezogen | candidate withdrew |

`candidate_priority` — the org's A/B/C/D scheme (vision.md), kept separate from
status; ordinal-priority precedent is Odoo `AVAILABLE_PRIORITIES`. Nullable
until triaged.

| identifier | German label |
|---|---|
| `a` | A |
| `b` | B |
| `c` | C |
| `d` | D |

`rejection_reason` — synthesized from Odoo `hr.applicant.refuse.reason` + FreeATS
mandatory reasons (`No reply`, `Position closed`) + care-recruiting additions.
Nullable; set exactly when `status = 'rejected'`.

| identifier | German label |
|---|---|
| `no_reply` | Keine Rückmeldung |
| `position_filled` | Stelle besetzt |
| `unqualified` | Fachlich nicht passend |
| `language_issues` | Sprachkenntnisse unzureichend |
| `salary_mismatch` | Gehaltsvorstellung zu hoch |
| `declined_by_candidate` | Absage durch Bewerber |
| `no_show` | Nicht erschienen |
| `duplicate` | Doppelte Bewerbung |
| `spam` | Spam / unseriös |
| `other` | Sonstiges |

`consent_state` — mirrors the OCA `privacy_consent` `state` shape (schema
reference only; the AGPL module is not depended on, per prior-art.md §4).

| identifier | German label |
|---|---|
| `draft` | Entwurf |
| `sent` | Angefragt |
| `answered` | Beantwortet |

### Domain-specific enums (no prior art; confirmed at the review gate)

No reference repo models German ambulatory-care recruiting specifics. The five
value sets below were confirmed at the review gate on 2026-06-11; all are
alterable later via `ALTER TYPE ... ADD VALUE` migrations.

`application_source` (loose precedent: Odoo UTM `source_id`/`medium_id`):
`email` Per E-Mail · `phone` Telefonisch · `partner_referral` Über Gesellschafter ·
`employee_referral` Mitarbeiterempfehlung · `job_portal` Stellenportal ·
`agency` Arbeitsagentur · `website` Website · `walk_in` Initiativ ·
`other` Sonstiges

`nursing_qualification`: `examined_nurse` Examinierte Pflegefachkraft ·
`nursing_assistant` Pflegehelfer/in · `nursing_aide_1yr` Einjährig examiniert ·
`care_assistant_unqualified` Betreuungskraft (ohne Examen) · `other` Sonstige ·
`none` Keine

`foreign_qualification_recognition`: `not_applicable` Nicht relevant ·
`not_started` Noch nicht beantragt · `pending` Anerkennung läuft ·
`partially_recognized` Teilanerkennung · `fully_recognized` Voll anerkannt ·
`rejected` Nicht anerkannt

`mobility`: `own_car` Eigener PKW · `license_no_car` Führerschein, kein PKW ·
`no_license` Kein Führerschein · `unknown` Unbekannt

`team_feedback_status`: `not_requested` Nicht angefragt · `pending` Ausstehend ·
`positive` Zusage Team · `negative` Absage Team · `more_info_needed` Rückfragen offen

### Tables

`candidate`

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `created_at` | `timestamptz` | `not null default now()` |
| `updated_at` | `timestamptz` | `not null default now()`; trigger-maintained |
| `first_name` | `text` | `not null` |
| `last_name` | `text` | `not null` |
| `email` | `text` | nullable (phone-only intakes) |
| `phone` | `text` | nullable |
| `application_source` | `application_source` | `not null` |
| `nursing_qualification` | `nursing_qualification` | nullable (unknown at intake) |
| `foreign_qualification_recognition` | `foreign_qualification_recognition` | `not null default 'not_applicable'` |
| `mobility` | `mobility` | `not null default 'unknown'` |
| `stage` | `pipeline_stage` | `not null default 'new'` |
| `stage_order` | `integer` | `not null default 0` (Phase 4 board ordering) |
| `status` | `candidate_status` | `not null default 'active'` |
| `priority` | `candidate_priority` | nullable (until triaged) |
| `rejection_reason` | `rejection_reason` | nullable; CHECK below |
| `team_proposal` | `text` | nullable (proposed team) |
| `team_feedback_status` | `team_feedback_status` | `not null default 'not_requested'` |
| `next_step` | `text` | nullable (Wiedervorlage; surfaced in Phase 5) |
| `follow_up_date` | `date` | nullable (Wiedervorlage; surfaced in Phase 5) |
| `deletion_review_date` | `date` | nullable (Phase 7 retention scan) |
| `documents_path` | `text` | nullable; link only (principle 3) |
| `notes` | `text` | nullable (free remarks) |

CHECK constraint: `(status = 'rejected') = (rejection_reason IS NOT NULL)`.

`talent_pool_consent` (OCA `privacy_consent` shape)

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `candidate_id` | `uuid` | `not null references candidate(id) on delete cascade`, `unique` |
| `accepted` | `boolean` | `not null default false` |
| `state` | `consent_state` | `not null default 'draft'` |
| `answered_at` | `timestamptz` | nullable (set when answered) |
| `proof_metadata` | `jsonb` | nullable (audit; OCA `last_metadata`) |
| `created_at` | `timestamptz` | `not null default now()` |
| `updated_at` | `timestamptz` | `not null default now()`; trigger-maintained |

### RLS

Enable RLS on both tables. One policy per table granting the `authenticated`
role `select`/`insert`/`update`/`delete` (`using (true) with check (true)` — all
authenticated users are internal staff). `anon` gets no policy. The service-role
(retention job) bypasses RLS and is introduced in Phase 7.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Derive the data model from professional ATS references, not the legacy Excel | User decision: the Excel is not a real template; orient on the prior-art professionals | 2026-06-11 |
| Three separate columns (`stage`, `status`, `priority`), not one folded enum | Constitution principle 1; FreeATS/Odoo separate them, OpenCATS' single ladder is the documented anti-pattern | 2026-06-11 |
| Fixed Postgres `enum` types for all categoricals; new values via `ALTER TYPE` migration | Constitution principle 2 + architecture.md; prior art uses config rows, but a single-team MVP does not need user-editable taxonomies | 2026-06-11 |
| Rejection-reason enforced by a biconditional CHECK | Principle 1: a reason exists exactly when status is `rejected` | 2026-06-11 |
| Terminal stages flagged by an app-level constant, not a stage/status value | atomic-crm `defaultDealPipelineStatuses` / FreeATS pinned "Hired" pattern | 2026-06-11 |
| Complete candidate spine (incl. `next_step`/`follow_up_date`/team fields) in this phase | Phase 2 is "the spine"; avoids mid-stream column-adding migrations. Feature phases (3–7) add UX/views on top, not schema | 2026-06-11 |
| RLS = `authenticated` full access, `anon` none; no role matrix | Phase 1 provisions internal users with no roles; principle 6 | 2026-06-11 |
| The 5 domain enum value sets (source, qualification, recognition, mobility, team feedback) | No prior art; MVP defaults confirmed at the review gate — `trial_day_result` dropped and `nursing_qualification` trimmed (no trainee/student) per stakeholder | 2026-06-11 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 2 — Data model (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`) with the generated types.
- [ ] Applying the migration to an empty database creates all 10 enum types,
      both tables, the update triggers, the check constraint, and the RLS
      policies without error.
- [ ] Inserting a candidate with `status = 'rejected'` and no `rejection_reason`
      is rejected by the CHECK; setting a `rejection_reason` while `status` is
      not `rejected` is also rejected.
- [ ] A second `talent_pool_consent` row for the same `candidate_id` violates the
      unique constraint.
- [ ] With RLS on, an `anon`-key query against `candidate` returns no rows /
      is denied; an `authenticated`-key query succeeds.
- [ ] `supabase gen types` output committed under `src/lib/supabase` matches the
      migration, and importing the generated `Database` type compiles.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A domain enum needs a new value post-MVP | MVP defaults confirmed at the review gate; alterable via `ALTER TYPE ... ADD VALUE` migrations |
| `ALTER TYPE ... ADD VALUE` cannot run inside a transaction / values cannot be removed or reordered | Accept for the MVP fixed-enum trade-off; if a taxonomy proves volatile, migrate that one enum to a lookup table post-MVP (revisit point recorded) |
| Implementation blocked because Phase 1 is unmerged | Sequencing is explicit: issues created now, worked only after PR #1 merges and the Supabase wiring exists |
| `status = 'talent_pool'` without an accepted consent (principle 4) not DB-enforced here | Out of scope by design; the invariant is wired in the Phase 7 consent workflow (trigger or app logic) |

## Decision log

- 2026-06-11: Planning kickoff — user chose to plan Phase 2 ahead of the
  roadmap's Phase-1-first focus (AskUserQuestion); domain values to be derived
  from prior-art references, not the Excel.
- 2026-06-11: Review gate — reconciled `docs/architecture.md` in this PR (enum
  source → prior art; `consent` table renamed to `talent_pool_consent`);
  corrected the OCA `consent_state` attribution to "schema reference only, AGPL
  not depended on"; softened the consent Outcome to "at most one row per
  candidate (unique FK), population in Phase 7".
- 2026-06-11: Review gate (AskUserQuestion) — domain enums confirmed; dropped
  `trial_day_result` entirely (the `trial_day` / Hospitation *stage* stays) and
  removed `trainee` + `student` from `nursing_qualification`. 10 enum types.
