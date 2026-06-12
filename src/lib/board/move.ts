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

export type StageWrite = {
  id: string;
  stage: PipelineStage;
  stage_order: number;
};

// Plan the persistence for a board move: place the moved card at `toIndex` in
// the destination column, then renumber the destination (and, for a
// cross-column move, the source) to a contiguous 0..n sequence. Returns only
// the rows whose stored `stage` / `stage_order` actually changes, so untouched
// peers are not rewritten.
export function planReindex(
  columns: BoardColumns,
  id: string,
  toStage: PipelineStage,
  toIndex: number,
): StageWrite[] {
  const located = locate(columns, id);
  if (!located) return [];
  const { card, stage: fromStage } = located;

  const sourceArr = columns[fromStage].filter((c) => c.id !== id);
  const destBase = toStage === fromStage ? sourceArr : columns[toStage];
  const insertAt = Math.max(0, Math.min(toIndex, destBase.length));
  const destArr = [
    ...destBase.slice(0, insertAt),
    card,
    ...destBase.slice(insertAt),
  ];

  const current = new Map<string, { stage: PipelineStage; order: number }>();
  for (const stage of PIPELINE_STAGES) {
    for (const c of columns[stage]) {
      current.set(c.id, { stage, order: c.stage_order });
    }
  }

  const writes: StageWrite[] = [];
  const consider = (cardId: string, stage: PipelineStage, order: number) => {
    const cur = current.get(cardId);
    if (!cur || cur.stage !== stage || cur.order !== order) {
      writes.push({ id: cardId, stage, stage_order: order });
    }
  };

  destArr.forEach((c, index) => consider(c.id, toStage, index));
  if (toStage !== fromStage) {
    sourceArr.forEach((c, index) => consider(c.id, fromStage, index));
  }
  return writes;
}
