import type { Metadata } from "next";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getNotificationPreferences } from "@/lib/api/services/messaging";
import { requireUser } from "@/lib/auth/session";
import { AlertSettings } from "./AlertSettings";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default async function AlertsPage() {
  await requireUser("/account/alerts");
  const preferences = await settle(getNotificationPreferences());
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Notifications" />
      <p className="mb-6 text-sm text-ink-500">Choose how we reach you. Messages, security codes and account notices are always sent.</p>
      {preferences ? <AlertSettings initial={preferences} /> : <p className="text-sm text-ink-500">Your settings couldn&apos;t be loaded. Please refresh.</p>}
    </Container>
  );
}
