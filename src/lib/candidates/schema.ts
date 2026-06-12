// The single zod schema mirroring the editable columns of the Phase 2
// `candidate` table. Validated on the client (react-hook-form) and re-validated
// inside the server action (defense in depth) — the database CHECK and
// NOT NULL constraints remain the source of truth.
//
// Required: first_name, last_name, application_source (the table's three
// non-defaulted NOT NULLs). The five defaulted-NOT-NULL enums default to their
// database defaults rather than null, so a row is never written with a null
// enum. The rejection-reason biconditional mirrors the DB CHECK
// `(status = 'rejected') = (rejection_reason is not null)`.

import { z } from "zod";

import { Constants } from "@/lib/supabase/types";

const requiredText = z.string().trim().min(1, "Pflichtfeld");

// Optional free text: an empty field collapses to undefined so the data-access
// layer can omit it rather than write an empty string.
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

// Optional date: a native date input yields `YYYY-MM-DD` or an empty string.
const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Datum im Format JJJJ-MM-TT erwartet",
  })
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const candidateSchema = z
  .object({
    first_name: requiredText,
    last_name: requiredText,
    email: optionalText,
    phone: optionalText,

    application_source: z.enum(Constants.public.Enums.application_source, {
      error: "Bitte eine Quelle wählen",
    }),
    nursing_qualification: z
      .enum(Constants.public.Enums.nursing_qualification)
      .optional(),
    foreign_qualification_recognition: z
      .enum(Constants.public.Enums.foreign_qualification_recognition)
      .default("not_applicable"),
    mobility: z.enum(Constants.public.Enums.mobility).default("unknown"),

    stage: z.enum(Constants.public.Enums.pipeline_stage).default("new"),
    status: z.enum(Constants.public.Enums.candidate_status).default("active"),
    priority: z.enum(Constants.public.Enums.candidate_priority).optional(),
    rejection_reason: z
      .enum(Constants.public.Enums.rejection_reason)
      .optional(),

    team_proposal: optionalText,
    team_feedback_status: z
      .enum(Constants.public.Enums.team_feedback_status)
      .default("not_requested"),

    next_step: optionalText,
    follow_up_date: optionalDate,
    deletion_review_date: optionalDate,

    documents_path: optionalText,
    notes: optionalText,
  })
  .refine(
    (data) => (data.status === "rejected") === Boolean(data.rejection_reason),
    {
      message:
        'Ein Ablehnungsgrund ist genau dann erforderlich, wenn der Status "Abgelehnt" ist.',
      path: ["rejection_reason"],
    },
  );

export type CandidateFormInput = z.input<typeof candidateSchema>;
export type CandidateFormValues = z.infer<typeof candidateSchema>;
