import Link from "next/link";

import { CandidateForm } from "@/components/candidates/candidate-form";

export default function NewCandidatePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/candidates"
          className="text-sm text-[var(--color-secondary)] underline-offset-4 hover:underline"
        >
          ← Zurück zur Liste
        </Link>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
          Neuer Bewerber
        </h1>
      </div>
      <CandidateForm />
    </div>
  );
}
