-- Phase 7 (#55) migration 7b: schedule the daily retention scan via pg_cron.
--
-- Guarded by a pg_extension check so it is a clean no-op (not a hard failure)
-- when pg_cron is not yet enabled — the human prerequisite. Once the extension
-- is enabled on the project, re-running migrations (or this statement) registers
-- the job; cron.schedule upserts by job name, so it is idempotent.
--
-- The scan runs daily at 02:00 (server time, UTC on Supabase); the due-date
-- comparison inside scan_deletion_review() is evaluated in Europe/Berlin, so the
-- exact wall-clock hour of the run does not affect which candidates are due.

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'deletion-review-daily',
      '0 2 * * *',
      $cron$select public.scan_deletion_review();$cron$
    );
  end if;
end $$;
