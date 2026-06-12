import Link from "next/link";

import { ReviewRowActions } from "@/components/dashboard/review-row-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listDueReviews } from "@/lib/db/retention";

const EMPTY_LABEL = "Keine fälligen Löschprüfungen";

// DD.MM.YYYY from the ISO date parts (matches the candidate detail view).
function formatDate(value: string): string {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

// The dashboard "Löschprüfung" card: a distinct server-read view (principle 6)
// of the open retention-review queue. Each row links to the candidate and offers
// the three resolutions (extend / keep / anonymize).
export async function DeletionReviewCard() {
  const due = await listDueReviews();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Löschprüfung fällig</CardTitle>
      </CardHeader>
      <CardContent>
        {due.length === 0 ? (
          <p className="text-sm text-text-secondary">{EMPTY_LABEL}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {due.map((review) => (
              <li
                key={review.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/candidates/${review.candidateId}`}
                  className="-mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-bg-alt sm:flex-1"
                >
                  <span className="font-medium">
                    {review.firstName} {review.lastName}
                  </span>
                  <span className="shrink-0 text-sm text-text-secondary tabular-nums">
                    fällig {formatDate(review.dueDate)}
                  </span>
                </Link>
                <ReviewRowActions
                  reviewId={review.id}
                  candidateId={review.candidateId}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
