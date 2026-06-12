"use client";

import * as React from "react";

import {
  Bell,
  Clock,
  Inbox,
  Mail,
  MoreVertical,
  Plus,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { Constants, type Enums } from "@/lib/supabase/types";
import { applicationSourceLabels } from "@/lib/candidates/labels";
import { cn } from "@/lib/utils";

import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardSectionHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CountBadge } from "@/components/ui/count-badge";
import { DateInput } from "@/components/ui/date-input";
import { DistributionBar } from "@/components/ui/distribution-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationEllipsis,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FollowUpBadge } from "@/components/candidates/follow-up-badge";
import { PriorityBadge } from "@/components/candidates/priority-badge";
import { PriorityToggleGroup } from "@/components/candidates/priority-toggle-group";
import { StageBadge } from "@/components/candidates/stage-badge";
import { StatusBadge } from "@/components/candidates/status-badge";

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-border pt-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
          {index}
        </span>
        <h2 className="font-heading text-h3 text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Block({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold tracking-[0.04em] text-[var(--color-border-hover)] uppercase">
        {label}
      </span>
      <div className={cn("flex flex-wrap items-start gap-3", className)}>
        {children}
      </div>
    </div>
  );
}

function Swatch({ name, swatchClass }: { name: string; swatchClass: string }) {
  return (
    <div className="flex w-[140px] flex-col overflow-hidden rounded-lg border border-border">
      <div className={cn("h-16", swatchClass)} />
      <div className="px-3 py-2.5">
        <span className="text-sm font-semibold text-foreground">{name}</span>
      </div>
    </div>
  );
}

const distributionRows = [
  { label: "Über Gesellschafter", value: 100, count: 52 },
  { label: "Stellenportal", value: 68, count: 35 },
  { label: "Per E-Mail", value: 47, count: 24 },
  { label: "Webseite", value: 29, count: 15 },
];

export function StyleguideGallery() {
  const [priority, setPriority] =
    React.useState<Enums<"candidate_priority"> | null>("a");

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-12">
      <header className="flex flex-col gap-2 pb-4">
        <span className="font-heading text-display text-primary">
          Styleguide
        </span>
        <p className="text-body-lg text-text-secondary">
          Komponentenbibliothek (Phase 9) — Tokens aus globals.css, shadcn/ui
          auf @base-ui. Montserrat Headings, Source Sans 3 Body.
        </p>
      </header>

      <Section index="01 — Farben" title="Farb-Tokens">
        <Block label="Marke">
          <Swatch name="primary" swatchClass="bg-primary" />
          <Swatch name="secondary" swatchClass="bg-secondary" />
          <Swatch name="secondary-light" swatchClass="bg-secondary-light" />
          <Swatch name="cta" swatchClass="bg-cta" />
          <Swatch name="cta-decorative" swatchClass="bg-cta-decorative" />
          <Swatch name="destructive" swatchClass="bg-destructive" />
        </Block>
        <Block label="Semantisch & Neutral">
          <Swatch name="success" swatchClass="bg-[var(--color-success)]" />
          <Swatch name="warning" swatchClass="bg-[var(--color-warning)]" />
          <Swatch name="bg-alt" swatchClass="bg-bg-alt" />
          <Swatch name="bg-muted" swatchClass="bg-bg-muted" />
          <Swatch name="border" swatchClass="bg-border" />
          <Swatch name="text" swatchClass="bg-foreground" />
          <Swatch name="text-secondary" swatchClass="bg-text-secondary" />
        </Block>
      </Section>

      <Section index="02 — Typografie" title="Type-Skala">
        <div className="flex flex-col divide-y divide-border">
          <TypeRow
            sample="Bewerbermanagement"
            spec="Montserrat ExtraBold · 44/52"
            sampleClass="font-heading text-display text-foreground"
          />
          <TypeRow
            sample="Offene Bewerbungen"
            spec="Montserrat Bold · 32/40"
            sampleClass="font-heading text-h2 text-foreground"
          />
          <TypeRow
            sample="Sektionsüberschrift"
            spec="Montserrat SemiBold · 22/30"
            sampleClass="font-heading text-h3 text-foreground"
          />
          <TypeRow
            sample="Body Large — zentrale Verwaltung erfasst jede Bewerbung."
            spec="Source Sans 3 · 18/28"
            sampleClass="text-body-lg text-foreground"
          />
          <TypeRow
            sample="Body — Standardtext für Tabellen und Formulare."
            spec="Source Sans 3 · 16/24"
            sampleClass="text-body text-foreground"
          />
          <TypeRow
            sample="Label / Caption · Überfällig"
            spec="Source Sans 3 SemiBold · 12"
            sampleClass="text-label text-text-muted uppercase"
          />
        </div>
      </Section>

      <Section index="03 — Buttons" title="Actions">
        <Block label="Varianten">
          <Button>Primary</Button>
          <Button variant="cta">
            <Plus />
            Bewerber anlegen
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Absagen</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </Block>
        <Block label="Icon-Buttons">
          <Button variant="ghost" size="icon" aria-label="Benachrichtigungen">
            <Bell />
          </Button>
          <Button variant="outline" size="icon" aria-label="Suche">
            <Search />
          </Button>
        </Block>
      </Section>

      <Section index="04 — Badges" title="Badges">
        <Block label="Status">
          {Constants.public.Enums.candidate_status.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </Block>
        <Block label="Priorität (A/B/C/D + Keine)">
          {Constants.public.Enums.candidate_priority.map((p) => (
            <PriorityBadge key={p} priority={p} />
          ))}
          <PriorityBadge priority={null} />
        </Block>
        <Block label="Pipeline-Stage">
          {Constants.public.Enums.pipeline_stage.map((stage) => (
            <StageBadge key={stage} stage={stage} />
          ))}
        </Block>
        <Block label="Wiedervorlage">
          <FollowUpBadge bucket="overdue" />
          <FollowUpBadge bucket="due_today" />
          <FollowUpBadge bucket="due_this_week" />
        </Block>
        <Block label="Tonal & Count">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <CountBadge>8</CountBadge>
          <CountBadge tone="primary">12</CountBadge>
          <CountBadge tone="alert">5</CountBadge>
        </Block>
      </Section>

      <Section index="05 — Formular-Controls" title="Form Controls">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Vorname">
            <Input defaultValue="Anna" />
          </Field>
          <Field label="E-Mail">
            <Input icon={Mail} type="email" placeholder="name@beispiel.de" />
          </Field>
          <Field label="Quelle der Bewerbung">
            <Select
              items={applicationSourceLabels}
              defaultValue="partner_referral"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.application_source.map((source) => (
                  <SelectItem key={source} value={source}>
                    {applicationSourceLabels[source]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Fokus-Zustand: Ring secondary</FieldDescription>
          </Field>
          <Field label="Wiedervorlage am">
            <DateInput defaultValue="2026-06-16" />
          </Field>
          <Field label="Absagegrund" required>
            <Input aria-invalid placeholder="Bitte auswählen" />
            <FieldError>Pflichtfeld, wenn Status = Abgesagt</FieldError>
          </Field>
          <Field label="Notizen">
            <Textarea placeholder="Freitext zu Eignung, Verfügbarkeit …" />
          </Field>
        </div>
        <Block label="Auswahl">
          <label className="flex items-center gap-2.5 text-[15px] text-foreground">
            <Checkbox defaultChecked />
            Talentpool-Einwilligung erteilt
          </label>
          <label className="flex items-center gap-2.5 text-[15px] text-foreground">
            <Switch defaultChecked />
            Nur überfällige anzeigen
          </label>
        </Block>
        <Block label="Priorität (Toggle-Group)">
          <PriorityToggleGroup value={priority} onValueChange={setPriority} />
        </Block>
      </Section>

      <Section
        index="06 — Daten & Navigation"
        title="Data display & navigation"
      >
        <Block label="Avatar">
          <Avatar initials="AK" />
          <Avatar size="sm" initials="LB" />
        </Block>
        <Block
          label="Segmented / Breadcrumb"
          className="flex-col items-stretch"
        >
          <Tabs defaultValue="liste">
            <TabsList className="max-w-[340px]">
              <TabsTab value="liste">Liste</TabsTab>
              <TabsTab value="board">Board</TabsTab>
              <TabsTab value="wv">Wiedervorlage</TabsTab>
            </TabsList>
          </Tabs>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Bewerber</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Anna Krause</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Block>
        <Block label="Card / Section-Header" className="flex-col items-stretch">
          <Card className="max-w-[420px]">
            <CardContent>
              <CardSectionHeader
                icon={Users}
                title="Kontaktdaten"
                subtitle="Name und Erreichbarkeit des Bewerbers"
              />
            </CardContent>
          </Card>
        </Block>
        <Block
          label="Tabelle (Avatar-Zelle, Badges, Kebab, überfällig)"
          className="flex-col items-stretch"
        >
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bewerber</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prio</TableHead>
                  <TableHead>Wiedervorlage</TableHead>
                  <TableHead className="w-9" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm" initials="AK" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Anna Krause</span>
                        <span className="text-[13px] text-text-muted">
                          anna.krause@web.de
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage="interview" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="active" />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority="a" />
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-destructive">
                      14.06.2026
                    </span>
                  </TableCell>
                  <TableCell>
                    <RowMenu />
                  </TableCell>
                </TableRow>
                <TableRow data-state="selected">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm" initials="LB" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Lukas Brandt</span>
                        <span className="text-[13px] text-text-muted">
                          lukas.brandt@web.de
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage="new" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="talent_pool" />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={null} />
                  </TableCell>
                  <TableCell>Heute</TableCell>
                  <TableCell>
                    <RowMenu />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Block>
        <Block label="Pagination">
          <Pagination>
            <PaginationPrevious disabled />
            <PaginationPage active>1</PaginationPage>
            <PaginationPage>2</PaginationPage>
            <PaginationPage>3</PaginationPage>
            <PaginationEllipsis />
            <PaginationPage>18</PaginationPage>
            <PaginationNext />
          </Pagination>
        </Block>
      </Section>

      <Section index="07 — Surfaces & Feedback" title="Surfaces & feedback">
        <Block label="Stat-Cards" className="grid grid-cols-1 sm:grid-cols-3">
          <StatCard
            icon={TrendingUp}
            label="Bewerbungen / Monat"
            figure="34"
            delta="+18% ggü. Vormonat"
          />
          <StatCard
            icon={UserCheck}
            label="A-Kandidaten aktiv"
            figure="7"
            delta="−2 ggü. Vormonat"
            deltaTone="negative"
          />
          <StatCard
            icon={Inbox}
            label="Offene Wiedervorlagen"
            figure="12"
            delta="5 überfällig"
            deltaTone="neutral"
          />
        </Block>
        <Block
          label="Stepper (7-Stufen Pipeline)"
          className="flex-col items-stretch"
        >
          <div className="max-w-[720px]">
            <Stepper
              current={3}
              steps={[
                "Neu",
                "Sichtung",
                "Telefon",
                "Gespräch",
                "Hospitation",
                "Angebot",
                "Eingestellt",
              ]}
            />
          </div>
        </Block>
        <Block
          label="Progress (Aufbewahrung)"
          className="flex-col items-stretch"
        >
          <div className="flex max-w-[420px] items-center gap-3">
            <Clock className="size-5 shrink-0 text-secondary" />
            <Progress value={3} className="grow" />
            <span className="shrink-0 text-[13px] text-text-muted">
              in 357 Tagen
            </span>
          </div>
        </Block>
        <Block
          label="Distribution (Nach Quelle)"
          className="flex-col items-stretch"
        >
          <div className="flex max-w-[420px] flex-col gap-2.5">
            {distributionRows.map((row) => (
              <DistributionBar
                key={row.label}
                label={row.label}
                value={row.value}
                count={row.count}
              />
            ))}
          </div>
        </Block>
        <Block label="Alerts / Callouts" className="flex-col items-stretch">
          <div className="flex max-w-[560px] flex-col gap-3">
            <Alert tone="info">
              Zugang nur für die zentrale Verwaltung. Konten werden im
              Supabase-Dashboard angelegt.
            </Alert>
            <Alert tone="warning">
              Team-Feedback ausstehend — seit dem 10.06.2026.
            </Alert>
            <Alert tone="success">
              Talentpool-Einwilligung erteilt und dokumentiert.
            </Alert>
            <Alert tone="destructive">
              Absagegrund fehlt — bitte vor dem Speichern ergänzen.
            </Alert>
          </div>
        </Block>
      </Section>
    </main>
  );
}

function TypeRow({
  sample,
  spec,
  sampleClass,
}: {
  sample: string;
  spec: string;
  sampleClass: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <span className={sampleClass}>{sample}</span>
      <span className="shrink-0 text-[13px] text-text-muted">{spec}</span>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function RowMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Aktionen"
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-[var(--color-border-hover)] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <MoreVertical className="size-[18px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Öffnen</DropdownMenuItem>
        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Absagen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
