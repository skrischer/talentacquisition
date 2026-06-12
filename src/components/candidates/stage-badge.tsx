import { cva } from "class-variance-authority";

import { pipelineStageLabels } from "@/lib/candidates/labels";
import type { Enums } from "@/lib/supabase/types";

// Styleguide pipeline-stage badge: an outline pill (white ground, hairline
// border, dark label) with a per-stage dot set via the `--dot` custom property.
// The positive terminal `hired` inverts to a filled primary pill with a green
// dot. All seven stages, all from design tokens (constitution principle 8).
const stageBadge = cva(
  "inline-flex items-center gap-[7px] rounded-full border px-3 py-[5px] text-[13px] font-semibold leading-4",
  {
    variants: {
      stage: {
        new: "border-border bg-background text-foreground [--dot:var(--color-stage-new-dot)]",
        screening:
          "border-border bg-background text-foreground [--dot:var(--color-stage-screening-dot)]",
        phone_screen:
          "border-border bg-background text-foreground [--dot:var(--color-secondary)]",
        interview:
          "border-border bg-background text-foreground [--dot:var(--color-secondary-light)]",
        trial_day:
          "border-border bg-background text-foreground [--dot:var(--color-cta-decorative)]",
        offer:
          "border-border bg-background text-foreground [--dot:var(--color-cta)]",
        hired:
          "border-primary bg-primary text-primary-foreground [--dot:var(--color-stage-hired-dot)]",
      },
    },
  },
);

export function StageBadge({ stage }: { stage: Enums<"pipeline_stage"> }) {
  return (
    <span className={stageBadge({ stage })}>
      <span className="size-[7px] shrink-0 rounded-full bg-[var(--dot)]" />
      {pipelineStageLabels[stage]}
    </span>
  );
}
