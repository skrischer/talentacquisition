"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "sent" | "error";

export function LoginForm({ linkError = false }: { linkError?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-primary)]">
          Anmelden
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "sent" ? (
          <p
            role="status"
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 text-base text-[var(--color-text)]"
          >
            Wenn ein Konto für diese Adresse besteht, ist ein Anmeldelink
            unterwegs. Bitte prüfen Sie Ihr Postfach.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {linkError && (
              <p
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--color-destructive)] bg-[var(--color-bg-muted)] p-3 text-base text-[var(--color-destructive)]"
              >
                Der Anmeldelink ist ungültig oder abgelaufen. Bitte fordern Sie
                einen neuen an.
              </p>
            )}
            {status === "error" && (
              <p
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--color-destructive)] bg-[var(--color-bg-muted)] p-3 text-base text-[var(--color-destructive)]"
              >
                Der Anmeldelink konnte nicht versendet werden. Bitte versuchen
                Sie es erneut.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@beispiel.de"
              />
            </div>
            <Button
              type="submit"
              variant="cta"
              size="cta"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Wird gesendet…"
                : "Anmeldelink anfordern"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
