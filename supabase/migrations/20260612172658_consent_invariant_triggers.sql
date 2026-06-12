-- Phase 7 (#53): enforce the talent-pool consent invariant in the database
-- (constitution principle 4) via two cross-table triggers. A candidate may hold
-- status = 'talent_pool' only while an accepted talent_pool_consent row exists,
-- and that consent cannot be un-accepted or deleted while the candidate is still
-- talent_pool. The invariant spans two tables, so a trigger pair rather than a
-- CHECK (mirroring the principle-1 rejection-reason CHECK pattern on one table).
--
-- No INSERT trigger on talent_pool_consent is needed: a candidate can only reach
-- talent_pool through trigger (a), which already requires an accepted row, and
-- the Phase 2 unique FK (candidate_id) forbids a second consent row. The
-- recruiter records consent before setting the status (consent insert precedes
-- the status update in the transaction; trigger (a)'s lookup sees only
-- already-executed statements).
--
-- Error messages are English technical text raised with errcode check_violation;
-- the Phase 7 consent UI / server action maps them to German copy.

-- Trigger (a): a candidate cannot become (or be inserted as) talent_pool unless
-- an accepted consent row already exists for it.
create function public.enforce_talent_pool_consent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'talent_pool'
     and not exists (
       select 1
       from public.talent_pool_consent
       where candidate_id = new.id
         and accepted = true
     ) then
    raise exception
      'candidate % cannot have status talent_pool without an accepted talent_pool_consent',
      new.id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger candidate_enforce_talent_pool_consent
  before insert or update of status on public.candidate
  for each row
  execute function public.enforce_talent_pool_consent();

-- Trigger (b): a consent row cannot be un-accepted or deleted while its
-- candidate is still talent_pool. On a candidate cascade delete the candidate
-- row is already gone when this BEFORE DELETE fires (the FK cascade is an AFTER
-- trigger on candidate), so the EXISTS check is false and the cascade proceeds.
create function public.guard_talent_pool_consent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- An update that keeps the row accepted never threatens the invariant.
  if tg_op = 'UPDATE' and new.accepted = true then
    return new;
  end if;

  -- DELETE, or an UPDATE leaving accepted = false: reject while talent_pool.
  if exists (
       select 1
       from public.candidate
       where id = old.candidate_id
         and status = 'talent_pool'
     ) then
    raise exception
      'cannot % consent for candidate % while it has status talent_pool',
      lower(tg_op), old.candidate_id
      using errcode = 'check_violation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger talent_pool_consent_guard
  before update of accepted or delete on public.talent_pool_consent
  for each row
  execute function public.guard_talent_pool_consent();
