import * as React from "react";

import { cn } from "@/lib/utils";

// Styleguide progress bar (retention countdown): a rounded track with a
// secondary fill. `value` is a 0-100 percentage. All colours are design tokens
// (constitution principle 8).
function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value: number;
  indicatorClassName?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="progress"
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-subtle)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-secondary transition-[width]",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
