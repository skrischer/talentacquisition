// Shared zod rules for the password-set forms (reset-password and the /account
// change-password page). Validated on the client (react-hook-form) and
// re-validated inside the server action (defense in depth). Supabase's
// server-side minimum is a dashboard setting and remains the final backstop.

import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`);

// New password plus its confirmation; the refine enforces that they match.
export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

// In-app change at /account: the current password (re-checked server-side) plus
// the new password and its confirmation.
export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Bitte das aktuelle Passwort eingeben."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export type AccountPasswordValues = z.infer<typeof accountPasswordSchema>;
