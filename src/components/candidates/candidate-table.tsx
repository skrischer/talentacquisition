"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Check, ChevronDown, LayoutGrid, List, MoreVertical } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { CountBadge } from "@/components/ui/count-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bucketFor, isSurfacedBucket } from "@/lib/candidates/follow-up";
import {
  applicationSourceLabels,
  applicationSourceOptions,
  candidatePriorityOptions,
  candidateStatusOptions,
  nursingQualificationLabels,
  pipelineStageOptions,
} from "@/lib/candidates/labels";
import type { Candidate } from "@/lib/db/candidates";
import { cn } from "@/lib/utils";

import { PriorityBadge } from "./priority-badge";
import { StageBadge } from "./stage-badge";
import { StatusBadge } from "./status-badge";

const PAGE_SIZE = 8;

function initials(candidate: Candidate): string {
  return `${candidate.first_name[0] ?? ""}${candidate.last_name[0] ?? ""}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

// The follow-up cell: the formatted date, emphasised in the destructive tone
// when overdue / due today. Classification reuses the same `bucketFor` the
// dashboard card uses — one source, no second date parse.
function FollowUpDateCell({
  followUpDate,
  today,
}: {
  followUpDate: string | null;
  today: string;
}) {
  const bucket = bucketFor(followUpDate, today);
  const surfaced = isSurfacedBucket(bucket);
  const overdueOrToday = bucket === "overdue" || bucket === "due_today";
  return (
    <span
      className={
        overdueOrToday
          ? "font-semibold text-destructive"
          : surfaced
            ? "font-medium text-[var(--color-text)]"
            : "text-text-muted"
      }
    >
      {bucket === "due_today" ? "Heute" : formatDate(followUpDate)}
    </span>
  );
}

// A multi-select filter chip: a token-styled trigger that opens a checkbox menu
// and carries a count badge once at least one option is picked. Items keep the
// menu open on click (`closeOnClick={false}`) so several values can be toggled
// in one pass.
function FilterDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  selected: Set<T>;
  onChange: (next: Set<T>) => void;
}) {
  function toggle(value: T) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:ring-2 focus-visible:ring-secondary data-[popup-open]:border-secondary",
          selected.size > 0 && "border-secondary",
        )}
      >
        {label}
        {selected.size > 0 && (
          <CountBadge tone="primary">{selected.size}</CountBadge>
        )}
        <ChevronDown className="size-4 text-text-secondary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option) => {
          const checked = selected.has(option.value);
          return (
            <DropdownMenuItem
              key={option.value}
              closeOnClick={false}
              onClick={() => toggle(option.value)}
              className="justify-between"
            >
              {option.label}
              <span className="flex size-4 shrink-0 items-center justify-center text-secondary">
                {checked && <Check className="size-4" />}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// The Liste / Board view toggle: a segmented control. Liste is the current
// route; Board links to the pipeline board.
function ViewToggle() {
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-border bg-bg-subtle p-1">
      <span className="inline-flex items-center gap-1.5 rounded-[7px] bg-card px-3 py-1.5 text-[13px] font-semibold text-foreground shadow-[var(--shadow-sm)]">
        <List className="size-4" />
        Liste
      </span>
      <Link
        href="/board"
        className="inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[13px] font-semibold text-text-secondary transition-colors hover:text-foreground"
      >
        <LayoutGrid className="size-4" />
        Board
      </Link>
    </div>
  );
}

export function CandidateTable({
  candidates,
  today,
  initialSearch = "",
}: {
  candidates: Candidate[];
  today: string;
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // All active filters are AND-composed; within a filter the picked values are
  // OR-ed (a row matches if its value is among the selected). An empty set means
  // "all".
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesQuery =
        query === "" ||
        `${candidate.first_name} ${candidate.last_name}`
          .toLowerCase()
          .includes(query) ||
        (candidate.email?.toLowerCase().includes(query) ?? false);
      const matchesStage =
        stageFilter.size === 0 || stageFilter.has(candidate.stage);
      const matchesStatus =
        statusFilter.size === 0 || statusFilter.has(candidate.status);
      const matchesPriority =
        priorityFilter.size === 0 ||
        (candidate.priority !== null && priorityFilter.has(candidate.priority));
      const matchesSource =
        sourceFilter.size === 0 ||
        sourceFilter.has(candidate.application_source);
      return (
        matchesQuery &&
        matchesStage &&
        matchesStatus &&
        matchesPriority &&
        matchesSource
      );
    });
  }, [
    candidates,
    search,
    stageFilter,
    statusFilter,
    priorityFilter,
    sourceFilter,
  ]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstRow = rows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(currentPage * PAGE_SIZE, rows.length);

  const isFiltered =
    search !== "" ||
    stageFilter.size > 0 ||
    statusFilter.size > 0 ||
    priorityFilter.size > 0 ||
    sourceFilter.size > 0;

  // A filter change can shrink the result set below the current page; snap back
  // to page 1 whenever a filter or the search mutates.
  function withReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function reset() {
    setSearch("");
    setStageFilter(new Set());
    setStatusFilter(new Set());
    setPriorityFilter(new Set());
    setSourceFilter(new Set());
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: a mobile-only search, the filter chips + Zuruecksetzen, and
          the Liste/Board toggle. */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => withReset(setSearch)(event.target.value)}
          placeholder="Name, E-Mail ..."
          aria-label="Bewerber suchen"
          className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-card px-3 text-sm outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary md:hidden"
        />
        <FilterDropdown
          label="Phase"
          options={pipelineStageOptions}
          selected={stageFilter}
          onChange={withReset(setStageFilter)}
        />
        <FilterDropdown
          label="Status"
          options={candidateStatusOptions}
          selected={statusFilter}
          onChange={withReset(setStatusFilter)}
        />
        <FilterDropdown
          label="Priorität"
          options={candidatePriorityOptions}
          selected={priorityFilter}
          onChange={withReset(setPriorityFilter)}
        />
        <FilterDropdown
          label="Quelle"
          options={applicationSourceOptions}
          selected={sourceFilter}
          onChange={withReset(setSourceFilter)}
        />
        {isFiltered && (
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer text-sm font-medium text-secondary underline-offset-4 hover:underline"
          >
            Zurücksetzen
          </button>
        )}
        <div className="ml-auto">
          <ViewToggle />
        </div>
      </div>

      {/* Desktop: table card. */}
      <div className="hidden rounded-[var(--radius-md)] border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bewerber</TableHead>
              <TableHead>Quelle</TableHead>
              <TableHead>Qualifikation</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prio</TableHead>
              <TableHead>Wiedervorlage</TableHead>
              <TableHead className="w-12" aria-label="Aktionen" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-text-muted"
                >
                  Keine Bewerber gefunden.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" initials={initials(candidate)} />
                      <div className="flex flex-col">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="font-semibold text-foreground hover:text-secondary hover:underline"
                        >
                          {candidate.first_name} {candidate.last_name}
                        </Link>
                        <span className="text-[13px] text-text-muted">
                          {candidate.email ?? candidate.phone ?? "—"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {applicationSourceLabels[candidate.application_source]}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {candidate.nursing_qualification
                      ? nursingQualificationLabels[
                          candidate.nursing_qualification
                        ]
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={candidate.stage} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={candidate.priority} />
                  </TableCell>
                  <TableCell>
                    <FollowUpDateCell
                      followUpDate={candidate.follow_up_date}
                      today={today}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-secondary outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-secondary"
                        aria-label="Aktionen"
                      >
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          render={<Link href={`/candidates/${candidate.id}`} />}
                        >
                          Öffnen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/candidates/${candidate.id}/edit`} />
                          }
                        >
                          Bearbeiten
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards. */}
      <div className="flex flex-col gap-3 md:hidden">
        {pageRows.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-border bg-card py-10 text-center text-text-muted">
            Keine Bewerber gefunden.
          </p>
        ) : (
          pageRows.map((candidate) => (
            <Link
              key={candidate.id}
              href={`/candidates/${candidate.id}`}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-card p-4 transition-colors hover:border-[var(--color-border-hover)]"
            >
              <div className="flex items-start gap-3">
                <Avatar initials={initials(candidate)} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold text-foreground">
                    {candidate.first_name} {candidate.last_name}
                  </span>
                  <span className="truncate text-[13px] text-text-muted">
                    {candidate.email ?? candidate.phone ?? "—"}
                  </span>
                </div>
                <PriorityBadge priority={candidate.priority} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StageBadge stage={candidate.stage} />
                <StatusBadge status={candidate.status} />
              </div>
              <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-sm">
                <span className="truncate text-text-secondary">
                  {candidate.next_step ?? "Kein nächster Schritt"}
                </span>
                <FollowUpDateCell
                  followUpDate={candidate.follow_up_date}
                  today={today}
                />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer: result range + client-side pagination. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-text-muted">
          {firstRow}–{lastRow} von {rows.length} Bewerbern
        </span>
        {pageCount > 1 && (
          <Pagination>
            <PaginationPrevious
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
                <PaginationPage
                  key={number}
                  active={number === currentPage}
                  onClick={() => setPage(number)}
                >
                  {number}
                </PaginationPage>
              ),
            )}
            <PaginationNext
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
            />
          </Pagination>
        )}
      </div>
    </div>
  );
}
