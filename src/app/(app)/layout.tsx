import Link from "next/link";

import { LogOut } from "lucide-react";

import { BottomNav, SidebarNav } from "@/components/app-shell/app-nav";
import { HeaderSearch } from "@/components/app-shell/header-search";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { bucketFor, resolveToday } from "@/lib/candidates/follow-up";
import { list } from "@/lib/db/candidates";
import { createClient } from "@/lib/supabase/server";

// Derives the email-local part into up-to-two uppercase initials for the
// avatar; falls back to "?" when there is no usable handle.
function initialsFromEmail(email: string | undefined): string {
  const handle = email?.split("@")[0] ?? "";
  const parts = handle.split(/[._-]+/).filter(Boolean);
  const letters = (parts.length >= 2 ? [parts[0], parts[1]] : [handle])
    .map((part) => part.charAt(0))
    .join("");
  return letters ? letters.toUpperCase().slice(0, 2) : "?";
}

/**
 * Authenticated app shell. The route group `(app)` carries every signed-in
 * surface; the middleware guard (Phase 1, #5) redirects unauthenticated
 * requests here to /login, so this layout always runs with a session.
 *
 * Chrome: a desktop sidebar (≥ md) and a mobile bottom-tab bar (< md) share
 * one nav definition; the Wiedervorlage entry carries the overdue follow-up
 * count, derived server-side from the Phase-5 bucket utility over `list()`.
 * The header carries the global search that routes to the candidate list.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Overdue count for the nav badge — the same single classification source
  // (Phase-5 `bucketFor`) the dashboard card and list treatment use; "today"
  // is resolved server-side in the org timezone.
  const today = resolveToday();
  const overdueCount = (await list()).filter(
    (candidate) => bucketFor(candidate.follow_up_date, today) === "overdue",
  ).length;

  const initials = initialsFromEmail(user?.email);

  return (
    <div className="min-h-screen bg-[var(--color-bg-alt)] md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] md:flex">
        <Link
          href="/"
          className="flex items-center gap-3 border-b border-[var(--color-border)] px-6 py-5"
        >
          <span className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-primary-foreground)]">
            t
          </span>
          <span className="font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)]">
            talentacquisition
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <SidebarNav overdueCount={overdueCount} />
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--color-border)] px-4 py-4">
          <Avatar initials={initials} size="default" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-text)]">
              {user?.email ?? "Angemeldet"}
            </p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">
              Zentrale Verwaltung
            </p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Abmelden"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="flex items-center gap-4 px-4 py-3 md:px-8">
            <Link
              href="/"
              className="font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)] md:hidden"
            >
              talentacquisition
            </Link>
            <div className="flex flex-1 justify-end md:justify-start">
              <HeaderSearch />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8"
        >
          {children}
        </main>
      </div>

      <BottomNav overdueCount={overdueCount} />
    </div>
  );
}
