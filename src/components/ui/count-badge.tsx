import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Small reusable numeric count badge — the nav "Wiedervorlage" marker and the
// "Alle anzeigen" counters. A pill sized to stay round for single digits and
// grow for larger counts; tones from design tokens (constitution principle 8).
const countBadgeVariants = cva(
  "inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs font-bold leading-4",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-text-secondary",
        primary: "bg-primary text-primary-foreground",
        alert: "bg-destructive text-primary-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

function CountBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof countBadgeVariants>) {
  return (
    <span
      data-slot="count-badge"
      className={cn(countBadgeVariants({ tone, className }))}
      {...props}
    />
  );
}

export { CountBadge, countBadgeVariants };
