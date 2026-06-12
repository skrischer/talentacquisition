import { cva } from "class-variance-authority";

import { candidatePriorityLabels } from "@/lib/candidates/labels";
import type { Enums } from "@/lib/supabase/types";

// Styleguide priority badge: a solid square chip carrying the A/B/C/D letter in
// Montserrat Bold. `priority` is nullable on the candidate row; a null renders
// the neutral "Nicht triagiert" chip — a dashed outline with an en dash, NOT an
// enum value. Descending screening weight: A (cta) -> D (neutral). All from
// design tokens (constitution principle 8).
const priorityChip = cva(
  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-heading)] text-[15px] font-bold leading-[18px]",
  {
    variants: {
      priority: {
        a: "bg-[var(--color-cta)] text-primary-foreground",
        b: "bg-[var(--color-cta-decorative)] text-primary-foreground",
        c: "bg-secondary text-primary-foreground",
        d: "bg-[var(--color-border-hover)] text-primary-foreground",
        none: "border border-dashed border-[var(--color-border-dashed)] bg-background text-[var(--color-border-hover)]",
      },
    },
  },
);

export function PriorityBadge({
  priority,
}: {
  priority: Enums<"candidate_priority"> | null;
}) {
  if (priority === null) {
    return (
      <span
        className={priorityChip({ priority: "none" })}
        aria-label="Nicht triagiert"
      >
        –
      </span>
    );
  }

  return (
    <span className={priorityChip({ priority })}>
      {candidatePriorityLabels[priority]}
    </span>
  );
}
