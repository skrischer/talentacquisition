# Spec: Screen implementation (Phase 10)

> Status: DRAFT
> Created: 2026-06-12

Implement every product page to match the finalized Paper screens (7 desktop +
5 mobile) using the Phase-9 component library — login, app shell / navigation,
candidate list / detail / form, pipeline board, dashboard, and the dedicated
Wiedervorlage page — including the explicit **functional deltas** the screens
introduce. After the MVP scope trim the screens **are** the target state, so the
deltas are first-class scope, not styling side-effects. All pages are responsive
(desktop ≈ 1440 / mobile ≈ 390). No migration: every change is UI plus server
actions over existing columns.

## Outcome

- [ ] Every product page matches its Paper screen at desktop and mobile, built
      from the **Phase-9 library** — no ad-hoc primitives, no hardcoded hex
      (principle 8).
- [ ] **App shell / navigation** — desktop sidebar + mobile bottom-tab bar
      (Dashboard, Bewerber, Pipeline-Board, Wiedervorlage with the overdue count,
      plus the auth user + logout), with a topbar / page-header; the **global
      header search** routes to the candidate list filtered by the query.
- [ ] **Login** — split brand hero + passwordless magic-link form, responsive.
- [ ] **Candidate list** — responsive table → stacked card; the **stage and
      source filters** are added and AND-composed with the existing status /
      priority / search; **client-side pagination**; the Liste / Board toggle.
- [ ] **Candidate detail** — identity card (badges + contact grid), the 7-stage
      pipeline **stepper**, the qualification / team / notes sections, and the
      right sidebar (Wiedervorlage, Talentpool, Aufbewahrung cards).
- [ ] **Candidate form** — sectioned cards using the Phase-9 controls; the
      **email-or-phone-required** rule (at least one of email / phone) is enforced
      via zod with a German message; the rejection-reason biconditional
      (constitution principle 1) is preserved.
- [ ] **Pipeline board** — stage columns (desktop) / stage-selector + single
      column (mobile), reusing the Phase-4 drag-and-persist engine unchanged.
- [ ] **Dashboard** — the KPI **stat row** (active A-candidates, month-over-month
      delta, eingestellt, rejection rate — derived from the existing Phase-6
      views, no new trend), the Phase-6 chart, the Wiedervorlage card, the
      distribution cards, and the Phase-7 "Löschprüfung fällig" card slotted in.
- [ ] **Wiedervorlage page** — grouped sections (Überfällig / Heute fällig /
      Diese Woche) over the Phase-5 bucket utility, each row with **Erledigt**
      (clears `next_step` + `follow_up_date`) and **Verschieben** (sets a new
      `follow_up_date`) server actions, plus a "Nur überfällig" toggle and
      Sortieren.
- [ ] The German label copy deferred from Phase 9 is reconciled to the styleguide
      (`active` → "In Bearbeitung", `rejected` → "Abgesagt") in
      `src/lib/candidates/labels.ts`.
- [ ] Verify (`eslint` + `tsc`) and Build pass; no `any`; all candidate-data
      access stays server-side (principle 6); the diff adds **no** file under
      `supabase/migrations/`.

## Scope

### In scope

- **App shell & navigation** — the chrome every `(app)` page sits in: the desktop
  sidebar and the mobile bottom-tab bar (active-route state, the auth user +
  logout, the Wiedervorlage overdue count from the Phase-5 due set), and the
  topbar / page-header. The **global header search** routes to
  `/candidates?q=…` (the list reads `q`).
- **The seven screens** — login, candidate list, candidate detail, candidate
  form, pipeline board, dashboard, and the dedicated Wiedervorlage page — each
  responsive and composed from the Phase-9 components.
- **Functional deltas (explicit, per the roadmap)** — none needs a migration:
  - **Wiedervorlage page** + the **Erledigt / Verschieben** server actions over
    `next_step` / `follow_up_date` (no task table).
  - **Global header search** routing to the candidate list.
  - **Stage + source list filters** AND-composed with the existing filters, plus
    **client-side pagination** over the already-loaded rows.
  - **Email-or-phone-required** form rule (zod refine; a German message).
  - **KPI stat-row figures** derived from the existing Phase-6 views (active
    A-candidates, month-over-month delta, rejection rate — no new trend metric).
  - **Label-copy reconciliation** deferred from Phase 9.

### Out of scope

- **The component library and tokens** — built in **Phase 9**; this phase only
  composes them.
- **New schema, migrations, or KPI views** — the columns and the Phase-6 views
  already exist; this phase adds no SQL.
- **Owned by sibling milestones, reused / slotted — not rebuilt here:** the chart
  component (**Phase 6**, #43), the KPI views + their data access (**Phase 6**,
  #44), the retention review query + anonymize action (**Phase 7**, #56 — Phase
  10 only places the card), the follow-up bucket utility (**Phase 5**, #28 —
  reused by the Wiedervorlage page and the nav count), and the board
  drag-and-persist engine (**Phase 4** — reused).
- **Talent-pool consent logic and the retention job** — **Phase 7**; the detail
  Talentpool / Aufbewahrung cards display existing state only.
- **Automated emails** (vision non-goal) and any **new candidate field or
  behaviour** beyond the named deltas.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Depends on Phase 9 and on the functional pages.** Phase 9 (#90–#95) supplies
  the tokens + component library. Phases 1 (shell / auth), 3 (list / detail /
  form), 4 (board) are **done** (specs archived) — their pages are restyled here.
  Phases 5 (follow-up util), 6 (KPI views / chart), 7 (retention card) are **in
  progress**; the Wiedervorlage page, the dashboard, and the retention card wait
  on those milestones.
- **No migration.** Erledigt / Verschieben and email-or-phone are server-action /
  validation changes over existing columns; the stat-row reads existing views.
- **Reuse, do not fork.** Extend the existing pages, components, server actions
  (`candidate-table.tsx`, `candidate-form.tsx`, `lib/candidates/actions.ts`,
  the board), not parallel copies. The list filters extend the Phase-3 table;
  Erledigt / Verschieben are new actions over the existing column pair; the nav
  count and the Wiedervorlage page reuse the Phase-5 bucket utility.
- **Responsive** to the two Paper breakpoints (table → card, sidebar → bottom-tab,
  board columns → stage-selector); the Phase-9 components carry the adaptivity.
- Match the Paper screens via Paper MCP `get_jsx` / `get_computed_styles`;
  screenshots are for QA only. Principle 8 (tokens, no hex); strict TS, no `any`;
  German UI copy, English identifiers; server-side RLS reads (principle 6); no
  emojis.

## Human prerequisites

- [ ] None beyond Paper MCP access for value extraction during implementation —
      no secret, account, or external provisioning; the data, columns, and views
      all already exist. Nothing is added to `.env.local`.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Implement **all** pages in Phase 10; the functional deltas are explicit issues, not folded into "styling" | Roadmap Phase 10 intent: after the scope trim the screens are the target state and the deltas must be explicit | 2026-06-12 |
| Boundaries: chart → Phase 6 (#43), KPI views → Phase 6 (#44), retention card → Phase 7 (#56), follow-up bucket → Phase 5 (#28), board engine → Phase 4 — reused / slotted, not rebuilt | Those milestones own the data / behaviour; Phase 10 composes and restyles | 2026-06-12 |
| Dashboard split: Phase 6 owns the views + chart + by-X distribution cards; Phase 10 owns the page composition, the **stat row**, and the restyle | Roadmap puts the KPI stat-row figures explicitly under Phase 10; avoids double-owning the dashboard | 2026-06-12 |
| `email-or-phone-required` = a zod refine (at least one of email / phone), German message; **no** DB change | Roadmap names it as a form rule; keeps the "telefon-only Eingang möglich" path the form hints at; no `NOT NULL` churn | 2026-06-12 |
| Client-side pagination over the already-loaded rows | Small single-team dataset; matches the Phase-3 whole-table read and the Phase-5 client-filter decisions | 2026-06-12 |
| Mobile nav = bottom-tab bar; desktop = sidebar | The final Paper screens; the two are distinct compositions of the same Phase-9 primitives | 2026-06-12 |
| The Phase-9-deferred German label copy (`active` → "In Bearbeitung", `rejected` → "Abgesagt") is reconciled here | It is page-facing copy in a shared module rendered by these pages | 2026-06-12 |
| Erledigt clears `next_step` + `follow_up_date`; Verschieben sets a new `follow_up_date` (no snooze table, no task model) | Architecture "Later (not MVP)"; matches the Phase-5 reschedule-by-editing decision | 2026-06-12 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 10 — Screen implementation (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` and `npm run build` pass (no type errors, no `any`).
- [ ] Each page visually matches its Paper screen at ≈ 1440 and ≈ 390 (human QA
      gate against the artboards) and uses only Phase-9 components / tokens —
      `git grep` finds no hardcoded hex in the page code.
- [ ] The app shell renders the sidebar (desktop) and bottom-tab bar (mobile)
      with the active route highlighted and the Wiedervorlage overdue count; the
      header search navigates to the filtered candidate list.
- [ ] The candidate list filters by stage and source (AND-composed with status /
      priority / search) and paginates client-side; the Liste / Board toggle works.
- [ ] Saving a candidate with neither email nor phone is rejected with a German
      message; with either one it saves; a rejection status still requires a reason.
- [ ] On the Wiedervorlage page, Erledigt removes a row (clears the column pair)
      and Verschieben to a future date re-buckets it; the "Nur überfällig" toggle
      narrows to overdue.
- [ ] The dashboard stat row shows active A-candidates, the month-over-month
      delta, and the rejection rate from the existing views; the chart, the
      Wiedervorlage card, the distribution cards, and the Löschprüfung card render.
- [ ] The diff adds no file under `supabase/migrations/`; all reads are
      server-side (principle 6).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Dashboard double-owned with Phase 6 | Explicit split (Phase 6 = views + chart + distribution; Phase 10 = composition + stat row + restyle) in Prior decisions |
| Rebuilding a page that its functional phase (5/6/7) has not finished | Cross-milestone `Depends on` edges; the implement loop only picks unblocked issues |
| Restyle silently changes behaviour | The functional deltas are explicit issues with their own acceptance; pure-restyle issues assert "no behaviour change" |
| Pixel-matching drift from the final design | Pull exact values via Paper MCP `get_jsx` / `get_computed_styles`; screenshots diffed at the QA gate |
| Responsive gaps (only desktop built) | Every screen issue has a mobile acceptance item; the Phase-9 components carry adaptivity |
| Erledigt / Verschieben diverge from the Phase-5 model | Both act only on `next_step` / `follow_up_date`, reuse the bucket utility; no task table |

## Decision log

- 2026-06-12: Planning kickoff for Phase 10 (`/loopkit:plan Phase 9 & 10`,
  second cycle). The Paper hand-off is final and now includes a dedicated
  Wiedervorlage screen and 5 mobile screens, so responsive and the functional
  deltas are first-class scope. Boundaries to Phases 4/5/6/7 fixed in Prior
  decisions; the dashboard split and the email-or-phone rule recorded as
  decisions (roadmap-determined). No genuinely-open decision identified at draft
  time — to be confirmed at the review gate.
