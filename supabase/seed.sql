-- Seed data for development and QA. NOT applied to production automatically.
--
-- Apply on demand:
--   - local:  applied automatically by `supabase db reset`, or:
--             docker exec -i supabase_db_talentacquisition \
--               psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/seed.sql
--   - hosted: paste into the Supabase Studio SQL editor.
--
-- Idempotent: every seed row uses a fixed UUID under the prefix
-- 00000000-0000-4000-8000-..., and the script first deletes that prefix
-- (talent_pool_consent rows cascade). Real data is never touched.
--
-- All dates are RELATIVE to the run date so the follow-up buckets
-- (overdue / due today / due this week), the rolling 12-month KPI chart, and
-- the retention review dates stay meaningful whenever the seed runs.
--
-- Coverage: all 7 stages, all 6 statuses, priorities a-d plus untriaged
-- (null), all 10 rejection reasons across rejected rows, all consent states,
-- umlauts in names, email-only and phone-only contacts, every
-- application_source value, and at least one candidate in every monthly
-- bucket of the last 12 months.

begin;

delete from public.candidate
where id::text like '00000000-0000-4000-8000-%';

-- ---------------------------------------------------------------------------
-- Active pipeline (visible on the board: active / on_hold)
-- ---------------------------------------------------------------------------
insert into public.candidate
  (id, created_at, first_name, last_name, email, phone,
   application_source, nursing_qualification, foreign_qualification_recognition,
   mobility, stage, stage_order, status, priority,
   team_proposal, team_feedback_status, next_step, follow_up_date,
   documents_path, notes)
values
  ('00000000-0000-4000-8000-000000000001', now() - interval '8 days',
   'Anna', 'Krause', 'anna.krause@example.com', '+49 151 5550101',
   'partner_referral', 'examined_nurse', 'not_applicable',
   'own_car', 'interview', 0, 'active', 'a',
   null, 'not_requested', 'Telefoninterview vereinbaren', current_date - 2,
   '\\srv-pflege\bewerbungen\krause-anna',
   'Sehr motiviert, 6 Jahre Berufserfahrung in der ambulanten Pflege. Wünscht Frühdienst, ab 01.08. verfügbar.'),
  ('00000000-0000-4000-8000-000000000002', now() - interval '12 days',
   'Mehmet', 'Yilmaz', 'm.yilmaz@example.com', '+49 151 5550102',
   'job_portal', 'examined_nurse', 'pending',
   'license_no_car', 'phone_screen', 0, 'active', 'a',
   null, 'not_requested', 'Anerkennungsunterlagen nachfragen', current_date - 1,
   '\\srv-pflege\bewerbungen\yilmaz-mehmet', null),
  ('00000000-0000-4000-8000-000000000003', now() - interval '20 days',
   'Petra', 'Wolf', 'petra.wolf@example.com', null,
   'email', 'nursing_assistant', 'not_applicable',
   'own_car', 'screening', 0, 'on_hold', 'b',
   'Pflegeteam Nord', 'pending', 'Rückmeldung der Teamleitung abwarten', current_date,
   null, null),
  ('00000000-0000-4000-8000-000000000004', now() - interval '30 days',
   'Jonas', 'Berg', 'jonas.berg@example.com', '+49 151 5550104',
   'walk_in', 'care_assistant_unqualified', 'not_applicable',
   'no_license', 'trial_day', 0, 'active', 'b',
   null, 'not_requested', 'Hospitationstermin abstimmen', current_date,
   null, 'Persönlich vorbeigekommen, sympathischer Eindruck.'),
  ('00000000-0000-4000-8000-000000000005', now() - interval '45 days',
   'Sofia', 'Rossi', 'sofia.rossi@example.com', '+49 151 5550105',
   'website', 'nursing_aide_1yr', 'fully_recognized',
   'own_car', 'offer', 0, 'active', 'a',
   'Pflegeteam Süd', 'positive', 'Vertragsangebot nachfassen', current_date + 2,
   '\\srv-pflege\bewerbungen\rossi-sofia', null),
  ('00000000-0000-4000-8000-000000000006', now() - interval '1 day',
   'Thomas', 'Klein', 't.klein@example.com', '+49 151 5550106',
   'agency', 'none', 'not_applicable',
   'unknown', 'new', 0, 'active', null,
   null, 'not_requested', 'Erstsichtung der Unterlagen', current_date,
   null, null),
  ('00000000-0000-4000-8000-000000000007', now() - interval '3 days',
   'Markus', 'Lind', 'markus.lind@example.com', null,
   'email', 'nursing_aide_1yr', 'not_applicable',
   'license_no_car', 'new', 1, 'active', 'c',
   null, 'not_requested', 'Erstsichtung der Unterlagen', current_date + 4,
   null, null),
  ('00000000-0000-4000-8000-000000000008', now() - interval '6 days',
   'Ahmet', 'Demir', null, '+49 151 5550108',
   'phone', 'nursing_assistant', 'not_started',
   'no_license', 'screening', 1, 'active', 'b',
   null, 'not_requested', 'Rückruf vereinbaren', current_date + 5,
   null, 'Telefonisch beworben — Unterlagen folgen per Post.'),
  ('00000000-0000-4000-8000-000000000009', now() - interval '15 days',
   'Carla', 'Reuter', 'carla.reuter@example.com', '+49 151 5550109',
   'employee_referral', 'nursing_aide_1yr', 'not_applicable',
   'own_car', 'interview', 1, 'active', 'b',
   null, 'not_requested', 'Gesprächstermin bestätigen', current_date + 3,
   null, null),
  ('00000000-0000-4000-8000-000000000010', now() - interval '40 days',
   'Yusuf', 'Kaya', 'yusuf.kaya@example.com', '+49 151 5550110',
   'partner_referral', 'examined_nurse', 'partially_recognized',
   'own_car', 'trial_day', 1, 'active', 'a',
   'Pflegeteam Süd', 'pending', 'Hospitationsfeedback einholen', current_date + 6,
   '\\srv-pflege\bewerbungen\kaya-yusuf', null),
  ('00000000-0000-4000-8000-000000000011', now() - interval '2 days',
   'Sandra', 'Fuchs', 'sandra.fuchs@example.com', '+49 151 5550111',
   'website', 'care_assistant_unqualified', 'not_applicable',
   'no_license', 'new', 2, 'active', null,
   null, 'not_requested', 'Telefonische Vorprüfung', current_date + 1,
   null, null),
  ('00000000-0000-4000-8000-000000000012', now() - interval '18 days',
   'Olaf', 'Decker', 'olaf.decker@example.com', null,
   'other', 'none', 'not_applicable',
   'unknown', 'phone_screen', 1, 'active', 'c',
   null, 'not_requested', 'Zweitsichtung der Unterlagen', current_date - 3,
   null, null),
  ('00000000-0000-4000-8000-000000000013', now() - interval '9 days',
   'Elena', 'Petrova', 'elena.petrova@example.com', '+49 151 5550113',
   'agency', 'examined_nurse', 'pending',
   'license_no_car', 'screening', 2, 'active', 'a',
   null, 'not_requested', 'Sprachzertifikat anfragen', current_date + 7,
   null, 'B2-Zertifikat angekündigt, Anerkennung läuft.'),
  ('00000000-0000-4000-8000-000000000014', now() - interval '50 days',
   'Frank', 'Weber', 'frank.weber@example.com', '+49 151 5550114',
   'email', 'nursing_assistant', 'not_applicable',
   'own_car', 'offer', 1, 'on_hold', 'b',
   'Pflegeteam Nord', 'more_info_needed', 'Gehaltsfrage mit Leitung klären', current_date + 1,
   null, null),
  ('00000000-0000-4000-8000-000000000015', now() - interval '22 days',
   'Julia', 'Hartmann', 'julia.hartmann@example.com', '+49 151 5550115',
   'website', 'examined_nurse', 'not_applicable',
   'own_car', 'interview', 2, 'active', 'a',
   null, 'not_requested', 'Zweitgespräch planen', current_date + 10,
   null, null),
  ('00000000-0000-4000-8000-000000000016', now() - interval '5 days',
   'Birgit', 'Köhler', 'birgit.koehler@example.com', null,
   'email', 'nursing_assistant', 'not_applicable',
   'own_car', 'screening', 3, 'active', 'c',
   null, 'not_requested', 'Unterlagen nachfordern', current_date + 2,
   null, null);

-- ---------------------------------------------------------------------------
-- Hired (status and stage 'hired'; spread over past months for the KPI chart)
-- ---------------------------------------------------------------------------
insert into public.candidate
  (id, created_at, first_name, last_name, email, phone,
   application_source, nursing_qualification, mobility,
   stage, stage_order, status, priority,
   team_proposal, team_feedback_status, deletion_review_date, notes)
values
  ('00000000-0000-4000-8000-000000000017', now() - interval '3 months',
   'Laura', 'Schmitt', 'laura.schmitt@example.com', '+49 151 5550117',
   'email', 'examined_nurse', 'own_car',
   'hired', 0, 'hired', 'a',
   'Pflegeteam Nord', 'positive', current_date + 365, 'Start zum Monatsersten.'),
  ('00000000-0000-4000-8000-000000000018', now() - interval '2 months',
   'Nina', 'Brandt', 'nina.brandt@example.com', '+49 151 5550118',
   'job_portal', 'nursing_assistant', 'own_car',
   'hired', 1, 'hired', 'b',
   'Pflegeteam Süd', 'positive', current_date + 365, null),
  ('00000000-0000-4000-8000-000000000019', now() - interval '4 months',
   'Stefan', 'Maier', 'stefan.maier@example.com', '+49 151 5550119',
   'partner_referral', 'examined_nurse', 'own_car',
   'hired', 2, 'hired', 'a',
   'Pflegeteam Nord', 'positive', current_date + 365, null),
  ('00000000-0000-4000-8000-000000000020', now() - interval '7 months',
   'Renate', 'Busch', 'renate.busch@example.com', null,
   'agency', 'nursing_aide_1yr', 'license_no_car',
   'hired', 3, 'hired', 'b',
   'Pflegeteam West', 'positive', current_date + 365, null),
  ('00000000-0000-4000-8000-000000000021', now() - interval '10 months',
   'Tobias', 'Krüger', 'tobias.krueger@example.com', '+49 151 5550121',
   'website', 'examined_nurse', 'own_car',
   'hired', 4, 'hired', 'a',
   'Pflegeteam Süd', 'positive', current_date + 365, null);

-- ---------------------------------------------------------------------------
-- Rejected (stage = where they exited; covers all 10 rejection reasons;
-- some deletion_review_date already due to exercise the retention queue)
-- ---------------------------------------------------------------------------
insert into public.candidate
  (id, created_at, first_name, last_name, email,
   application_source, nursing_qualification, foreign_qualification_recognition,
   stage, status, priority, rejection_reason, deletion_review_date)
values
  ('00000000-0000-4000-8000-000000000022', now() - interval '1 month',
   'Heike', 'Sommer', 'heike.sommer@example.com',
   'job_portal', 'nursing_assistant', 'not_applicable',
   'interview', 'rejected', 'b', 'no_show', current_date + 150),
  ('00000000-0000-4000-8000-000000000023', now() - interval '2 months',
   'Dirk', 'Lehmann', 'dirk.lehmann@example.com',
   'email', 'none', 'not_applicable',
   'new', 'rejected', 'c', 'no_reply', current_date + 120),
  ('00000000-0000-4000-8000-000000000024', now() - interval '2 months',
   'Katrin', 'Vogel', 'katrin.vogel@example.com',
   'partner_referral', 'examined_nurse', 'not_applicable',
   'offer', 'rejected', 'a', 'declined_by_candidate', current_date + 120),
  ('00000000-0000-4000-8000-000000000025', now() - interval '3 months',
   'Uwe', 'Brunner', 'uwe.brunner@example.com',
   'website', 'care_assistant_unqualified', 'not_applicable',
   'screening', 'rejected', 'c', 'position_filled', current_date + 90),
  ('00000000-0000-4000-8000-000000000026', now() - interval '4 months',
   'Olga', 'Smirnova', 'olga.smirnova@example.com',
   'agency', 'examined_nurse', 'pending',
   'phone_screen', 'rejected', 'c', 'language_issues', current_date + 60),
  ('00000000-0000-4000-8000-000000000027', now() - interval '5 months',
   'Ralf', 'Engel', 'ralf.engel@example.com',
   'job_portal', 'examined_nurse', 'not_applicable',
   'offer', 'rejected', 'b', 'salary_mismatch', current_date + 30),
  ('00000000-0000-4000-8000-000000000028', now() - interval '6 months',
   'Sabrina', 'Otto', 'sabrina.otto@example.com',
   'email', 'nursing_assistant', 'not_applicable',
   'new', 'rejected', 'd', 'duplicate', current_date - 3),
  ('00000000-0000-4000-8000-000000000029', now() - interval '7 months',
   'Max', 'Mustermann', 'max.mustermann@example.com',
   'other', null, 'not_applicable',
   'new', 'rejected', 'd', 'spam', current_date - 30),
  ('00000000-0000-4000-8000-000000000030', now() - interval '8 months',
   'Gerd', 'Albers', null,
   'phone', 'none', 'not_applicable',
   'screening', 'rejected', 'c', 'other', current_date + 14),
  ('00000000-0000-4000-8000-000000000031', now() - interval '9 months',
   'Tanja', 'Winkler', 'tanja.winkler@example.com',
   'email', 'nursing_aide_1yr', 'not_applicable',
   'phone_screen', 'rejected', 'b', 'unqualified', current_date - 14),
  ('00000000-0000-4000-8000-000000000032', now() - interval '11 months',
   'Holger', 'Franke', 'holger.franke@example.com',
   'employee_referral', 'nursing_assistant', 'not_applicable',
   'interview', 'rejected', 'b', 'position_filled', current_date - 60);

-- ---------------------------------------------------------------------------
-- Withdrawn
-- ---------------------------------------------------------------------------
insert into public.candidate
  (id, created_at, first_name, last_name, email,
   application_source, nursing_qualification, stage, status, priority,
   deletion_review_date, notes)
values
  ('00000000-0000-4000-8000-000000000033', now() - interval '1 month',
   'Doris', 'Hagen', 'doris.hagen@example.com',
   'website', 'nursing_assistant', 'screening', 'withdrawn', 'b',
   current_date + 150, 'Zurückgezogen — Stelle näher am Wohnort gefunden.'),
  ('00000000-0000-4000-8000-000000000034', now() - interval '3 months',
   'Peter', 'Jansen', 'peter.jansen@example.com',
   'job_portal', 'examined_nurse', 'interview', 'withdrawn', 'a',
   current_date + 90, null);

-- ---------------------------------------------------------------------------
-- Talent pool. Inserted as 'active' first, consent second, then flipped to
-- 'talent_pool' — keeps the seed valid once Phase 7 adds the
-- talent_pool => accepted-consent trigger.
-- ---------------------------------------------------------------------------
insert into public.candidate
  (id, created_at, first_name, last_name, email, phone,
   application_source, nursing_qualification, mobility, stage, status, priority,
   deletion_review_date, notes)
values
  ('00000000-0000-4000-8000-000000000035', now() - interval '5 months',
   'Greta', 'Albrecht', 'greta.albrecht@example.com', '+49 151 5550135',
   'email', 'examined_nurse', 'own_car', 'interview', 'active', 'b',
   current_date + 300, 'Aktuell in Elternzeit, ab Frühjahr wieder verfügbar.'),
  ('00000000-0000-4000-8000-000000000036', now() - interval '7 months',
   'Ivan', 'Horvat', 'ivan.horvat@example.com', '+49 151 5550136',
   'job_portal', 'nursing_assistant', 'license_no_car', 'trial_day', 'active', 'b',
   current_date + 210, null),
  ('00000000-0000-4000-8000-000000000037', now() - interval '10 months',
   'Miriam', 'Schulz', 'miriam.schulz@example.com', null,
   'employee_referral', 'nursing_aide_1yr', 'own_car', 'phone_screen', 'active', 'c',
   current_date - 5, null);

insert into public.talent_pool_consent
  (id, candidate_id, accepted, state, answered_at, proof_metadata)
values
  ('00000000-0000-4000-8000-000000000101',
   '00000000-0000-4000-8000-000000000035', true, 'answered',
   now() - interval '4 months',
   '{"channel": "email", "note": "Zustimmung per E-Mail bestätigt"}'::jsonb),
  ('00000000-0000-4000-8000-000000000102',
   '00000000-0000-4000-8000-000000000036', true, 'answered',
   now() - interval '6 months', null),
  ('00000000-0000-4000-8000-000000000103',
   '00000000-0000-4000-8000-000000000037', true, 'answered',
   now() - interval '9 months', null);

update public.candidate
set status = 'talent_pool'
where id in ('00000000-0000-4000-8000-000000000035',
             '00000000-0000-4000-8000-000000000036',
             '00000000-0000-4000-8000-000000000037');

-- Consent lifecycle coverage on non-talent-pool candidates: one draft, one sent.
insert into public.talent_pool_consent
  (id, candidate_id, accepted, state)
values
  ('00000000-0000-4000-8000-000000000104',
   '00000000-0000-4000-8000-000000000005', false, 'draft'),
  ('00000000-0000-4000-8000-000000000105',
   '00000000-0000-4000-8000-000000000010', false, 'sent');

commit;
