# Spec: Anmeldung mit Zugangsdaten (Password authentication)

> Status: DRAFT
> Created: 2026-06-13

Replace the magic-link / OTP sign-in with email + password
(`signInWithPassword`), add self-service password reset and an in-app
change-password page; accounts stay admin-provisioned. (Phase 11.)

## Outcome

What is true when this work is done?

- [ ] A user signs in at `/login` with email + password; no magic-link UI
      remains anywhere.
- [ ] A user who forgot their password requests a reset by email and sets a new
      one via the recovery link.
- [ ] A signed-in user can change their password in the app (`/account`).
- [ ] Accounts are provisioned by the central administration in the Supabase
      dashboard (initial password); there is no public signup and no in-app
      user management.
- [ ] Every auth screen matches its Paper artboard at desktop and mobile.
- [ ] Verify and Build are green; the constitution's auth/RLS rules hold (no
      service-role key in client code).

## Scope

### In scope

- **Login:** email + password via `signInWithPassword`; remove the magic-link
  send from the UI; a "Passwort vergessen?" link; copy updates.
- **Forgot password:** a public route that calls `resetPasswordForEmail` with a
  redirect to the set-new-password page; a neutral success message.
- **Set new password (recovery):** a page reached after `/auth/confirm` verifies
  a `recovery` token; sets the password via `updateUser`; the Supabase recovery
  email template's redirect targets it.
- **Change password (in-app):** an authenticated `/account` page that updates
  the password via `updateUser`, linked from the app shell.
- **Middleware:** the forgot/reset routes follow the existing public/auth rules;
  `/auth/confirm` continues to handle `recovery`.

### Out of scope

- Public self-service signup (constitution: internal tool, no public funnel).
- In-app user management / admin UI for creating accounts — provisioning stays
  in the Supabase dashboard.
- Team-lead / partner login (vision: later).
- MFA, SSO, a password-strength meter beyond a minimum-length rule, and account
  lockout / rate-limiting (Supabase defaults apply).
- Email-address change flow.

## Constraints

- Supabase Auth with `@supabase/ssr`; candidate-data access stays RLS-scoped;
  the service-role key never reaches the client (constitution 6).
- TypeScript strict, no `any`; UI copy German, code English; no emojis; design
  tokens from `globals.css` (constitution 8).
- No DB migration — `auth.users` is Supabase-managed.
- Reuse the Phase-9 component library and the existing `/auth/confirm`
  token-hash verification (it already accepts `recovery`).

## Human prerequisites

- [ ] Supabase email/password provider enabled (Supabase default) — confirmed
      in the dashboard.
- [ ] Supabase "Reset password" email template points to
      `/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
      (custom SMTP via Brevo already configured).
- [ ] At least one account exists with a known email + password for QA
      (admin-set in the Supabase dashboard).

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Email + password (`signInWithPassword`) replaces magic-link as the only login method | Customer rejects the per-login email round-trip; wants real credentials | 2026-06-13 |
| Magic-link removed from the UI; `/auth/confirm` kept for `recovery` (and invite) | One clear login path; recovery still needs token-hash verification | 2026-06-13 |
| Accounts provisioned admin-side in the Supabase dashboard with an initial password | Tiny internal team; no public signup; matches the existing model | 2026-06-13 |
| Self-service password reset via Supabase recovery email | Standard, rare (only on forget), no third-party dependency | 2026-06-13 |
| In-app `/account` change-password page | Lets users rotate the admin-set initial password | 2026-06-13 |
| Minimum password length 8 | Matches the Paper helper text; above Supabase's default of 6 | 2026-06-13 |
| Route slugs in English: `/forgot-password`, `/reset-password`, `/account` | Consistent with `/login`, `/auth/confirm`; UI copy stays German | 2026-06-13 |
| `/reset-password` and `/account` are authenticated routes (recovery establishes a session) | After `verifyOtp(recovery)` the user has a session; no separate public surface needed | 2026-06-13 |

## Design reference

The UI design source of truth is the Paper file **talentacquisition**:
https://app.paper.design/file/01KTY1HN0R547CC6T3XAZHJ2H7/1-0 — implementation
extracts exact values via Paper MCP (`get_jsx` / `get_computed_styles`), never
from screenshots.

- **Login:** artboards "Login (Desktop)" + "Login (Mobile)" (reworked to
  password).
- **Forgot password:** "Passwort vergessen (Desktop)" + "Passwort vergessen
  (Mobile)".
- **Set new password:** "Neues Passwort setzen (Desktop)" + "Neues Passwort
  setzen (Mobile)".
- **Change password (`/account`):** no dedicated artboard — composed from the
  Phase-9 primitives (card + labeled password inputs + primary button) inside
  the app shell.

## Tracking

The decomposition into steps lives as GitHub issues, not in this file — one
issue per step, grouped under the milestone. This spec owns the design; the
issues own progress.

- Milestone: Phase 11 — Anmeldung mit Zugangsdaten (created once this spec is
  `READY`)
- Issues: created from this spec once `READY` (one per implementable step)

## Verification

While the project's Test command is `none yet`, every behavioral item below is
checked by the human at the milestone QA gate against the `qa/milestone-<n>`
Vercel preview.

- [ ] `npm run verify` and `npm run build` pass.
- [ ] Valid email + password signs in and lands in the app; invalid credentials
      show a German error; no magic-link UI is present.
- [ ] "Passwort vergessen?" → submitting a known address sends a recovery email;
      the response is neutral (no account enumeration).
- [ ] The recovery link lands on the set-new-password page; setting a valid new
      password (≥ 8 chars, matching confirmation) signs the user in.
- [ ] `/account` lets a signed-in user change their password; the new password
      works on the next sign-in.
- [ ] Unauthenticated access to protected routes still redirects to `/login`;
      `/account` and `/reset-password` require a session.
- [ ] Each auth screen matches its Paper artboard at ≈ 1440 and ≈ 390.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Recovery email template not updated → the reset link 404s | Listed as a human prerequisite; QA verifies the full reset flow end-to-end |
| Account enumeration via reset / login responses | Neutral success copy on forgot-password; a generic error on failed login |
| Set-password page reachable without a recovery session | It is a normal authenticated page — without a session, middleware redirects to `/login` |
| Magic-link entry points left behind | Acceptance explicitly checks that no magic-link UI remains |

## Decision log

- 2026-06-13: All design decisions were resolved with the user before drafting
  (captured in Prior decisions); no genuinely-open decision remained at the
  spec-acceptance gate.
