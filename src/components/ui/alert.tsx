import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import {
  Info,
  TriangleAlert,
  CircleCheck,
  CircleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide callout (login info box, inline notices): a tinted box with a
// leading tone icon and copy. Tones reuse the semantic status palette; the
// neutral "info" tone matches the login note. All colours are design tokens
// (constitution principle 8).
const alertVariants = cva(
  "flex items-start gap-2.5 rounded-lg px-4 py-3.5 text-sm leading-5 [&>svg]:mt-px [&>svg]:size-[18px] [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        info: "bg-bg-alt text-text-secondary [&>svg]:text-secondary",
        warning:
          "bg-[var(--color-warning-bg)] text-[var(--color-warning)] [&>svg]:text-[var(--color-warning)]",
        success:
          "bg-[var(--color-success-bg)] text-[var(--color-success)] [&>svg]:text-[var(--color-success)]",
        destructive:
          "bg-[var(--color-destructive-bg)] text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

const toneIcons: Record<
  NonNullable<VariantProps<typeof alertVariants>["tone"]>,
  LucideIcon
> = {
  info: Info,
  warning: TriangleAlert,
  success: CircleCheck,
  destructive: CircleAlert,
};

function Alert({
  className,
  tone = "info",
  icon: Icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & { icon?: LucideIcon }) {
  const ResolvedIcon = Icon ?? toneIcons[tone ?? "info"];
  return (
    <div
      role="note"
      data-slot="alert"
      className={cn(alertVariants({ tone, className }))}
      {...props}
    >
      <ResolvedIcon aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export { Alert, alertVariants };
