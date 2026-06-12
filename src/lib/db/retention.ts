// Retention review data-access on the RLS-scoped server client (principle 6),
// over the Phase 7 deletion_review queue (#55). The scan populates the queue;
// this module reads the open rows and resolves them. Anonymize scrubs the
// candidate PII and voids the consent's free-form proof_metadata — it never
// changes the enum columns or created_at (Phase 6 KPI continuity, principle 7)
// and never deletes/un-accepts the consent row (which the #53 invariant forbids
// while the candidate is talent_pool).

import { createClient } from "@/lib/supabase/server";

export type DueReview = {
  id: string;
  dueDate: string;
  candidateId: string;
  firstName: string;
  lastName: string;
};

export type ReviewResolution = "extended" | "keep" | "removed";

// Fixed sentinel for the NOT NULL PII columns; nullable PII is set to null.
const ANONYMIZED = "Anonymisiert";

// Open queue rows (resolved_at is null), oldest due first, joined to the
// candidate's name via a second typed read (no embed, no `any`).
export async function listDueReviews(): Promise<DueReview[]> {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("deletion_review")
    .select("id, due_date, candidate_id")
    .is("resolved_at", null)
    .order("due_date", { ascending: true });
  if (error) throw error;
  if (reviews.length === 0) return [];

  const candidateIds = reviews.map((row) => row.candidate_id);
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidate")
    .select("id, first_name, last_name")
    .in("id", candidateIds);
  if (candidatesError) throw candidatesError;

  const byId = new Map(
    candidates.map((candidate) => [candidate.id, candidate]),
  );
  return reviews.map((row) => {
    const candidate = byId.get(row.candidate_id);
    return {
      id: row.id,
      dueDate: row.due_date,
      candidateId: row.candidate_id,
      firstName: candidate?.first_name ?? "",
      lastName: candidate?.last_name ?? "",
    };
  });
}

export async function resolveReview(
  reviewId: string,
  resolution: ReviewResolution,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deletion_review")
    .update({ resolved_at: new Date().toISOString(), resolution })
    .eq("id", reviewId);
  if (error) throw error;
}

// Scrub the candidate's PII and void the consent proof_metadata. Touches no enum
// column and not created_at, so the Phase 6 KPI aggregates are unchanged; touches
// neither the consent's accepted flag nor the row's existence, so the #53 trigger
// never fires (status stays talent_pool where it was).
export async function anonymizeCandidate(candidateId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidate")
    .update({
      first_name: ANONYMIZED,
      last_name: ANONYMIZED,
      email: null,
      phone: null,
      notes: null,
      team_proposal: null,
      documents_path: null,
    })
    .eq("id", candidateId);
  if (error) throw error;

  const { error: consentError } = await supabase
    .from("talent_pool_consent")
    .update({ proof_metadata: null })
    .eq("candidate_id", candidateId);
  if (consentError) throw consentError;
}
