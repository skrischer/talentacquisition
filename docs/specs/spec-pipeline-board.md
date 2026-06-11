# Spec: Pipeline Board (Phase 4)

> Status: READY
> Created: 2026-06-11

A Kanban board grouping the live-pipeline candidates by `stage`, where dragging a
card to another column (or reordering within one) persists the new `stage` and
within-column `stage_order` in a single move through the RLS-scoped server
client — the atomic-crm deals pattern over the Phase 2 columns and the Phase 3
candidate / data-access layer.

## Outcome

- [ ] An authenticated recruiter sees a board at `app/(app)/board` with one
      column per `pipeline_stage` (the 7 Phase 2 stages, German labels, in
      pipeline order); each column holds the live-pipeline candidates at that
      stage as cards, ordered by `stage_order`.
- [ ] Each card reuses the Phase 3 candidate presentation (name + priority/status
      badges) and links to the candidate detail view; an empty column shows an
      empty state.
- [ ] Dragging a card to another column sets the candidate's `stage`; dragging
      within a column reorders it; both persist `stage` + `stage_order` through a
      server action on the RLS-scoped server client (principle 6) — no
      service-role client, no client-side write path.
- [ ] The move updates optimistically (React 19 `useOptimistic`) and rolls back
      if the server action fails.
- [ ] The board writes only `stage` + `stage_order`; it never changes `status`,
      `priority`, or any other field (stage/status orthogonality, principle 1).
- [ ] The board shows candidates with `status` in {`active`, `on_hold`, `hired`};
      rejected / withdrawn / talent_pool do not appear — it reflects the live
      pipeline plus the terminal hired column.
- [ ] `npm run lint` and `npm run build` pass (no `any`); stage labels come from
      the Phase 3 shared label map (no hardcoded German copy, principle 8).

## Scope

### In scope

- **Board read query** — a board-specific query in `src/lib/db/candidates.ts`
  returning candidates with `status` in {`active`, `on_hold`, `hired`} ordered by
  `stage`, `stage_order` asc, grouped into the 7 columns. Reuses the Phase 2
  generated types and the Phase 1 RLS-scoped **server** client. A card's column is
  its `stage` regardless of `status`, so a
  `status = 'hired'` candidate still at `stage = 'interview'` shows in Interview —
  expected, since stage and status are orthogonal (principle 1).
- **Board page + nav** — `app/(app)/board/page.tsx` (server component, loads the
  grouped data) and a board nav entry in the Phase 1 app shell.
- **Column + card components** — `components/board/` (BoardColumn, CandidateCard)
  reusing the Phase 3 stage/status/priority badges and the candidate detail link;
  a per-column empty state.
- **Drag-and-drop interaction** — a client board component: cross-column drag
  (changes `stage`) and within-column reorder (changes `stage_order`), with an
  optimistic update. The optimistic state is the same
  `Record<PipelineStage, Candidate[]>` grouped-column map as the server-loaded
  data (no separate ad-hoc shape — keeps it typed, no `any`).
- **Move persistence** — a server action that, for a dropped card, sets its
  `stage` + `stage_order` and reindexes the destination column to a contiguous
  `0..n` sequence, then revalidates the board route. RLS-scoped server client.
- **App-level stage config** — a single `src/lib/candidates/stages.ts` module
  (alongside the Phase 3 label map in `src/lib/candidates`) owning the ordered
  stage list + the `TERMINAL_STAGES = ['hired']` constant (Phase 2 design) as the
  board's column source, app-level not DB (principle 2). It is the one home for
  this constant — components import it, never redefine it.

### Out of scope

- Candidate create/edit/detail UI — **Phase 3** (the board links to it and reuses
  its components, but adds no form).
- Editing `status`, `priority`, rejection reason, or any non-stage field from the
  board — done in the Phase 3 form.
- Overdue follow-up surfacing on cards — **Phase 5** (the board shows stage, not
  Wiedervorlage state).
- KPI / throughput metrics over the board — **Phase 6**.
- Stage-configuration UI / user-editable stages — fixed enum (principle 2).
- Multi-select / bulk drag, swimlanes, WIP limits, column collapse.

### Move and ordering model

- Each card's within-column position is its `stage_order` (Phase 2 `integer not
  null default 0`). Each column renders ordered by `stage_order` asc, then
  `created_at` as a stable tiebreak.
- On drop, the move server action sets the moved card's `stage` (= target column)
  and `stage_order` (= target index), then renumbers **both** affected columns —
  the destination and (for a cross-column move) the source — to a contiguous
  `0..n` sequence, so no column is left with a gap. A within-column reorder
  renumbers that one column.
- The reindex is **not** wrapped in a DB transaction in the MVP: even a partial
  failure leaves only relative order intact (every column is rendered by
  `stage_order` asc), never a wrong order, and the optimistic UI rolls back on a
  rejected move. A transactional Postgres RPC is the post-MVP hardening if
  contention appears (see Risks).
- One drag = one persisted move (`stage` + `stage_order` together), per the
  roadmap's "persists the stage and within-column order in one update".

## Constraints

Reference `docs/constitution.md` rather than restating it.

- **Depends on Phase 1, 2, and 3.** Phase 2 (`spec-data-model.md`, milestone #2)
  supplies `stage` (`pipeline_stage`) + `stage_order` — the column the data-model
  spec reserved for "Phase 4 board ordering". Phase 3 (`spec-candidate-management.md`,
  milestone #3) supplies the candidate data-access layer (`src/lib/db/candidates.ts`),
  the shared enum-label map (`src/lib/candidates`), and the stage/status/priority
  badge components. Phase 1 supplies the `(app)` shell and the RLS-scoped server
  client. The design is independent and is specced now; **implementation waits
  until Phase 3 lands** (and Phases 1–2 under it).
- Reads are React Server Components; the move is a **server action** on the
  RLS-scoped server client (principle 6, architecture boundaries) — the drag UI
  is a client component but never holds a privileged key.
- The board writes **only** `stage` + `stage_order` (principle 1: stage is
  orthogonal to status/priority; the board never mutates them).
- Stage columns are the fixed `pipeline_stage` enum in pipeline order; terminal
  `hired` is flagged by the app-level `TERMINAL_STAGES` constant, not a DB/status
  value (principle 2; prior-art §2, atomic-crm).
- Styling via design tokens (principle 8); shadcn/ui + lucide-react; German stage
  labels from the Phase 3 shared map; TypeScript `strict`, no `any`.
- **DnD mechanism:** `@atlaskit/pragmatic-drag-and-drop` (MIT) — the one new
  dependency this phase adds, approved at the review gate. Justification: it is
  exactly what the atomic-crm reuse reference uses (prior-art §2), is small and
  framework-agnostic, and gives clean within-column reorder + drop-indicator UX
  that native HTML5 DnD does not. No other new dependency is introduced.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Board groups by `stage`; cross-column drag sets `stage`, within-column drag sets `stage_order`; both persist in one move | Roadmap Phase 4 intent + prior-art §2 (atomic-crm: a record carries `stage` + a numeric order, a move persists both) | 2026-06-11 |
| Columns are the fixed `pipeline_stage` enum in pipeline order; `hired` is the terminal column via the app-level `TERMINAL_STAGES` constant | Principle 2 (fixed enum, no stage-config table); prior-art §2 (stages are app-level config, terminal flagged separately) | 2026-06-11 |
| The board writes only `stage` + `stage_order`, never `status` / `priority` | Principle 1 (stage orthogonal to status/priority); status changes stay in the Phase 3 form | 2026-06-11 |
| Reads as RSC, the move as a server action on the RLS-scoped server client | Principle 6 + architecture boundaries; no service-role / client write path | 2026-06-11 |
| Optimistic move via React 19 `useOptimistic`, rollback on server-action error | React 19 is in the stack (no new dep); standard board UX (atomic-crm updates optimistically) | 2026-06-11 |
| Both affected columns (source + destination) integer-reindexed on drop, no DB transaction in the MVP | Small single-team dataset; reindexing both columns keeps every column gap-free; even a partial non-transactional failure preserves relative order; a transactional RPC is post-MVP hardening | 2026-06-11 |
| Cards reuse the Phase 3 badge components + candidate detail link; no new card-level data | Reuse over rebuild (architecture "where new code goes"); the board is a view over the Phase 3 layer | 2026-06-11 |
| DnD via `@atlaskit/pragmatic-drag-and-drop` (the one new dependency, approved at the review gate) | atomic-crm reuse reference (prior-art §2); small, framework-agnostic, clean reorder / drop-indicator UX that native HTML5 DnD lacks | 2026-06-11 |
| Board row-scope: `status` in {`active`, `on_hold`, `hired`} visible; rejected / withdrawn / talent_pool hidden | Stakeholder decision at the review gate; shows the full live pipeline plus the terminal hired column (the `hired` stage column needs hired candidates to be meaningful) | 2026-06-11 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one issue
per step, grouped under the milestone. This spec owns the design; the issues own
progress.

- Milestone: Phase 4 — Pipeline board (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`).
- [ ] `/board` renders 7 stage columns in pipeline order with German labels; each
      live-pipeline candidate appears as a card in its stage column, ordered by
      `stage_order`; empty columns show an empty state.
- [ ] Dragging a card to another column persists the new `stage` (visible after
      reload and in the candidate detail view); dragging within a column persists
      the new `stage_order`.
- [ ] An optimistic move that the server action rejects rolls the card back to its
      origin.
- [ ] A rejected / withdrawn candidate does not appear on the board, and its
      `stage` is unchanged (the board never touched it).
- [ ] After a move, the candidate's `status` / `priority` are unchanged (only
      `stage` / `stage_order` were written).
- [ ] The move runs through the RLS-scoped server client; Phase 4 introduces no
      service-role client and no client-side Supabase write.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A new DnD dependency vs native HTML5 DnD ergonomics | Decision deferred to the review gate with justification; the native option keeps zero-dep, the library option matches the atomic-crm reuse reference |
| Non-transactional reindex partially fails | Both affected columns are renumbered on each move; a partial failure still leaves every column rendered by `stage_order` asc (relative order intact), and the optimistic UI rolls back on a rejected move. A transactional Postgres RPC is the post-MVP hardening if contention appears |
| Concurrent moves by two recruiters race on `stage_order` | Single-team, low-concurrency MVP; last-write-wins + reindex-on-load keeps columns well-ordered. Revisit with an RPC / locking if it bites |
| Implementation blocked because Phase 3 (or 1 / 2) is unmerged | Explicit sequencing: issues created now, worked only once Phase 3 lands |
| The terminal `hired` column accumulates hired candidates | MVP shows them (the success column); a "hide hired older than N days" filter is a post-MVP option, not built now |

## Decision log

- 2026-06-11: Planning kickoff for Phase 4 (`/plan 4`), after Phase 3 (candidate
  management) reached READY — the board builds on its candidate / data-access /
  badge layer. Most decisions are constraint-determined (principles 1 / 2 / 6,
  prior-art §2 atomic-crm).
- 2026-06-11: Review gate (code-reviewer agent) — VERDICT READY, no blocking
  findings. Addressed non-blocking findings: named `src/lib/candidates/stages.ts`
  as the sole home for the ordered stage list + `TERMINAL_STAGES`; made the
  reindex renumber **both** the source and destination columns (dropped the
  "self-heal" framing); pinned the optimistic state to the
  `Record<PipelineStage, Candidate[]>` map; noted that a card's column is its
  `stage` regardless of `status` (expected, orthogonality).
- 2026-06-11: Review gate (AskUserQuestion) — resolved both open decisions:
  (1) DnD via `@atlaskit/pragmatic-drag-and-drop` (new dependency approved,
  atomic-crm-aligned); (2) board row-scope = `status` in {`active`, `on_hold`,
  `hired`}. Spec flipped to READY.
