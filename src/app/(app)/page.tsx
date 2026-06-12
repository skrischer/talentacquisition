import Link from "next/link";

import type { Metadata } from "next";

import { CircleCheck, Clock, FileText, Plus, Star, TrendingDown } from "lucide-react";

import { DeletionReviewCard } from "@/components/dashboard/deletion-review-card";
import { FollowUpCard } from "@/components/dashboard/follow-up-card";
import {
  ApplicationsByPriorityCard,
  ApplicationsBySourceCard,
  ApplicationsByStatusCard,
  ApplicationsPerMonthCard,
} from "@/components/dashboard/kpi-cards";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { resolveToday } from "@/lib/candidates/follow-up";
import { getDashboardKpis, getDashboardStats } from "@/lib/db/kpis";

export const metadata: Metadata = {
  title: "Dashboard",
};

const DASH = "—";

// Capitalize the German month name (Intl returns it lowercase mid-sentence on
// some runtimes; the header wants "Juni", not "juni").
function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export default async function DashboardPage() {
  const today = resolveToday();
  const [kpis, stats] = await Promise.all([
    getDashboardKpis(),
    getDashboardStats(today),
  ]);

  const todayLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${today}T00:00:00`));

  const { currentMonth, priorityA, followUps, hired, rejectionRatePercent } =
    stats;
  const monthDelta =
    currentMonth.deltaPercent === null
      ? null
      : `${currentMonth.deltaPercent >= 0 ? "+" : ""}${currentMonth.deltaPercent}% ggü. Vormonat`;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header — title + date, with the create-candidate CTA. */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-[family-name:var(--font-heading)] text-[28px] leading-tight font-bold text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary">{todayLabel}</p>
        </div>
        <Button render={<Link href="/candidates/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          Bewerber anlegen
        </Button>
      </div>

      {/* KPI stat row — five figures derived from the existing views (no SQL). */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          icon={FileText}
          label={`Bewerbungen im ${capitalize(currentMonth.label)}`.trimEnd()}
          figure={currentMonth.count}
          delta={monthDelta ?? undefined}
          deltaTone={
            currentMonth.deltaPercent !== null && currentMonth.deltaPercent < 0
              ? "negative"
              : "positive"
          }
        />
        <StatCard
          icon={Star}
          label="A-Kandidaten aktiv"
          figure={priorityA.count}
          delta={`von ${priorityA.activeTotal} aktiven Bewerbern`}
          deltaTone="neutral"
        />
        <StatCard
          icon={Clock}
          label="Wiedervorlagen überfällig"
          figure={followUps.overdue}
          delta={`heute fällig: ${followUps.dueToday}`}
          deltaTone={followUps.overdue > 0 ? "negative" : "neutral"}
        />
        <StatCard
          icon={CircleCheck}
          label={`Eingestellt ${hired.year}`}
          figure={hired.count}
        />
        <StatCard
          icon={TrendingDown}
          label="Absagequote"
          figure={
            rejectionRatePercent === null ? DASH : `${rejectionRatePercent}%`
          }
        />
      </div>

      {/* Chart + the actionable Wiedervorlage surface, side by side on wide
          viewports (the chart leads at ~2:1). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApplicationsPerMonthCard data={kpis.applicationsPerMonth} />
        </div>
        <FollowUpCard />
      </div>

      {/* The three distribution cards. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ApplicationsBySourceCard data={kpis.bySource} />
        <ApplicationsByPriorityCard data={kpis.byPriority} />
        <ApplicationsByStatusCard data={kpis.byStatus} />
      </div>

      {/* Retention review queue (Phase 7). */}
      <DeletionReviewCard />
    </div>
  );
}
