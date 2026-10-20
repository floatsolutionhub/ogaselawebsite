import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { MapPin, MessageSquareQuote, PackageOpen } from "lucide-react";

import { Container } from "@/components/Container";
import { BlockedSellerNotice } from "@/components/listing/BlockedSellerNotice";
import { EmptyState, SectionHeading, Stars, VerifiedBadge } from "@/components/market/Badges";
import { ListingGrid, ListingGridSkeleton } from "@/components/market/ListingCard";
import { Pagination } from "@/components/market/Pagination";
import { cardClass } from "@/components/ui/styles";
import { ApiError, settle } from "@/lib/api/client";
import { getSeller, getSellerListings, getSellerReviews, toCardItem } from "@/lib/api/marketplace";
import type { SellerProfile } from "@/lib/api/types";
import { memberSince, timeAgo } from "@/lib/format";
import { uuidSchema } from "@/lib/validation";

const PAGE_SIZE = 24;
const pageSchema = z.coerce.number().int().min(1).max(500).catch(1);

async function load(id: string): Promise<SellerProfile> {
  if (!uuidSchema.safeParse(id).success) notFound();
  try {
    return await getSeller(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/seller/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const seller = await load(id);
    return { title: `${seller.businessName}'s stall`, description: `Shop ${seller.activeAdCount} items from ${seller.businessName} on Ogasela.` };
  } catch {
    return { title: "Seller" };
  }
}

export default async function SellerPage({ params, searchParams }: PageProps<"/seller/[id]">) {
  const { id } = await params;
  const page = pageSchema.parse((await searchParams).page);
  const seller = await load(id);

  return (
    <>
      <section className="ankara relative">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand-900/70 to-brand-900/95" />
        <Container className="relative py-12 text-white sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-gold-400 text-3xl font-extrabold text-brand-900 shadow-lift ring-4 ring-white/15">
              {seller.businessName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Market stall</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{seller.businessName}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-100">
                <VerifiedBadge status={seller.verificationStatus} business={seller.isBusinessVerified} />
                {seller.reviewCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Stars rating={seller.averageRating} /> {seller.averageRating.toFixed(1)} ({seller.reviewCount})
                  </span>
                )}
                <span>Member since {memberSince(seller.memberSince)}</span>
                {seller.storeAddress && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden className="size-4" /> {seller.storeAddress}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
      <div aria-hidden className="awning h-4" />

      <Container className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <SectionHeading eyebrow={`${seller.activeAdCount} on display`} title="Items on this stall" />
          {seller.isBlockedByMe ? (
            <BlockedSellerNotice userId={seller.userId} />
          ) : (
            <Suspense key={page} fallback={<ListingGridSkeleton count={8} />}>
              <SellerListings sellerId={seller.sellerProfileId} page={page} />
            </Suspense>
          )}
        </section>

        <aside>
          <SectionHeading title="What buyers say" />
          <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
            <Reviews sellerId={seller.sellerProfileId} />
          </Suspense>
        </aside>
      </Container>
    </>
  );
}

async function SellerListings({ sellerId, page }: { sellerId: string; page: number }) {
  const result = await settle(getSellerListings(sellerId, page, PAGE_SIZE));
  if (!result) return <EmptyState icon={PackageOpen} title="We couldn't load this stall">Please refresh in a moment.</EmptyState>;
  // The same endpoint doubles as "my listings" on the app - only show what's live.
  const live = result.items.filter((l) => l.status === "Active" || l.status === "ExpiringSoon");
  if (live.length === 0) {
    return <EmptyState icon={PackageOpen} title="The stall is empty right now">Check back soon. New items arrive all the time.</EmptyState>;
  }
  return (
    <>
      <ListingGrid items={live.map(toCardItem)} />
      <Pagination basePath={`/seller/${sellerId}`} params={{}} page={result.page} pageSize={result.pageSize} totalCount={result.totalCount} />
    </>
  );
}

async function Reviews({ sellerId }: { sellerId: string }) {
  const result = await settle(getSellerReviews(sellerId, 1, 10));
  if (!result) return null;
  if (result.items.length === 0) {
    return <p className={`${cardClass} p-5 text-sm text-ink-500`}>No reviews yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {result.items.map((review) => (
        <li key={review.id} className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between gap-2">
            <Stars rating={review.rating} />
            <span className="text-xs text-ink-500">{timeAgo(review.createdAt)}</span>
          </div>
          {review.comment && (
            <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-700">
              <MessageSquareQuote aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-600" />
              <span className="break-words">{review.comment}</span>
            </p>
          )}
          <p className="mt-2 text-xs font-medium text-ink-500">- {review.reviewerName ?? "Ogasela buyer"}</p>
        </li>
      ))}
    </ul>
  );
}
