"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Variants carry only colour; the universal styleguide button typography
// (Source Sans 3 SemiBold, 14px) and interaction affordances live in the base.
// Seven styleguide treatments — default = Primary, cta = CTA, secondary,
// outline, ghost, destructive, link — plus the disabled state on the base.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap cursor-pointer text-sm font-semibold transition-[background-color,color,border-color,box-shadow,outline-color,opacity] duration-200 outline-none focus-visible:outline-[3px] focus-visible:outline-[var(--focus-color)] focus-visible:outline-offset-2 select-none disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 aria-expanded:bg-primary/90",
        cta: "rounded-lg bg-[var(--color-cta)] text-primary-foreground hover:bg-[var(--color-cta-hover)] active:translate-y-px",
        secondary:
          "rounded-lg bg-muted text-foreground hover:bg-[var(--color-border)] aria-expanded:bg-[var(--color-border)]",
        outline:
          "rounded-lg border border-border bg-background text-foreground hover:bg-muted aria-expanded:bg-muted",
        ghost: "rounded-lg text-primary hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "rounded-lg bg-destructive text-primary-foreground hover:bg-destructive/90",
        link: "text-secondary underline underline-offset-4 hover:text-primary",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        cta: "min-h-12 gap-2 px-7 py-3.5",
        icon: "size-10",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
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
