import { PIPELINE_STAGES, type PipelineStage } from "@/lib/candidates/stages";
import type { BoardColumns, Candidate } from "@/lib/db/candidates";

export type MoveIntent = {
  cardId: string;
  toStage: PipelineStage;
  // The card the drop landed on, with the edge relative to it; `null` appends
  // to the end of the destination column (drop on the column itself / empty).
  overCardId: string | null;
  edge: "top" | "bottom";
};

export type ResolvedMove = {
  columns: BoardColumns;
  // The moved card's new index within its destination column = its stage_order.
  stageOrder: number;
};

function locate(
  columns: BoardColumns,
  cardId: string,
): { card: Candidate; stage: PipelineStage } | null {
  for (const stage of PIPELINE_STAGES) {
    const card = columns[stage].find((c) => c.id === cardId);
    if (card) return { card, stage };
  }
  return null;
}

// Pure board-move resolution, shared by the optimistic reducer and the server
// call: remove the card from its source column, then insert it into the
// destination column at the position resolved against the post-removal array
// (so same-column reordering and cross-column moves both land correctly).
export function resolveMove(
  columns: BoardColumns,
  intent: MoveIntent,
): ResolvedMove {
  const { cardId, toStage, overCardId, edge } = intent;

  const located = locate(columns, cardId);
  if (!located || overCardId === cardId) {
    const fallbackIndex = located
      ? columns[located.stage].findIndex((c) => c.id === cardId)
      : 0;
    return { columns, stageOrder: Math.max(fallbackIndex, 0) };
  }

  const { card, stage: fromStage } = located;

  const next: BoardColumns = { ...columns };
  next[fromStage] = columns[fromStage].filter((c) => c.id !== cardId);
  // For a same-column move this is the post-removal array; for a cross-column
  // move it is the untouched destination column.
  const destArr = next[toStage];

  let insertAt: number;
  if (overCardId === null) {
    insertAt = destArr.length;
  } else {
    const overIdx = destArr.findIndex((c) => c.id === overCardId);
    insertAt =
      overIdx === -1 ? destArr.length : overIdx + (edge === "bottom" ? 1 : 0);
  }

  next[toStage] = [
    ...destArr.slice(0, insertAt),
    card,
    ...destArr.slice(insertAt),
  ];

  return { columns: next, stageOrder: insertAt };
}
