"use server";

import { revalidatePath } from "next/cache";

import { planReindex } from "@/lib/board/move";
import { type PipelineStage } from "@/lib/candidates/stages";
import { listForBoard } from "@/lib/db/candidates";
import { createClient } from "@/lib/supabase/server";

export type MoveResult = { error: string };

// Persist a board move on the RLS-scoped server client. It writes ONLY `stage`
// + `stage_order` (principle 1 — the board never touches status/priority): the
// moved card lands at `stageOrder` in the destination column, then the
// destination and (for a cross-column move) the source column are renumbered to
// a contiguous 0..n sequence. Only rows whose position actually changed are
// written. The reindex is not transactional (MVP): every column renders by
// `stage_order` asc, so a partial failure preserves relative order, and the
// optimistic UI rolls back on a rejected move.
export async function moveCandidate(
  id: string,
  stage: PipelineStage,
  stageOrder: number,
): Promise<MoveResult | void> {
  const columns = await listForBoard();
  const writes = planReindex(columns, id, stage, stageOrder);

  if (writes.length > 0) {
    try {
      const supabase = await createClient();
      for (const write of writes) {
        const { error } = await supabase
          .from("candidate")
          .update({ stage: write.stage, stage_order: write.stage_order })
          .eq("id", write.id);
        if (error) throw error;
      }
    } catch (error) {
      console.error("moveCandidate failed:", error);
      return { error: "Verschieben fehlgeschlagen." };
    }
  }

  revalidatePath("/board");
}
