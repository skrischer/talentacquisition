import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
        Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Willkommen</CardTitle>
        </CardHeader>
        <CardContent className="text-[var(--color-text-secondary)]">
          Hier entsteht das Bewerber-Dashboard. Kennzahlen und Wiedervorlagen
          folgen in den nächsten Phasen.
        </CardContent>
      </Card>
    </div>
  );
}
