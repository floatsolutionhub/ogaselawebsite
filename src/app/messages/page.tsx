import type { Metadata } from "next";
import Link from "next/link";
import { Ban, MessageCircle } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { cardClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getListing } from "@/lib/api/marketplace";
import { getConversations } from "@/lib/api/services/messaging";
import { requireUser } from "@/lib/auth/session";
import { safeHttpUrl, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const page = await settle(getConversations(1, 50));

  // One lookup per ad, however many chats share it (two buyers asking about the same item).
  const listingIds = [...new Set((page?.items ?? []).map((c) => c.listingId))];
  const listings = new Map(
    await Promise.all(listingIds.map(async (id) => [id, await settle(getListing(id))] as const)),
  );
  const conversations = [...(page?.items ?? [])].sort(
    (a, b) => Date.parse(b.lastMessageAt ?? b.createdAt) - Date.parse(a.lastMessageAt ?? a.createdAt),
  );

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <SectionHeading eyebrow="Your chats" title="Messages" />
      {!page ? (
        <EmptyState icon={MessageCircle} title="We couldn't load your messages">
          Please refresh the page in a moment.
        </EmptyState>
      ) : conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet">
          Message a seller from any ad and your chat shows up here.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {conversations.map((conversation) => {
            const listing = listings.get(conversation.listingId);
            const thumb = safeHttpUrl(listing?.mediaUrls[0]);
            return (
              <li key={conversation.id}>
                <Link
                  href={`/messages/${conversation.id}`}
                  className={`${cardClass} flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lift`}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <MessageCircle aria-hidden className="size-6" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate font-semibold">{listing?.title ?? `Chat about listing #${conversation.listingId.slice(0, 8)}`}</span>
                      <span className="shrink-0 text-xs text-ink-500">{timeAgo(conversation.lastMessageAt ?? conversation.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-500">
                      {user.id === conversation.buyerId ? "You're the buyer" : "You're the seller"} in this chat
                    </span>
                    {conversation.isBlockedByMe && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-danger">
                        <Ban aria-hidden className="size-3.5" /> Blocked
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
