import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES = [
  "email",
  "magiclink",
  "signup",
  "invite",
  "recovery",
  "email_change",
] as const satisfies readonly EmailOtpType[];

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return (
    value !== null && EMAIL_OTP_TYPES.some((candidate) => candidate === value)
  );
}

/**
 * Email token-hash callback: verifies the OTP from a Supabase email link
 * (password recovery, invite) and, on success, redirects to the originally
 * requested page (default: the app shell) with the session established. The
 * password-recovery flow lands here via `type=recovery` and continues to
 * /reset-password. A failed or expired link returns to /login with an error
 * flag. `next` is constrained to same-origin relative paths to avoid an open
 * redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  if (tokenHash && isEmailOtpType(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", request.url));
}
