import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-base outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-[var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-secondary)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
