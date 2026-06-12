"use client";

import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";

import { cn } from "@/lib/utils";
import type { Enums } from "@/lib/supabase/types";

// Styleguide priority selector: A/B/C/D letter+label segments plus a neutral
// "Keine". Single-select over the nullable candidate_priority column — null is
// the "Keine" segment, not an enum value. Built on @base-ui/react toggle-group;
// all colours are design tokens (constitution principle 8).

type Priority = Enums<"candidate_priority">;

const NONE = "none";

const OPTIONS: { value: Priority; letter: string; label: string }[] = [
  { value: "a", letter: "A", label: "Top" },
  { value: "b", letter: "B", label: "Hoch" },
  { value: "c", letter: "C", label: "Mittel" },
  { value: "d", letter: "D", label: "Niedrig" },
];

const segment =
  "flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-text-secondary outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:ring-2 focus-visible:ring-secondary";

export function PriorityToggleGroup({
  value,
  onValueChange,
  className,
}: {
  value: Priority | null;
  onValueChange?: (value: Priority | null) => void;
  className?: string;
}) {
  const groupValue = value ?? NONE;

  return (
    <ToggleGroup
      value={[groupValue]}
      onValueChange={(group) => {
        const next = group.find((v) => v !== groupValue);
        // A re-click on the active segment yields no new value — keep it; the
        // group is always exactly one of A/B/C/D/Keine.
        if (next === undefined) return;
        onValueChange?.(next === NONE ? null : (next as Priority));
      }}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {OPTIONS.map((o) => (
        <Toggle
          key={o.value}
          value={o.value}
          className={cn(
            segment,
            "data-[pressed]:border-transparent data-[pressed]:bg-[var(--color-cta)] data-[pressed]:text-primary-foreground",
          )}
        >
          <span className="font-[family-name:var(--font-heading)] text-[15px] font-bold">
            {o.letter}
          </span>
          {o.label}
        </Toggle>
      ))}
      <Toggle
        value={NONE}
        className={cn(
          segment,
          "text-[var(--color-border-hover)] data-[pressed]:border-transparent data-[pressed]:bg-muted data-[pressed]:text-foreground",
        )}
      >
        Keine
      </Toggle>
    </ToggleGroup>
  );
}
