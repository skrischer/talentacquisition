"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  Columns3,
  LayoutGrid,
  Users,
  type LucideIcon,
} from "lucide-react";

import { CountBadge } from "@/components/ui/count-badge";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  // Full label (sidebar) and short label (mobile bottom-tab).
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Dashboard", shortLabel: "Dashboard", icon: LayoutGrid },
  {
    href: "/candidates",
    label: "Bewerber",
    shortLabel: "Bewerber",
    icon: Users,
  },
  {
    href: "/board",
    label: "Pipeline-Board",
    shortLabel: "Board",
    icon: Columns3,
  },
  {
    href: "/follow-ups",
    label: "Wiedervorlage",
    shortLabel: "Wiedervorlage",
    icon: Bell,
  },
];

// Active when the path equals the item's route or sits below it; the root "/"
// only matches exactly so it does not light up on every nested route.
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Desktop sidebar nav list. Each row is a token-styled link; the active row
// carries the active tint, the Wiedervorlage row its overdue count badge.
export function SidebarNav({ overdueCount }: { overdueCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Hauptnavigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        const showCount = href === "/follow-ups" && overdueCount > 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-status-active-bg)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-primary)]",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {showCount && (
              <CountBadge tone="alert" aria-label={`${overdueCount} überfällig`}>
                {overdueCount}
              </CountBadge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile bottom-tab bar. Fixed to the viewport bottom; each tab stacks icon
// over short label. The Wiedervorlage tab carries its overdue count badge.
export function BottomNav({ overdueCount }: { overdueCount: number }) {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-[var(--color-border)] bg-[var(--color-card)] md:hidden"
      aria-label="Hauptnavigation"
    >
      {NAV_ITEMS.map(({ href, shortLabel, icon: Icon }) => {
        const active = isActive(pathname, href);
        const showCount = href === "/follow-ups" && overdueCount > 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
              active
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)]",
            )}
          >
            <span className="relative">
              <Icon className="size-6 shrink-0" aria-hidden="true" />
              {showCount && (
                <CountBadge
                  tone="alert"
                  className="absolute -right-3 -top-1.5 h-4 min-w-4 px-1 text-[10px] leading-none"
                  aria-label={`${overdueCount} überfällig`}
                >
                  {overdueCount}
                </CountBadge>
              )}
            </span>
            <span>{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
