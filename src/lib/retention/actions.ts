"use server";

import { revalidatePath } from "next/cache";

import { anonymizeCandidate, resolveReview } from "@/lib/db/retention";

// Mark reviewed / keep: the queue row leaves the open list but is retained for
// audit (soft resolution).
export async function keepReview(reviewId: string): Promise<void> {
  await resolveReview(reviewId, "keep");
  revalidatePath("/");
}

// Extend: resolve the open row as 'extended'. The client then navigates to the
// Phase 3 edit form, where the recruiter sets a future deletion_review_date; if
// they do not, the next scan simply re-queues the candidate. (Navigation lives
// in the client so a server-action redirect cannot be swallowed by the caller's
// error handling.)
export async function extendReview(reviewId: string): Promise<void> {
  await resolveReview(reviewId, "extended");
  revalidatePath("/");
}

// Anonymize: scrub the candidate PII (gate-decided removal action), then resolve
// the row as 'removed'. Enum columns + created_at stay, so Phase 6 KPIs are
// unaffected.
export async function anonymizeReview(
  reviewId: string,
  candidateId: string,
): Promise<void> {
  await anonymizeCandidate(candidateId);
  await resolveReview(reviewId, "removed");
  revalidatePath("/");
  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidateId}`);
}
