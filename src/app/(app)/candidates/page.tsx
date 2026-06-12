import Link from "next/link";

import { CandidateTable } from "@/components/candidates/candidate-table";
import { Button } from "@/components/ui/button";
import { list } from "@/lib/db/candidates";

// The candidates list. A server component: it loads every row through the
// RLS-scoped server client (the (app) layout guard ensures a session), then
// hands them to the client table for search/filter/sort without a round-trip.
export default async function CandidatesPage() {
  const candidates = await list();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
          Bewerber
        </h1>
        <Button render={<Link href="/candidates/new" />}>Neuer Bewerber</Button>
      </div>
      <CandidateTable candidates={candidates} />
    </div>
  );
}
