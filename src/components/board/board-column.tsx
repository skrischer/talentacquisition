import type { Candidate } from "@/lib/db/candidates";

import { CandidateCard } from "./candidate-card";

// One pipeline-stage column. The stage label is passed in from the shared
// Phase 3 label map (German copy lives there, not here).
export function BoardColumn({
  label,
  candidates,
}: {
  label: string;
  candidates: Candidate[];
}) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-bg-alt p-3">
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
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        )}
      </div>
    </div>
  );
}
