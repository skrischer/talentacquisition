"use client";

import Link from "next/link";
import { startTransition, useMemo, useOptimistic, useState } from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  CalendarDays,
  CalendarClock,
  Check,
  Clock,
  MoreVertical,
} from "lucide-react";

import { PriorityBadge } from "@/components/candidates/priority-badge";
import { StageBadge } from "@/components/candidates/stage-badge";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { DateInput } from "@/components/ui/date-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  completeFollowUp,
  rescheduleFollowUp,
} from "@/lib/candidates/follow-up-actions";
import {
  calendarDayDiff,
  compareByFollowUpDate,
  type SurfacedFollowUpBucket,
} from "@/lib/candidates/follow-up";
import type { Candidate } from "@/lib/db/candidates";

export type FollowUpItem = {
  candidate: Candidate;
  bucket: SurfacedFollowUpBucket;
};

// The three surfaced sections in display order, each with its German heading,
// icon, and accent token for the icon + count (constitution principle 8 — no
// hardcoded hex). overdue is most urgent (destructive), due_today draws the eye
// (accent), due_this_week is noted but lower-emphasis (primary).
const SECTIONS: {
  bucket: SurfacedFollowUpBucket;
  title: string;
  icon: typeof AlertTriangle;
  accent: string;
}[] = [
  {
    bucket: "overdue",
    title: "Überfällig",
    icon: AlertTriangle,
    accent: "var(--color-destructive)",
  },
  {
    bucket: "due_today",
    title: "Heute fällig",
    icon: Clock,
    accent: "var(--color-cta)",
  },
  {
    bucket: "due_this_week",
    title: "Diese Woche",
    icon: CalendarDays,
    accent: "var(--color-primary)",
  },
];

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

// "DD.MM." from the ISO date parts — never shifts a day across a timezone
// boundary.
function shortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}.${month}.`;
}

// "Wd DD." (e.g. "Mo 16.") for a non-urgent date, from the calendar components.
function weekdayDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday} ${day}.`;
}

// The due chip per bucket: overdue shows the date plus the overdue span
// ("14.06. · 2 Tage") in destructive tone; due_today shows "Heute" in the accent
// tone; due_this_week shows the short weekday in muted text. Reuses the Phase-5
// `calendarDayDiff` for the span — one date arithmetic source.
function DueChip({
  bucket,
  followUpDate,
  today,
}: {
  bucket: SurfacedFollowUpBucket;
  followUpDate: string;
  today: string;
}) {
  if (bucket === "overdue") {
    const overdueBy = calendarDayDiff(today, followUpDate);
    const span = overdueBy === 1 ? "1 Tag" : `${overdueBy} Tage`;
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-[var(--color-destructive)]">
        <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
        {shortDate(followUpDate)} · {span}
      </span>
    );
  }
  if (bucket === "due_today") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-[var(--color-cta)]">
        <Clock className="size-4 shrink-0" aria-hidden="true" />
        Heute
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap text-text-muted">
      <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
      {weekdayDate(followUpDate)}
    </span>
  );
}

// One task row: prio chip + name (linking to the detail) with the stage badge,
// the next_step text, the due chip, and the Erledigt / Verschieben actions.
function TaskRow({
  item,
  today,
  onComplete,
  onReschedule,
}: {
  item: FollowUpItem;
  today: string;
  onComplete: (id: string) => void;
  onReschedule: (id: string, date: string) => void;
}) {
  const { candidate, bucket } = item;
  const followUpDate = candidate.follow_up_date ?? today;

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 md:flex-row md:items-center md:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <PriorityBadge priority={candidate.priority} />
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/candidates/${candidate.id}`}
            className="truncate text-sm font-semibold text-[var(--color-text)] hover:underline"
          >
            {candidate.first_name} {candidate.last_name}
          </Link>
          <StageBadge stage={candidate.stage} />
        </div>
      </div>

      <p className="min-w-0 flex-1 truncate text-sm text-text-secondary md:px-2">
        {candidate.next_step?.trim() ? candidate.next_step : "—"}
      </p>

      <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end">
        <div className="md:w-28 md:text-right">
          <DueChip bucket={bucket} followUpDate={followUpDate} today={today} />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete(candidate.id)}
          >
            <Check className="size-4" aria-hidden="true" />
            Erledigt
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-secondary outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-secondary data-[popup-open]:bg-muted"
              aria-label={`Aktionen für ${candidate.first_name} ${candidate.last_name}`}
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 p-2">
              <p className="px-1 pb-1.5 text-xs font-medium text-text-secondary">
                Verschieben auf
              </p>
              <DateInput
                defaultValue={candidate.follow_up_date ?? undefined}
                min={today}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value) onReschedule(candidate.id, value);
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function FollowUpList({
  items,
  today,
}: {
  items: FollowUpItem[];
  today: string;
}) {
  // Optimistic removal: Erledigt and a future Verschieben both drop the row from
  // the surfaced set immediately; the server action then revalidates. The
  // reducer removes by id, so both mutations share one transition.
  const [optimisticItems, removeItem] = useOptimistic(
    items,
    (current: FollowUpItem[], removedId: string) =>
      current.filter((item) => item.candidate.id !== removedId),
  );

  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [descending, setDescending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const filtered = onlyOverdue
      ? optimisticItems.filter((item) => item.bucket === "overdue")
      : optimisticItems;
    return [...filtered].sort((a, b) => {
      const byDate = compareByFollowUpDate(a.candidate, b.candidate);
      return descending ? -byDate : byDate;
    });
  }, [optimisticItems, onlyOverdue, descending]);

  function handleComplete(id: string): void {
    startTransition(async () => {
      setError(null);
      removeItem(id);
      const result = await completeFollowUp(id);
      if (result?.error) setError(result.error);
    });
  }

  function handleReschedule(id: string, date: string): void {
    startTransition(async () => {
      setError(null);
      // A reschedule into the future leaves the surfaced set; drop it
      // optimistically. The revalidate re-buckets if it stays surfaced.
      if (date > today) removeItem(id);
      const result = await rescheduleFollowUp(id, date);
      if (result?.error) setError(result.error);
    });
  }

  const total = optimisticItems.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
            Wiedervorlage
          </h1>
          <p className="text-sm text-text-secondary">
            {total} offene {total === 1 ? "Aufgabe" : "Aufgaben"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary">
            <Switch
              checked={onlyOverdue}
              onCheckedChange={setOnlyOverdue}
              aria-label="Nur überfällige"
            />
            Nur überfällige
          </label>
          <Button
            variant="outline"
            size="default"
            onClick={() => setDescending((value) => !value)}
          >
            <ArrowUpDown className="size-4" aria-hidden="true" />
            Sortieren
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--color-destructive)]">{error}</p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-dashed)] px-4 py-12 text-center text-sm text-text-secondary">
          Keine fälligen Wiedervorlagen
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {SECTIONS.map((section) => {
            const rows = visible.filter((item) => item.bucket === section.bucket);
            if (rows.length === 0) return null;
            const Icon = section.icon;
            return (
              <section key={section.bucket} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Icon
                    className="size-5 shrink-0"
                    style={{ color: section.accent }}
                    aria-hidden="true"
                  />
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    {section.title}
                  </h2>
                  <CountBadge
                    tone={section.bucket === "overdue" ? "alert" : "neutral"}
                  >
                    {rows.length}
                  </CountBadge>
                </div>
                <div className="divide-y divide-border rounded-[var(--radius-md)] border border-border bg-[var(--color-card)] shadow-[var(--shadow-sm)]">
                  {rows.map((item) => (
                    <TaskRow
                      key={item.candidate.id}
                      item={item}
                      today={today}
                      onComplete={handleComplete}
                      onReschedule={handleReschedule}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
