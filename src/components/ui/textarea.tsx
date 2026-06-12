import * as React from "react";

import { cn } from "@/lib/utils";

// Styleguide textarea: rounded-lg, hairline border, 15px text, the shared
// secondary focus ring and destructive error border. All colours are design
// tokens (constitution principle 8).
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[88px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-[var(--color-border-hover)] hover:border-[var(--color-border-hover)] focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-2 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
