import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StyleguideGallery } from "./styleguide-gallery";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

// Dev-only verification surface: it renders the full component library so it can
// be diffed against the Paper styleguide. It lives outside the (app) route
// group, reads no Supabase / candidate data, and is not linked from the nav.
// Guarded to non-production — hidden on the production deployment, visible in
// local dev and on the Vercel preview used for the milestone QA gate.
export default function StyleguidePage() {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return <StyleguideGallery />;
}
