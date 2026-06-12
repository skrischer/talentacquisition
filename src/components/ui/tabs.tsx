"use client";

import * as React from "react";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

// Styleguide segmented control (Liste / Board, mobile stage selector): a pill
// track with the active segment lifted onto a white tile. Built on
// @base-ui/react/tabs; all colours are design tokens (constitution principle 8).
const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex gap-1 rounded-full bg-bg-alt p-1", className)}
      {...props}
    />
  );
}

function TabsTab({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "flex h-[34px] grow basis-0 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold text-text-secondary whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-secondary data-[active]:bg-card data-[active]:text-primary data-[active]:shadow-[var(--shadow-sm)]",
        className,
      )}
      {...props}
    />
  );
}

const TabsPanel = TabsPrimitive.Panel;

export { Tabs, TabsList, TabsTab, TabsPanel };
