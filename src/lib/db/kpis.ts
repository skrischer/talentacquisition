// Typed, server-side KPI readers over the Phase 6 aggregate views, on the
// RLS-scoped server Supabase client (constitution principle 6: no service-role
// key, all access server-side). Each KPI is read as a single SQL aggregate
// from its view (principle 7) — never recomputed by a per-bucket client
// round-trip. The views return (category, count) rows; ordering is applied
// here at query time. German labels are applied by the dashboard card layer
// from the Phase 3 enum label maps, not in this data layer.

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

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
