-- Phase 2 (#12): the talent_pool_consent table (OCA privacy_consent shape).
--
-- This ships only the table; row population and the
-- status = 'talent_pool' => accepted-consent invariant are the Phase 7
-- consent workflow. At most one consent row per candidate (unique FK), and
-- updated_at is maintained by the shared set_updated_at() trigger (#9).

create table public.talent_pool_consent (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique
    references public.candidate (id) on delete cascade,
  accepted boolean not null default false,
  state consent_state not null default 'draft',
  answered_at timestamptz,
  proof_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger talent_pool_consent_set_updated_at
  before update on public.talent_pool_consent
  for each row
  execute function public.set_updated_at();
