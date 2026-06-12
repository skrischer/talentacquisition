// German UI copy for the Phase 2 candidate enums, plus ready-made select
// option lists. This is the single home for the German labels (constitution:
// German UI, English stored identifiers) — reused by the table, detail view,
// badges, and form. Each label map is a Record over the generated enum union,
// so a missing identifier is a type error; option lists are derived from the
// generated Constants tuples, so they never drift from the database enums and
// no enum string is `as`-cast.

import { Constants, type Enums } from "@/lib/supabase/types";

export type EnumOption<T extends string> = { value: T; label: string };

function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): EnumOption<T>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

export const applicationSourceLabels: Record<
  Enums<"application_source">,
  string
> = {
  email: "E-Mail",
  phone: "Telefon",
  partner_referral: "Empfehlung (Gesellschafter)",
  employee_referral: "Mitarbeiterempfehlung",
  job_portal: "Jobportal",
  agency: "Personalvermittlung",
  website: "Webseite",
  walk_in: "Vor Ort",
  other: "Sonstiges",
};
export const applicationSourceOptions = toOptions(
  Constants.public.Enums.application_source,
  applicationSourceLabels,
);

export const nursingQualificationLabels: Record<
  Enums<"nursing_qualification">,
  string
> = {
  examined_nurse: "Examinierte Pflegefachkraft",
  nursing_assistant: "Pflegehelfer/in",
  nursing_aide_1yr: "Pflegehilfskraft (1-jährig)",
  care_assistant_unqualified: "Hilfskraft ohne Qualifikation",
  other: "Sonstige Qualifikation",
  none: "Keine",
};
export const nursingQualificationOptions = toOptions(
  Constants.public.Enums.nursing_qualification,
  nursingQualificationLabels,
);

export const foreignQualificationRecognitionLabels: Record<
  Enums<"foreign_qualification_recognition">,
  string
> = {
  not_applicable: "Nicht zutreffend",
  not_started: "Nicht begonnen",
  pending: "In Bearbeitung",
  partially_recognized: "Teilweise anerkannt",
  fully_recognized: "Vollständig anerkannt",
  rejected: "Abgelehnt",
};
export const foreignQualificationRecognitionOptions = toOptions(
  Constants.public.Enums.foreign_qualification_recognition,
  foreignQualificationRecognitionLabels,
);

export const mobilityLabels: Record<Enums<"mobility">, string> = {
  own_car: "Eigener PKW",
  license_no_car: "Führerschein, kein PKW",
  no_license: "Kein Führerschein",
  unknown: "Unbekannt",
};
export const mobilityOptions = toOptions(
  Constants.public.Enums.mobility,
  mobilityLabels,
);

export const pipelineStageLabels: Record<Enums<"pipeline_stage">, string> = {
  new: "Neu",
  screening: "Sichtung",
  phone_screen: "Telefonscreening",
  interview: "Vorstellungsgespräch",
  trial_day: "Probearbeitstag",
  offer: "Angebot",
  hired: "Eingestellt",
};
export const pipelineStageOptions = toOptions(
  Constants.public.Enums.pipeline_stage,
  pipelineStageLabels,
);

export const candidateStatusLabels: Record<
  Enums<"candidate_status">,
  string
> = {
  active: "Aktiv",
  on_hold: "Zurückgestellt",
  hired: "Eingestellt",
  rejected: "Abgelehnt",
  talent_pool: "Talentpool",
  withdrawn: "Zurückgezogen",
};
export const candidateStatusOptions = toOptions(
  Constants.public.Enums.candidate_status,
  candidateStatusLabels,
);

export const candidatePriorityLabels: Record<
  Enums<"candidate_priority">,
  string
> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
};
export const candidatePriorityOptions = toOptions(
  Constants.public.Enums.candidate_priority,
  candidatePriorityLabels,
);

export const rejectionReasonLabels: Record<
  Enums<"rejection_reason">,
  string
> = {
  no_reply: "Keine Rückmeldung",
  position_filled: "Stelle besetzt",
  unqualified: "Nicht qualifiziert",
  language_issues: "Sprachliche Hürden",
  salary_mismatch: "Gehaltsvorstellung",
  declined_by_candidate: "Absage durch Bewerber",
  no_show: "Nicht erschienen",
  duplicate: "Dublette",
  spam: "Spam",
  other: "Sonstiges",
};
export const rejectionReasonOptions = toOptions(
  Constants.public.Enums.rejection_reason,
  rejectionReasonLabels,
);

export const teamFeedbackStatusLabels: Record<
  Enums<"team_feedback_status">,
  string
> = {
  not_requested: "Nicht angefragt",
  pending: "Ausstehend",
  positive: "Positiv",
  negative: "Negativ",
  more_info_needed: "Mehr Infos benötigt",
};
export const teamFeedbackStatusOptions = toOptions(
  Constants.public.Enums.team_feedback_status,
  teamFeedbackStatusLabels,
);

export const consentStateLabels: Record<Enums<"consent_state">, string> = {
  draft: "Entwurf",
  sent: "Angefragt",
  answered: "Beantwortet",
};
export const consentStateOptions = toOptions(
  Constants.public.Enums.consent_state,
  consentStateLabels,
);
