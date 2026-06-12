"use server";

import { revalidatePath } from "next/cache";

import { resolveToday } from "@/lib/candidates/follow-up";
import { update } from "@/lib/db/candidates";

export type FollowUpActionResult = { error: string };

// A plain ISO calendar date `YYYY-MM-DD` — the wire shape of the `date`-typed
// `follow_up_date` column, the same form the Phase-5 bucket utility consumes.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The candidate `id` is a UUID; reject a malformed value before the DB call
// (defense in depth — RLS and the parameterized `.eq` already guard access).
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Revalidate every surface that reads the due set after a follow-up mutation:
// the page itself, the nav overdue badge ((app) layout), the dashboard card,
// and the candidate list/detail follow-up treatment.
function revalidateFollowUpSurfaces(id: string): void {
  revalidatePath("/follow-ups");
  revalidatePath("/", "layout");
  revalidatePath("/candidates");
  revalidatePath(`/candidates/${id}`);
}

// Erledigt: mark a follow-up done by clearing both `next_step` and
// `follow_up_date` (no task table — the open task IS the column pair, per the
// Phase-5 model). The row drops out of every due bucket because `bucketFor`
// maps a null date to "none".
export async function completeFollowUp(
  id: string,
): Promise<FollowUpActionResult | void> {
  if (!UUID.test(id)) {
    return { error: "Ungültiger Bewerber." };
  }
  try {
    await update(id, { next_step: null, follow_up_date: null });
  } catch (error) {
    console.error("completeFollowUp failed:", error);
    return { error: "Erledigen fehlgeschlagen. Bitte erneut versuchen." };
  }
  revalidateFollowUpSurfaces(id);
}

// Verschieben: set a new `follow_up_date`, re-bucketing the row (a future date
// moves it out of the surfaced set). `next_step` is left untouched — the task
// stays, only its due date changes.
export async function rescheduleFollowUp(
  id: string,
  followUpDate: string,
): Promise<FollowUpActionResult | void> {
  if (!UUID.test(id)) {
    return { error: "Ungültiger Bewerber." };
  }
  if (!ISO_DATE.test(followUpDate)) {
    return { error: "Bitte ein gültiges Datum wählen." };
  }
  // No rescheduling into the past — ISO YYYY-MM-DD strings order chronologically
  // under lexical comparison, so a string compare is the calendar compare.
  if (followUpDate < resolveToday()) {
    return { error: "Das Datum darf nicht in der Vergangenheit liegen." };
  }
  try {
    await update(id, { follow_up_date: followUpDate });
  } catch (error) {
    console.error("rescheduleFollowUp failed:", error);
    return { error: "Verschieben fehlgeschlagen. Bitte erneut versuchen." };
  }
  revalidateFollowUpSurfaces(id);
}
