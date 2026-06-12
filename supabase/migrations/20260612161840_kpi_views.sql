-- Phase 6 (#41): the five additive KPI views over the Phase 2 candidate spine.
--
-- Each KPI is one Postgres view computing a single SQL aggregate (constitution
-- principle 7 — never a per-bucket client round-trip). Every view is
-- security_invoker = on so it runs as the querying role and honours candidate
-- RLS (principle 6); SELECT is granted to authenticated and revoked from anon
-- and public in this same migration, so an unauthenticated query returns
-- nothing. Stored values are the English enum identifiers; German labels live
-- in the app (Phase 3 enum label maps), never in the database.
--
-- Month bucketing uses created_at AT TIME ZONE 'Europe/Berlin' (the org
-- timezone, consistent with the Phase 5 follow-up decision) so a late-evening
-- intake is counted in the correct local month, not the next UTC one.

-- Applications per month — rolling last 12 months (current month back 11),
-- bucketed in Europe/Berlin. The window filter lives in the view body so it is
-- evaluated against now() at query time; this is the one non-flat-aggregate view.
create view public.kpi_applications_per_month
with (security_invoker = on) as
  select
    date_trunc('month', created_at at time zone 'Europe/Berlin')::date as month,
    count(*) as count
  from public.candidate
  where date_trunc('month', created_at at time zone 'Europe/Berlin')
        >= date_trunc('month', now() at time zone 'Europe/Berlin') - interval '11 months'
  group by 1
  order by 1;

-- Applications by source — application_source is not null, so every row counts.
create view public.kpi_by_source
with (security_invoker = on) as
  select application_source, count(*) as count
  from public.candidate
  group by application_source
  order by application_source;

-- Applications by priority — includes the null (untriaged) bucket so the counts
-- reconcile to the candidate total (priority is nullable until triaged).
create view public.kpi_by_priority
with (security_invoker = on) as
  select priority, count(*) as count
  from public.candidate
  group by priority
  order by priority nulls last;

-- Applications by status.
create view public.kpi_by_status
with (security_invoker = on) as
  select status, count(*) as count
  from public.candidate
  group by status
  order by status;

-- Rejections by reason — only rejected rows carry a reason (Phase 2
-- biconditional CHECK); expressed directly on the reason column.
create view public.kpi_by_rejection_reason
with (security_invoker = on) as
  select rejection_reason, count(*) as count
  from public.candidate
  where rejection_reason is not null
  group by rejection_reason
  order by rejection_reason;

-- Expose the views to the internal (authenticated) role only and revoke the
-- Supabase default grants from anon/public — the migration-level guard that an
-- unauthenticated query can never read aggregates (principle 6).
grant select on
  public.kpi_applications_per_month,
  public.kpi_by_source,
  public.kpi_by_priority,
  public.kpi_by_status,
  public.kpi_by_rejection_reason
to authenticated;

revoke select on
  public.kpi_applications_per_month,
  public.kpi_by_source,
  public.kpi_by_priority,
  public.kpi_by_status,
  public.kpi_by_rejection_reason
from anon, public;
