"use server";

import { z } from "zod";

import { fail, withUser, type ActionResult } from "@/lib/actions";
import { getInbox, markAllInboxRead, markInboxRead } from "@/lib/api/services/messaging";
import type { InboxPage } from "@/lib/api/types";
import { uuidSchema } from "@/lib/validation";

export async function loadInbox(page: number): Promise<ActionResult<InboxPage>> {
  const p = z.number().int().min(1).max(500).safeParse(page);
  if (!p.success) return fail("Couldn't load more.");
  return withUser(() => getInbox(p.data, 20));
}

export async function markNotificationRead(id: string): Promise<void> {
  const parsed = uuidSchema.safeParse(id);
  if (parsed.success) await withUser(() => markInboxRead(parsed.data));
}

export async function markAllNotificationsRead(): Promise<void> {
  await withUser(() => markAllInboxRead());
}
