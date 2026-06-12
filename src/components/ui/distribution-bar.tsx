import * as React from "react";

import { cn } from "@/lib/utils";

// Styleguide distribution-bar row (dashboard "Nach Quelle / Prioritaet /
// Status"): a clamped label, a proportional bar, and a right-aligned count.
// `value` is a 0-100 percentage; the fill defaults to primary and can be
// re-coloured per bucket. All colours are design tokens (principle 8).
function DistributionBar({
  label,
  value,
  count,
  className,
  barClassName,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode;
  value: number;
  count: React.ReactNode;
  barClassName?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <span className="w-32 shrink-0 truncate text-[13px] text-text-secondary">
        {label}
      </span>
      <div className="h-[9px] grow overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
        <div
          className={cn("h-full rounded-full bg-primary", barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[13px] font-semibold text-foreground">
        {count}
      </span>
    </div>
  );
}

export { DistributionBar };
