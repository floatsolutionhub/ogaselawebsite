import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getInbox } from "@/lib/api/services/messaging";
import { requireUser } from "@/lib/auth/session";
import { Inbox } from "./Inbox";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default async function NotificationsPage() {
  await requireUser("/notifications");
  const inbox = await settle(getInbox(1, 20));
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Inbox initial={inbox} />
    </Container>
  );
}
