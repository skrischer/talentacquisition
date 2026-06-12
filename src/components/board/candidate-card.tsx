import Link from "next/link";

import { Clock } from "lucide-react";

import { PriorityBadge } from "@/components/candidates/priority-badge";
import { Badge } from "@/components/ui/badge";
import {
  bucketFor,
  calendarDayDiff,
  isSurfacedBucket,
} from "@/lib/candidates/follow-up";
import {
  applicationSourceLabels,
  nursingQualificationLabels,
} from "@/lib/candidates/labels";
import type { Candidate } from "@/lib/db/candidates";
import { cn } from "@/lib/utils";

// The follow-up chip on a board card: a clock icon plus a compact due label.
// A surfaced bucket (overdue / due today / due this week) reads as a relative
// term in the destructive tone to draw the eye; a non-surfaced date renders as
// a short weekday marker in muted text. A row with no follow-up date renders no
// chip. Classification reuses the Phase-5 `bucketFor` — one source, no second
// date parse.
function dueChip(
  followUpDate: string | null,
  today: string,
): { label: string; urgent: boolean } | null {
  if (followUpDate === null) return null;
  const bucket = bucketFor(followUpDate, today);
  if (isSurfacedBucket(bucket)) {
    const diff = calendarDayDiff(followUpDate, today);
    const label =
      diff < 0
        ? "Überfällig"
        : diff === 0
          ? "Heute"
          : diff === 1
            ? "Morgen"
            : `In ${diff} Tagen`;
    return { label, urgent: true };
  }
  return { label: shortWeekday(followUpDate), urgent: false };
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

// A short "Wd DD." marker (e.g. "Mo 16.") for a non-surfaced follow-up date,
// computed from the calendar components — no wall-clock instant.
function shortWeekday(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday} ${day}.`;
}

// A board card's visual content: a priority chip + name (linking to the detail
// view), the nursing-qualification subtitle, and a footer with the application
// source chip and the follow-up due chip. The column already conveys the stage,
// so no stage badge here. The outer card is a plain element so the board can
// make it draggable; the name link is marked non-draggable so the native anchor
// drag does not fight the drag-and-drop adapter. All colours are design tokens
// (constitution principle 8).
export function CandidateCard({
  candidate,
  today,
}: {
  candidate: Candidate;
  today: string;
}) {
  const due = dueChip(candidate.follow_up_date, today);

  return (
    <div className="flex flex-col gap-2.5 rounded-[var(--radius-md)] border border-border bg-[var(--color-card)] p-3 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2.5">
        <PriorityBadge priority={candidate.priority} />
        <Link
          href={`/candidates/${candidate.id}`}
          draggable={false}
          className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-text)] hover:underline"
        >
          {candidate.last_name}, {candidate.first_name}
        </Link>
      </div>
      <p className="truncate text-[13px] text-text-secondary">
        {candidate.nursing_qualification
          ? nursingQualificationLabels[candidate.nursing_qualification]
          : "Ohne Angabe"}
      </p>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="neutral">
          {applicationSourceLabels[candidate.application_source]}
        </Badge>
        {due && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap",
              due.urgent
                ? "text-[var(--color-destructive)]"
                : "text-text-muted",
            )}
          >
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {due.label}
          </span>
        )}
      </div>
    </div>
  );
}
