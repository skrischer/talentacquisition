"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  applicationSourceLabels,
  candidatePriorityOptions,
  candidateStatusLabels,
  candidateStatusOptions,
  pipelineStageLabels,
} from "@/lib/candidates/labels";
import type { Candidate } from "@/lib/db/candidates";

import { PriorityBadge } from "./priority-badge";
import { StageBadge } from "./stage-badge";
import { StatusBadge } from "./status-badge";

type SortKey =
  | "name"
  | "source"
  | "stage"
  | "status"
  | "priority"
  | "follow_up_date";

type SortDir = "asc" | "desc";

// Returns the comparison key for a column, or null when the row has no value
// for it (priority / follow-up); the comparator keeps nulls last in both
// directions.
function sortValue(candidate: Candidate, key: SortKey): string | null {
  switch (key) {
    case "name":
      return `${candidate.last_name} ${candidate.first_name}`.toLowerCase();
    case "source":
      return applicationSourceLabels[
        candidate.application_source
      ].toLowerCase();
    case "stage":
      return pipelineStageLabels[candidate.stage].toLowerCase();
    case "status":
      return candidateStatusLabels[candidate.status].toLowerCase();
    case "priority":
      return candidate.priority;
    case "follow_up_date":
      return candidate.follow_up_date;
  }
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

const controlClass =
  "h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-[var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-secondary)] focus-visible:outline-offset-2";

function SortHeader({
  label,
  columnKey,
  activeKey,
  direction,
  onToggle,
}: {
  label: string;
  columnKey: SortKey;
  activeKey: SortKey | null;
  direction: SortDir;
  onToggle: (key: SortKey) => void;
}) {
  const active = activeKey === columnKey;
  const Icon = !active
    ? ChevronsUpDown
    : direction === "asc"
      ? ArrowUp
      : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(columnKey)}
      className="inline-flex cursor-pointer items-center gap-1 font-medium text-text-secondary transition-colors hover:text-[var(--color-text)]"
      aria-label={`Nach ${label} sortieren`}
    >
      {label}
      <Icon
        className={
          active
            ? "size-3.5 text-[var(--color-primary)]"
            : "size-3.5 opacity-50"
        }
      />
    </button>
  );
}

export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  const [search, setSearch] = useState("");
  // Filter values are plain strings ("" = all) so the native <select> onChange
  // needs no enum cast; comparing an enum column to the string is sound.
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const matchesName =
        query === "" ||
        `${candidate.first_name} ${candidate.last_name}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "" || candidate.status === statusFilter;
      const matchesPriority =
        priorityFilter === "" || candidate.priority === priorityFilter;
      return matchesName && matchesStatus && matchesPriority;
    });

    if (!sortKey) return filtered;
    const direction = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      // Rows missing a value sort last regardless of direction.
      if (left === null && right === null) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      return left.localeCompare(right, "de") * direction;
    });
  }, [candidates, search, statusFilter, priorityFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function reset() {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  }

  const isFiltered =
    search !== "" || statusFilter !== "" || priorityFilter !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name suchen"
          className="h-9 max-w-xs py-0"
          aria-label="Bewerber nach Name suchen"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={controlClass}
          aria-label="Nach Status filtern"
        >
          <option value="">Alle Status</option>
          {candidateStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className={controlClass}
          aria-label="Nach Priorität filtern"
        >
          <option value="">Alle Prioritäten</option>
          {candidatePriorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isFiltered && (
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer text-sm text-[var(--color-secondary)] underline-offset-4 hover:underline"
          >
            Zurücksetzen
          </button>
        )}
        <span className="ml-auto text-sm text-text-muted">
          {rows.length} von {candidates.length}
        </span>
      </div>

      <div className="rounded-[var(--radius-md)] border border-border bg-[var(--color-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortHeader
                  label="Name"
                  columnKey="name"
                  activeKey={sortKey}
                  direction={sortDir}
                  onToggle={toggleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Quelle"
                  columnKey="source"
                  activeKey={sortKey}
                  direction={sortDir}
                  onToggle={toggleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Phase"
                  columnKey="stage"
                  activeKey={sortKey}
                  direction={sortDir}
                  onToggle={toggleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Status"
                  columnKey="status"
                  activeKey={sortKey}
                  direction={sortDir}
                  onToggle={toggleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Priorität"
                  columnKey="priority"
                  activeKey={sortKey}
                  direction={sortDir}
                  onToggle={toggleSort}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Wiedervorlage"
                  columnKey="follow_up_date"
                  activeKey={sortKey}
                  direction={sortDir}
                  onToggle={toggleSort}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-text-muted"
                >
                  Keine Bewerber gefunden.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {candidate.last_name}, {candidate.first_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {applicationSourceLabels[candidate.application_source]}
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={candidate.stage} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell>
                    {candidate.priority ? (
                      <PriorityBadge priority={candidate.priority} />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDate(candidate.follow_up_date)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
