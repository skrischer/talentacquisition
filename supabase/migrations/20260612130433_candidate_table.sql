-- Phase 2 (#11): the candidate table — the data-model spine.
--
-- stage, status, and priority are three separate columns (constitution
-- principle 1), never one folded enum. documents_path is a text link to
-- external storage only — no document bytes in the database (principle 3).
-- A biconditional CHECK ties rejection_reason to the rejected status, and a
-- BEFORE UPDATE trigger maintains updated_at via the shared set_updated_at()
-- function from the foundation migration (#9).

create table public.candidate (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  first_name text not null,
  last_name text not null,
  email text,
  phone text,

  application_source application_source not null,
  nursing_qualification nursing_qualification,
  foreign_qualification_recognition foreign_qualification_recognition
    not null default 'not_applicable',
  mobility mobility not null default 'unknown',

  stage pipeline_stage not null default 'new',
  stage_order integer not null default 0,
  status candidate_status not null default 'active',
  priority candidate_priority,
  rejection_reason rejection_reason,

  team_proposal text,
  team_feedback_status team_feedback_status not null default 'not_requested',

  next_step text,
  follow_up_date date,
  deletion_review_date date,

  documents_path text,
  notes text,

  -- A rejection reason exists exactly when, and only when, the candidate is
  -- rejected (principle 1).
  constraint candidate_rejection_reason_check
    check ((status = 'rejected') = (rejection_reason is not null))
);

create trigger candidate_set_updated_at
  before update on public.candidate
  for each row
  execute function public.set_updated_at();
