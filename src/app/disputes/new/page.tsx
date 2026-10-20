import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getListing } from "@/lib/api/marketplace";
import { getConversations } from "@/lib/api/services/messaging";
import { requireUser } from "@/lib/auth/session";
import { uuidSchema } from "@/lib/validation";
import { NewDisputeForm } from "./NewDisputeForm";

export const metadata: Metadata = { title: "Open a dispute", robots: { index: false } };

export default async function NewDisputePage({ searchParams }: PageProps<"/disputes/new">) {
  const params = await searchParams;
  const listingId = uuidSchema.safeParse(params.listingId);
  const conversationId = uuidSchema.safeParse(params.conversationId);
  if (!listingId.success) notFound();
  const user = await requireUser(`/disputes/new?listingId=${listingId.data}`);

  const listing = await settle(getListing(listingId.data));
  if (!listing) notFound();
  const isSeller = listing.seller.userId === user.id;
  // A seller disputes a specific buyer - via their chat about this ad.
  const chats =
    isSeller && !conversationId.success
      ? ((await settle(getConversations(1, 100)))?.items ?? []).filter((c) => c.listingId === listing.id)
      : [];

  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <Link href={`/listing/${listing.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        <ChevronLeft aria-hidden className="size-4" /> Back to the ad
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Open a dispute</h1>
      <NewDisputeForm
        listing={{ id: listing.id, title: listing.title, image: listing.mediaUrls[0] ?? null, sellerName: listing.seller.businessName }}
        isSeller={isSeller}
        conversationId={conversationId.success ? conversationId.data : null}
        chats={chats.map((c) => ({ id: c.id, at: c.lastMessageAt ?? c.createdAt }))}
      />
    </Container>
  );
}
