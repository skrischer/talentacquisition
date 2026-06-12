import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import { ConsentPanel } from "@/components/candidates/consent-panel";
import { FollowUpBadge } from "@/components/candidates/follow-up-badge";
import { PriorityBadge } from "@/components/candidates/priority-badge";
import { StageBadge } from "@/components/candidates/stage-badge";
import { StatusBadge } from "@/components/candidates/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardSectionHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stepper } from "@/components/ui/stepper";
import {
  bucketFor,
  isSurfacedBucket,
  resolveToday,
} from "@/lib/candidates/follow-up";
import {
  applicationSourceLabels,
  foreignQualificationRecognitionLabels,
  mobilityLabels,
  nursingQualificationLabels,
  rejectionReasonLabels,
  teamFeedbackStatusLabels,
} from "@/lib/candidates/labels";
import { PIPELINE_STAGES } from "@/lib/candidates/stages";
import { getById, type Candidate } from "@/lib/db/candidates";
import { getByCandidate } from "@/lib/db/consent";

// The seven pipeline steps in the design's short German labels (the styleguide
// stepper copy), positionally aligned with PIPELINE_STAGES so the candidate's
// stage_order maps to its step index.
const STEPPER_LABELS = [
  "Neu",
  "Sichtung",
  "Telefon",
  "Gespräch",
  "Hospitation",
  "Angebot",
  "Eingestellt",
];

const DASH = "—";

function formatDate(value: string | null): string {
  if (!value) return DASH;
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

function textValue(value: string | null): string {
  return value && value.trim() !== "" ? value : DASH;
}

function initials(candidate: Candidate): string {
  const letters = `${candidate.first_name.charAt(0)}${candidate.last_name.charAt(0)}`;
  return letters.toUpperCase() || "?";
}

// Whole days from today to the retention review date, and its position in a
// two-year window (730 days) as a 0-100 progress value. A past date is clamped
// to a full bar; an absent date renders no countdown.
function retentionCountdown(
  reviewDate: string | null,
  today: string,
): { daysLeft: number; progress: number } | null {
  if (!reviewDate) return null;
  const MS_PER_DAY = 86_400_000;
  const [ry, rm, rd] = reviewDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const daysLeft = Math.round(
    (Date.UTC(ry, rm - 1, rd) - Date.UTC(ty, tm - 1, td)) / MS_PER_DAY,
  );
  if (daysLeft < 0) return { daysLeft, progress: 100 };
  const WINDOW = 730;
  const elapsed = WINDOW - Math.min(daysLeft, WINDOW);
  return { daysLeft, progress: (elapsed / WINDOW) * 100 };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
        {label}
      </dt>
      <dd className="text-[15px] text-foreground">{children}</dd>
    </div>
  );
}

// A neutral status pill matching the card-header trailing chip in the design.
function NeutralPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-status-neutral-bg)] px-[11px] py-1 text-[13px] leading-4 font-semibold text-text-secondary">
      <span className="size-[7px] shrink-0 rounded-full bg-[var(--color-border-hover)]" />
      {children}
    </span>
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
  const consent = await getByCandidate(id);

  const today = resolveToday();
  // stage_order is the DB-authoritative 1-based pipeline position; convert to
  // the stepper's 0-based step index.
  const currentStep = Math.min(
    PIPELINE_STAGES.length - 1,
    Math.max(0, candidate.stage_order - 1),
  );
  const followUpBucket = bucketFor(candidate.follow_up_date, today);
  const retention = retentionCountdown(candidate.deletion_review_date, today);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav
          aria-label="Brotkrümelnavigation"
          className="flex items-center gap-2 text-sm"
        >
          <Link
            href="/candidates"
            className="text-text-secondary underline-offset-4 hover:text-foreground hover:underline"
          >
            Bewerber
          </Link>
          <ChevronRight className="size-4 text-text-muted" aria-hidden="true" />
          <span className="font-medium text-foreground">
            {candidate.first_name} {candidate.last_name}
          </span>
        </nav>
        <Button render={<Link href={`/candidates/${candidate.id}/edit`} />}>
          <Pencil className="size-4" aria-hidden="true" />
          Bearbeiten
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          {/* Identity card */}
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <Avatar
                  initials={initials(candidate)}
                  className="size-16 text-xl"
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight font-bold text-foreground">
                    {candidate.first_name} {candidate.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <StageBadge stage={candidate.stage} />
                    <StatusBadge status={candidate.status} />
                    <PriorityBadge priority={candidate.priority} />
                  </div>
                </div>
              </div>
              <div className="border-t border-border" />
              <dl
                aria-label="Kontaktdaten"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <Field label="E-Mail">
                  {candidate.email ? (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="break-all text-secondary underline-offset-4 hover:underline"
                    >
                      {candidate.email}
                    </a>
                  ) : (
                    DASH
                  )}
                </Field>
                <Field label="Telefon">
                  {candidate.phone ? (
                    <a
                      href={`tel:${candidate.phone}`}
                      className="text-secondary underline-offset-4 hover:underline"
                    >
                      {candidate.phone}
                    </a>
                  ) : (
                    DASH
                  )}
                </Field>
                <Field label="Quelle">
                  {applicationSourceLabels[candidate.application_source]}
                </Field>
                <Field label="Eingegangen">
                  {formatDate(candidate.created_at.slice(0, 10))}
                </Field>
              </dl>
            </CardContent>
          </Card>

          {/* Pipeline stepper */}
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-[family-name:var(--font-heading)] text-[17px] leading-snug font-bold text-foreground">
                  Pipeline-Fortschritt
                </span>
                <span className="text-sm text-text-muted">
                  Stufe {currentStep + 1} von {PIPELINE_STAGES.length}
                </span>
              </div>
              <Stepper steps={STEPPER_LABELS} current={currentStep} />
            </CardContent>
          </Card>

          {/* Qualification & classification */}
          <Card>
            <CardContent className="flex flex-col gap-5">
              <CardSectionHeader
                icon={FileText}
                title="Qualifikation & Klassifizierung"
              />
              <dl
                aria-label="Qualifikation und Klassifizierung"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <Field label="Qualifikation">
                  {candidate.nursing_qualification
                    ? nursingQualificationLabels[candidate.nursing_qualification]
                    : DASH}
                </Field>
                <Field label="Anerkennung Ausland">
                  {
                    foreignQualificationRecognitionLabels[
                      candidate.foreign_qualification_recognition
                    ]
                  }
                </Field>
                <Field label="Mobilität">
                  {mobilityLabels[candidate.mobility]}
                </Field>
                <Field label="Dokumente">
                  {candidate.documents_path ? (
                    <a
                      href={candidate.documents_path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary underline-offset-4 hover:underline"
                    >
                      <FileText className="size-4" aria-hidden="true" />
                      Bewerbungsunterlagen (extern)
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    DASH
                  )}
                </Field>
                {candidate.rejection_reason && (
                  <Field label="Ablehnungsgrund">
                    {rejectionReasonLabels[candidate.rejection_reason]}
                  </Field>
                )}
                <Field label="Aktualisiert">
                  {formatDate(candidate.updated_at.slice(0, 10))}
                </Field>
              </dl>
            </CardContent>
          </Card>

          {/* Team coordination */}
          <Card>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardSectionHeader icon={Users} title="Team-Abstimmung" />
                <NeutralPill>
                  {teamFeedbackStatusLabels[candidate.team_feedback_status]}
                </NeutralPill>
              </div>
              <dl aria-label="Team-Abstimmung" className="grid grid-cols-1 gap-4">
                <Field label="Vorgeschlagenes Team">
                  {textValue(candidate.team_proposal)}
                </Field>
              </dl>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="flex flex-col gap-4">
              <span className="font-[family-name:var(--font-heading)] text-[17px] leading-snug font-bold text-foreground">
                Notizen
              </span>
              <p className="text-[15px] whitespace-pre-wrap text-foreground">
                {textValue(candidate.notes)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Wiedervorlage */}
          <Card className="p-0">
            <div className="h-1 w-full bg-destructive" aria-hidden="true" />
            <CardContent className="flex flex-col gap-4 py-4">
              <CardSectionHeader
                icon={Clock}
                title="Wiedervorlage"
                className="[&>span:first-child]:bg-[var(--color-destructive-bg)] [&>span:first-child]:text-destructive"
              />
              <Field label="Nächster Schritt">
                {textValue(candidate.next_step)}
              </Field>
              <div className="flex flex-wrap items-center gap-2">
                {isSurfacedBucket(followUpBucket) && (
                  <FollowUpBadge bucket={followUpBucket} />
                )}
                <span className="text-sm text-text-secondary tabular-nums">
                  {candidate.follow_up_date
                    ? `Fällig ${formatDate(candidate.follow_up_date)}`
                    : "Keine Wiedervorlage"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Talentpool consent — real state from Phase 7 (#56) */}
          <ConsentPanel candidateId={candidate.id} consent={consent} />

          {/* Aufbewahrung / retention */}
          <Card>
            <CardContent className="flex flex-col gap-4">
              <span className="font-[family-name:var(--font-heading)] text-[17px] leading-snug font-bold text-foreground">
                Aufbewahrung
              </span>
              {candidate.deletion_review_date ? (
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-status-active-bg)] text-secondary">
                    <Trash2 className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Prüfdatum: {formatDate(candidate.deletion_review_date)}
                    </span>
                    {retention && <Progress value={retention.progress} />}
                    <span className="text-[13px] text-text-muted">
                      {retention && retention.daysLeft >= 0
                        ? `in ${retention.daysLeft} Tagen — danach Anonymisierung`
                        : "Prüfung fällig — Anonymisierung steht an"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Kein Prüfdatum hinterlegt.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
