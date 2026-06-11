# Spec: Candidate Management (Phase 3)

> Status: READY
> Created: 2026-06-11

The core CRUD surface over the Phase 2 `candidate` table: a list/table of all
candidates, a read-only detail view, and a validated create/edit form
(react-hook-form + zod) writing through server actions on the RLS-scoped server
client. This is the first visible win — it replaces the Excel `Bewerber-ATS`
sheet as the system of record for capturing and editing applications.

## Outcome

- [ ] An authenticated recruiter sees a list of all candidates with name,
      application source, stage, status, priority, and follow-up date, read
      server-side through the RLS-scoped client established in Phase 1; Phase 3
      introduces no service-role client (principle 6).
- [ ] A recruiter can open a candidate detail view showing every stored field,
      with German enum labels and design-token-styled stage/status/priority
      badges (no hardcoded hex — principle 8).
- [ ] A recruiter can create a new candidate through a react-hook-form + zod
      form; the three NOT NULL fields (`first_name`, `last_name`,
      `application_source`) are enforced both client-side (zod) and server-side
      (the server action re-validates with the same schema); the row is inserted
      via a server action.
- [ ] A recruiter can edit an existing candidate through the same form; changes
      persist and `updated_at` advances (Phase 2 trigger).
- [ ] The form enforces the rejection-reason biconditional in the UI — a
      `rejection_reason` is required exactly when `status = 'rejected'` and
      forbidden otherwise — mirroring the Phase 2 DB `CHECK`; an invalid
      combination cannot be submitted.
- [ ] The list can be searched by name and filtered by status and priority
      (client-side), and sorted by column, narrowing the visible rows without a
      server round-trip.
- [ ] Every enum input and badge renders its German label from a single shared
      label map; the English identifiers are what reach the database.
- [ ] `npm run lint` and `npm run build` pass with no `any`; all candidate-data
      access is server-side.

## Scope

### In scope

- **Data-access layer** — `src/lib/db/candidates.ts`: typed `list`, `getById`,
  `create`, `update` queries built on the Phase 2 generated `Database` type and
  the Phase 1 RLS-scoped **server** Supabase client. `list` returns all rows
  ordered by `created_at` desc (newest first) — no pagination in the MVP
  (single-team, small dataset). `create` omits the five defaulted-NOT-NULL enum
  columns from the insert payload unless the form supplies a value, so the DB
  default applies — they are never sent as `null` (see **Fields** below).
- **Shared enum labels + zod schema** — `src/lib/candidates/`: one label map per
  enum (identifier -> German label, and `{ value, label }[]` option lists for
  selects), reused by the table, detail view, badges, and form; a zod schema
  mirroring the `candidate` columns and the rejection-reason biconditional.
- **List/table page** — `app/(app)/candidates/page.tsx` (server component, loads
  the rows) + `components/candidates/candidate-table.tsx` (client component for
  the interactive bits), plus a nav entry in the Phase 1 app shell. Columns:
  name, source, stage, status, priority, follow-up date. Column sorting, a name
  text-search, and status/priority filters run client-side over the loaded rows
  (small dataset — no server round-trip per filter).
- **Stage/status/priority badges** — `components/candidates/*-badge.tsx`,
  variant -> design-token classes.
- **Detail view** — `app/(app)/candidates/[id]/page.tsx` (server component),
  all fields with German labels + badges + a link to edit.
- **Create/edit form** — a single `components/candidates/candidate-form.tsx`
  (client, react-hook-form + zod via shadcn form primitives) covering all 19
  fields grouped into sections (Kontakt, Klassifizierung, Pipeline,
  Team/Wiedervorlage, Sonstiges), wired to server actions for insert/update and
  reused by both `app/(app)/candidates/new/page.tsx` and
  `app/(app)/candidates/[id]/edit/page.tsx`.

### Out of scope

- Pipeline board / drag-to-reorder — **Phase 4** (consumes `stage` +
  `stage_order`; this phase only exposes `stage` as a form select).
- Surfacing overdue follow-ups / the Wiedervorlage dashboard — **Phase 5**
  (this phase edits `next_step` / `follow_up_date` as plain fields, no overdue
  logic).
- Dashboard KPIs / aggregate views — **Phase 6**.
- Talent-pool consent capture and the `status = 'talent_pool'` ⇒ accepted-consent
  invariant — **Phase 7**. The form may set `status = 'talent_pool'`, but it does
  not create or manage a `talent_pool_consent` row.
- Retention over `deletion_review_date` — **Phase 7** (the field is editable here
  as a plain date input; no scan/job).
- Bulk import / migrating legacy Excel rows; CSV export.
- File upload — only `documents_path` (a text link) is captured (principle 3).

### Fields

The `candidate` table has 19 user-editable columns (Phase 2): `first_name`,
`last_name`, `email`, `phone`, `application_source`, `nursing_qualification`,
`foreign_qualification_recognition`, `mobility`, `stage`, `status`, `priority`,
`rejection_reason`, `team_proposal`, `team_feedback_status`, `next_step`,
`follow_up_date`, `deletion_review_date`, `documents_path`, `notes`. The detail
view shows all 19 plus the read-only `created_at` / `updated_at`; the create/edit
form covers all 19. `stage_order` is **not** surfaced — it is the Phase 4 board's
write path.

Form rules:

- **Required:** `first_name`, `last_name`, `application_source` (the table's three
  non-defaulted NOT NULLs). The five defaulted-NOT-NULL enums
  (`foreign_qualification_recognition`, `mobility`, `stage`, `status`,
  `team_feedback_status`) render with their DB default preselected and are always
  submitted with a valid value, never `null`. Everything else is optional.
- **Only one cross-field rule is enforced:** the rejection-reason biconditional
  (`rejection_reason` required iff `status = 'rejected'`). Phase 3 enforces **no
  stage/status coupling** — the DB defines no such constraint, so every
  stage×status combination is permitted (including `status = 'hired'` with a
  non-terminal stage). Terminal-stage semantics (`TERMINAL_STAGES = ['hired']`)
  are a Phase 4 board concern, deliberately not enforced in this form.
- `documents_path` is optional free text — a path/link to protected external
  storage (principle 3); it is **not** validated as a strict URL, since the
  target may be a network/share path rather than an http URL.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Depends on Phase 1 and Phase 2.** Phase 1 (`spec-foundation-auth.md`)
  supplies the `(app)` route group, app shell, and typed server/browser Supabase
  clients; the scaffold (PR #16) has landed but the auth/app-shell issues
  (#5, #6) are still open. Phase 2 (`spec-data-model.md`, milestone #2) supplies
  the `candidate` table, the 10 enums, the RLS policies, and the generated
  `Database` type under `src/lib/supabase`. **Implementation of this phase's
  issues waits until both are merged**; the design is independent and is specced
  now.
- Reads are React Server Components; writes are **server actions** — candidate
  data never transits a client component holding a privileged key (principle 6).
  The form is a client component, but it submits to a server action that
  re-validates and performs the insert/update on the server.
- Validation is **react-hook-form + zod** (constitution stack); the same zod
  schema validates on the client and inside the server action.
- The UI mirrors, never re-implements, the DB rules: the rejection-reason
  biconditional is a zod `refine`, and the database `CHECK` remains the source of
  truth (defense in depth).
- Enum **UI labels are German**, enum **identifiers/stored values are English**
  (Conventions); a single shared label map is the only place the German copy
  lives. No `as`-casting enum strings — derive option lists from the generated
  enum types.
- Styling uses design tokens from `globals.css` (principle 8); shadcn/ui
  primitives vendored from `mag`; path aliases `@/components`, `@/components/ui`,
  `@/lib`.
- TypeScript `strict`, no `any`, no `@ts-ignore` without a TODO.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Reads as RSC server components, writes as server actions, both via the RLS-scoped server client | Principle 6 + `docs/architecture.md` boundaries (candidate access is server-side); no service-role key reaches the client | 2026-06-11 |
| Single shared enum-label map (`src/lib/candidates`) is the only home for German enum copy | Conventions (German UI, English identifiers); reused by table, detail, badges, form — avoids drift | 2026-06-11 |
| Rejection-reason biconditional enforced in the UI via zod `refine`, mirroring the DB `CHECK` | Principle 1; the DB stays the source of truth, the form fails fast | 2026-06-11 |
| Form built with react-hook-form + zod (shadcn form primitives); list/detail layout follows atomic-crm | Constitution stack; atomic-crm is the same-stack reuse reference (prior-art §2) | 2026-06-11 |
| Three NOT NULL fields only (`first_name`, `last_name`, `application_source`); everything else optional/defaulted | Matches the Phase 2 table nullability; keeps intake friction low | 2026-06-11 |
| No hard-delete in Phase 3 — removal is expressed via `status` (`rejected` with reason `spam`/`duplicate`, or `withdrawn`); destructive deletion/anonymization is the Phase 7 retention concern over `deletion_review_date` | Principle 5 + the vision retention model + the spam/duplicate rejection reasons; a UI hard-delete would pre-empt the Phase 7 design. Revisitable if stakeholders need to purge obvious data-entry mistakes | 2026-06-11 |
| One full form, shared by create & edit — all 19 fields grouped into sections (Kontakt, Klassifizierung, Pipeline, Team/Wiedervorlage, Sonstiges); only the three required fields block save | Stakeholder decision at the review gate; one component, minimal code, quick capture by saving after the three required fields | 2026-06-11 |
| List = sortable table **plus** a name text-search and status/priority filters, applied client-side over the loaded rows (small single-team dataset) | Stakeholder decision at the review gate; directly serves the vision triage goal (find A-candidates), replacing the Excel filters. Stage view is the Phase 4 board; overdue surfacing is Phase 5 | 2026-06-11 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 3 — Candidate management (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`).
- [ ] An authenticated user can load `/candidates` and see existing rows; an
      unauthenticated request is redirected/denied by the Phase 1 guard.
- [ ] Creating a candidate with only the three required fields succeeds; the new
      row appears in the list and its detail view.
- [ ] Submitting the form with `status = 'rejected'` and no `rejection_reason`
      is blocked by zod before the server action runs; the inverse (a reason set
      while status is not `rejected`) is also blocked.
- [ ] Editing a candidate persists the change and the detail view reflects it.
- [ ] Typing a name in the search box and selecting a status/priority filter
      narrows the table to matching rows; clearing them restores the full list.
- [ ] All enum cells/badges/selects show German labels; the values written to the
      DB are the English identifiers.
- [ ] Phase 3 introduces no service-role client; candidate queries run
      server-side through the RLS-scoped Phase 1 client only.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Phase 1 (#5, #6) and/or Phase 2 not yet merged when implementation starts | Sequencing is explicit; issues are created now, worked only once both phases land. The scaffold (#16) is already in. |
| The full candidate form has 19 fields and risks being unwieldy | Single form, all 19 fields grouped into labelled sections; only the three non-defaulted NOT NULLs block save, so quick capture stays a 3-field path |
| Enum option lists drift from the DB enums | Derive option lists and labels from a single map keyed by the generated enum union type; a missing key is a type error |
| Client/DB validation diverge for the rejection biconditional | One zod schema shared by client and server action; the DB `CHECK` is the backstop |
| `status = 'talent_pool'` set here with no consent row (principle 4) | Out of scope by design; the consent invariant is a Phase 7 concern, not enforced in this UI |

## Decision log

- 2026-06-11: Planning kickoff for Phase 3 (`/plan 3`). Builds on the Phase 2
  data model and the Phase 1 shell; most decisions are constraint-determined by
  the constitution stack, with atomic-crm (prior-art §2) as the same-stack
  layout reference. Three product/scope decisions (create-form shape, list
  richness, delete capability) initially marked OPEN for the review gate.
- 2026-06-11: Review gate — added the **Fields** subsection (19 editable columns
  enumerated; `stage_order` excluded as Phase 4); stated that Phase 3 enforces
  **only** the rejection-reason biconditional and **no** stage/status coupling
  (the DB has no such CHECK; terminal-stage semantics are Phase 4); specified the
  `create` contract to omit the five defaulted-NOT-NULL enums rather than send
  `null`; set list ordering (created_at desc) and no-pagination as explicit MVP
  assumptions; clarified `documents_path` is non-URL-validated free text.
- 2026-06-11: Review gate — reclassified the **delete-capability** question from
  OPEN to constraint-determined: no hard-delete in Phase 3 (removal via `status`;
  retention/anonymization is Phase 7), per principle 5 + the spam/duplicate
  rejection reasons. Two genuinely-open decisions remained for the human gate:
  create-form shape and list richness.
- 2026-06-11: Review gate (AskUserQuestion) — resolved both open decisions:
  (1) **one full form** shared by create & edit, all 19 fields in labelled
  sections, only the three required fields block save; (2) list = sortable table
  **plus** client-side name search and status/priority filters. Spec flipped to
  READY.
