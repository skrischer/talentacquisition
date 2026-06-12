import * as React from "react";

import { cn } from "@/lib/utils";

// Field helper texts that pair with the form controls: a neutral description
// and a destructive error message (e.g. the required Absagegrund). Both 13px,
// from design tokens (constitution principle 8).
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-[13px] text-text-secondary", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-[13px] text-destructive", className)}
      {...props}
    />
  );
}

export { FieldDescription, FieldError };
