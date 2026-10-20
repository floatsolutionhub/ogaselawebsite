import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiError, settle } from "@/lib/api/client";
import { getListing } from "@/lib/api/marketplace";
import { getPickupQuote } from "@/lib/api/services/deals";
import { getConversation, getMessages, getSafetyNotice } from "@/lib/api/services/messaging";
import { requireUser } from "@/lib/auth/session";
import { uuidSchema } from "@/lib/validation";
import { ChatThread } from "./ChatThread";

export const metadata: Metadata = { title: "Chat", robots: { index: false } };

const PAGE_SIZE = 40;
/** The API's default, shown if the admin-set text can't be fetched. */
const DEFAULT_NOTICE = "Do not send money for an item you have not seen and verified";

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await requireUser(`/messages/${id}`);

  let conversation;
  try {
    conversation = await getConversation(id);
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) notFound();
    throw error;
  }

  // Loading the newest page also marks the other person's messages read.
  const [messages, listing, notice] = await Promise.all([
    settle(getMessages(id, 1, PAGE_SIZE)),
    settle(getListing(conversation.listingId)),
    settle(getSafetyNotice()),
  ]);
  const isBuyer = user.id === conversation.buyerId;
  // The "Want office pickup?" prompt - buyers only, and only where the category offers it.
  const quote = isBuyer ? await settle(getPickupQuote(conversation.listingId)) : null;

  return (
    <ChatThread
      conversation={conversation}
      viewerId={user.id}
      listing={
        listing
          ? { id: listing.id, title: listing.title, price: listing.price, image: listing.mediaUrls[0] ?? null }
          : { id: conversation.listingId, title: "this item", price: null, image: null }
      }
      initialMessages={messages?.items ?? []}
      hasMore={!!messages && messages.page * messages.pageSize < messages.totalCount}
      safetyNotice={notice?.text || DEFAULT_NOTICE}
      officePickup={!!quote?.available}
    />
  );
}
