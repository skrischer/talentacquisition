# Spec: Foundation & Auth (Phase 1)

> Status: READY
> Created: 2026-06-11

Stand up the Next.js + Tailwind v4 + shadcn/ui + Supabase walking skeleton with a
passwordless (magic-link) internal login and an RLS-ready, authenticated app
shell that builds and deploys to Vercel.

## Outcome

- [ ] `npm run build` and `npm run lint` pass on a clean checkout (Next.js 16 App
      Router + React 19, TypeScript `strict`, no `any`), using the `src/` layout
      from `mag`.
- [ ] Tailwind v4 is wired and the `globals.css` design tokens are vendored from
      `mag` (without its `@structcms` `@source`/imports); shadcn/ui (base-nova) is
      initialized with the `cn` util and the constitution's path aliases.
- [ ] Typed Supabase clients exist for both server and browser, built on
      `@supabase/ssr`; the browser client uses the anon key only. No service-role
      key is introduced this phase, and no non-`NEXT_PUBLIC_` secret appears in
      the client bundle.
- [ ] An unauthenticated request to any `(app)` route is redirected to `/login`;
      any provisioned Supabase Auth user reaches the app shell.
- [ ] Login works via Supabase Auth magic-link (`signInWithOtp` →
      `GET /auth/confirm` token-hash exchange); the session is cookie-based and
      refreshed in middleware, persisting across reloads.
- [ ] A sign-out action (server action calling `supabase.auth.signOut()`) ends the
      session and returns to `/login`.
- [ ] The skeleton is deployed to Vercel with the required environment variables
      wired and the Supabase Auth redirect URL set to the Vercel domain.

## Scope

### In scope

- Next.js scaffold (App Router, RSC) in a `src/` layout matching `mag`,
  TypeScript `strict`, `eslint-config-next`.
- Tailwind v4 + `src/app/globals.css` tokens vendored from `mag` with the
  `@structcms` `@source`/imports stripped; shadcn/ui base plus only the primitives
  the login and shell need (button, input, label, card, and an inline alert for
  "check your email" / "link expired" feedback).
- `src/lib/supabase` typed clients — server and browser — built on
  `@supabase/ssr`.
- `src/middleware.ts` for Supabase session refresh and route protection of the
  `(app)` group.
- `src/app/(auth)/login` (magic-link request via `signInWithOtp`) and a
  `GET /auth/confirm` route handler that verifies the `token_hash` + `type` OTP and
  redirects to the app shell; a sign-out server action.
- A minimal authenticated app shell under `src/app/(app)`: a header with sign-out
  and an empty dashboard placeholder.
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
- The browser client uses the anon key only; principle 6 (the service-role key
  never reaches client code) is established structurally — this phase introduces
  no service-role client and no service-role env var at all.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, used by both the browser and the cookie-scoped
  server client. No `SUPABASE_SERVICE_ROLE_KEY` is added this phase; a later phase
  that needs it keeps it server-only.
- UI reads design tokens from `globals.css`; no hardcoded hex in components
  (principle 8).
- Path aliases `@/components`, `@/components/ui`, `@/lib` (Conventions), mapping
  `@/*` → `src/*` as in `mag`.
- Code, identifiers, and commits in English; UI copy in German.
- Supabase project `talentacquisition` (ref `nlhpxtrpddjnnqgxwqle`) is
  provisioned; its schema stays empty this phase. Magic-link requires the
  Supabase Auth email provider (SMTP / templates / redirect URLs) configured in
  the dashboard.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Inherit framework / styling / UI / forms stack from `mag` verbatim | Shared client CI and infra; constitution tech-stack table | 2026-06-11 |
| Use Next.js 16 and the `src/` layout, matching `mag` (`@/*` → `src/*`, `src/middleware.ts`) | Verbatim stack reuse; fixes `middleware.ts` placement so route protection works | 2026-06-11 |
| Vendor `globals.css` tokens from `mag` (copy, not a shared package), stripping its `@structcms` `@source`/imports | Constitution tech-debt table (no shared design package yet); `@structcms/*` is explicitly excluded | 2026-06-11 |
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
- [ ] After `npm run build`, grepping the client bundle under `.next/static` for
      any non-`NEXT_PUBLIC_` Supabase secret returns zero hits (guardrail for
      principle 6).
- [ ] The deployed Vercel URL serves the login and, after auth, the shell.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| `@supabase/ssr` incompatibility with this repo's installed `@supabase/supabase-js` | Pin `@supabase/ssr` to a release compatible with the `@supabase/supabase-js` version this repo installs; verify the build |
| Magic-link needs the Supabase Auth email provider (SMTP / templates / redirect URLs) configured | Configure the email provider and redirect URLs in the Supabase dashboard before the deploy; document the required setup in the README |
| Service-role key leaking into a client bundle | Keep the service-role client out of `lib/supabase/client.ts`; only the anon key is `NEXT_PUBLIC_*`; verify via the bundle check in Verification |
| Vercel env vars / auth redirect URL mismatch in production | Document the required env vars; set the Supabase Auth redirect URL to the Vercel domain |

## Decision log

- 2026-06-11: Login method resolved at planning kickoff (AskUserQuestion) —
  passwordless magic-link, dashboard-provisioned users.
- 2026-06-11: Review gate. Pinned the `src/` layout + Next.js 16 (anchors
  `src/middleware.ts`); qualified the token vendoring to strip `@structcms`;
  specified the `signInWithOtp` → `GET /auth/confirm` callback; named the env
  vars and dropped any service-role key from this phase; made the bundle check an
  executable `.next/static` grep.
- 2026-06-11: Scaffold (#3). Next.js 16 removed `next lint`, so the `lint` script
  runs `eslint .` directly; the ruleset stays `eslint-config-next` and the
  workflow command (`npm run lint`) is unchanged. `shadcn` resolved to 4.11.0
  under the `^4.0.5` range (build green).
- 2026-06-11: Supabase clients (#4). `@supabase/ssr@^0.12` + `@supabase/supabase-js@^2.108`
  (newer than `mag`'s 2.99; same `^2` line). Both factories export `createClient`
  (Supabase convention; disambiguated by import path). A placeholder `Database`
  type keeps the clients typed without `any` until Phase 2 regenerates it.
- 2026-06-12: Auth (#5). Magic-link end-to-end on `@supabase/ssr`: `(auth)/login`
  (`signInWithOtp`, `shouldCreateUser: false`), `GET /auth/confirm` (`verifyOtp`
  on a validated `EmailOtpType`, same-origin-only `next`), `src/middleware.ts`
  session refresh + public allowlist (`/login`, `/auth`), and a `signOut` server
  action. Next.js 16.2.9 deprecation-warns the `middleware.ts` file convention in
  favor of `proxy.ts`; kept `middleware.ts` to honor the pinned decision (build
  green, middleware registered) — a `proxy.ts` migration is deferred as a
  deliberate future chore, not folded into this phase.
