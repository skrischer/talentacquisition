"use client";

import { useActionState, useState } from "react";

import Link from "next/link";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/lib/auth/actions";

const INITIAL_STATE: LoginState = { error: null };

export function LoginForm({ linkError = false }: { linkError?: boolean }) {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-heading)] text-h2 font-bold text-foreground">
          Anmelden
        </h1>
        <p className="text-base text-text-secondary">
          Melde dich mit deiner dienstlichen E-Mail-Adresse und deinem Passwort
          an.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {linkError && (
          <div role="alert">
            <Alert tone="destructive">
              Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen
              neuen an.
            </Alert>
          </div>
        )}
        {state.error && (
          <div role="alert">
            <Alert tone="destructive">{state.error}</Alert>
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
            placeholder="vorname.nachname@traeger.de"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-secondary hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              icon={Lock}
              autoComplete="current-password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword ? "Passwort verbergen" : "Passwort anzeigen"
              }
              aria-pressed={showPassword}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <Button type="submit" variant="cta" size="cta" disabled={isPending}>
          {isPending ? "Wird angemeldet…" : "Anmelden"}
          {!isPending && <ArrowRight aria-hidden="true" />}
        </Button>
      </form>

      <Alert tone="info">
        Zugang nur für die zentrale Verwaltung. Neue Konten legt die Verwaltung
        an.
      </Alert>
    </div>
  );
}
