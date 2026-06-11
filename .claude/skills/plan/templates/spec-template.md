# Spec: [Feature/Phase Name]

> Status: DRAFT | READY
> Created: YYYY-MM-DD

One-sentence summary of what this spec delivers. The only status this spec
carries is `DRAFT` or `READY` — all progress (in progress, done, blocked) lives
in the GitHub issues and milestone. A completed spec is moved to
`docs/specs/archive/`.

## Outcome

What is true when this work is done? Write observable, verifiable outcomes — not
activities. These are the spec's done-criteria, not a progress tracker: check a
box only when the outcome holds end-to-end. Step-by-step progress lives in the
issues, never here.

- [ ] Outcome 1
- [ ] Outcome 2

## Scope

### In scope

- What this spec covers

### Out of scope

- What this spec explicitly does NOT cover (and why, if not obvious)

## Constraints

Technical constraints, existing decisions, and assumptions that affect
implementation. Reference the constitution rather than restating it.

- Constraint 1
- Constraint 2

## Prior decisions

Decisions already made that the implementor must respect. Include rationale so
edge cases can be judged. Mark any genuinely-open point explicitly until it is
resolved at the review gate.

| Decision | Rationale | Date |
|---|---|---|
| Example | Why | YYYY-MM-DD |
| OPEN — <question> | resolved at the review gate | — |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under a milestone. This spec owns the design; the issues
own progress. Do not duplicate the step list here.

- Milestone: [Phase/Feature name](<milestone-url>)
- Issues: created from this spec once it is `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

How does Claude Code (or the developer) know the entire spec is complete? Use
the project's lint/test/build commands from `docs/workflow.md`.

- [ ] Lint passes
- [ ] Test passes
- [ ] [Specific behavioral test]
- [ ] [Specific edge case handled]

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Risk 1 | How to handle it |

## Decision log

Decisions made during implementation. Claude Code adds entries here as work
progresses.

- YYYY-MM-DD: [Decision and rationale]
