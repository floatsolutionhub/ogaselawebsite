import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getListingForEdit, getPromotionPlans } from "@/lib/api/services/seller";
import { requireUser } from "@/lib/auth/session";
import { shortDate } from "@/lib/format";
import { canUpgrade } from "@/lib/listings";
import { readCheckout } from "@/lib/payments";
import { uuidSchema } from "@/lib/validation";
import { StepProgress } from "../../PostWizard";
import { PlanPicker } from "./PlanPicker";

export const metadata: Metadata = { title: "Promote & pay", robots: { index: false } };

/**
 * Paying for an ad's plan:
 * - new: a draft (step 4 of posting) - pick a plan, pay, and only once the payment is confirmed is
 *   the ad submitted for review. Until then it stays a draft in My ads.
 * - renew: an expired ad - the same, for a fresh plan period.
 * - upgrade: an ad whose plan is running - only plans costing the same or more, at full price; the
 *   new plan starts counting once paid and the old expiry date no longer applies.
 */
export default async function PromotePage({ params, searchParams }: PageProps<"/sell/[id]/promote">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await requireUser(`/sell/${id}/promote`);
  const fromPost = (await searchParams).fromPost === "1";

  const [listing, plans, pending] = await Promise.all([settle(getListingForEdit(id)), settle(getPromotionPlans()), readCheckout()]);
  if (!listing || listing.sellerId !== user.sellerProfile?.id) notFound();
  const onSale = (plans ?? []).filter((p) => p.isActive);
  const mode = canUpgrade(listing) ? "upgrade" : listing.status === "Expired" ? "renew" : listing.status === "Draft" ? "new" : null;
  const currentPlan = (plans ?? []).find((p) => p.id === listing.promotionPlanId) ?? null;
  // Never a downgrade: paid plans at least as dear as the current one.
  const offered = mode === "upgrade" ? onSale.filter((p) => p.price > 0 && p.id !== currentPlan?.id && p.price >= (currentPlan?.price ?? 0)) : onSale;
  const backTab = mode === "upgrade" ? "active" : mode === "renew" ? "expired" : "draft";

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Link href={`/my-ads?tab=${backTab}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        <ChevronLeft aria-hidden className="size-4" /> My ads
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        {mode === "upgrade" ? "Upgrade your plan" : mode === "renew" ? "Renew your ad" : "Promote & pay"}
      </h1>
      <p className="mt-1 truncate text-ink-500">for “{listing.title}”</p>
      {fromPost && (
        <div className="mt-6">
          <StepProgress current={3} />
        </div>
      )}

      {mode === null ? (
        <p className="mt-10 rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card">This ad has already been paid for and submitted.</p>
      ) : offered.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card">
          {mode === "upgrade"
            ? `Your ad is already on our top plan${currentPlan ? ` (${currentPlan.name})` : ""}.`
            : "No plans are available right now. Your ad is saved in My ads. Try again later."}
        </p>
      ) : (
        <PlanPicker
          listingId={listing.id}
          mode={mode}
          plans={offered}
          initialPlanId={mode === "upgrade" ? null : listing.promotionPlanId}
          current={mode === "upgrade" && currentPlan ? { name: currentPlan.name, until: shortDate(listing.expiresAt) } : null}
          photoCount={listing.mediaUrls.length}
          reviewNote={mode === "new" ? (listing.reviewNote ?? null) : null}
          paymentPending={pending?.kind === (mode === "upgrade" ? "upgrade" : "listing") && pending.id === listing.id}
        />
      )}
    </Container>
  );
}
