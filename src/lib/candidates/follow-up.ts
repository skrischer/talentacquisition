// The follow-up (Wiedervorlage) date-bucket utility — the single classification
// source for Phase 5 surfacing. A pure predicate over `candidate.follow_up_date`
// relative to an injected "today", plus the German labels and the sort
// comparator the dashboard card and the list treatment reuse.
//
// Design (spec-follow-ups.md): "today" is resolved once, server-side, in the
// org's timezone (Europe/Berlin) and passed in, so `bucketFor` is deterministic
// and unit-checkable with no hidden clock. Classification compares calendar-date
// components (year/month/day), never `Date` millisecond instants, so DST and
// UTC-midnight boundaries never shift a bucket.

// A plain calendar date in ISO `YYYY-MM-DD` form — no time, no timezone instant.
// This is exactly how Postgres serializes the `date`-typed `follow_up_date`.
export type IsoDate = string;

export type FollowUpBucket =
  | "overdue"
  | "due_today"
  | "due_this_week"
  | "upcoming"
  | "none";

// The buckets surfaced in the Phase 5 UI. `upcoming` / `none` are
// classification-only and never rendered, so the label map covers only these.
export type SurfacedFollowUpBucket = Extract<
  FollowUpBucket,
  "overdue" | "due_today" | "due_this_week"
>;

// German UI copy for the three surfaced buckets (constitution: German UI,
// English identifiers). A Record over the surfaced union, so a missing bucket is
// a type error.
export const followUpBucketLabels: Record<SurfacedFollowUpBucket, string> = {
  overdue: "Überfällig",
  due_today: "Heute fällig",
  due_this_week: "Diese Woche fällig",
};

// Narrows a bucket to the surfaced set — the one gate the dashboard card and the
// list "nur fällige" filter share, so both show exactly overdue + due_today +
// due_this_week and hide upcoming / none.
export function isSurfacedBucket(
  bucket: FollowUpBucket,
): bucket is SurfacedFollowUpBucket {
  return (
    bucket === "overdue" || bucket === "due_today" || bucket === "due_this_week"
  );
}

// Classifies a follow-up date relative to "today". Pure: every clock read lives
// in `resolveToday`, which the caller invokes once and injects here.
//
// Buckets, by whole calendar-day difference (date - today):
//   < 0        -> overdue
//   = 0        -> due_today
//   1 .. 6     -> due_this_week  (rolling next-7-days window; today is due_today)
//   >= 7       -> upcoming
//   null date  -> none           (never surfaced as due)
export function bucketFor(
  followUpDate: IsoDate | null,
  today: IsoDate,
): FollowUpBucket {
  if (followUpDate === null) return "none";
  const diff = calendarDayDiff(followUpDate, today);
  if (diff < 0) return "overdue";
  if (diff === 0) return "due_today";
  if (diff <= 6) return "due_this_week";
  return "upcoming";
}

// Sorts items by follow-up date ascending (the card / list order). Nulls — which
// are never surfaced as due — sort last so a mixed list stays stable.
export function compareByFollowUpDate(
  a: { follow_up_date: IsoDate | null },
  b: { follow_up_date: IsoDate | null },
): number {
  if (a.follow_up_date === null && b.follow_up_date === null) return 0;
  if (a.follow_up_date === null) return 1;
  if (b.follow_up_date === null) return -1;
  // ISO `YYYY-MM-DD` strings order chronologically under lexical comparison.
  return a.follow_up_date.localeCompare(b.follow_up_date);
}

// Resolves "today" as the Europe/Berlin calendar date in ISO `YYYY-MM-DD` form —
// the org's timezone, so a `date`-only follow-up never misbuckets around UTC
// midnight on the server. The single place a real clock is read; `now` is
// injectable for tests. `en-CA` formats as `YYYY-MM-DD`.
export function resolveToday(now: Date = new Date()): IsoDate {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Whole-day difference (a - b) between two ISO calendar dates. Both dates are
// projected onto the UTC day axis purely as an integer day index — this uses
// `Date.UTC` only as calendar arithmetic over the parsed components, never as a
// wall-clock instant, so the result is timezone- and DST-independent.
function calendarDayDiff(a: IsoDate, b: IsoDate): number {
  const MS_PER_DAY = 86_400_000;
  return Math.round((utcDayIndex(a) - utcDayIndex(b)) / MS_PER_DAY);
}

function utcDayIndex(iso: IsoDate): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}
