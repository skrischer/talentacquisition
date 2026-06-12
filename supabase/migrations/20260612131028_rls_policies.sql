-- Phase 2 (#13): internal-only RLS on candidate and talent_pool_consent.
--
-- Phase 1 provisions internal users with no roles, so every authenticated user
-- is recruiting staff: RLS reduces to "authenticated may do everything, anon
-- nothing" — no per-role policy matrix (constitution principle 6). The
-- service-role (retention job) bypasses RLS and is a Phase 7 concern; no
-- service-role key or client is introduced here.

alter table public.candidate enable row level security;
alter table public.talent_pool_consent enable row level security;

-- Table privileges are the first gate; RLS policies filter rows only after a
-- role already holds the privilege. Granting authenticated explicitly (and anon
-- nothing) keeps the schema self-contained and reproducible on an empty
-- database, rather than depending on the platform's implicit default grants.
grant select, insert, update, delete on public.candidate to authenticated;
grant select, insert, update, delete on public.talent_pool_consent to authenticated;

create policy "candidate: authenticated full access"
  on public.candidate
  for all
  to authenticated
  using (true)
  with check (true);

create policy "talent_pool_consent: authenticated full access"
  on public.talent_pool_consent
  for all
  to authenticated
  using (true)
  with check (true);
