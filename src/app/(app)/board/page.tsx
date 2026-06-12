import { BoardColumn } from "@/components/board/board-column";
import { pipelineStageLabels } from "@/lib/candidates/labels";
import { PIPELINE_STAGES } from "@/lib/candidates/stages";
import { listForBoard } from "@/lib/db/candidates";

// The pipeline board. A server component: it loads the live-pipeline candidates
// grouped into stage columns through the RLS-scoped server client, then renders
// one column per stage in pipeline order. Read-only here; drag-to-move is added
// in a later step.
export default async function BoardPage() {
  const columns = await listForBoard();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
        Pipeline
      </h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            label={pipelineStageLabels[stage]}
            candidates={columns[stage]}
          />
        ))}
      </div>
    </div>
  );
}
