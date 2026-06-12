"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  anonymizeReview,
  extendReview,
  keepReview,
} from "@/lib/retention/actions";

const ANONYMIZE_CONFIRM =
  "Diesen Kandidaten anonymisieren? Die personenbezogenen Daten werden unwiderruflich entfernt.";

export function ReviewRowActions({
  reviewId,
  candidateId,
}: {
  reviewId: string;
  candidateId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError("Aktion fehlgeschlagen. Bitte erneut versuchen.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(async () => {
            await extendReview(reviewId);
            router.push(`/candidates/${candidateId}/edit`);
          })
        }
      >
        Verlängern
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => keepReview(reviewId))}
      >
        Behalten
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (window.confirm(ANONYMIZE_CONFIRM)) {
            run(() => anonymizeReview(reviewId, candidateId));
          }
        }}
      >
        Anonymisieren
      </Button>
      {error && (
        <span className="text-xs text-[var(--color-destructive)]">{error}</span>
      )}
    </div>
  );
}
