import * as React from "react";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide pipeline stepper: equal-width step columns over a connector line
// that fills to the current step. Completed nodes are secondary with a check,
// the current node is the cta with a soft ring, upcoming nodes are outlined.
// `current` is the 0-based index of the active step. All colours are design
// tokens (constitution principle 8).
function Stepper({
  steps,
  current,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  steps: string[];
  current: number;
}) {
  const n = steps.length;
  const half = n > 0 ? 100 / (n * 2) : 0;
  const span = 100 - 2 * half;
  const fillWidth = n > 1 ? (Math.min(current, n - 1) / (n - 1)) * span : 0;

  return (
    <div
      data-slot="stepper"
      className={cn("relative flex w-full items-start pt-0.5", className)}
      {...props}
    >
      <div
        className="absolute top-[15px] h-0.5 bg-border"
        style={{ left: `${half}%`, right: `${half}%` }}
      />
      <div
        className="absolute top-[15px] h-0.5 bg-secondary"
        style={{ left: `${half}%`, width: `${fillWidth}%` }}
      />
      {steps.map((label, i) => {
        const state =
          i < current ? "completed" : i === current ? "current" : "upcoming";
        return (
          <div
            key={label}
            className="relative flex grow basis-0 flex-col items-center gap-2"
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-[3px] border-background font-[family-name:var(--font-heading)] text-sm font-bold",
                state === "completed" && "bg-secondary text-primary-foreground",
                state === "current" &&
                  "bg-[var(--color-cta)] text-primary-foreground ring-[3px] ring-[var(--color-cta)]/25",
                state === "upcoming" &&
                  "border-2 border-border bg-background text-[var(--color-border-hover)]",
              )}
            >
              {state === "completed" ? (
                <Check className="size-[15px]" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "text-center text-[11px] leading-tight",
                state === "completed" && "font-semibold text-foreground",
                state === "current" && "font-bold text-[var(--color-cta)]",
                state === "upcoming" &&
                  "font-medium text-[var(--color-border-hover)]",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { Stepper };
