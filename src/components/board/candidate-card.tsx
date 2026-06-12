import Link from "next/link";

import { PriorityBadge } from "@/components/candidates/priority-badge";
import { StatusBadge } from "@/components/candidates/status-badge";
import type { Candidate } from "@/lib/db/candidates";

// A board card's visual content: name (linking to the detail view) + status/
// priority badges (Phase 3 components). The column already conveys the stage,
// so no stage badge here. The outer card is a plain element so the board can
// make it draggable; the name link is marked non-draggable so the native anchor
// drag does not fight the drag-and-drop adapter.
export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-border bg-[var(--color-card)] p-3">
      <Link
        href={`/candidates/${candidate.id}`}
        draggable={false}
        className="text-sm font-medium text-[var(--color-text)] hover:underline"
      >
        {candidate.last_name}, {candidate.first_name}
      </Link>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={candidate.status} />
        {candidate.priority && <PriorityBadge priority={candidate.priority} />}
      </div>
    </div>
  );
}
