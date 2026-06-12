// Talent-pool consent data-access on the RLS-scoped server client (principle 6),
// extending the Phase 3 src/lib/db convention. At most one consent row per
// candidate (the Phase 2 unique FK), so reads use the candidate_id and writes
// upsert on it. The Phase 7 consent invariant triggers (#53) enforce the
// status <-> consent rule at the database; isTalentPoolConsentError lets the
// server actions surface that rejection as clear German copy.

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, Tables } from "@/lib/supabase/types";

export type Consent = Tables<"talent_pool_consent">;
export type ConsentUpsert = TablesInsert<"talent_pool_consent">;

export async function getByCandidate(
  candidateId: string,
): Promise<Consent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_pool_consent")
    .select("*")
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Insert the candidate's consent row or update it in place (unique candidate_id).
export async function upsertConsent(input: ConsentUpsert): Promise<Consent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talent_pool_consent")
    .upsert(input, { onConflict: "candidate_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// True when an error is the consent-invariant trigger rejection (#53). The
// trigger raises a message naming the talent_pool status; both the candidate
// status write and the consent un-accept/delete write can hit it.
export function isTalentPoolConsentError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("talent_pool")
  );
}
