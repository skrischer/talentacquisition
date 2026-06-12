import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { pipelineStageLabels } from "@/lib/candidates/labels";
import type { Enums } from "@/lib/supabase/types";

// Pipeline progression: early stages stay neutral, the active middle is
// primary, an offer draws attention (accent), hired reads as the positive
// terminal (secondary).
const stageVariants: Record<Enums<"pipeline_stage">, BadgeVariant> = {
  new: "neutral",
  screening: "neutral",
  phone_screen: "primary",
  interview: "primary",
  trial_day: "primary",
  offer: "accent",
  hired: "secondary",
};

export function StageBadge({ stage }: { stage: Enums<"pipeline_stage"> }) {
  return (
    <Badge variant={stageVariants[stage]}>{pipelineStageLabels[stage]}</Badge>
  );
}
