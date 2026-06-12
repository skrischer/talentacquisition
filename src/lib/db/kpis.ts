// Typed, server-side KPI readers over the Phase 6 aggregate views, on the
// RLS-scoped server Supabase client (constitution principle 6: no service-role
// key, all access server-side). Each KPI is read as a single SQL aggregate
// from its view (principle 7) — never recomputed by a per-bucket client
// round-trip. The views return (category, count) rows; ordering is applied
// here at query time. German labels are applied by the dashboard card layer
// from the Phase 3 enum label maps, not in this data layer.

import { bucketFor, type IsoDate } from "@/lib/candidates/follow-up";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/types";

export type ApplicationsPerMonth = Tables<"kpi_applications_per_month">;
export type ApplicationsBySource = Tables<"kpi_by_source">;
export type ApplicationsByPriority = Tables<"kpi_by_priority">;
export type ApplicationsByStatus = Tables<"kpi_by_status">;
export type RejectionsByReason = Tables<"kpi_by_rejection_reason">;

// The whole KPI set, the shape the dashboard page reads in one call.
export type DashboardKpis = {
  applicationsPerMonth: ApplicationsPerMonth[];
  bySource: ApplicationsBySource[];
  byPriority: ApplicationsByPriority[];
  byStatus: ApplicationsByStatus[];
  byRejectionReason: RejectionsByReason[];
};

// Rolling last 12 months (the view bounds the window), oldest month first for a
// left-to-right time series.
export async function getApplicationsPerMonth(): Promise<
  ApplicationsPerMonth[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_applications_per_month")
    .select("*")
    .order("month", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getApplicationsBySource(): Promise<
  ApplicationsBySource[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_by_source")
    .select("*")
    .order("application_source", { ascending: true });
  if (error) throw error;
  return data;
}

// Includes the null (untriaged) bucket; it sorts last so the A/B/C/D values
// lead.
export async function getApplicationsByPriority(): Promise<
  ApplicationsByPriority[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_by_priority")
    .select("*")
    .order("priority", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function getApplicationsByStatus(): Promise<
  ApplicationsByStatus[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_by_status")
    .select("*")
    .order("status", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRejectionsByReason(): Promise<RejectionsByReason[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_by_rejection_reason")
    .select("*")
    .order("rejection_reason", { ascending: true });
  if (error) throw error;
  return data;
}

// Just the follow_up_date column, for the stat-row bucket tally — the same
// minimal projection the nav overdue count uses, so the dashboard classifies
// follow-ups without loading whole candidate rows.
async function listFollowUpDates(): Promise<(IsoDate | null)[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate")
    .select("follow_up_date");
  if (error) throw error;
  return data.map((row) => row.follow_up_date);
}

// One round-trip set for the dashboard: the five aggregates read in parallel.
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [
    applicationsPerMonth,
    bySource,
    byPriority,
    byStatus,
    byRejectionReason,
  ] = await Promise.all([
    getApplicationsPerMonth(),
    getApplicationsBySource(),
    getApplicationsByPriority(),
    getApplicationsByStatus(),
    getRejectionsByReason(),
  ]);
  return {
    applicationsPerMonth,
    bySource,
    byPriority,
    byStatus,
    byRejectionReason,
  };
}

// The dashboard KPI stat-row figures, all derived from the existing Phase-6
// views plus the Phase-5 follow-up classification — no new SQL, no new view.
// Each figure is the closest faithful read the existing aggregates allow:
// where a true cross-tab (active ∩ priority A) is not a shipped view, the
// honest single-view figures are surfaced (the A total over the active total)
// rather than inventing a query.
export type DashboardStats = {
  // Current calendar month application count and the month-over-month delta as
  // a signed percentage (null when there is no prior month to compare).
  currentMonth: { label: string; count: number; deltaPercent: number | null };
  // Priority-A candidates (kpi_by_priority) over the active candidate total
  // (kpi_by_status), the denominator the screen frames the A count against.
  priorityA: { count: number; activeTotal: number };
  // Open follow-ups: overdue leads, due-today is the secondary line — the same
  // Phase-5 buckets the nav badge and the Wiedervorlage card use.
  followUps: { overdue: number; dueToday: number };
  // Hired candidates (kpi_by_status, status "hired") and the calendar year the
  // figure is framed for.
  hired: { count: number; year: number };
  // Rejection rate: rejected over all candidates as a 0-100 percentage
  // (kpi_by_status), null when there are no candidates yet.
  rejectionRatePercent: number | null;
};

// "active" candidate statuses for the A-candidate denominator — the in-process
// states, excluding the terminal/parked ones (hired, rejected, withdrawn,
// talent_pool). on_hold counts as active (still in the pipeline, just paused).
const ACTIVE_STATUSES = new Set<Enums<"candidate_status">>([
  "active",
  "on_hold",
]);

export async function getDashboardStats(today: IsoDate): Promise<DashboardStats> {
  const [perMonth, byPriority, byStatus, followUpRows] = await Promise.all([
    getApplicationsPerMonth(),
    getApplicationsByPriority(),
    getApplicationsByStatus(),
    listFollowUpDates(),
  ]);

  // Current month is the last (newest) bucket of the rolling window; the prior
  // month is the one before it. The view omits empty months, so compare by the
  // adjacent buckets it returns, not by a fixed index.
  const lastBucket = perMonth.at(-1) ?? null;
  const prevBucket = perMonth.at(-2) ?? null;
  const currentCount = lastBucket?.count ?? 0;
  const prevCount = prevBucket?.count ?? 0;
  const deltaPercent =
    prevCount > 0 ? Math.round(((currentCount - prevCount) / prevCount) * 100) : null;
  const monthLabel = lastBucket?.month
    ? new Intl.DateTimeFormat("de-DE", { month: "long" }).format(
        new Date(`${lastBucket.month}T00:00:00`),
      )
    : "";

  const priorityACount =
    byPriority.find((row) => row.priority === "a")?.count ?? 0;
  const activeTotal = byStatus
    .filter((row) => row.status !== null && ACTIVE_STATUSES.has(row.status))
    .reduce((sum, row) => sum + (row.count ?? 0), 0);

  const hiredCount = byStatus.find((row) => row.status === "hired")?.count ?? 0;
  const rejectedCount =
    byStatus.find((row) => row.status === "rejected")?.count ?? 0;
  const totalCount = byStatus.reduce((sum, row) => sum + (row.count ?? 0), 0);
  const rejectionRatePercent =
    totalCount > 0 ? Math.round((rejectedCount / totalCount) * 100) : null;

  let overdue = 0;
  let dueToday = 0;
  for (const date of followUpRows) {
    const bucket = bucketFor(date, today);
    if (bucket === "overdue") overdue += 1;
    else if (bucket === "due_today") dueToday += 1;
  }

  return {
    currentMonth: { label: monthLabel, count: currentCount, deltaPercent },
    priorityA: { count: priorityACount, activeTotal },
    followUps: { overdue, dueToday },
    hired: { count: hiredCount, year: Number(today.slice(0, 4)) },
    rejectionRatePercent,
  };
}
