"use client";

import * as React from "react";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

// Styleguide switch: a 40x23 track that turns secondary when on, with a white
// thumb that slides right. Shares the secondary focus ring. All colours are
// design tokens (constitution principle 8).
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[23px] w-10 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-[var(--color-border-hover)] px-[3px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-secondary data-[checked]:bg-secondary disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-[17px] rounded-full bg-background transition-transform data-[checked]:translate-x-[17px]" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
