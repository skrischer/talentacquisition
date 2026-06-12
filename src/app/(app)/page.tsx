import type { Metadata } from "next";

import {
  ApplicationsByPriorityCard,
  ApplicationsBySourceCard,
  ApplicationsByStatusCard,
  ApplicationsPerMonthCard,
  RejectionsByReasonCard,
} from "@/components/dashboard/kpi-cards";
import { FollowUpCard } from "@/components/dashboard/follow-up-card";
import { getDashboardKpis } from "@/lib/db/kpis";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const kpis = await getDashboardKpis();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
        Dashboard
      </h1>
      {/* The actionable follow-up surface leads; the KPI cards follow. Each is a
          distinct server-read view with no shared state. */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <FollowUpCard />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <ApplicationsPerMonthCard data={kpis.applicationsPerMonth} />
        </div>
        <ApplicationsBySourceCard data={kpis.bySource} />
        <ApplicationsByPriorityCard data={kpis.byPriority} />
        <ApplicationsByStatusCard data={kpis.byStatus} />
        <RejectionsByReasonCard data={kpis.byRejectionReason} />
      </div>
    </div>
  );
}
