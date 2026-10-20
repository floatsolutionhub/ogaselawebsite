"use server";

import { z } from "zod";

import { fail, withUser, type ActionResult } from "@/lib/actions";
import { getInboxUnreadCount, getMessages, getUnreadMessageCount, sendMessage } from "@/lib/api/services/messaging";
import type { Message } from "@/lib/api/types";
import { uuidSchema } from "@/lib/validation";

const PAGE_SIZE = 40;
const contentSchema = z.string().trim().min(1).max(4000, "Keep messages under 4,000 characters.");

export async function sendChatMessage(conversationId: string, content: string): Promise<ActionResult<Message>> {
  const id = uuidSchema.safeParse(conversationId);
  const text = contentSchema.safeParse(content);
  if (!id.success) return fail("That chat couldn't be found.");
  if (!text.success) return fail(text.error.issues[0]?.message ?? "Type a message.");
  return withUser(() => sendMessage(id.data, text.data), "Message not sent.");
}

/** Older messages, for "Load earlier messages". Page 1 is the newest. */
export async function loadMessages(conversationId: string, page: number): Promise<ActionResult<{ items: Message[]; hasMore: boolean }>> {
  const id = uuidSchema.safeParse(conversationId);
  const p = z.number().int().min(1).max(1000).safeParse(page);
  if (!id.success || !p.success) return fail("That chat couldn't be found.");
  return withUser(async () => {
    const result = await getMessages(id.data, p.data, PAGE_SIZE);
    return { items: result.items, hasMore: result.page * result.pageSize < result.totalCount };
  });
}

/** A message arrived while the chat was open - reading it marks it read (as the app does). */
export async function markChatRead(conversationId: string): Promise<void> {
  const id = uuidSchema.safeParse(conversationId);
  if (!id.success) return;
  await withUser(() => getMessages(id.data, 1, 1));
}

/** The real unread counts, after something was read on this page. */
export async function getUnreadCounts(): Promise<{ messages: number; notifications: number } | null> {
  const result = await withUser(async () => {
    const [messages, notifications] = await Promise.all([getUnreadMessageCount(), getInboxUnreadCount()]);
    return { messages, notifications };
  });
  return result.ok ? result.data : null;
}
