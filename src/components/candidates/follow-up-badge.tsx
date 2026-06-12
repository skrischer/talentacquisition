import { Badge, type BadgeVariant } from "@/components/ui/badge";
import {
  followUpBucketLabels,
  type SurfacedFollowUpBucket,
} from "@/lib/candidates/follow-up";

// The shared follow-up (Wiedervorlage) marker, reused by the dashboard card and
// the candidate-list treatment. It renders only the three surfaced buckets; the
// caller classifies via `bucketFor` and narrows with `isSurfacedBucket`, so this
// component stays the single rendering of a bucket, not a second date parse.
//
// overdue is the most urgent (destructive), due_today draws the eye (accent),
// due_this_week is noted but lower-emphasis (primary) — all from design tokens
// (constitution principle 8).
const bucketVariants: Record<SurfacedFollowUpBucket, BadgeVariant> = {
  overdue: "destructive",
  due_today: "accent",
  due_this_week: "primary",
};

export function FollowUpBadge({ bucket }: { bucket: SurfacedFollowUpBucket }) {
  return (
    <Badge variant={bucketVariants[bucket]}>
      {followUpBucketLabels[bucket]}
    </Badge>
  );
}
