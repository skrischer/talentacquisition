import { Board } from "@/components/board/board";
import { listForBoard } from "@/lib/db/candidates";

// The pipeline board. A server component: it loads the live-pipeline candidates
// grouped into stage columns through the RLS-scoped server client, then hands
// them to the interactive client board (drag-to-move with optimistic updates).
export default async function BoardPage() {
  const columns = await listForBoard();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
        Pipeline
      </h1>
      <Board columns={columns} />
    </div>
  );
}
