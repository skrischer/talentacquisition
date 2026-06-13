"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/auth/actions";
import {
  accountPasswordSchema,
  type AccountPasswordValues,
} from "@/lib/auth/schema";

export function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountPasswordValues>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccess(false);
    const result = await changePassword(
      values.currentPassword,
      values.password,
    );
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    setSuccess(true);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
        <Input
          id="currentPassword"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <FieldError>{errors.currentPassword.message}</FieldError>
        )}
      </div>

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
          type="password"
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
      {success && (
        <div role="status">
          <Alert tone="success">Dein Passwort wurde geändert.</Alert>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Wird gespeichert…" : "Passwort speichern"}
      </Button>
    </form>
  );
}
