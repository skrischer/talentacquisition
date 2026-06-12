import Link from "next/link";
import { notFound } from "next/navigation";

import { CandidateForm } from "@/components/candidates/candidate-form";
import { getById } from "@/lib/db/candidates";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getById(id);
  if (!candidate) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/candidates/${candidate.id}`}
          className="text-sm text-[var(--color-secondary)] underline-offset-4 hover:underline"
        >
          ← Zurück zur Detailansicht
        </Link>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
          {candidate.last_name}, {candidate.first_name} bearbeiten
        </h1>
      </div>
      <CandidateForm candidate={candidate} />
    </div>
  );
}
