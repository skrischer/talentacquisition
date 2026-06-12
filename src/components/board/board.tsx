"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { CandidateCard } from "@/components/board/candidate-card";
import { moveCandidate } from "@/lib/board/actions";
import { resolveMove, type MoveIntent } from "@/lib/board/move";
import { pipelineStageLabels } from "@/lib/candidates/labels";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/candidates/stages";
import type { BoardColumns, Candidate } from "@/lib/db/candidates";
import { cn } from "@/lib/utils";

type Edge = "top" | "bottom";
type DragData = Record<string | symbol, unknown>;

function isPipelineStage(value: string): value is PipelineStage {
  return PIPELINE_STAGES.some((stage) => stage === value);
}

function readString(data: DragData, key: string): string | null {
  const value = data[key];
  return typeof value === "string" ? value : null;
}

function readStage(data: DragData): PipelineStage | null {
  const value = readString(data, "stage");
  return value !== null && isPipelineStage(value) ? value : null;
}

function edgeFor(clientY: number, element: Element): Edge {
  const rect = element.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2 ? "top" : "bottom";
}

function DropLine() {
  return (
    <div className="h-0.5 w-full rounded-full bg-[var(--color-secondary)]" />
  );
}

function DraggableCard({
  candidate,
  stage,
}: {
  candidate: Candidate;
  stage: PipelineStage;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return combine(
      draggable({
        element,
        getInitialData: () => ({ type: "card", cardId: candidate.id, stage }),
        onDragStart: () => setDragging(true),
        onDrop: () => {
          setDragging(false);
          setEdge(null);
        },
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) =>
          source.data.type === "card" && source.data.cardId !== candidate.id,
        getData: ({ input }) => ({
          type: "card",
          cardId: candidate.id,
          stage,
          edge: edgeFor(input.clientY, element),
        }),
        onDrag: ({ source, location }) => {
          if (source.data.cardId === candidate.id) {
            setEdge(null);
            return;
          }
          setEdge(edgeFor(location.current.input.clientY, element));
        },
        onDragLeave: () => setEdge(null),
        onDrop: () => setEdge(null),
      }),
    );
  }, [candidate.id, stage]);

  return (
    <div className="flex flex-col gap-0.5">
      {edge === "top" && <DropLine />}
      <div
        ref={ref}
        className={cn(
          "cursor-grab active:cursor-grabbing",
          dragging && "opacity-40",
        )}
      >
        <CandidateCard candidate={candidate} />
      </div>
      {edge === "bottom" && <DropLine />}
    </div>
  );
}

function BoardColumn({
  stage,
  label,
  candidates,
}: {
  stage: PipelineStage;
  label: string;
  candidates: Candidate[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === "card",
      getData: () => ({ type: "column", stage }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [stage]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-bg-alt p-3 transition-colors",
        isOver && "border-[var(--color-secondary)]",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {label}
        </h2>
        <span className="text-xs text-text-muted">{candidates.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {candidates.length === 0 ? (
          <p className="rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-6 text-center text-xs text-text-muted">
            Keine Bewerber
          </p>
        ) : (
          candidates.map((candidate) => (
            <DraggableCard
              key={candidate.id}
              candidate={candidate}
              stage={stage}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function Board({ columns }: { columns: BoardColumns }) {
  const [optimisticColumns, applyOptimistic] = useOptimistic(
    columns,
    (current: BoardColumns, intent: MoveIntent) =>
      resolveMove(current, intent).columns,
  );
  const columnsRef = useRef(optimisticColumns);
  useEffect(() => {
    columnsRef.current = optimisticColumns;
  }, [optimisticColumns]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === "card",
      onDrop: ({ source, location }) => {
        const cardId = readString(source.data, "cardId");
        const target = location.current.dropTargets[0];
        if (!cardId || !target) return;

        const type = readString(target.data, "type");
        const toStage = readStage(target.data);
        if (!toStage) return;

        const overCardId =
          type === "card" ? readString(target.data, "cardId") : null;
        if (overCardId === cardId) return;
        const edge =
          readString(target.data, "edge") === "top" ? "top" : "bottom";

        const intent: MoveIntent = { cardId, toStage, overCardId, edge };
        const { stageOrder } = resolveMove(columnsRef.current, intent);

        startTransition(async () => {
          setError(null);
          applyOptimistic(intent);
          const result = await moveCandidate(cardId, toStage, stageOrder);
          if (result?.error) setError(result.error);
        });
      },
    });
  }, [applyOptimistic]);

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-sm text-[var(--color-destructive)]">{error}</p>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            stage={stage}
            label={pipelineStageLabels[stage]}
            candidates={optimisticColumns[stage]}
          />
        ))}
      </div>
    </div>
  );
}
