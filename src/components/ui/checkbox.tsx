"use client";

import * as React from "react";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide checkbox: a 20px square that fills primary with a white check when
// checked; shares the secondary focus ring. All colours are design tokens
// (constitution principle 8).
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-[5px] border border-border bg-background text-primary-foreground outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary data-[checked]:border-primary data-[checked]:bg-primary disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
