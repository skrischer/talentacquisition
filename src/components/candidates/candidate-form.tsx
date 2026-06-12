"use client";

import Link from "next/link";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, GraduationCap, KanbanSquare, User } from "lucide-react";
import {
  Controller,
  type Control,
  type DefaultValues,
  useForm,
  useWatch,
} from "react-hook-form";

import { PriorityToggleGroup } from "@/components/candidates/priority-toggle-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardSectionHeader } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCandidate, updateCandidate } from "@/lib/candidates/actions";
import {
  applicationSourceLabels,
  candidateStatusLabels,
  foreignQualificationRecognitionLabels,
  mobilityLabels,
  nursingQualificationLabels,
  pipelineStageLabels,
  rejectionReasonLabels,
  teamFeedbackStatusLabels,
} from "@/lib/candidates/labels";
import {
  candidateSchema,
  type CandidateFormInput,
  type CandidateFormValues,
} from "@/lib/candidates/schema";
import type { Candidate } from "@/lib/db/candidates";

function FieldRow({
  label,
  htmlFor,
  required,
  error,
  description,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {description && !error && (
        <FieldDescription>{description}</FieldDescription>
      )}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

// A Phase-9 select bound to react-hook-form through a Controller. `items` lets
// the trigger render the German label of the stored enum value; an `optional`
// select clears to undefined when its placeholder option is chosen.
function ControlledSelect({
  control,
  name,
  labels,
  placeholder,
  optional = false,
  disabled = false,
  invalid = false,
  onAfterChange,
}: {
  control: Control<CandidateFormInput>;
  name: keyof CandidateFormInput;
  labels: Record<string, string>;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  onAfterChange?: (value: string) => void;
}) {
  const items: Record<string, string> = placeholder
    ? { "": placeholder, ...labels }
    : labels;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          items={items}
          value={(field.value as string | undefined) ?? ""}
          disabled={disabled}
          onValueChange={(value) => {
            const next = typeof value === "string" ? value : "";
            field.onChange(optional && next === "" ? undefined : next);
            onAfterChange?.(next);
          }}
        >
          <SelectTrigger
            onBlur={field.onBlur}
            aria-invalid={invalid || undefined}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {placeholder && <SelectItem value="">{placeholder}</SelectItem>}
            {Object.keys(labels).map((option) => (
              <SelectItem key={option} value={option}>
                {labels[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
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

const grid = "grid grid-cols-1 gap-4 sm:grid-cols-2";

export function CandidateForm({ candidate }: { candidate?: Candidate }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CandidateFormInput, unknown, CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: buildDefaults(candidate),
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // `useWatch` (a proper hook) instead of `form.watch` so the conditional read
  // re-renders cleanly without the React-Compiler memoization warning.
  const isRejected = useWatch({ control, name: "status" }) === "rejected";

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
      <Card>
        <CardContent className="flex flex-col gap-5">
          <CardSectionHeader
            icon={User}
            title="Kontaktdaten"
            subtitle="Name und Erreichbarkeit des Bewerbers"
          />
          <div className={grid}>
            <FieldRow
              label="Vorname"
              htmlFor="first_name"
              required
              error={errors.first_name?.message}
            >
              <Input
                id="first_name"
                aria-invalid={Boolean(errors.first_name)}
                {...register("first_name")}
              />
            </FieldRow>
            <FieldRow
              label="Nachname"
              htmlFor="last_name"
              required
              error={errors.last_name?.message}
            >
              <Input
                id="last_name"
                aria-invalid={Boolean(errors.last_name)}
                {...register("last_name")}
              />
            </FieldRow>
            <FieldRow
              label="E-Mail"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </FieldRow>
            <FieldRow
              label="Telefon"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input id="phone" type="tel" {...register("phone")} />
            </FieldRow>
          </div>
          <FieldDescription>
            Mindestens E-Mail oder Telefon angeben (Telefon-Only-Eingang
            möglich).
          </FieldDescription>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <CardSectionHeader
            icon={GraduationCap}
            title="Bewerbung & Qualifikation"
            subtitle="Herkunft der Bewerbung und fachliche Einordnung"
          />
          <div className={grid}>
            <FieldRow
              label="Quelle der Bewerbung"
              required
              error={errors.application_source?.message}
            >
              <ControlledSelect
                control={control}
                name="application_source"
                labels={applicationSourceLabels}
                placeholder="Bitte wählen"
                invalid={Boolean(errors.application_source)}
              />
            </FieldRow>
            <FieldRow
              label="Qualifikation"
              error={errors.nursing_qualification?.message}
            >
              <ControlledSelect
                control={control}
                name="nursing_qualification"
                labels={nursingQualificationLabels}
                placeholder="—"
                optional
              />
            </FieldRow>
            <FieldRow
              label="Anerkennung Ausland"
              error={errors.foreign_qualification_recognition?.message}
            >
              <ControlledSelect
                control={control}
                name="foreign_qualification_recognition"
                labels={foreignQualificationRecognitionLabels}
              />
            </FieldRow>
            <FieldRow label="Mobilität" error={errors.mobility?.message}>
              <ControlledSelect
                control={control}
                name="mobility"
                labels={mobilityLabels}
              />
            </FieldRow>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <CardSectionHeader
            icon={KanbanSquare}
            title="Pipeline & Status"
            subtitle="Stage, Status und Priorität sind getrennt"
          />
          <div className={grid}>
            <FieldRow label="Stage" error={errors.stage?.message}>
              <ControlledSelect
                control={control}
                name="stage"
                labels={pipelineStageLabels}
              />
            </FieldRow>
            <FieldRow label="Status" error={errors.status?.message}>
              <ControlledSelect
                control={control}
                name="status"
                labels={candidateStatusLabels}
                onAfterChange={(value) => {
                  if (value !== "rejected") {
                    setValue("rejection_reason", undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </FieldRow>
          </div>
          <FieldRow label="Priorität" error={errors.priority?.message}>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <PriorityToggleGroup
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value ?? undefined)}
                />
              )}
            />
          </FieldRow>
          <FieldRow
            label="Absagegrund"
            error={errors.rejection_reason?.message}
            description={isRejected ? undefined : 'Nur bei Status „Abgesagt" aktiv'}
          >
            <ControlledSelect
              control={control}
              name="rejection_reason"
              labels={rejectionReasonLabels}
              placeholder="—"
              optional
              disabled={!isRejected}
              invalid={Boolean(errors.rejection_reason)}
            />
          </FieldRow>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <CardSectionHeader
            icon={Clock}
            title="Wiedervorlage, Team & Notizen"
            subtitle="Nächster Schritt, Termin und freie Vermerke"
          />
          <div className={grid}>
            <FieldRow
              label="Nächster Schritt"
              htmlFor="next_step"
              error={errors.next_step?.message}
            >
              <Input id="next_step" {...register("next_step")} />
            </FieldRow>
            <FieldRow
              label="Wiedervorlage am"
              htmlFor="follow_up_date"
              error={errors.follow_up_date?.message}
            >
              <DateInput id="follow_up_date" {...register("follow_up_date")} />
            </FieldRow>
            <FieldRow
              label="Team-Vorschlag"
              htmlFor="team_proposal"
              error={errors.team_proposal?.message}
            >
              <Input id="team_proposal" {...register("team_proposal")} />
            </FieldRow>
            <FieldRow
              label="Team-Feedback"
              error={errors.team_feedback_status?.message}
            >
              <ControlledSelect
                control={control}
                name="team_feedback_status"
                labels={teamFeedbackStatusLabels}
              />
            </FieldRow>
          </div>
          <FieldRow
            label="Pfad zu Bewerbungsunterlagen"
            htmlFor="documents_path"
            error={errors.documents_path?.message}
            description="Nur Link/Pfad — keine Dateien in der App."
          >
            <Input id="documents_path" {...register("documents_path")} />
          </FieldRow>
          <FieldRow
            label="Lösch-/Prüfdatum"
            htmlFor="deletion_review_date"
            error={errors.deletion_review_date?.message}
          >
            <DateInput
              id="deletion_review_date"
              {...register("deletion_review_date")}
            />
          </FieldRow>
          <FieldRow
            label="Notizen"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <Textarea id="notes" rows={4} {...register("notes")} />
          </FieldRow>
        </CardContent>
      </Card>

      {serverError && <FieldError>{serverError}</FieldError>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {candidate ? "Bewerber speichern" : "Bewerber anlegen"}
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
