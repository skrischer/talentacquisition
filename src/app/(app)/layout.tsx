import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/**
 * Authenticated app shell. The route group `(app)` carries every signed-in
 * surface; the middleware guard (Phase 1, #5) redirects unauthenticated
 * requests here to /login, so this layout always runs with a session.
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

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-alt)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]">
              talentacquisition
            </span>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                Dashboard
              </Link>
              <Link
                href="/candidates"
                className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                Bewerber
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                {user.email}
              </span>
            )}
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Abmelden
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-6 py-8"
      >
        {children}
      </main>
    </div>
  );
}
