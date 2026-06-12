import Link from "next/link";

import { FollowUpBadge } from "@/components/candidates/follow-up-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  bucketFor,
  compareByFollowUpDate,
  isSurfacedBucket,
  resolveToday,
  type SurfacedFollowUpBucket,
} from "@/lib/candidates/follow-up";
import { list, type Candidate } from "@/lib/db/candidates";

const EMPTY_LABEL = "Keine fälligen Wiedervorlagen";

type DueFollowUp = { candidate: Candidate; bucket: SurfacedFollowUpBucket };

// DD.MM.YYYY from the ISO date parts (matches the candidate detail view) — never
// shifts a day across a timezone boundary. Due rows always carry a date; the
// null branch only satisfies the column type.
function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

// The due set: overdue + due_today + due_this_week, derived from the Phase 3
// `list()` result via the bucket utility (no new query, same single
// classification source as the list treatment), sorted by follow_up_date
// ascending then last_name. upcoming / none never surface.
function dueFollowUps(candidates: Candidate[], today: string): DueFollowUp[] {
  return candidates
    .map((candidate) => ({
      candidate,
      bucket: bucketFor(candidate.follow_up_date, today),
    }))
    .filter((item): item is DueFollowUp => isSurfacedBucket(item.bucket))
    .sort(
      (a, b) =>
        compareByFollowUpDate(a.candidate, b.candidate) ||
        a.candidate.last_name.localeCompare(b.candidate.last_name, "de"),
    );
}

// The dashboard "Wiedervorlage" card: a distinct server-read view (principle 6,
// RLS-scoped client) listing every due candidate with no row cap (small
// single-team dataset). Each row links to the candidate detail, where the
// follow-up date is edited (Phase 3) to reschedule out of the due set.
export async function FollowUpCard() {
  const today = resolveToday();
  const due = dueFollowUps(await list(), today);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wiedervorlage</CardTitle>
      </CardHeader>
      <CardContent>
        {due.length === 0 ? (
          <p className="text-sm text-text-secondary">{EMPTY_LABEL}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {due.map(({ candidate, bucket }) => (
              <li key={candidate.id}>
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="-mx-2 flex flex-col gap-1 rounded-md px-2 py-2 hover:bg-bg-alt"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {candidate.first_name} {candidate.last_name}
                    </span>
                    <FollowUpBadge bucket={bucket} />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-text-secondary">
                    <span className="truncate">
                      {candidate.next_step?.trim() ? candidate.next_step : "—"}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatDate(candidate.follow_up_date)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
