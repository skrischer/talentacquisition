-- Phase 7 (#55) migration 7a: the deletion-review queue + the scan function.
-- Safe to apply WITHOUT pg_cron (the schedule itself is migration 7b). The scan
-- runs in-database (principle 5) and ships no service-role key (principle 6) —
-- it is a SECURITY DEFINER function, not an external client.
--
-- The Odoo data_recycle review-queue pattern (prior-art §4): the job only flags
-- due candidates for recruiter review; it performs no destructive action.

-- One queue row per (candidate, review cycle). resolution is null while the row
-- is open; the Phase 7 resolve action (#56) sets it to one of the three values.
create table public.deletion_review (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate (id) on delete cascade,
  due_date date not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text
    check (resolution in ('extended', 'keep', 'removed'))
);

-- At most one OPEN (unresolved) row per candidate; a resolved row never blocks a
-- later re-queue when the candidate becomes due again. This partial unique index
-- is also the scan's ON CONFLICT target.
create unique index deletion_review_one_open_per_candidate
  on public.deletion_review (candidate_id)
  where resolved_at is null;

-- Internal-only access, mirroring the Phase 2 candidate/consent policy:
-- authenticated may read and resolve, anon nothing (principle 6).
alter table public.deletion_review enable row level security;

grant select, insert, update, delete on public.deletion_review to authenticated;

create policy "deletion_review: authenticated full access"
  on public.deletion_review
  for all
  to authenticated
  using (true)
  with check (true);

-- The scan: flag every candidate whose recruiter-set deletion_review_date is due
-- or overdue (Europe/Berlin, consistent with Phase 5/6) into the queue, skipping
-- those that already have an open row. SECURITY DEFINER so the scheduled job runs
-- as the owner and bypasses RLS by design — it is an internal write-only job that
-- touches only the non-PII join keys (candidate_id, due_date). search_path is
-- pinned empty; every reference is schema-qualified.
create function public.scan_deletion_review()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.deletion_review (candidate_id, due_date)
  select c.id, c.deletion_review_date
  from public.candidate c
  where c.deletion_review_date is not null
    and c.deletion_review_date <= (now() at time zone 'Europe/Berlin')::date
  on conflict (candidate_id) where resolved_at is null do nothing;
$$;

-- The scan is the scheduled job's entry point only; do not expose it to the Data
-- API roles.
revoke execute on function public.scan_deletion_review() from public;
