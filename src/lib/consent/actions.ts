"use server";

import { revalidatePath } from "next/cache";

import { consentSchema } from "@/lib/consent/schema";
import { isTalentPoolConsentError, upsertConsent } from "@/lib/db/consent";

export type ConsentActionResult = { error: string } | { success: true };

// Record (insert or update) the candidate's talent-pool consent. The same zod
// schema the panel uses runs again here (defense in depth). On success the
// detail page is revalidated so the consent summary reflects the new state;
// a trigger rejection (e.g. un-accepting while the candidate is talent_pool)
// is surfaced as clear German copy.
export async function recordConsent(
  candidateId: string,
  values: unknown,
): Promise<ConsentActionResult> {
  const parsed = consentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte die markierten Felder korrigieren." };
  }
  const { state, accepted, answered_at, proof_note } = parsed.data;

  try {
    await upsertConsent({
      candidate_id: candidateId,
      state,
      accepted,
      answered_at: answered_at ?? null,
      proof_metadata: proof_note ? { note: proof_note } : null,
    });
  } catch (error) {
    if (isTalentPoolConsentError(error)) {
      return {
        error:
          'Die Einwilligung kann nicht zurückgezogen werden, solange der Status "Talentpool" ist.',
      };
    }
    console.error("recordConsent failed:", error);
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath(`/candidates/${candidateId}`);
  return { success: true };
}
