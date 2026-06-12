# Spec: Dashboard KPIs (Phase 6)

> Status: DRAFT
> Created: 2026-06-12

Additive Postgres KPI views over the Phase 2 `candidate` spine plus token-styled
dashboard cards, so the recruiting counts the Excel computed by hand —
applications per month, by source, by priority (A/B/C/D), by status, and by
rejection reason — are available without manual counting and never via per-bucket
client round-trips (constitution principle 7).

## Outcome

- [ ] Five Postgres views aggregate `candidate` — applications per month, by
      `application_source`, by `priority`, by `candidate_status`, by
      `rejection_reason` — each a single SQL `group by` (or `date_trunc`) with no
      per-bucket client round-trip (principle 7); they live in
      `supabase/migrations/` and apply cleanly on top of the Phase 2 schema.
- [ ] Every KPI view is `security_invoker = on` and the migration explicitly
      `REVOKE SELECT … FROM anon, public` on each view, so an unauthenticated query
      returns nothing and the views never bypass `candidate` RLS (principle 6).
- [ ] Regenerated TypeScript types include the views and `npm run build` /
      `npm run lint` pass with no `any`.
- [ ] A server-side data-access module (`src/lib/db/kpis.ts`) reads each view
      through the RLS-scoped server client and returns typed, label/value-shaped
      results — all KPI reads go through it, none through client-side aggregation.
- [ ] The dashboard (`app/(app)/dashboard`) shows a KPI card per metric beside the
      Phase 5 Wiedervorlage card, each styled from design tokens (no hardcoded hex,
      principle 8), with German labels reused from the Phase 3 enum label maps.
- [ ] Every card renders a graceful zero/empty state when there are no candidates
      (or none in a category); the by-priority card includes an untriaged (null)
      bucket and the month series covers a rolling last 12 months in Europe/Berlin.

## Scope

### In scope

- **KPI Postgres views** — an additive migration (`supabase/migrations/`), one
  view per metric, each `create view … with (security_invoker = on)` followed by
  `REVOKE SELECT ON <view> FROM anon, public` **in the same migration** (Supabase
  default privileges otherwise grant `anon` SELECT on new public-schema views — the
  revoke is the migration-level guard, not just the behavioral test):
  - `kpi_applications_per_month` —
    `date_trunc('month', created_at AT TIME ZONE 'Europe/Berlin')` group-by with a
    `count`, restricted to the rolling **last 12 months** (current month back 11),
    returning `(month, count)` ordered by month. The window filter
    (`WHERE date_trunc('month', created_at AT TIME ZONE 'Europe/Berlin') >=
    date_trunc('month', now() AT TIME ZONE 'Europe/Berlin') - interval '11 months'`)
    lives **in the view body** (evaluated against `now()` at query time), never in
    `kpis.ts` — this is the one view that is not a flat all-time aggregate.
  - `kpi_by_source` — `group by application_source` -> `(application_source, count)`.
  - `kpi_by_priority` — `group by priority` -> `(priority, count)`, **including the
    `null` (untriaged) bucket** so the counts reconcile to the candidate total.
  - `kpi_by_status` — `group by candidate_status` -> `(status, count)`.
  - `kpi_by_rejection_reason` — `group by rejection_reason` over rejected rows
    (`WHERE rejection_reason IS NOT NULL`; equivalent to `status = 'rejected'` under
    the Phase 2 biconditional CHECK, but expressed on the reason column directly) ->
    `(rejection_reason, count)`.
- **Regenerated types** — `supabase gen types` re-run and committed under
  `src/lib/supabase`, now including the views.
- **KPI data-access** — `src/lib/db/kpis.ts`: typed, server-side reader(s) over the
  views through the RLS-scoped server client (the Phase 1 client + the Phase 3
  `lib/db` convention), returning typed label/value rows. No client-side
  aggregation, no per-bucket query.
- **KPI card components** — presentational, token-styled cards under
  `components/dashboard/` with German labels from the Phase 3 enum label maps
  (`src/lib/candidates/…`, issue #18) and a zero/empty state; the per-month card
  renders the 12-month series per the chosen visualization approach (see the OPEN
  decision).
- **Dashboard integration** — compose the KPI cards onto the Phase 1 dashboard
  page alongside the Phase 5 Wiedervorlage card; the page reads the KPI module
  server-side and passes typed props down.

### Out of scope

- **Funnel / conversion KPIs** (candidates-per-stage, conversion rate, acceptance
  ratio) — beyond the vision's named KPI set; addable later as further views +
  cards (horilla prior-art is reference-only, and its per-bucket query shape is the
  documented anti-pattern).
- **Interactive KPI filtering** — date-range pickers, per-card source/status
  filters; the MVP shows fixed windows (all-time categorical counts, rolling
  12-month series).
- **Drill-down** from a KPI into the filtered candidate list — a later nicety.
- **CSV / PDF export** of KPIs.
- **Materialized views / caching** — plain views suffice for the single-team
  dataset; revisit only if it outgrows a live aggregate.
- **Any new schema column** — this phase is additive read-only views over the
  Phase 2 spine; it adds no column and no write path.
- **Client-side aggregation / per-bucket round-trips** — forbidden by principle 7.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Depends on Phase 2 and Phase 1.** Phase 2 (`spec-data-model.md`, milestone #2)
  supplies the `candidate` table, the four classification enums, and `created_at`
  the views aggregate; Phase 1 (`spec-foundation-auth.md`, milestone #1) supplies
  the typed server client and the dashboard placeholder the cards land on.
  **Implementation waits until those land**; the design is independent and is
  specced now. The views, types, and `kpis.ts` data-access need only the Phase 2
  schema and the Phase 1 server client. The **card-label wiring** additionally
  depends on Phase 3's German enum label maps (`src/lib/candidates/…`, issue #18):
  the card-components step reuses them rather than duplicating a parallel label
  source, so that step waits on Phase 3. It does not depend on Phase 4.
- **Principle 7** — KPIs are SQL aggregates / Postgres views (`group by` an enum,
  or `date_trunc('month', …)`), never per-bucket client round-trips.
- **Principle 6** — KPI reads are server-side through the RLS-scoped client; the
  views are created `with (security_invoker = on)` (Postgres 17) and **not granted
  to `anon`**, so they honour `candidate` RLS and never expose aggregates to
  unauthenticated access. The service-role key never appears client-side.
- **Principle 8** — card styling from design tokens (CSS custom properties); no
  hardcoded hex.
- **Timezone** — month bucketing uses `created_at AT TIME ZONE 'Europe/Berlin'`
  (the org timezone, consistent with the Phase 5 follow-up decision) so a
  late-evening intake is not counted in the next UTC month.
- **No new date/charting dependency** unless the visualization OPEN decision
  approves one; the stack has no chart library and the constitution prefers native
  APIs and minimal dependencies. A chart dependency, if approved, is a shadcn
  `chart` (recharts) install under the loopkit dependency grant.
- German UI labels (reuse the Phase 3 enum label maps — no parallel label source);
  English identifiers, SQL, and comments. TypeScript `strict`, no `any`.
- Reuse the Phase 3 `lib/db` data-access convention rather than introducing a
  parallel module shape.

## Human prerequisites

- [ ] none — the KPI views are an additive migration on the already-provisioned
      Supabase project; no new secret, external provisioning, dashboard
      configuration, or account is required. (If the visualization decision adds a
      chart dependency, it installs autonomously under the loopkit grant — still no
      human prerequisite.)

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| KPI set = applications per month, by source, by priority (A/B/C/D), by status, by rejection reason | Vision success criteria ("applications per month, by source, A/B/C/D counts, rejection reasons") + roadmap Phase 6 intent (adds "by status") | 2026-06-12 |
| Each KPI is its own Postgres view, additive on the Phase 2 spine | Principle 7 + architecture "New KPI → a Postgres view + a dashboard card"; one view per metric keeps each a single readable aggregate | 2026-06-12 |
| Views are `security_invoker = on` and not granted to `anon` | Principle 6 — a default (definer) view would run as the owner and could leak aggregates past `candidate` RLS / to unauthenticated access; Postgres 17 supports `security_invoker` | 2026-06-12 |
| Month series = rolling last 12 months, bucketed in Europe/Berlin; categorical counts are all-time | Bounded and conventional (all-time month series grows unboundedly); Europe/Berlin matches the Phase 5 timezone decision so months do not flip at UTC midnight | 2026-06-12 |
| The by-priority view includes a `null`/untriaged bucket | `priority` is nullable until triaged (Phase 2); excluding nulls would make the card under-count vs. the candidate total | 2026-06-12 |
| German card labels reuse the Phase 3 enum label maps; no second label source | Phase 3 (#18) owns the enum→German maps; one source of truth, principle of reuse | 2026-06-12 |
| Default DECIDED: dependency-free numeric/table/CSS-bar cards, no chart library. The constitution's dependency-minimization rule sets this default; implementation proceeds dependency-free unless overridden. | Constitution "no new dependency without justification"; over-engineering avoidance for a single screen | 2026-06-12 |
| OPEN (override only) — whether to add shadcn `chart` (recharts) for the month series, as a visible-early-win lever for the management presentation | A new dependency needs explicit human approval (dependency rule); surfaced at the spec-acceptance gate. Without approval, the dependency-free default above stands | — |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 6 — Dashboard KPIs (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`) with the regenerated types.
- [ ] Applying the migration on the Phase 2 schema creates all five views; querying
      each on seeded candidates returns the expected grouped counts.
- [ ] An `anon`-key query against any KPI view returns no rows / is denied; an
      `authenticated`-key query succeeds (security_invoker + no anon grant).
- [ ] `kpi_by_priority` shows an untriaged bucket for null-priority rows;
      `kpi_by_rejection_reason` counts only rejected rows;
      `kpi_applications_per_month` returns the rolling last 12 months bucketed in
      Europe/Berlin (a 23:30 Europe/Berlin intake on the last day of a month counts
      in that month, not the next).
- [ ] Rolling-window boundary: a candidate created in the month 11 calendar months
      ago (Europe/Berlin) appears in `kpi_applications_per_month`; one created in
      the month 12 months ago does not (guards the `interval '11 months'`
      off-by-one).
- [ ] Each dashboard KPI card renders its counts from the view via
      `src/lib/db/kpis.ts`; with zero candidates every card shows a graceful
      zero/empty state.
- [ ] The dashboard shows the KPI cards alongside the Phase 5 Wiedervorlage card
      with no layout breakage; labels are German, styling uses design tokens (no
      hardcoded hex).
- [ ] The diff adds the views under `supabase/migrations/` and computes no KPI by a
      per-bucket client round-trip (principle 7) — KPI reads come only from the
      view-backed `kpis.ts` module.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A KPI view bypasses `candidate` RLS or leaks aggregates to `anon` | `security_invoker = on`, revoke from `anon`, and verify with an anon-key query (Verification) |
| Month bucketing flips a row into the wrong month at the UTC boundary | Bucket on `created_at AT TIME ZONE 'Europe/Berlin'`, consistent with Phase 5 |
| KPI cards collide with the Phase 5 Wiedervorlage card / Phase 1 placeholder on the dashboard page | Integration depends on the Phase 1 dashboard shell (#6); cards compose as distinct reads with no shared state (mirrors the Phase 5 risk row) |
| Adding a chart dependency for a single screen | Gated decision; default dependency-free numeric/table cards; recharts only if explicitly approved |
| View performance as the dataset grows | Plain views are fine for the single-team MVP; materialized views are an explicit later revisit |
| Implementation blocked because Phase 1/2 are unmerged | Sequencing is explicit; issues depend on #14 (Phase 2 schema + types) and #6 (Phase 1 dashboard); design is specced now, worked after they land |

## Decision log

- 2026-06-12: Planning kickoff for Phase 6 (plan loop). KPI set taken from the
  vision success criteria + roadmap intent; computed as one Postgres view per
  metric (principle 7, architecture "New KPI → a view + a card");
  `security_invoker` views with no anon grant for principle 6; month series
  bucketed in Europe/Berlin and bounded to a rolling 12 months, consistent with the
  Phase 5 timezone decision. One genuinely-open decision (visualization approach:
  dependency-free cards vs. a chart dependency) deferred to the spec-acceptance
  gate.
