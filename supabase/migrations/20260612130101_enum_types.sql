-- Phase 2 (#10): the 10 fixed Postgres enum types from the data-model spec.
--
-- Stored values are the English identifiers below; German UI labels live in the
-- app's enum label maps (Phase 3, #18), never in the database. Fixed enums per
-- constitution principle 2 (no stage/status configuration table); new values
-- are added later via `alter type ... add value` migrations.

-- Pipeline stage — fixed, ordered. Terminal stages are flagged by an app-level
-- constant (TERMINAL_STAGES = ['hired']), never inside an enum.
create type public.pipeline_stage as enum (
  'new',
  'screening',
  'phone_screen',
  'interview',
  'trial_day',
  'offer',
  'hired'
);

-- Candidate status — orthogonal to stage and priority (constitution principle 1).
create type public.candidate_status as enum (
  'active',
  'on_hold',
  'hired',
  'rejected',
  'talent_pool',
  'withdrawn'
);

-- Candidate priority — the org's A/B/C/D scheme, kept separate from status.
create type public.candidate_priority as enum (
  'a',
  'b',
  'c',
  'd'
);

-- Rejection reason — set exactly when status = 'rejected' (CHECK in #11).
create type public.rejection_reason as enum (
  'no_reply',
  'position_filled',
  'unqualified',
  'language_issues',
  'salary_mismatch',
  'declined_by_candidate',
  'no_show',
  'duplicate',
  'spam',
  'other'
);

-- Consent state — talent_pool_consent lifecycle (#12).
create type public.consent_state as enum (
  'draft',
  'sent',
  'answered'
);

-- Application source — how the application arrived.
create type public.application_source as enum (
  'email',
  'phone',
  'partner_referral',
  'employee_referral',
  'job_portal',
  'agency',
  'website',
  'walk_in',
  'other'
);

-- Nursing qualification — German ambulatory-care qualification levels.
create type public.nursing_qualification as enum (
  'examined_nurse',
  'nursing_assistant',
  'nursing_aide_1yr',
  'care_assistant_unqualified',
  'other',
  'none'
);

-- Foreign-qualification recognition status (Anerkennung).
create type public.foreign_qualification_recognition as enum (
  'not_applicable',
  'not_started',
  'pending',
  'partially_recognized',
  'fully_recognized',
  'rejected'
);

-- Mobility — driving licence / car availability.
create type public.mobility as enum (
  'own_car',
  'license_no_car',
  'no_license',
  'unknown'
);

-- Team feedback status — proposed team's response.
create type public.team_feedback_status as enum (
  'not_requested',
  'pending',
  'positive',
  'negative',
  'more_info_needed'
);
