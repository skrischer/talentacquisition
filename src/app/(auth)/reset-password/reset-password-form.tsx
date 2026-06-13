"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/auth/actions";
import { newPasswordSchema, type NewPasswordValues } from "@/lib/auth/schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await updatePassword(values.password);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.push("/");
  });

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-heading)] text-h2 font-bold text-foreground">
          Neues Passwort setzen
        </h1>
        <p className="text-base text-text-secondary">
          Wähle ein neues Passwort für dein Konto.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Neues Passwort</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              className="pr-10"
              {...register("password")}
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
          {errors.password ? (
            <FieldError>{errors.password.message}</FieldError>
          ) : (
            <FieldDescription>Mindestens 8 Zeichen.</FieldDescription>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </div>

        {serverError && <FieldError>{serverError}</FieldError>}

        <Button type="submit" variant="cta" size="cta" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert…" : "Passwort speichern"}
          {!isSubmitting && <ArrowRight aria-hidden="true" />}
        </Button>
      </form>

      <Alert tone="info">
        Wähle ein Passwort, das du nicht an anderer Stelle verwendest.
      </Alert>
    </div>
  );
}
