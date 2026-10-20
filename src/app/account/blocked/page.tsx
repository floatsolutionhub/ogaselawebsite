import type { Metadata } from "next";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getBlockedUsers } from "@/lib/api/services/messaging";
import { requireUser } from "@/lib/auth/session";
import { BlockedList } from "./BlockedList";

export const metadata: Metadata = { title: "Blocked users", robots: { index: false } };

export default async function BlockedUsersPage() {
  await requireUser("/account/blocked");
  const users = await settle(getBlockedUsers());
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Blocked users" />
      {users ? <BlockedList initial={users} /> : <p className="text-sm text-ink-500">This list couldn&apos;t be loaded. Please refresh.</p>}
    </Container>
  );
}
