"use client";

import { useActionState } from "react";

import Link from "next/link";

import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "@/lib/auth/actions";

const INITIAL_STATE: ForgotPasswordState = { submitted: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    INITIAL_STATE,
  );

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-heading)] text-h2 font-bold text-foreground">
          Passwort vergessen?
        </h1>
        <p className="text-base text-text-secondary">
          Gib deine dienstliche E-Mail-Adresse ein. Wir senden dir einen Link
          zum Zurücksetzen.
        </p>
      </div>

      {state.submitted ? (
        // Neutral confirmation regardless of whether the address exists.
        <div role="status">
          <Alert tone="success">
            Wenn ein Konto für diese Adresse besteht, ist ein Link zum
            Zurücksetzen unterwegs. Bitte prüfe dein Postfach.
          </Alert>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              name="email"
              icon={Mail}
              autoComplete="email"
              required
              placeholder="vorname.nachname@traeger.de"
            />
          </div>
          <Button type="submit" variant="cta" size="cta" disabled={isPending}>
            {isPending ? "Wird gesendet…" : "Link zum Zurücksetzen senden"}
            {!isPending && <ArrowRight aria-hidden="true" />}
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zurück zur Anmeldung
      </Link>
    </div>
  );
}
