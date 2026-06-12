"use client";

import * as React from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide select: the trigger mirrors the text input (h-10, hairline border,
// secondary focus ring, destructive error border) with a trailing chevron; the
// popup is a token-styled card. Built on @base-ui/react/select. All colours are
// design tokens (constitution principle 8).
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectGroupLabel = SelectPrimitive.GroupLabel;

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      className={cn(
        "truncate data-[placeholder]:text-[var(--color-border-hover)]",
        className,
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-[15px] text-foreground outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary data-[popup-open]:border-secondary disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-2 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="flex shrink-0 text-text-secondary">
        <ChevronDown className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="z-[var(--z-dropdown)] outline-none"
        align="start"
      >
        <SelectPrimitive.Popup
          className={cn(
            "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-card p-1 text-foreground shadow-[var(--shadow-lg)] outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[15px] text-foreground outline-none select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex shrink-0 text-secondary">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
