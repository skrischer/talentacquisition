# Constitution

> Normative and binding. Every principle must be verifiable and specific.
> Keep to ~1 page; this file is permanently loaded via CLAUDE.md.

## Tech stack

All choices are inherited from the sibling project `mag` (shared client CI and
infrastructure) unless noted; the Supabase project and GitHub repo are already
provisioned.

| Area | Choice | Rationale |
| ---- | ------ | --------- |
| Framework | Next.js (App Router, RSC) + React 19 | Matches `mag`; Vercel-native rendering |
| Language | TypeScript, `strict: true` | Global rule; type safety, no `any` |
| Styling | Tailwind v4 + design tokens copied from `mag` `globals.css` | Reuse the client's existing CI verbatim |
| UI components | shadcn/ui (base-nova, on `@base-ui/react`) + CVA + tailwind-merge + lucide-react | Matches `mag` and the atomic-crm prior art |
| Forms | react-hook-form + zod | Matches `mag`; runtime validation at the edge |
| Backend / DB | Supabase (Postgres 17, eu-central-1): DB, Auth, RLS | Project `talentacquisition` already provisioned |
| Hosting | Vercel | Matches `mag`; Next.js-native |

Explicitly **not** included: `@structcms/*` — that is `mag`'s CMS and has no
role here.

## Architecture principles

Each is checkable in review or by a constraint.

1. Pipeline **stage** and candidate **status/priority** are separate columns;
   a rejection reason is required only when the status is a rejection
   (enforced by a DB check constraint), never folded into one enum.
2. Pipeline stages are a fixed enum in the MVP — no stage-configuration table.
3. Candidate documents (CV/PDF) are never stored in the database, repo, or app
   — only a text path/link to protected external storage.
4. Talent-pool consent is an explicit record (`accepted` + `answered_at`); no
   talent-pool retention exists without it.
5. Every candidate row carries a deletion/review date; retention runs as a
   scheduled job over that column, not ad hoc.
6. All candidate-data access goes through Supabase Row Level Security; the
   service-role key never appears in client-side code.
7. Dashboard KPIs are computed as SQL aggregates / Postgres views (`group by`
   an enum column, or `date_trunc('month', …)`) — never per-bucket client
   round-trips.
8. UI reads design tokens (CSS custom properties from `globals.css`); no
   hardcoded hex colors in components.

## Conventions

- TypeScript `strict`; `any` is forbidden (use `unknown`, explicit types, or
  generics). No `as unknown as X`, no `@ts-ignore` / `@ts-expect-error`
  without a justifying TODO comment.
- Code, comments, identifiers, and commit messages in English; UI copy in
  German.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- No emojis in code or UI.
- Follow the shadcn path aliases: `@/components`, `@/components/ui`, `@/lib`.

## Quality gates

- `npm run build` passes (no type errors).
- `npm run lint` passes (eslint-config-next).
- No `any` in committed code.

## Don'ts

- No candidate documents (PDFs) in the database or repo.
- Never disable RLS on candidate tables; never ship the service-role key to the
  client.
- No new dependency without justification (prefer native APIs and the existing
  stack).
- No `any`, no casting hacks, no `@ts-ignore` without a TODO.
- No emojis.
- No public/unauthenticated route that exposes candidate data — this is an
  internal tool.

## Tech debt (known couplings)

| Deviation | Where | Plan |
| --------- | ----- | ---- |
| Design tokens are vendored (copied) from `mag` | `globals.css` | Re-sync manually when the client CI changes; no shared package yet |
