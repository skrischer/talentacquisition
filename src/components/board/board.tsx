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

// Per-stage accent colour for the column header (the coloured top rule + the
// header dot), reusing the same stage-colour vocabulary as the styleguide
// StageBadge — all design tokens, no hardcoded hex (constitution principle 8).
const STAGE_ACCENT: Record<PipelineStage, string> = {
  new: "var(--color-stage-new-dot)",
  screening: "var(--color-stage-screening-dot)",
  phone_screen: "var(--color-secondary)",
  interview: "var(--color-secondary-light)",
  trial_day: "var(--color-cta-decorative)",
  offer: "var(--color-cta)",
  hired: "var(--color-stage-hired-dot)",
};

// How many cards a column shows before collapsing the remainder behind a
// "+N weitere" expander (matches the Paper screen's stacked columns).
const COLLAPSE_LIMIT = 4;

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
  today,
}: {
  candidate: Candidate;
  stage: PipelineStage;
  today: string;
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
        <CandidateCard candidate={candidate} today={today} />
      </div>
      {edge === "bottom" && <DropLine />}
    </div>
  );
}

// The droppable card stack for a stage — the column body shared by the desktop
// columns and the mobile single-column view. It registers the column-level drop
// target (append on drop) and collapses overflow behind a "+N weitere" toggle.
function CardStack({
  stage,
  candidates,
  today,
}: {
  stage: PipelineStage;
  candidates: Candidate[];
  today: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Reveal an arriving card even when the stack is collapsed: if the count grows
  // (a drop landed here), expand so the card is visible in the optimistic state
  // and not hidden behind the "+N weitere" slice until the server revalidates.
  const prevCount = useRef(candidates.length);
  useEffect(() => {
    if (candidates.length > prevCount.current) setExpanded(true);
    prevCount.current = candidates.length;
  }, [candidates.length]);

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

  const overflow = candidates.length - COLLAPSE_LIMIT;
  const collapsed = !expanded && overflow > 0;
  const visible = collapsed ? candidates.slice(0, COLLAPSE_LIMIT) : candidates;

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-md)] transition-colors",
        isOver && "outline-2 outline-offset-2 outline-[var(--color-secondary)]",
      )}
    >
      {candidates.length === 0 ? (
        <p className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-dashed)] px-3 py-6 text-center text-xs text-text-muted">
          Keine Bewerber
        </p>
      ) : (
        visible.map((candidate) => (
          <DraggableCard
            key={candidate.id}
            candidate={candidate}
            stage={stage}
            today={today}
          />
        ))
      )}
      {collapsed && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="cursor-pointer rounded-[var(--radius-sm)] border border-border bg-[var(--color-card)] px-3 py-2 text-center text-xs font-medium text-text-secondary transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text)]"
        >
          + {overflow} weitere
        </button>
      )}
    </div>
  );
}

// A coloured column header: a stage accent dot, the German stage label, and the
// live card count. The accent also rules the column's top edge.
function ColumnHeader({
  stage,
  label,
  count,
}: {
  stage: PipelineStage;
  label: string;
  count: number;
}) {
  return (
    <div
      className="flex items-center justify-between border-t-2 px-1 pt-2.5 pb-1"
      style={{ borderTopColor: STAGE_ACCENT[stage] }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: STAGE_ACCENT[stage] }}
        />
        <h2 className="truncate text-sm font-semibold text-[var(--color-text)]">
          {label}
        </h2>
      </div>
      <span className="shrink-0 text-xs font-medium text-text-muted">
        {count}
      </span>
    </div>
  );
}

// A full desktop board column: the coloured header above its card stack.
function BoardColumn({
  stage,
  candidates,
  today,
}: {
  stage: PipelineStage;
  candidates: Candidate[];
  today: string;
}) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <ColumnHeader
        stage={stage}
        label={pipelineStageLabels[stage]}
        count={candidates.length}
      />
      <CardStack stage={stage} candidates={candidates} today={today} />
    </div>
  );
}

// The mobile stage selector: a horizontally scrollable chip row; the active
// chip carries the stage's primary tone and reveals that single column below.
function StageSelector({
  columns,
  active,
  onSelect,
}: {
  columns: BoardColumns;
  active: PipelineStage;
  onSelect: (stage: PipelineStage) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {PIPELINE_STAGES.map((stage) => {
        const selected = stage === active;
        return (
          <button
            key={stage}
            type="button"
            onClick={() => onSelect(stage)}
            aria-pressed={selected}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-[var(--color-card)] text-text-secondary hover:border-[var(--color-border-hover)]",
            )}
          >
            {pipelineStageLabels[stage]}
            <span
              className={cn(
                "text-xs font-semibold",
                selected ? "text-primary-foreground/80" : "text-text-muted",
              )}
            >
              {columns[stage].length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Board({
  columns,
  today,
}: {
  columns: BoardColumns;
  today: string;
}) {
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
  const [activeStage, setActiveStage] = useState<PipelineStage>(
    PIPELINE_STAGES[0] ?? "new",
  );

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
        // Edge only applies when landing on a card; a column drop appends, where
        // resolveMove ignores the edge (overCardId is null).
        const edge: Edge =
          type === "card" && readString(target.data, "edge") === "top"
            ? "top"
            : "bottom";

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

      {/* Desktop: all seven stage columns in a horizontal scroll. */}
      <div className="hidden gap-4 overflow-x-auto pb-4 md:flex">
        {PIPELINE_STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            stage={stage}
            candidates={optimisticColumns[stage]}
            today={today}
          />
        ))}
      </div>

      {/* Mobile: a stage-selector chip row + the single selected column. */}
      <div className="flex flex-col gap-4 md:hidden">
        <StageSelector
          columns={optimisticColumns}
          active={activeStage}
          onSelect={setActiveStage}
        />
        <div className="flex flex-col gap-3">
          <ColumnHeader
            stage={activeStage}
            label={pipelineStageLabels[activeStage]}
            count={optimisticColumns[activeStage].length}
          />
          <CardStack
            stage={activeStage}
            candidates={optimisticColumns[activeStage]}
            today={today}
          />
        </div>
      </div>
    </div>
  );
}
