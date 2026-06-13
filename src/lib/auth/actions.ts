"use server";

import { redirect } from "next/navigation";

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

/**
 * Ends the current session and returns to the login page. Invoked from the app
 * shell header (Phase 1, #6).
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
