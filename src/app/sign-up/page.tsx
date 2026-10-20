import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { getCurrentUser, safeReturnPath } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const next = safeReturnPath((await searchParams).next, "/account");
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell title="Open your stall" subtitle="One free account to buy and sell anything on Ogasela. It takes a minute.">
      <SignUpForm next={next} />
    </AuthShell>
  );
}
