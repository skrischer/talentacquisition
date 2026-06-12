import type { Metadata } from "next";

import { Check, Lock } from "lucide-react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Anmelden",
};

const VALUE_PROPS = [
  "Status, nächster Schritt und Wiedervorlage je Bewerber",
  "A/B/C/D-Priorität getrennt von der Pipeline",
  "Dashboard-KPIs ohne manuelles Zählen",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col bg-primary lg:flex-row"
    >
      {/* Brand hero — full-bleed teal panel; left column on desktop, top hero on mobile */}
      <section
        data-dark-bg
        aria-label="Über talentacquisition"
        className="relative flex flex-col overflow-hidden px-6 pt-12 pb-8 text-[var(--color-footer-text)] sm:px-10 lg:flex-[0_0_54%] lg:justify-between lg:px-20 lg:py-16"
      >
        {/* Decorative circles */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 size-[420px] rounded-full bg-secondary/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 size-[360px] rounded-full bg-secondary/20"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card font-[family-name:var(--font-heading)] text-xl font-extrabold text-primary">
            t
          </span>
          <span className="font-[family-name:var(--font-heading)] text-xl font-extrabold tracking-tight">
            talentacquisition
          </span>
        </div>

        <div className="relative mt-10 flex max-w-[560px] flex-col gap-6 lg:mt-0">
          {/* Marketing headline — decorative, kept out of the heading outline so
              the form's "Anmelden" stays the page's single h1. */}
          <p className="font-[family-name:var(--font-heading)] text-4xl leading-[1.1] font-extrabold tracking-tight lg:text-display lg:leading-[var(--text-display--line-height)]">
            Jede Bewerbung zuverlässig im Blick.
          </p>
          <p className="text-lg text-[var(--color-footer-text)] opacity-85">
            Zentrale Erfassung, klare Prioritäten und Wiedervorlagen — damit kein
            Kandidat im Posteingang verloren geht.
          </p>
          <ul className="mt-2 flex flex-col gap-3">
            {VALUE_PROPS.map((prop) => (
              <li key={prop} className="flex items-center gap-3">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-secondary-light/25 text-secondary-light">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-base font-medium">{prop}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 flex items-center gap-2 text-sm text-[var(--color-footer-text)] opacity-70 lg:mt-0">
          <Lock className="size-4 shrink-0" aria-hidden="true" />
          <span>Interner Zugang · DSGVO-konform · Hosting in der EU</span>
        </div>
      </section>

      {/* Sign-in panel — white surface; right column on desktop, overlapping card on mobile */}
      <section
        aria-label="Anmelden"
        className="flex flex-1 justify-center rounded-t-2xl bg-card px-6 pt-10 pb-12 lg:items-center lg:rounded-none lg:px-16 lg:py-16"
      >
        <LoginForm linkError={error === "link"} />
      </section>
    </main>
  );
}
