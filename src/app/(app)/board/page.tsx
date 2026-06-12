import { Board } from "@/components/board/board";
import { resolveToday } from "@/lib/candidates/follow-up";
import { listForBoard } from "@/lib/db/candidates";

// The pipeline board. A server component: it loads the live-pipeline candidates
// grouped into stage columns through the RLS-scoped server client, then hands
// them to the interactive client board (drag-to-move with optimistic updates).
// "Today" is resolved here (Europe/Berlin, server-side) and passed in so each
// card's follow-up due chip never depends on the client clock.
export default async function BoardPage() {
  const columns = await listForBoard();
  const today = resolveToday();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
          Pipeline-Board
        </h1>
        <p className="text-sm text-text-secondary">
          Bewerber per Drag-and-drop durch die Phasen führen
        </p>
      </div>
      <Board columns={columns} today={today} />
    </div>
  );
}
