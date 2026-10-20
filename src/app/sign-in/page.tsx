import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { getCurrentUser, safeReturnPath } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const NOTICES: Record<string, string> = {
  idle: "You were signed out after a period of inactivity.",
  "google-unavailable": "Google sign-in isn't available yet. Please use your email or phone number for now.",
  "facebook-unavailable": "Facebook sign-in isn't available yet. Please use your email or phone number for now.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = safeReturnPath(params.next, "/account");
  if (await getCurrentUser()) redirect(next);
  const notice = typeof params.reason === "string" ? NOTICES[params.reason] : undefined;

  return (
    <AuthShell title="Welcome back to the market" subtitle="Sign in to contact sellers, save items and manage your stall.">
      {notice && (
        <p role="status" className="mb-6 rounded-2xl bg-gold-50 px-4 py-3 text-sm font-medium text-gold-900 ring-1 ring-gold-200">
          {notice}
        </p>
      )}
      <SignInForm next={next} />
    </AuthShell>
  );
}
