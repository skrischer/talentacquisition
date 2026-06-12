import * as React from "react";

import { cn } from "@/lib/utils";

import { inputClass } from "./input";

// Styleguide date field: the shared text-input shell with the native calendar
// picker as the trailing affordance. Reusing inputClass keeps the height,
// border, focus ring and error state identical to the other controls.
function DateInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="date"
      data-slot="date-input"
      className={cn(
        inputClass,
        "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export { DateInput };
