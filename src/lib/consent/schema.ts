// zod schema for the talent-pool consent panel — validated on the client
// (react-hook-form) and re-validated in the server action (defense in depth),
// mirroring the Phase 3 candidate schema. The DB triggers (#53) and the unique
// FK remain the source of truth.

import { z } from "zod";

import { Constants } from "@/lib/supabase/types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

// A native date input yields `YYYY-MM-DD` or an empty string.
const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Datum im Format JJJJ-MM-TT erwartet",
  })
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const consentSchema = z.object({
  state: z.enum(Constants.public.Enums.consent_state),
  accepted: z.boolean(),
  answered_at: optionalDate,
  proof_note: optionalText,
});

export type ConsentFormInput = z.input<typeof consentSchema>;
export type ConsentFormValues = z.infer<typeof consentSchema>;
