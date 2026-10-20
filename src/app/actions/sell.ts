"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, withUser, type ActionResult } from "@/lib/actions";
import { ApiError } from "@/lib/api/client";
import {
  cancelCheckout,
  checkout,
  confirmCheckout,
  createDraft,
  generateDescription,
  getListingForEdit,
  suggestPrice,
  updateListing,
  uploadListingImage,
} from "@/lib/api/services/seller";
import { cancelPickupPayment, confirmPickupPayment } from "@/lib/api/services/deals";
import type { CurrentUser, ListingInput } from "@/lib/api/types";
import { safeHttpUrl } from "@/lib/format";
import { forgetCheckout, paymentReturnUrl, readCheckout, rememberCheckout } from "@/lib/payments";
import { checkUpload } from "@/lib/uploads";
import { uuidSchema } from "@/lib/validation";

// Posting and paying for ads - the app's post.tsx and choose-plan.tsx, server side.

const SOCIAL_DOMAINS = {
  youTubeUrl: ["youtube.com", "youtu.be"],
  tikTokUrl: ["tiktok.com"],
  instagramUrl: ["instagram.com", "instagr.am"],
  facebookUrl: ["facebook.com", "fb.com", "fb.watch"],
} as const;

/** Blank, or an http(s) link on that platform's own domain - the API's ListingSocialLinks rule. */
function socialLink(field: keyof typeof SOCIAL_DOMAINS) {
  return z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        return (url.protocol === "https:" || url.protocol === "http:") && SOCIAL_DOMAINS[field].some((d) => host === d || host.endsWith(`.${d}`));
      } catch {
        return false;
      }
    }, "Enter a full link (starting with https://), or leave it blank.");
}

const draftSchema = z.object({
  title: z.string().trim().min(1, "Give your ad a title").max(150),
  categoryId: uuidSchema,
  condition: z.enum(["New", "Used"]),
  description: z.string().trim().max(5000),
  price: z.number().int().min(0).max(1e12).nullable(),
  mediaUrls: z
    .array(z.string().refine((u) => safeHttpUrl(u) !== null))
    .max(30),
  location: z.string().trim().max(120).nullable(),
  hasOriginalReceipt: z.boolean().nullable(),
  youTubeUrl: socialLink("youTubeUrl"),
  tikTokUrl: socialLink("tikTokUrl"),
  instagramUrl: socialLink("instagramUrl"),
  facebookUrl: socialLink("facebookUrl"),
});

export type DraftInput = z.input<typeof draftSchema>;

async function ownedListing(user: CurrentUser, id: string) {
  const listing = await getListingForEdit(id);
  if (!user.sellerProfile || listing.sellerId !== user.sellerProfile.id) throw new ApiError(404, "That ad couldn't be found.");
  return listing;
}

/**
 * Creates the draft or updates it. Only title and category are needed - the API insists on the
 * rest at checkout. Returns the draft's id.
 */
export async function saveDraft(input: DraftInput, id: string | null): Promise<ActionResult<string>> {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your ad's details.");
  const existing = id === null ? null : uuidSchema.safeParse(id);
  if (existing && !existing.success) return fail("That draft couldn't be found.");

  return withUser(async (user) => {
    const body: ListingInput = { ...parsed.data, promotionPlanId: null, latitude: null, longitude: null };
    if (existing?.success) {
      await ownedListing(user, existing.data);
      await updateListing(existing.data, body);
      return existing.data;
    }
    return (await createDraft(body)).id;
  }, "We couldn't save your ad.");
}

/** One photo, already compressed in the browser - re-checked here before it goes to the API. */
export async function uploadPhoto(form: FormData): Promise<ActionResult<string>> {
  const file = await checkUpload(form.get("image"), false);
  if (typeof file === "string") return fail(file);
  return withUser(async () => (await uploadListingImage(file)).url, "We couldn't upload that photo.");
}

export async function aiDescription(keywords: string, coverUrl: string | null): Promise<ActionResult<string>> {
  const words = z.string().trim().max(300).safeParse(keywords);
  if (!words.success) return fail("Add a title first.");
  return withUser(async () => {
    const result = await generateDescription(words.data || null, coverUrl && safeHttpUrl(coverUrl) ? coverUrl : null);
    return result.description?.trim() ?? "";
  }, "AI suggestions aren't available right now. You can write it yourself.");
}

export async function aiPrice(
  categoryId: string,
  title: string,
  condition: "New" | "Used",
): Promise<ActionResult<{ suggested: number; min: number; max: number; comparables: number }>> {
  const category = uuidSchema.safeParse(categoryId);
  const name = z.string().trim().min(1).max(150).safeParse(title);
  if (!category.success || !name.success || (condition !== "New" && condition !== "Used")) return fail("Add a title and category first.");
  const result = await withUser(async () => {
    const s = await suggestPrice(category.data, name.data, condition);
    // Named *Kobo, but in naira - see OgaselaMobileClient/src/services/ai.ts.
    return { suggested: Math.round(s.suggestedKobo), min: Math.round(s.minKobo), max: Math.round(s.maxKobo), comparables: s.comparableCount };
  });
  if (!result.ok && result.code === "Ai.NotEnoughComparableData") {
    return fail("Not enough similar ads yet for a price suggestion. Set your own price.");
  }
  return result.ok ? result : fail("Price suggestions aren't available right now. Set your own price.");
}

// ---- Checkout ----

/** Friendlier wording for the rules the API checks before any money moves (as the app). */
function checkoutError(error: unknown) {
  const code = error instanceof ApiError ? error.code : undefined;
  switch (code) {
    case "Listing.NotVerified":
      return fail("Verify your account first. Complete verification in your profile, then try again.");
    case "Listing.MediaLimitExceeded":
      return fail("Too many photos for this plan. Choose a bigger plan or remove some photos.");
    case "Listing.CategoryNotFreeEligible":
      return fail("The free plan isn't available in this category. Ads here need a paid plan.");
    case "Listing.FreePlanCapReached":
      return fail("You've used all your free ads. Choose a paid plan, or wait for one of your free ads to end.");
    default:
      return fail(error, "We couldn't complete checkout.");
  }
}

export type CheckoutStart = { kind: "submitted"; underReview: boolean } | { kind: "redirect"; url: string };

export async function startCheckout(listingId: string, planId: string): Promise<ActionResult<CheckoutStart>> {
  const id = uuidSchema.safeParse(listingId);
  const plan = uuidSchema.safeParse(planId);
  if (!id.success || !plan.success) return fail("Choose a plan.");
  const result = await withUser(async (user) => {
    await ownedListing(user, id.data);
    return checkout(id.data, plan.data, paymentReturnUrl());
  });
  if (!result.ok) return result.code === "SignedOut" ? result : checkoutError(result.code ? new ApiError(400, result.error, result.code) : result.error);

  const outcome = result.data;
  if (outcome.outcome === "Submitted") {
    revalidatePath("/my-ads");
    return { ok: true, data: { kind: "submitted", underReview: outcome.listing.status === "PendingReview" } };
  }
  const url = safeHttpUrl(outcome.redirectUrl);
  if (outcome.outcome === "PaymentRequired" && url && outcome.paymentReference) {
    await rememberCheckout({ kind: "listing", id: id.data, reference: outcome.paymentReference });
    return { ok: true, data: { kind: "redirect", url } };
  }
  return fail("We couldn't start the payment. Please try again.");
}

export type SettleResult =
  | { status: "paid"; next: string; title: string; body?: string }
  | { status: "pending"; next: string }
  | { status: "failed" | "cancelled"; next: string; title: string; body: string }
  | { status: "none" };

/**
 * After the payment page: asks the API to confirm (or, if the payer cancelled, to cancel) the
 * checkout remembered in the cookie. Safe to call repeatedly - the gateway's webhook settles it
 * too if the bank is slow.
 */
export async function settleCheckout(mode: "confirm" | "cancel"): Promise<ActionResult<SettleResult>> {
  const pending = await readCheckout();
  if (!pending) return { ok: true, data: { status: "none" } };

  return withUser(async () => {
    if (pending.kind === "listing") {
      const back = `/sell/${pending.id}/promote`;
      const result = mode === "cancel" ? await cancelCheckout(pending.id, pending.reference) : await confirmCheckout(pending.id, pending.reference);
      switch (result.outcome) {
        case "Submitted": {
          await forgetCheckout();
          revalidatePath("/my-ads");
          const underReview = result.listing.status === "PendingReview";
          return {
            status: "paid",
            next: `/my-ads?tab=${underReview ? "pending" : "active"}`,
            title: underReview ? "Paid! Your ad is under review" : "Your ad is live",
            body: underReview ? "We'll let you know as soon as our team approves it." : undefined,
          } satisfies SettleResult;
        }
        case "PaymentFailed":
          await forgetCheckout();
          return { status: "failed", next: back, title: "Payment wasn't completed", body: "Your ad is saved as a draft. You can pay any time." } satisfies SettleResult;
        case "PaymentCancelled":
          await forgetCheckout();
          return { status: "cancelled", next: back, title: "Payment cancelled", body: "Nothing was charged. Your ad is saved as a draft. Pay whenever you're ready." } satisfies SettleResult;
        default:
          return { status: "pending", next: back } satisfies SettleResult;
      }
    }

    const back = `/office-pickups/${pending.id}`;
    const detail = mode === "cancel" ? await cancelPickupPayment(pending.id) : await confirmPickupPayment(pending.id);
    switch (detail.summary.status) {
      case "AwaitingPayment":
        return { status: "pending", next: back } satisfies SettleResult;
      case "PaymentFailed":
        await forgetCheckout();
        return { status: "failed", next: back, title: "Payment wasn't completed", body: "Nothing was charged. You can try again." } satisfies SettleResult;
      case "PaymentCancelled":
        await forgetCheckout();
        return { status: "cancelled", next: back, title: "Payment cancelled", body: "Nothing was charged." } satisfies SettleResult;
      default:
        await forgetCheckout();
        return {
          status: "paid",
          next: back,
          title: "Payment confirmed",
          body: "Your receipt is on its way to your email. We'll update you at every step.",
        } satisfies SettleResult;
    }
  }, "We couldn't check your payment.");
}
