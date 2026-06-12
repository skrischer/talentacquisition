import * as React from "react";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide text input: h-10, hairline border, 15px value, secondary focus
// ring, destructive error border (via aria-invalid). An optional leading icon
// (email / search) sits in a left slot. All colours are design tokens
// (constitution principle 8).
const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-[15px] text-foreground transition-colors outline-none placeholder:text-[var(--color-border-hover)] hover:border-[var(--color-border-hover)] focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-2 aria-invalid:border-destructive";

function Input({
  className,
  type,
  icon: Icon,
  ...props
}: React.ComponentProps<"input"> & { icon?: LucideIcon }) {
  const control = (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputClass, Icon && "pl-10", className)}
      {...props}
    />
  );

  if (!Icon) return control;

  return (
    <div className="relative w-full">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" />
      {control}
    </div>
  );
}

export { Input, inputClass };
