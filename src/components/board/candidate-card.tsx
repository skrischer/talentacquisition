import Link from "next/link";

import { PriorityBadge } from "@/components/candidates/priority-badge";
import { StatusBadge } from "@/components/candidates/status-badge";
import type { Candidate } from "@/lib/db/candidates";

// A board card: name + status/priority badges (Phase 3 components), linking to
// the candidate detail view. The column already conveys the stage, so no stage
// badge here.
export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Link
      href={`/candidates/${candidate.id}`}
      className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-border bg-[var(--color-card)] p-3 transition-colors hover:border-[var(--color-border-hover)]"
    >
      <span className="text-sm font-medium text-[var(--color-text)]">
        {candidate.last_name}, {candidate.first_name}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={candidate.status} />
        {candidate.priority && <PriorityBadge priority={candidate.priority} />}
      </div>
    </Link>
  );
}
