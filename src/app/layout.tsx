import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "talentacquisition",
    template: "%s | talentacquisition",
  },
  description: "Internes Bewerbermanagement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-sm focus:bg-[var(--color-cta)] focus:px-4 focus:py-3 focus:text-white focus:outline-none"
        >
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
