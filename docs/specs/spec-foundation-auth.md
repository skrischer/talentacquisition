# Spec: Foundation & Auth (Phase 1)

> Status: DRAFT
> Created: 2026-06-11

Stand up the Next.js + Tailwind v4 + shadcn/ui + Supabase walking skeleton with a
passwordless (magic-link) internal login and an RLS-ready, authenticated app
shell that builds and deploys to Vercel.

## Outcome

- [ ] `npm run build` and `npm run lint` pass on a clean checkout (Next.js App
      Router + React 19, TypeScript `strict`, no `any`).
- [ ] Tailwind v4 is wired and `globals.css` design tokens are vendored from
      `mag`; shadcn/ui (base-nova) is initialized with the `cn` util and the
      path aliases from the constitution.
- [ ] Typed Supabase clients exist for both server and browser; the service-role
      key is never reachable from client code (absent from the client bundle).
- [ ] An unauthenticated request to any `(app)` route is redirected to `/login`;
      an authenticated internal user reaches the app shell.
- [ ] Login works via Supabase Auth magic-link; the session is cookie-based and
      refreshed in middleware, persisting across reloads.
- [ ] A sign-out action ends the session and returns to `/login`.
- [ ] The skeleton is deployed to Vercel with the required environment variables
      wired.

## Scope

### In scope

- Next.js scaffold (App Router, RSC), TypeScript `strict`, `eslint-config-next`.
- Tailwind v4 + `globals.css` tokens vendored verbatim from `mag`; shadcn/ui base
  plus only the primitives the login and shell need (button, input, label, card).
- `lib/supabase` typed clients — server and browser — built on `@supabase/ssr`.
- `middleware.ts` for Supabase session refresh and route protection of the
  `(app)` group.
- `(auth)/login` page (magic-link request + auth callback) and a sign-out action.
- A minimal authenticated app shell under `(app)`: a header with sign-out and an
  empty dashboard placeholder.
- `.env.example` and README run/deploy instructions.
- First Vercel deploy of the walking skeleton.

### Out of scope

- Candidate tables, enums, RLS policies on domain data, generated types —
  Phase 2 (Data model).
- Any candidate data, KPIs, pipeline board, or forms.
- User self-signup, team-lead/partner roles, multi-role authorization.
- Automated emails to candidates (the magic-link mail is Supabase Auth
  infrastructure, not candidate communication).

## Constraints

Reference `docs/constitution.md` rather than restating it.

- TypeScript `strict`; `any` is forbidden (Conventions).
- Internal-only: `/login` and its auth callback are the sole public routes; every
  `(app)` route requires a session. No public route exposes candidate data
  (Don'ts) — holds trivially now since no candidate data exists, but the guard is
  established here.
- The browser client uses the anon key only; the service-role key is server-only
  and must never enter a client bundle (principle 6).
- UI reads design tokens from `globals.css`; no hardcoded hex in components
  (principle 8).
- Path aliases `@/components`, `@/components/ui`, `@/lib` (Conventions).
- Code, identifiers, and commits in English; UI copy in German.
- Supabase project `talentacquisition` (ref `nlhpxtrpddjnnqgxwqle`) is
  provisioned; its schema stays empty this phase. Magic-link requires the
  Supabase Auth email provider (SMTP / templates / redirect URLs) configured in
  the dashboard.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Inherit framework / styling / UI / forms stack from `mag` verbatim | Shared client CI and infra; constitution tech-stack table | 2026-06-11 |
| Vendor `globals.css` tokens from `mag` (copy, not a shared package) | Constitution tech-debt table; no shared design package yet | 2026-06-11 |
| Add `@supabase/ssr` as a new dependency | Canonical cookie-based session pattern for App Router auth with RLS; `mag`'s `supabase-js`-only setup (service key, no per-user sessions) cannot do it. Justified per the dependency rule | 2026-06-11 |
| Login is passwordless magic-link; users are provisioned in the Supabase dashboard (no in-app signup) | Smallest-friction auth for a small internal recruiting team; no password management; matches "internal users only, no public funnel" | 2026-06-11 |
| Phase 1 includes a first Vercel deploy | The roadmap defines the phase as "the walking skeleton that builds and deploys" | 2026-06-11 |

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one issue
per step, grouped under the milestone. This spec owns the design; the issues own
progress.

- Milestone: Phase 1 — Foundation & Auth (created once this spec is `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

Each issue references this spec path in its body.

## Verification

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors, no `any`).
- [ ] Visiting an `(app)` route while signed out redirects to `/login`.
- [ ] Requesting a magic link and following it signs the user in and lands on the
      app shell.
- [ ] The session survives a full page reload (cookie refreshed by middleware).
- [ ] Sign-out clears the session and returns to `/login`.
- [ ] The service-role key does not appear in the client bundle (not referenced
      from any client component; verified against the build output).
- [ ] The deployed Vercel URL serves the login and, after auth, the shell.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `@supabase/ssr` version drift vs. `mag`'s `@supabase/supabase-js` | Pin `@supabase/ssr` to a release compatible with the installed `@supabase/supabase-js`; verify the build |
| Magic-link needs the Supabase Auth email provider (SMTP / templates / redirect URLs) configured | Configure the email provider and redirect URLs in the Supabase dashboard before the deploy; document the required setup in the README |
| Service-role key leaking into a client bundle | Keep the service-role client out of `lib/supabase/client.ts`; only the anon key is `NEXT_PUBLIC_*`; verify via the bundle check in Verification |
| Vercel env vars / auth redirect URL mismatch in production | Document the required env vars; set the Supabase Auth redirect URL to the Vercel domain |

## Decision log

- 2026-06-11: Login method resolved at planning kickoff (AskUserQuestion) —
  passwordless magic-link, dashboard-provisioned users.
