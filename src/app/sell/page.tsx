import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { VerificationBanner } from "@/components/account/VerificationBanner";
import { settle } from "@/lib/api/client";
import { getCategories } from "@/lib/api/marketplace";
import { getVerificationOverview } from "@/lib/api/services/me";
import { getListingForEdit, getPromotionPlans } from "@/lib/api/services/seller";
import { requireUser } from "@/lib/auth/session";
import { locationLabel } from "@/lib/location";
import { getShopLocation } from "@/lib/location.server";
import { uuidSchema } from "@/lib/validation";
import { PostWizard, type WizardDraft } from "./PostWizard";

export const metadata: Metadata = { title: "Post an ad", robots: { index: false } };

/** Until the plans load (or if they can't) - the plan picked at checkout decides how many are kept. */
const FALLBACK_MAX_PHOTOS = 5;

export default async function SellPage({ searchParams }: PageProps<"/sell">) {
  const draftParam = (await searchParams).draft;
  const draftId = typeof draftParam === "string" && uuidSchema.safeParse(draftParam).success ? draftParam : null;
  const user = await requireUser(draftId ? `/sell?draft=${draftId}` : "/sell");

  const [categories, plans, verification, location, draftListing] = await Promise.all([
    settle(getCategories()),
    settle(getPromotionPlans()),
    settle(getVerificationOverview()),
    getShopLocation(),
    draftId ? settle(getListingForEdit(draftId)) : Promise.resolve(null),
  ]);

  // Only the seller's own draft can be resumed here.
  const owned = draftListing && draftListing.sellerId === user.sellerProfile?.id && draftListing.status === "Draft" ? draftListing : null;
  const tree = (categories ?? [])
    .filter((c) => !c.parentCategoryId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({
      id: c.id,
      name: c.name,
      children: (categories ?? []).filter((x) => x.parentCategoryId === c.id).map((x) => ({ id: x.id, name: x.name })),
    }));

  let draft: WizardDraft | null = null;
  if (owned) {
    // Filed under a subcategory or directly under a top-level category.
    const parent = tree.find((c) => c.id === owned.categoryId || c.children.some((x) => x.id === owned.categoryId));
    draft = {
      id: owned.id,
      title: owned.title,
      categoryId: parent?.id ?? owned.categoryId,
      subcategoryId: parent && parent.id !== owned.categoryId ? owned.categoryId : "",
      condition: owned.condition,
      description: owned.description,
      price: owned.price !== null ? String(owned.price) : "",
      hasReceipt: owned.hasOriginalReceipt === true,
      youTubeUrl: owned.youTubeUrl ?? "",
      tikTokUrl: owned.tikTokUrl ?? "",
      instagramUrl: owned.instagramUrl ?? "",
      facebookUrl: owned.facebookUrl ?? "",
      photos: owned.mediaUrls,
      reviewNote: owned.reviewNote ?? null,
    };
  }

  const limits = (plans ?? []).filter((p) => p.isActive && p.photoLimit > 0).map((p) => p.photoLimit);
  const canSell = verification?.personal.status === "Verified";

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight">{draft ? "Edit your ad" : "Post an ad"}</h1>
      <p className="mt-1 text-ink-500">
        {draft
          ? "Saved as a draft. Finish it any time from My ads."
          : location.city || location.state
            ? `Reach genuine buyers near ${locationLabel(location)}`
            : "Reach genuine buyers across Nigeria"}
      </p>

      {verification && !canSell && (
        <div className="mt-6">
          <VerificationBanner
            kind="personal"
            track={verification.personal}
            note={
              verification.personal.status === "PendingReview"
                ? "You'll be able to post ads as a seller once our team approves your verification."
                : "You need to complete account verification before you can become a seller and post ads."
            }
          />
        </div>
      )}

      <PostWizard
        key={draft?.id ?? "new"}
        tree={tree}
        draft={draft}
        canSell={canSell}
        location={location.city || location.state ? locationLabel(location) : null}
        photoLimits={{ max: limits.length ? Math.max(...limits) : FALLBACK_MAX_PHOTOS, min: limits.length ? Math.min(...limits) : FALLBACK_MAX_PHOTOS }}
      />
    </Container>
  );
}
