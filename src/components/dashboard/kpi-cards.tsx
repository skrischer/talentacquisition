// The five KPI cards, one per Phase 6 view. Each maps the typed view rows into
// label/value pairs — reusing the Phase 3 enum label maps as the single German
// label source (no parallel labels) — and renders the shared KpiBarCard. These
// are presentational: the dashboard page reads the views server-side
// (principle 6) and passes the typed results in.

import {
  applicationSourceLabels,
  candidatePriorityLabels,
  candidateStatusLabels,
  rejectionReasonLabels,
} from "@/lib/candidates/labels";
import type {
  ApplicationsByPriority,
  ApplicationsBySource,
  ApplicationsByStatus,
  ApplicationsPerMonth,
  RejectionsByReason,
} from "@/lib/db/kpis";

import { KpiBarCard } from "./kpi-bar-card";

const EMPTY_LABEL = "Noch keine Bewerbungen erfasst";
const UNKNOWN_LABEL = "Unbekannt";
const UNTRIAGED_LABEL = "Ohne Priorität";

// Format an ISO month (the view's date_trunc result, e.g. "2026-06-01") as a
// German "Monat Jahr" label. Built from the date parts so it never shifts a
// month across a timezone boundary.
function formatMonth(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function ApplicationsPerMonthCard({
  data,
}: {
  data: ApplicationsPerMonth[];
}) {
  const rows = data.map((row) => ({
    label: row.month ? formatMonth(row.month) : UNKNOWN_LABEL,
    value: row.count ?? 0,
  }));
  return (
    <KpiBarCard
      title="Bewerbungen pro Monat"
      description="Rollierende letzte 12 Monate"
      data={rows}
      colorVar="var(--chart-2)"
      emptyLabel={EMPTY_LABEL}
    />
  );
}

export function ApplicationsBySourceCard({
  data,
}: {
  data: ApplicationsBySource[];
}) {
  const rows = data.map((row) => ({
    label: row.application_source
      ? applicationSourceLabels[row.application_source]
      : UNKNOWN_LABEL,
    value: row.count ?? 0,
  }));
  return (
    <KpiBarCard
      title="Bewerbungen nach Quelle"
      data={rows}
      colorVar="var(--chart-1)"
      emptyLabel={EMPTY_LABEL}
    />
  );
}

export function ApplicationsByPriorityCard({
  data,
}: {
  data: ApplicationsByPriority[];
}) {
  const rows = data.map((row) => ({
    label: row.priority
      ? candidatePriorityLabels[row.priority]
      : UNTRIAGED_LABEL,
    value: row.count ?? 0,
  }));
  return (
    <KpiBarCard
      title="Bewerbungen nach Priorität"
      data={rows}
      colorVar="var(--chart-3)"
      emptyLabel={EMPTY_LABEL}
    />
  );
}

export function ApplicationsByStatusCard({
  data,
}: {
  data: ApplicationsByStatus[];
}) {
  const rows = data.map((row) => ({
    label: row.status ? candidateStatusLabels[row.status] : UNKNOWN_LABEL,
    value: row.count ?? 0,
  }));
  return (
    <KpiBarCard
      title="Bewerbungen nach Status"
      data={rows}
      colorVar="var(--chart-1)"
      emptyLabel={EMPTY_LABEL}
    />
  );
}

export function RejectionsByReasonCard({
  data,
}: {
  data: RejectionsByReason[];
}) {
  const rows = data.map((row) => ({
    label: row.rejection_reason
      ? rejectionReasonLabels[row.rejection_reason]
      : UNKNOWN_LABEL,
    value: row.count ?? 0,
  }));
  return (
    <KpiBarCard
      title="Absagen nach Grund"
      data={rows}
      colorVar="var(--chart-4)"
      emptyLabel="Noch keine Absagen erfasst"
    />
  );
}
