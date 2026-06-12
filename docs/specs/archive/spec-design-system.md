# Spec: Design system & component library (Phase 9)

> Status: READY
> Created: 2026-06-12

Turn the finalized Paper design hand-off (styleguide + 7 desktop screens + 5
mobile screens) into the project's own token foundation and a shadcn/ui-based
component library covering every element the screens use — each matched against
the styleguide, built responsive (desktop 1440 / mobile 390). No product page or
route changes: this phase ships tokens and components only, plus a dev-only
gallery to diff them against the styleguide. It supersedes the vendored `mag`
tokens as talentacquisition's own and updates the constitution accordingly.

## Outcome

- [ ] `globals.css` is talentacquisition's own design-token source — colors,
      type scale (Montserrat headings / Source Sans 3 body, 6 steps), spacing
      (8pt grid), radius, shadow, focus, z-index — matching the Paper styleguide;
      the constitution's styling row and the tech-debt "vendored from `mag`" entry
      are updated to say the tokens are now project-owned, and `docs/architecture.md`'s
      `components/ui` note follows.
- [ ] The shadcn **base-token aliases** the existing primitives and the shipped
      Phase-6 `chart.tsx` already reference but `globals.css` does not define —
      `--background`, `--foreground`, `--muted` / `--muted-foreground`, `--border`,
      `--input`, `--ring`, `--primary-foreground`, `--secondary-foreground`,
      `--accent` — plus the `--chart-*` palette, are defined as aliases onto the
      styleguide tokens, so shadcn-generated components (the chart tooltip,
      buttons, badges) render in the brand palette instead of shadcn defaults.
- [ ] A component library on shadcn/ui (base-nova, `@base-ui/react`) + CVA +
      tailwind-merge + lucide provides every primitive the screens use, each
      visually matched to the styleguide and built mobile-responsive:
      buttons, badges (status / priority / pipeline-stage covering **all**
      styleguide values), form controls (input, textarea, label, select,
      checkbox, switch, date input, priority toggle-group, with focus + error +
      helper states), and data-display / surfaces (avatar, table, pagination,
      breadcrumb, tabs/segmented control, dropdown-menu, stepper, progress bar,
      distribution bar, stat-card shell, alert/callout).
- [ ] Existing primitives (`components/ui/{badge,button,card,input,label,table,textarea}.tsx`)
      and the candidate badges (`components/candidates/{stage,status,priority,follow-up}-badge.tsx`)
      are aligned to the styleguide **in place** — not duplicated. The badge value
      sets already match the enums (status renders all six values incl.
      `talent_pool` / `withdrawn`; priority is `a/b/c/d`), so the work is **colour
      alignment** plus rendering the **null-priority "Nicht triagiert"** neutral
      (untriaged is the nullable `priority` column, not an enum value).
- [ ] A dev-only `/styleguide` gallery route renders the full library so it can
      be diffed against the Paper styleguide; it is excluded from the product
      navigation and exposes no candidate data.
- [ ] No route under `app/(app)/*` or the login changes behavior; the diff
      touches only tokens, `components/**`, and the gallery route.
- [ ] Verify (`eslint` + `tsc --noEmit`) and Build pass; no `any`; every brand
      variant is token-driven with no hardcoded hex (principle 8).

## Scope

### In scope

- **Token foundation.** Reconcile and complete `globals.css` against the Paper
  styleguide. The colour tokens already match the styleguide (`--color-primary
  #12464b`, `--color-cta #ea580c`, …); this phase confirms them, fills any gap
  the styleguide needs (the six type-scale steps as usable utilities/tokens, the
  semantic badge colours), and **defines the shadcn base-token aliases**
  (`--background`, `--foreground`, `--muted` / `--muted-foreground`, `--border`,
  `--input`, `--ring`, `--primary-foreground`, `--secondary-foreground`,
  `--accent`) plus the `--chart-*` palette — which the existing `button` / `badge`
  primitives and the shipped Phase-6 `chart.tsx` already reference but
  `globals.css` does not define — mapped onto the styleguide tokens, so the chart
  tooltip and any shadcn-generated component render in the brand palette rather
  than shadcn's defaults. It then **re-labels provenance**: update the
  constitution's *Styling* row and the *Tech debt* table (drop "vendored/copied
  from `mag`" → "talentacquisition's own, derived from the Paper styleguide") and
  the matching `docs/architecture.md` component-map line.
- **Component library**, each matched to the styleguide, responsive:
  - **Actions** — `button` (align the existing 8 CVA variants to the styleguide's
    Primary / CTA / Secondary / Outline / Ghost / Destructive / Link / Disabled,
    with leading-icon support); `icon-button` size for kebab / bell.
  - **Badges** — align `ui/badge` + the candidate badge wrappers (`stage`,
    `status`, `priority`, `follow-up`) to the styleguide **colours**; the value
    sets already match the enums, so the only additive case is the
    **null-priority "Nicht triagiert"** neutral; add a small reusable count badge
    (nav / "Alle anzeigen" markers).
  - **Form controls** — `input` (+ leading-icon slot for email / search),
    `textarea`, `label` (+ required asterisk), and the new `select`, `checkbox`,
    `switch`, a styled `date` input (calendar affordance), and a `priority`
    toggle-group (A/B/C/D + Keine); the shared focus ring (secondary) and the
    error state + helper/error text (e.g. Absagegrund-required) from the styleguide.
  - **Data display & surfaces** — align `card` (incl. the icon+title+subtitle
    section header used by form sections and dashboard cards) and `table`
    (header, selectable rows, avatar cell, hover, overdue date cell); new
    `avatar` (initials), `pagination`, `breadcrumb`, `tabs`/segmented control
    (Liste/Board; mobile stage selector), `dropdown-menu` (row kebab), `stepper`
    (7-stage pipeline tracker), `progress` bar (retention countdown), a
    `distribution-bar` list row (dashboard "Nach Quelle/Prioritaet/Status"), a
    presentational `stat-card` shell (icon, label, figure, delta), and an
    `alert`/callout (login info box, inline "Feedback ausstehend" note).
- **Gallery route** — a dev-only `/styleguide` page mirroring the Paper
  Styleguide artboard (colours, type scale, every component in its variants /
  states), used as the visual-diff surface and the QA-gate evidence. It lives
  outside the `(app)` route group (e.g. `app/styleguide/`), reads no Supabase /
  candidate data, is not linked from the app nav, and — pending the open decision
  below — may be guarded to non-production.
- **Responsiveness** — components that adapt between the desktop and mobile
  screens (table → stacked card row, segmented controls, touch target sizes) ship
  with both behaviours; the breakpoints follow the Paper screens (≈ 390 mobile,
  ≈ 1440 desktop).

### Out of scope

- **Any product page / route or behaviour change** — building the login, app
  shell, candidate list/detail/form, board, dashboard, and Wiedervorlage pages
  from these components is **Phase 10**. This phase only changes
  `components/**`, tokens, and the gallery route.
- **The app shell and navigation composition** — the desktop sidebar and mobile
  bottom-tab bar wired to real routing, active state, and the auth user are
  **Phase 10**; Phase 9 provides only the generic primitives they consume (count
  badge, avatar, icon-button, nav-item visual style).
- **Chart components** — the "Bewerbungen pro Monat" bar chart (recharts via the
  shadcn chart) is owned by **Phase 6 — Dashboard KPIs** (issue #43); Phase 9
  ships only the non-chart `stat-card` shell.
- **Retention review actions** — the dashboard "Löschprüfung fällig" surface and
  its Verlängern / Behalten / Anonymisieren actions are **Phase 7**; Phase 9
  ships only the presentational pieces (progress bar, alert, buttons) it reuses.
- **Data access, server actions, migrations, KPI views** — no `src/lib/db`,
  `supabase/migrations`, or server-action work; this is a presentational layer.
- **Dark mode** — the styleguide is light-mode only; no dark theme.
- **German label-copy reconciliation** — the styleguide words a few labels
  differently from the current `src/lib/candidates/labels.ts` (e.g. `active`
  shown as *In Bearbeitung* vs. *Aktiv*, `rejected` as *Abgesagt* vs.
  *Abgelehnt*). Those labels are shared copy rendered by the existing list / form
  pages, so reconciling them is page-facing and belongs to **Phase 10**; Phase 9
  matches badge **colour and shape**, not copy. The gallery shows the current
  labels.

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Stack is fixed by the constitution** — shadcn/ui (base-nova) on
  `@base-ui/react` + CVA + tailwind-merge + lucide-react, Tailwind v4. New
  primitives follow the same CVA + `data-slot` pattern as the existing
  `components/ui` files and the shadcn path aliases (`@/components/ui`, `@/lib`).
- **Extend, do not duplicate.** The Phase-1/3/4 primitives
  (`badge,button,card,input,label,table,textarea`, the candidate badges, the
  board card) already exist; align them to the styleguide rather than adding
  parallel components.
- **`globals.css` already carries the talentacquisition tokens** matching the
  styleguide — this phase confirms and completes them and re-labels their
  provenance; it does **not** re-vendor or restyle from scratch.
- **The Paper styleguide artboard is the visual source of truth.** During
  implementation, pull exact values via Paper MCP `get_jsx` / `get_computed_styles`
  / `get_fill_image` — never transcribe from screenshots (per the Paper MCP
  codebase-export guidance).
- **Responsive** to the two Paper breakpoints; the components are the only
  responsive unit here (full-page responsive composition is Phase 10).
- Principle 8 (tokens, no hardcoded hex); TypeScript `strict`, no `any`; German
  UI copy, English identifiers; no emojis. The gallery route exposes no candidate
  data, so it does not implicate RLS (principle 6).
- **Blocks Phase 10** — Phase 10's first issue depends on this milestone closing;
  this phase changes no product behaviour, so it can be implemented in parallel
  with the still-open functional milestones (Phases 5–8) without conflict.

## Human prerequisites

- [ ] The Paper file `talentacquisition` stays accessible via the Paper MCP for
      the implementing session(s) — the implementer reads exact token/component
      values from the styleguide artboard. No secret, account, or external
      provisioning is required; nothing is added to `.env.local`.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Phase 9 = component library + token confirmation + constitution re-label; **not** a token re-vendor | `globals.css` already matches the styleguide (the styleguide was built from it); re-doing tokens would be churn and risks regressing Phases 1/3/4 | 2026-06-12 |
| Align existing primitives + candidate badges **in place**; the badge value sets already match the enums, so the work is colour alignment + the null-priority "Nicht triagiert" rendering | "Extend, do not duplicate"; status already renders all six values and priority is `a/b/c/d` with untriaged = the nullable column (verified in `status-badge.tsx` / `priority-badge.tsx`) | 2026-06-12 |
| Define the shadcn base-token aliases + `--chart-*` palette mapped onto the styleguide tokens | The shipped Phase-6 `chart.tsx` and the `button` / `badge` primitives reference `--background` / `--foreground` / `--muted` / … and `--chart-*`, none defined in `globals.css`; the token-foundation phase is the right owner | 2026-06-12 |
| German label-copy reconciliation (e.g. `active` → "In Bearbeitung", `rejected` → "Abgesagt") deferred to Phase 10 | Those labels are shared copy rendered by existing pages; changing them is page-facing, outside this presentational phase | 2026-06-12 |
| Responsive (desktop + mobile) is in scope | The hand-off is final and includes 5 mobile screens; deferring responsive would force a rebuild in Phase 10 | 2026-06-12 |
| Boundaries: chart → Phase 6 (#43); app-shell/nav composition → Phase 10; retention actions → Phase 7 | Those milestones own the data/behaviour; Phase 9 supplies only the presentational primitives they reuse | 2026-06-12 |
| Pull exact values from Paper via `get_jsx`/`get_computed_styles`, not screenshots | Paper MCP export guidance; screenshots are for visual QA only | 2026-06-12 |
| Ship a dev-only `/styleguide` gallery route (`app/styleguide/`, outside `(app)`, no candidate data) as the visual-diff / QA surface | Stakeholder decision at the spec-acceptance gate; a verification surface to match components to the styleguide without touching product pages | 2026-06-12 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 9 — Design system & component library (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`).
- [ ] Every component in the inventory exists under `components/**`, renders in
      the `/styleguide` gallery, and visually matches the corresponding Paper
      styleguide group (colours, type, spacing, states) — checked at the human
      QA gate against the Paper artboard.
- [ ] Every badge renders in the styleguide's colours: status across all six
      enum values, priority A/B/C/D **plus the null-priority "Nicht triagiert"**
      neutral, pipeline-stage across all 7 stages.
- [ ] `globals.css` defines the shadcn base-token aliases (`--background`,
      `--foreground`, `--muted` / `--muted-foreground`, `--border`, `--input`,
      `--ring`, …) and the `--chart-*` palette; the shipped Phase-6 chart and its
      tooltip, and the `button` / `badge` primitives, render in the brand palette
      (verified in the gallery), not shadcn defaults.
- [ ] Form controls render their focus ring (secondary) and the error state with
      helper/error text (e.g. a required Absagegrund), all from tokens.
- [ ] Components render correctly at mobile (≈ 390) and desktop (≈ 1440) widths —
      the table collapses to the stacked card row, segmented controls and touch
      targets adapt.
- [ ] `git grep` finds no hardcoded hex colour in `components/**` (principle 8);
      no `any` in the diff.
- [ ] No route under `app/(app)/*` or the login is modified; the gallery route
      reads no candidate data.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Re-tokenising regresses already-shipped Phase 1/3/4 UI | Confirm/complete the existing tokens, don't replace them; Build + the gallery catch drift |
| Component library drifts from the final Paper design | Pull exact values via Paper MCP `get_jsx`/`get_computed_styles`; the `/styleguide` gallery is diffed against the artboard at the QA gate |
| Boundary bleed — building pages, the chart, the nav shell, or retention actions here | Scope "Out" names each owner (Phases 10 / 6 / 7); Phase 9 ships presentational primitives only |
| Mobile/desktop divergence missed because only desktop is built | Responsiveness is an explicit Outcome and Verification item, checked at both widths |
| The styleguide grows after `READY` | The hand-off is confirmed final (gate); a later design change is a new, scoped change, not a silent edit |

## Decision log

- 2026-06-12: Planning kickoff for Phase 9 (`/loopkit:plan Phase 9 & 10`). The
  Paper hand-off is confirmed final (styleguide + 7 desktop + 5 mobile screens).
  `globals.css` already carries the styleguide tokens, so Phase 9 is scoped to the
  component library + token confirmation + constitution re-label, with responsive
  in scope and the chart/nav/retention boundaries assigned to Phases 6/10/7. One
  open decision (ship a dev-only `/styleguide` gallery route) marked for the gate.
- 2026-06-12: Review gate (in-session agent) — two blocking corrections, both
  verified against the current `main` (@7030e82, Phases 5–6 partly implemented):
  (1) the badge value sets already match the enums — `status-badge.tsx` renders
  all six statuses incl. `talent_pool` / `withdrawn`, and `priority` is `a/b/c/d`
  with untriaged = the nullable column — so "completing" the sets was wrong;
  reframed to colour alignment + the null-priority "Nicht triagiert" rendering,
  with the styleguide's differing label copy (Aktiv → In Bearbeitung, Abgelehnt →
  Abgesagt) deferred to Phase 10. (2) The shipped Phase-6 `chart.tsx` and the
  `button` / `badge` primitives reference shadcn base tokens (`--background`,
  `--foreground`, `--muted` / `--muted-foreground`, `--border`, …) and `--chart-*`
  that `globals.css` does not define; defining those aliases onto the styleguide
  tokens was added to the token foundation. Gallery route location clarified
  (`app/styleguide/`, outside `(app)`).
- 2026-06-12: Spec-acceptance gate (AskUserQuestion) — open decision resolved:
  **ship the dev-only `/styleguide` gallery route** as the visual-diff / QA
  surface. Human prerequisites confirmed: none beyond Paper MCP access (in place).
  Spec accepted and flipped READY.
