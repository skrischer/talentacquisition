"use client";

import Link from "next/link";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { type DefaultValues, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCandidate, updateCandidate } from "@/lib/candidates/actions";
import {
  applicationSourceOptions,
  candidatePriorityOptions,
  candidateStatusOptions,
  foreignQualificationRecognitionOptions,
  mobilityOptions,
  nursingQualificationOptions,
  pipelineStageOptions,
  rejectionReasonOptions,
  teamFeedbackStatusOptions,
} from "@/lib/candidates/labels";
import {
  candidateSchema,
  type CandidateFormInput,
  type CandidateFormValues,
} from "@/lib/candidates/schema";
import type { Candidate } from "@/lib/db/candidates";

// Optional <select>s submit "" for "not set"; map that to undefined so the
// optional-enum schema treats it as absent rather than an invalid value.
function emptyToUndefined(value: string): string | undefined {
  return value === "" ? undefined : value;
}

const selectClass =
  "h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 text-base outline-none transition-colors hover:border-[var(--color-border-hover)] focus-visible:border-[var(--color-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-secondary)] focus-visible:outline-offset-2";

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function FieldRow({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="text-[var(--color-destructive)]"> *</span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-destructive)]">{error}</p>
      )}
    </div>
  );
}

function buildDefaults(
  candidate?: Candidate,
): DefaultValues<CandidateFormInput> {
  if (!candidate) {
    return {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      application_source: undefined,
      nursing_qualification: undefined,
      foreign_qualification_recognition: "not_applicable",
      mobility: "unknown",
      stage: "new",
      status: "active",
      priority: undefined,
      rejection_reason: undefined,
      team_proposal: "",
      team_feedback_status: "not_requested",
      next_step: "",
      follow_up_date: "",
      deletion_review_date: "",
      documents_path: "",
      notes: "",
    };
  }

  return {
    first_name: candidate.first_name,
    last_name: candidate.last_name,
    email: candidate.email ?? "",
    phone: candidate.phone ?? "",
    application_source: candidate.application_source,
    nursing_qualification: candidate.nursing_qualification ?? undefined,
    foreign_qualification_recognition:
      candidate.foreign_qualification_recognition,
    mobility: candidate.mobility,
    stage: candidate.stage,
    status: candidate.status,
    priority: candidate.priority ?? undefined,
    rejection_reason: candidate.rejection_reason ?? undefined,
    team_proposal: candidate.team_proposal ?? "",
    team_feedback_status: candidate.team_feedback_status,
    next_step: candidate.next_step ?? "",
    follow_up_date: candidate.follow_up_date ?? "",
    deletion_review_date: candidate.deletion_review_date ?? "",
    documents_path: candidate.documents_path ?? "",
    notes: candidate.notes ?? "",
  };
}

export function CandidateForm({ candidate }: { candidate?: Candidate }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CandidateFormInput, unknown, CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: buildDefaults(candidate),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = candidate
      ? await updateCandidate(candidate.id, values)
      : await createCandidate(values);
    // On success the action redirects; a returned result carries an error.
    if (result?.error) setServerError(result.error);
  });

  const cancelHref = candidate ? `/candidates/${candidate.id}` : "/candidates";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <FormSection title="Kontakt">
        <FieldRow
          label="Vorname"
          htmlFor="first_name"
          required
          error={errors.first_name?.message}
        >
          <Input id="first_name" {...register("first_name")} />
        </FieldRow>
        <FieldRow
          label="Nachname"
          htmlFor="last_name"
          required
          error={errors.last_name?.message}
        >
          <Input id="last_name" {...register("last_name")} />
        </FieldRow>
        <FieldRow label="E-Mail" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FieldRow>
        <FieldRow label="Telefon" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" {...register("phone")} />
        </FieldRow>
      </FormSection>

      <FormSection title="Klassifizierung">
        <FieldRow
          label="Quelle"
          htmlFor="application_source"
          required
          error={errors.application_source?.message}
        >
          <select
            id="application_source"
            className={selectClass}
            {...register("application_source")}
          >
            <option value="">Bitte wählen</option>
            {applicationSourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Pflegequalifikation"
          htmlFor="nursing_qualification"
          error={errors.nursing_qualification?.message}
        >
          <select
            id="nursing_qualification"
            className={selectClass}
            {...register("nursing_qualification", {
              setValueAs: emptyToUndefined,
            })}
          >
            <option value="">—</option>
            {nursingQualificationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Anerkennung ausl. Qualifikation"
          htmlFor="foreign_qualification_recognition"
          error={errors.foreign_qualification_recognition?.message}
        >
          <select
            id="foreign_qualification_recognition"
            className={selectClass}
            {...register("foreign_qualification_recognition")}
          >
            {foreignQualificationRecognitionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Mobilität"
          htmlFor="mobility"
          error={errors.mobility?.message}
        >
          <select
            id="mobility"
            className={selectClass}
            {...register("mobility")}
          >
            {mobilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Priorität"
          htmlFor="priority"
          error={errors.priority?.message}
        >
          <select
            id="priority"
            className={selectClass}
            {...register("priority", { setValueAs: emptyToUndefined })}
          >
            <option value="">—</option>
            {candidatePriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
      </FormSection>

      <FormSection title="Pipeline">
        <FieldRow label="Phase" htmlFor="stage" error={errors.stage?.message}>
          <select id="stage" className={selectClass} {...register("stage")}>
            {pipelineStageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Status"
          htmlFor="status"
          error={errors.status?.message}
        >
          <select id="status" className={selectClass} {...register("status")}>
            {candidateStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Ablehnungsgrund"
          htmlFor="rejection_reason"
          error={errors.rejection_reason?.message}
        >
          <select
            id="rejection_reason"
            className={selectClass}
            {...register("rejection_reason", { setValueAs: emptyToUndefined })}
          >
            <option value="">—</option>
            {rejectionReasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
      </FormSection>

      <FormSection title="Team / Wiedervorlage">
        <FieldRow
          label="Teamvorschlag"
          htmlFor="team_proposal"
          error={errors.team_proposal?.message}
        >
          <Input id="team_proposal" {...register("team_proposal")} />
        </FieldRow>
        <FieldRow
          label="Team-Feedback"
          htmlFor="team_feedback_status"
          error={errors.team_feedback_status?.message}
        >
          <select
            id="team_feedback_status"
            className={selectClass}
            {...register("team_feedback_status")}
          >
            {teamFeedbackStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow
          label="Nächster Schritt"
          htmlFor="next_step"
          error={errors.next_step?.message}
        >
          <Input id="next_step" {...register("next_step")} />
        </FieldRow>
        <FieldRow
          label="Wiedervorlage"
          htmlFor="follow_up_date"
          error={errors.follow_up_date?.message}
        >
          <Input
            id="follow_up_date"
            type="date"
            {...register("follow_up_date")}
          />
        </FieldRow>
      </FormSection>

      <FormSection title="Sonstiges">
        <FieldRow
          label="Lösch-/Prüfdatum"
          htmlFor="deletion_review_date"
          error={errors.deletion_review_date?.message}
        >
          <Input
            id="deletion_review_date"
            type="date"
            {...register("deletion_review_date")}
          />
        </FieldRow>
        <FieldRow
          label="Dokumente (Pfad/Link)"
          htmlFor="documents_path"
          error={errors.documents_path?.message}
        >
          <Input id="documents_path" {...register("documents_path")} />
        </FieldRow>
        <div className="sm:col-span-2">
          <FieldRow
            label="Notizen"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <Textarea id="notes" rows={4} {...register("notes")} />
          </FieldRow>
        </div>
      </FormSection>

      {serverError && (
        <p className="text-sm text-[var(--color-destructive)]">{serverError}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {candidate ? "Speichern" : "Anlegen"}
        </Button>
        <Button
          type="button"
          variant="outline"
          render={<Link href={cancelHref} />}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
