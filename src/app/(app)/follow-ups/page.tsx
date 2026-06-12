import {
  FollowUpList,
  type FollowUpItem,
} from "@/components/follow-ups/follow-up-list";
import {
  bucketFor,
  isSurfacedBucket,
  resolveToday,
} from "@/lib/candidates/follow-up";
import { list } from "@/lib/db/candidates";

// The Wiedervorlage (follow-up) page. A server component: it loads every row
// through the RLS-scoped server client (principle 6; the (app) layout guard
// ensures a session), classifies each into a follow-up bucket via the Phase-5
// utility — the single classification source the nav count and dashboard card
// also use — then hands the surfaced rows to the client list for the toggle,
// sort, and the Erledigt / Verschieben actions. "Today" is resolved here
// (Europe/Berlin, server-side) so the buckets never depend on the client clock.
export default async function FollowUpsPage() {
  const today = resolveToday();
  const candidates = await list();

  // Only the three surfaced buckets reach the page; the client list groups them.
  // Carrying the bucket avoids a second date parse in the client.
  const items = candidates
    .map((candidate) => ({
      candidate,
      bucket: bucketFor(candidate.follow_up_date, today),
    }))
    .filter((item): item is FollowUpItem => isSurfacedBucket(item.bucket));

  return <FollowUpList items={items} today={today} />;
}
