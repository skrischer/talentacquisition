-- Phase 2 (#9): migration-workflow foundation.
--
-- The data-model spine (enum types, candidate + talent_pool_consent tables,
-- RLS) is built by the follow-up migrations (#10-#13). This first migration
-- establishes only the shared infrastructure those tables depend on: a generic
-- updated_at trigger function, attached per-table in the table migrations.

-- Maintains the updated_at column on every row update. `create or replace`
-- keeps the migration replayable against an empty database.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
