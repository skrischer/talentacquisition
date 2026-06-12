"use client";

import { useState } from "react";

import { ArrowRight, Mail } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-heading)] text-h2 font-bold text-foreground">
          Anmelden
        </h1>
        <p className="text-base text-text-secondary">
          Gib deine dienstliche E-Mail ein. Wir senden dir einen Anmeldelink —
          kein Passwort nötig.
        </p>
      </div>

      {status === "sent" ? (
        // Live region announces the confirmation; Alert keeps its own role.
        <div role="status">
          <Alert tone="success">
            Wenn ein Konto für diese Adresse besteht, ist ein Anmeldelink
            unterwegs. Bitte prüfen Sie Ihr Postfach.
          </Alert>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {linkError && (
            <div role="alert">
              <Alert tone="destructive">
                Der Anmeldelink ist ungültig oder abgelaufen. Bitte fordern Sie
                einen neuen an.
              </Alert>
            </div>
          )}
          {status === "error" && (
            <div role="alert">
              <Alert tone="destructive">
                Der Anmeldelink konnte nicht versendet werden. Bitte versuchen
                Sie es erneut.
              </Alert>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              name="email"
              icon={Mail}
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vorname.nachname@traeger.de"
            />
          </div>
          <Button
            type="submit"
            variant="cta"
            size="cta"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Wird gesendet…" : "Anmeldelink senden"}
            {status !== "loading" && <ArrowRight aria-hidden="true" />}
          </Button>
        </form>
      )}

      <Alert tone="info">
        Zugang nur für die zentrale Verwaltung. Konten werden im
        Supabase-Dashboard angelegt.
      </Alert>
    </div>
  );
}
