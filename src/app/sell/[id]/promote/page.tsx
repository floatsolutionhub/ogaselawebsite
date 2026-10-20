import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getListingForEdit, getPromotionPlans } from "@/lib/api/services/seller";
import { requireUser } from "@/lib/auth/session";
import { readCheckout } from "@/lib/payments";
import { uuidSchema } from "@/lib/validation";
import { StepProgress } from "../../PostWizard";
import { PlanPicker } from "./PlanPicker";

export const metadata: Metadata = { title: "Promote & pay", robots: { index: false } };

/**
 * Checkout for a draft ad (step 4 of posting): pick a plan, pay, and only once the payment is
 * confirmed is the ad submitted for review. Until then it stays a draft in My ads.
 */
export default async function PromotePage({ params, searchParams }: PageProps<"/sell/[id]/promote">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await requireUser(`/sell/${id}/promote`);
  const fromPost = (await searchParams).fromPost === "1";

  const [listing, plans, pending] = await Promise.all([settle(getListingForEdit(id)), settle(getPromotionPlans()), readCheckout()]);
  if (!listing || listing.sellerId !== user.sellerProfile?.id) notFound();
  const onSale = (plans ?? []).filter((p) => p.isActive);

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Link href="/my-ads?tab=draft" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        <ChevronLeft aria-hidden className="size-4" /> My ads
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Promote &amp; pay</h1>
      <p className="mt-1 truncate text-ink-500">for “{listing.title}”</p>
      {fromPost && (
        <div className="mt-6">
          <StepProgress current={3} />
        </div>
      )}

      {listing.status !== "Draft" ? (
        <p className="mt-10 rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card">This ad has already been paid for and submitted.</p>
      ) : onSale.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card">
          No plans are available right now. Your ad is saved as a draft. Try again later.
        </p>
      ) : (
        <PlanPicker
          listingId={listing.id}
          plans={onSale}
          initialPlanId={listing.promotionPlanId}
          photoCount={listing.mediaUrls.length}
          reviewNote={listing.reviewNote ?? null}
          paymentPending={pending?.kind === "listing" && pending.id === listing.id}
        />
      )}
    </Container>
  );
}
