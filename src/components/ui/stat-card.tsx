import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide KPI stat-card shell: a label + accent icon, a large Montserrat
// figure and an optional delta. Presentational only — the "Bewerbungen pro
// Monat" chart stays Phase 6 (#43). All colours are design tokens (principle 8).
const deltaVariants = cva("text-sm", {
  variants: {
    deltaTone: {
      positive: "text-[var(--color-success)]",
      negative: "text-destructive",
      neutral: "text-text-secondary",
    },
  },
  defaultVariants: {
    deltaTone: "positive",
  },
});

function StatCard({
  icon: Icon,
  label,
  figure,
  delta,
  deltaTone,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof deltaVariants> & {
    icon?: LucideIcon;
    label: React.ReactNode;
    figure: React.ReactNode;
    delta?: React.ReactNode;
  }) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-text-secondary">
          {label}
        </span>
        {Icon && <Icon className="size-[18px] shrink-0 text-secondary" />}
      </div>
      <span className="font-[family-name:var(--font-heading)] text-[40px] leading-none font-extrabold text-primary">
        {figure}
      </span>
      {delta && (
        <span className={cn(deltaVariants({ deltaTone }))}>{delta}</span>
      )}
    </div>
  );
}

export { StatCard };
