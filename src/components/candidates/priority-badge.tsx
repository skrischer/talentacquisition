import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { candidatePriorityLabels } from "@/lib/candidates/labels";
import type { Enums } from "@/lib/supabase/types";

// A is the highest screening value and should stand out (accent), descending
// to a low-emphasis D (neutral). priority is nullable on the row; callers
// render this only when a priority is set.
const priorityVariants: Record<Enums<"candidate_priority">, BadgeVariant> = {
  a: "accent",
  b: "primary",
  c: "secondary",
  d: "neutral",
};

export function PriorityBadge({
  priority,
}: {
  priority: Enums<"candidate_priority">;
}) {
  return (
    <Badge variant={priorityVariants[priority]}>
      {candidatePriorityLabels[priority]}
    </Badge>
  );
}
