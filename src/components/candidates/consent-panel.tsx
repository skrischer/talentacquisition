"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type DefaultValues, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  consentStateLabels,
  consentStateOptions,
} from "@/lib/candidates/labels";
import { recordConsent } from "@/lib/consent/actions";
import {
  consentSchema,
  type ConsentFormInput,
  type ConsentFormValues,
} from "@/lib/consent/schema";
import type { Consent } from "@/lib/db/consent";
import type { Json } from "@/lib/supabase/types";

const selectClass =
  "h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 text-base outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-[var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-secondary)] focus-visible:outline-offset-2";

function FieldRow({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-destructive)]">{error}</p>
      )}
    </div>
  );
}

// proof_metadata is stored as { note } | null; read the note back defensively
// since the column is free-form jsonb.
function proofNote(meta: Json | null): string {
  if (
    typeof meta === "object" &&
    meta !== null &&
    !Array.isArray(meta) &&
    "note" in meta &&
    typeof meta.note === "string"
  ) {
    return meta.note;
  }
  return "";
}

function buildDefaults(
  consent: Consent | null,
): DefaultValues<ConsentFormInput> {
  return {
    state: consent?.state ?? "draft",
    accepted: consent?.accepted ?? false,
    answered_at: consent?.answered_at ? consent.answered_at.slice(0, 10) : "",
    proof_note: proofNote(consent?.proof_metadata ?? null),
  };
}

export function ConsentPanel({
  candidateId,
  consent,
}: {
  candidateId: string;
  consent: Consent | null;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ConsentFormInput, unknown, ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: buildDefaults(consent),
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);
    const result = await recordConsent(candidateId, values);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
    // Advance the pristine baseline to the just-saved values so the form no
    // longer reads dirty and a later unchanged re-submit is a clean no-op.
    reset(getValues());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Talentpool-Einwilligung</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-text-muted">
          {consent
            ? `Aktueller Stand: ${consentStateLabels[consent.state]} · Erteilt: ${
                consent.accepted ? "Ja" : "Nein"
              }`
            : "Noch keine Einwilligung erfasst."}
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <FieldRow
            label="Status"
            htmlFor="state"
            error={errors.state?.message}
          >
            <select id="state" className={selectClass} {...register("state")}>
              {consentStateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-secondary)]"
              {...register("accepted")}
            />
            Einwilligung erteilt
          </label>

          <FieldRow
            label="Beantwortet am"
            htmlFor="answered_at"
            error={errors.answered_at?.message}
          >
            <Input id="answered_at" type="date" {...register("answered_at")} />
          </FieldRow>

          <FieldRow
            label="Nachweis (optional)"
            htmlFor="proof_note"
            error={errors.proof_note?.message}
          >
            <Input
              id="proof_note"
              placeholder="z. B. Referenz zur Einwilligungs-E-Mail"
              {...register("proof_note")}
            />
          </FieldRow>

          {serverError && (
            <p className="text-sm text-[var(--color-destructive)]">
              {serverError}
            </p>
          )}
          {saved && (
            <p className="text-sm text-[var(--color-secondary)]">
              Einwilligung gespeichert.
            </p>
          )}

          <div>
            <Button type="submit" disabled={isSubmitting}>
              Einwilligung speichern
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
