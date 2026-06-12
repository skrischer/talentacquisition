import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Styleguide avatar: a round tinted tile with the candidate's initials in
// Montserrat Bold (primary on the active-status tint). Sizes match the table
// cell (sm) and the surfaces row (default). All colours are design tokens
// (constitution principle 8).
const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-status-active-bg)] font-[family-name:var(--font-heading)] font-bold text-primary uppercase",
  {
    variants: {
      size: {
        sm: "size-9 text-[13px]",
        default: "size-10 text-[15px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function Avatar({
  className,
  size,
  initials,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof avatarVariants> & { initials: string }) {
  return (
    <span
      data-slot="avatar"
      className={cn(avatarVariants({ size, className }))}
      {...props}
    >
      {initials}
    </span>
  );
}

export { Avatar, avatarVariants };
