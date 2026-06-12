"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { candidateSchema } from "@/lib/candidates/schema";
import { create, update } from "@/lib/db/candidates";
import { isTalentPoolConsentError } from "@/lib/db/consent";

export type CandidateActionResult = { error: string };

// The consent-invariant trigger (#53) rejects a talent_pool status without an
// accepted consent; surface that specific cause instead of the generic message.
const TALENT_POOL_CONSENT_ERROR =
  'Der Status "Talentpool" erfordert zuerst eine erteilte Einwilligung (im Kandidaten-Detail erfassen).';

// Server-side re-validation (defense in depth): the same zod schema the form
// uses runs again here, so the three required fields and the rejection-reason
// biconditional block the write even if the client is bypassed. The DB CHECK
// and NOT NULL constraints remain the final backstop.
export async function createCandidate(
  values: unknown,
): Promise<CandidateActionResult> {
  const parsed = candidateSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte die markierten Felder korrigieren." };
  }

  let id: string;
  try {
    const candidate = await create(parsed.data);
    id = candidate.id;
  } catch (error) {
    if (isTalentPoolConsentError(error)) {
      return { error: TALENT_POOL_CONSENT_ERROR };
    }
    console.error("createCandidate failed:", error);
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath("/candidates");
  redirect(`/candidates/${id}`);
}

export async function updateCandidate(
  id: string,
  values: unknown,
): Promise<CandidateActionResult> {
  const parsed = candidateSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Bitte die markierten Felder korrigieren." };
  }

  try {
    await update(id, parsed.data);
  } catch (error) {
    if (isTalentPoolConsentError(error)) {
      return { error: TALENT_POOL_CONSENT_ERROR };
    }
    console.error("updateCandidate failed:", error);
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath("/candidates");
  revalidatePath(`/candidates/${id}`);
  redirect(`/candidates/${id}`);
}
