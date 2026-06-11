# talentacquisition

Internal applicant-management web app (MVP) for a small German ambulatory-care
organization, replacing an Excel-based mini-ATS. Single-team internal tool for
the central administration (recruiting).

## Always in context

The normative artifacts — read and obey them on every task:

- @docs/vision.md — what/why, scope, non-goals.
- @docs/constitution.md — binding rules: tech stack, principles, quality gates.

## On-demand references (do NOT load unless needed — token budget)

Descriptive, living documents. Open them only when the task calls for it:

- `docs/architecture.md` — component map, data model, flows, "where new code
  goes". Read before structural or schema work; update it when a change alters
  components, boundaries, or flows.
- `docs/prior-art.md` — reusable patterns indexed by concern, with verdicts.
  Read when designing a feature that maps to a known concern (pipeline board,
  follow-ups, retention, KPIs).
- `docs/roadmap.md` — the sequenced queue of phases and the current focus.
  Read when picking what to `/plan` next; `/plan` keeps the spec/milestone
  links current.
- `docs/workflow.md` — operational contract (repo, branches, commands, gates)
  for `/plan` and `/implement`. Read when planning or implementing a phase.

## Infrastructure

- GitHub: `skrischer/talentacquisition` (currently empty).
- Supabase: project `talentacquisition` (ref `nlhpxtrpddjnnqgxwqle`,
  eu-central-1, Postgres 17) — schema not yet created.
- Vercel: not yet provisioned; created on first deploy.
