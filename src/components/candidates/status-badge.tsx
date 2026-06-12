import { cva } from "class-variance-authority";

import { candidateStatusLabels } from "@/lib/candidates/labels";
import type { Enums } from "@/lib/supabase/types";

// Styleguide status badge: a tinted pill with a leading status dot. Each status
// owns a background, a dot colour (set via the `--dot` custom property) and a
// text colour — all design tokens (constitution principle 8). The six values
// cover the full candidate_status enum; copy stays the current labels (label
// reconciliation is Phase 10).
const statusBadge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-[11px] py-1 text-[13px] font-semibold leading-4",
  {
    variants: {
      status: {
        active:
          "bg-[var(--color-status-active-bg)] text-primary [--dot:var(--color-secondary)]",
        on_hold:
          "bg-[var(--color-warning-bg)] text-[var(--color-warning)] [--dot:var(--color-warning)]",
        hired:
          "bg-[var(--color-success-bg)] text-[var(--color-success)] [--dot:var(--color-success)]",
        rejected:
          "bg-[var(--color-destructive-bg)] text-destructive [--dot:var(--color-destructive)]",
        talent_pool:
          "bg-[var(--color-status-talentpool-bg)] text-[var(--color-status-talentpool-fg)] [--dot:var(--color-secondary-light)]",
        withdrawn:
          "bg-[var(--color-status-neutral-bg)] text-text-secondary [--dot:var(--color-border-hover)]",
      },
    },
  },
);

export function StatusBadge({ status }: { status: Enums<"candidate_status"> }) {
  return (
    <span className={statusBadge({ status })}>
      <span className="size-[7px] shrink-0 rounded-full bg-[var(--dot)]" />
      {candidateStatusLabels[status]}
    </span>
  );
}
