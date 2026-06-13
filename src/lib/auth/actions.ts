"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { passwordSchema } from "@/lib/auth/schema";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

/**
 * Signs a user in with email + password (Phase 11). Runs server-side so the
 * password never enters client control flow. A failed sign-in returns a single
 * generic message — never distinguishing "unknown email" from "wrong password" —
 * to avoid account enumeration. On success the session cookie is set and the
 * user is sent to the app shell.
 */
export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-Mail-Adresse oder Passwort ist falsch." };
  }

  redirect("/");
}

export type ForgotPasswordState = { submitted: boolean };

/**
 * Sends a Supabase password-recovery email (Phase 11). `redirectTo` points at
 * the token-hash callback with `type=recovery` and `next=/reset-password`, so a
 * verified link lands on the set-new-password page with an active session. The
 * action ALWAYS reports success and never surfaces Supabase's result, so the
 * response cannot reveal whether the address has an account (no enumeration).
 */
export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "");

  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const redirectTo = `${proto}://${host}/auth/confirm?type=recovery&next=/reset-password`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  return { submitted: true };
}

export type UpdatePasswordResult = { error: string | null };

/**
 * Sets the signed-in user's password via `updateUser` (Phase 11). Used by the
 * recovery set-new-password page and the in-app /account change. Requires an
 * active session (the recovery session, or a normal sign-in). The minimum
 * length is re-validated server-side (defense in depth) on top of the client
 * zod rule. Returns a result instead of redirecting so each caller can decide
 * where to go next.
 */
export async function updatePassword(
  password: string,
): Promise<UpdatePasswordResult> {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { error: "Bitte ein gültiges Passwort eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });

  if (error) {
    return {
      error:
        "Das Passwort konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }

  return { error: null };
}

/**
 * Ends the current session and returns to the login page. Invoked from the app
 * shell header (Phase 1, #6).
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
