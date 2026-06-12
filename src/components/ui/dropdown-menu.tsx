"use client";

import * as React from "react";

import { Menu } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";

// Styleguide dropdown menu (the table row kebab): a token-styled popup with
// hover-highlighted items. Built on @base-ui/react/menu; all colours are design
// tokens (constitution principle 8).
const DropdownMenu = Menu.Root;
const DropdownMenuTrigger = Menu.Trigger;
const DropdownMenuGroup = Menu.Group;

function DropdownMenuContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Menu.Popup>) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        className="z-[var(--z-dropdown)] outline-none"
        align="end"
      >
        <Menu.Popup
          className={cn(
            "min-w-40 rounded-lg border border-border bg-card p-1 text-foreground shadow-[var(--shadow-lg)] outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground outline-none transition-colors select-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
