"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap cursor-pointer transition-[background-color,color,border-color,box-shadow,outline-color,opacity] duration-200 outline-none focus-visible:outline-[3px] focus-visible:outline-[var(--focus-color)] focus-visible:outline-offset-2 select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-lg border border-transparent bg-clip-padding bg-primary text-primary-foreground text-base font-medium [a]:hover:bg-primary/80",
        outline:
          "rounded-[var(--radius-sm)] border border-border bg-background text-base font-medium hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "rounded-lg border border-transparent bg-clip-padding bg-secondary text-secondary-foreground text-base font-medium hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "rounded-lg border border-transparent text-base font-medium hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "rounded-lg border border-transparent text-base font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-base font-medium text-primary underline-offset-4 hover:underline",
        cta: "rounded-[var(--radius-sm)] bg-[var(--color-cta)] font-[family-name:var(--font-heading)] text-base font-semibold text-white hover:bg-[var(--color-cta-hover)] active:translate-y-px",
        "mag-secondary":
          "rounded-[var(--radius-sm)] border-2 border-[var(--color-primary)] bg-transparent font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus-visible:bg-[var(--color-primary)] focus-visible:text-white active:translate-y-px",
        tertiary:
          "bg-transparent font-medium text-[var(--color-secondary)] underline hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-secondary)] focus-visible:rounded-[var(--radius-sm)]",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        cta: "min-h-12 gap-2 px-7 py-3.5",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  // Disable native button semantics when rendering as a non-button element
  // (e.g. via render={<Link />}) to prevent Base UI warnings
  const isNativeButton = nativeButton ?? !props.render;

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={isNativeButton}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
