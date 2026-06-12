"use server";

import { revalidatePath } from "next/cache";

import { type PipelineStage } from "@/lib/candidates/stages";
import { update } from "@/lib/db/candidates";

export type MoveResult = { error: string };

// Persist a board move: write only `stage` + `stage_order` (principle 1 — the
// board never touches status/priority) through the RLS-scoped server client,
// then revalidate the board so a reload reflects the move.
//
// This step persists the moved card's own position; the companion issue (#34)
// extends it to renumber both affected columns to a contiguous sequence. Every
// column renders by `stage_order` asc, so even before that hardening the
// relative order is preserved.
export async function moveCandidate(
  id: string,
  stage: PipelineStage,
  stageOrder: number,
): Promise<MoveResult | void> {
  try {
    await update(id, { stage, stage_order: stageOrder });
  } catch (error) {
    console.error("moveCandidate failed:", error);
    return { error: "Verschieben fehlgeschlagen." };
  }
  revalidatePath("/board");
}
