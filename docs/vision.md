# Vision

> Normative. What and why only — no implementation detail. Keep to ~1 page;
> this file is permanently loaded via CLAUDE.md.

## Problem

Applications arrive decentrally and informally — by email, phone, or through
the partners (Gesellschafter) directly. There is no central capture, no
tracking, slow responses, and candidates get lost in the process. The existing
Excel mini-ATS is a start, but it is not central, not multi-user, and does not
feel professional or state of the art.

## Why now

The process is thought through (concept dated 2026-06-11) and the data model
has been exercised in the Excel. The administration wants a dependable
structure in place *before* presenting the topic to management and the
partners — visible early wins are the means of persuasion.

## Target users

MVP: the central administration (recruiting staff). Team leads and partners
come later; candidate handover to a team stays via email for now.

## Goal

A central, easy-to-use, ambulatory-care-specific applicant management tool that
replaces the Excel and carries every application reliably through the process —
so no candidate is lost and screening effort is spent where it pays off.

## Success criteria

- Every application has a status, a defined next step, and a follow-up date
  (Wiedervorlage) — none lives only in an email inbox.
- New applications are triaged within 2 working days; A-candidates get a
  response within 24–48 hours — supported by the tool's follow-up surfacing.
- Dashboard KPIs (applications per month, by source, A/B/C/D counts, rejection
  reasons) are available without manual counting.
- The Excel is fully replaced as the system of record.

## Scope

### In

- Central capture of every application.
- A/B/C/D priority kept separate from pipeline stage/status.
- Defined next step plus follow-up date, with overdue items surfaced.
- Team proposal and team feedback as fields.
- Talent-pool consent plus deletion/review date.
- Dashboard KPIs.

### Out

- Public applicant funnel / 2-minute application.
- Team-lead / partner login.
- Upload of application PDFs into the app — only a path/link to protected
  storage is stored.
- Automated emails to candidates.
- Integration with third-party ATS vendors.

## Non-goals

- Not an HR or onboarding system — recruiting intake only.
- Does not replace the team leads' final hiring authority; it structures the
  pre-selection and coordination.
- Not a multi-tenant SaaS — a single internal tool for one organization.
- Does not legally determine GDPR retention periods. The MVP is pragmatic:
  consent and deletion/review-date fields exist, but the legal clarification
  stays parked.
