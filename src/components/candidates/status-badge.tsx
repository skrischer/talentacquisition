import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { candidateStatusLabels } from "@/lib/candidates/labels";
import type { Enums } from "@/lib/supabase/types";

// active = in play (primary), hired = positive terminal (secondary),
// rejected = destructive, talent_pool = parked-but-noteworthy (accent),
// on_hold / withdrawn = low-emphasis neutral.
const statusVariants: Record<Enums<"candidate_status">, BadgeVariant> = {
  active: "primary",
  on_hold: "neutral",
  hired: "secondary",
  rejected: "destructive",
  talent_pool: "accent",
  withdrawn: "neutral",
};

export function StatusBadge({ status }: { status: Enums<"candidate_status"> }) {
  return (
    <Badge variant={statusVariants[status]}>
      {candidateStatusLabels[status]}
    </Badge>
  );
}
