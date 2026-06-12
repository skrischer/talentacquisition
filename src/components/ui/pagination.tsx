import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

// Styleguide pagination: numbered page tiles (active fills primary), an ellipsis
// gap and prev/next buttons. All colours are design tokens (principle 8).

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Seitennavigation"
      data-slot="pagination"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function PaginationPage({
  className,
  active,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      data-slot="pagination-page"
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-[7px] text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        active
          ? "bg-primary text-primary-foreground"
          : "text-text-secondary hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn(
        "px-1 text-[13px] text-[var(--color-border-hover)]",
        className,
      )}
      {...props}
    >
      …
    </span>
  );
}

function PaginationPrevious({
  className,
  children = "Zurück",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="pagination-previous"
      className={cn(
        "flex h-8 cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-background px-3 text-[13px] font-semibold text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:text-[var(--color-border-hover)] disabled:opacity-70",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="size-3.5" />
      {children}
    </button>
  );
}

function PaginationNext({
  className,
  children = "Weiter",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="pagination-next"
      className={cn(
        "flex h-8 cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-background px-3 text-[13px] font-semibold text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:text-[var(--color-border-hover)] disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="size-3.5" />
    </button>
  );
}

export {
  Pagination,
  PaginationPage,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
};
