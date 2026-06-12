import Link from "next/link";
import { notFound } from "next/navigation";

import { PriorityBadge } from "@/components/candidates/priority-badge";
import { StageBadge } from "@/components/candidates/stage-badge";
import { StatusBadge } from "@/components/candidates/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  applicationSourceLabels,
  foreignQualificationRecognitionLabels,
  mobilityLabels,
  nursingQualificationLabels,
  rejectionReasonLabels,
  teamFeedbackStatusLabels,
} from "@/lib/candidates/labels";
import { getById } from "@/lib/db/candidates";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

const dateTimeFormat = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string): string {
  return dateTimeFormat.format(new Date(value));
}

function textValue(value: string | null): string {
  return value && value.trim() !== "" ? value : "—";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-text-muted">{label}</dt>
      <dd className="text-sm text-[var(--color-text)]">{children}</dd>
    </div>
  );
}

function DetailSection({
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
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</dl>
      </CardContent>
    </Card>
  );
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getById(id);
  if (!candidate) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/candidates"
            className="text-sm text-[var(--color-secondary)] underline-offset-4 hover:underline"
          >
            ← Zurück zur Liste
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-primary)]">
            {candidate.last_name}, {candidate.first_name}
          </h1>
        </div>
        <Button render={<Link href={`/candidates/${candidate.id}/edit`} />}>
          Bearbeiten
        </Button>
      </div>

      <DetailSection title="Kontakt">
        <Field label="Vorname">{textValue(candidate.first_name)}</Field>
        <Field label="Nachname">{textValue(candidate.last_name)}</Field>
        <Field label="E-Mail">{textValue(candidate.email)}</Field>
        <Field label="Telefon">{textValue(candidate.phone)}</Field>
      </DetailSection>

      <DetailSection title="Klassifizierung">
        <Field label="Quelle">
          {applicationSourceLabels[candidate.application_source]}
        </Field>
        <Field label="Pflegequalifikation">
          {candidate.nursing_qualification
            ? nursingQualificationLabels[candidate.nursing_qualification]
            : "—"}
        </Field>
        <Field label="Anerkennung ausl. Qualifikation">
          {
            foreignQualificationRecognitionLabels[
              candidate.foreign_qualification_recognition
            ]
          }
        </Field>
        <Field label="Mobilität">{mobilityLabels[candidate.mobility]}</Field>
        <Field label="Priorität">
          {candidate.priority ? (
            <PriorityBadge priority={candidate.priority} />
          ) : (
            "—"
          )}
        </Field>
      </DetailSection>

      <DetailSection title="Pipeline">
        <Field label="Phase">
          <StageBadge stage={candidate.stage} />
        </Field>
        <Field label="Status">
          <StatusBadge status={candidate.status} />
        </Field>
        <Field label="Ablehnungsgrund">
          {candidate.rejection_reason
            ? rejectionReasonLabels[candidate.rejection_reason]
            : "—"}
        </Field>
      </DetailSection>

      <DetailSection title="Team / Wiedervorlage">
        <Field label="Teamvorschlag">
          {textValue(candidate.team_proposal)}
        </Field>
        <Field label="Team-Feedback">
          {teamFeedbackStatusLabels[candidate.team_feedback_status]}
        </Field>
        <Field label="Nächster Schritt">{textValue(candidate.next_step)}</Field>
        <Field label="Wiedervorlage">
          {formatDate(candidate.follow_up_date)}
        </Field>
      </DetailSection>

      <DetailSection title="Sonstiges">
        <Field label="Lösch-/Prüfdatum">
          {formatDate(candidate.deletion_review_date)}
        </Field>
        <Field label="Dokumente (Pfad/Link)">
          {textValue(candidate.documents_path)}
        </Field>
        <Field label="Notizen">
          <span className="whitespace-pre-wrap">
            {textValue(candidate.notes)}
          </span>
        </Field>
      </DetailSection>

      <DetailSection title="Metadaten">
        <Field label="Erstellt">{formatDateTime(candidate.created_at)}</Field>
        <Field label="Aktualisiert">
          {formatDateTime(candidate.updated_at)}
        </Field>
      </DetailSection>
    </div>
  );
}
