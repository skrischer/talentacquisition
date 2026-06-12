import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-[var(--color-bg-alt)] p-6"
    >
      <LoginForm linkError={error === "link"} />
    </main>
  );
}
