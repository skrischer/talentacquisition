import type { Metadata } from "next";

import { ChangePasswordForm } from "@/components/account/change-password-form";
import { Card, CardContent, CardSectionHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Konto",
};

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
          Konto
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Kontoeinstellungen
        </p>
      </div>

      <Card className="max-w-xl">
        <CardContent className="flex flex-col gap-5">
          <CardSectionHeader
            title="Passwort ändern"
            subtitle="Aktualisiere das Passwort für deine Anmeldung."
          />
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
