"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, withUser, type ActionResult } from "@/lib/actions";
import { ApiError } from "@/lib/api/client";
import { getBranches, getPickupQuote, startPickup } from "@/lib/api/services/deals";
import { blockUser, reportUser, startConversation, unblockUser } from "@/lib/api/services/messaging";
import { reportListing } from "@/lib/api/services/seller";
import type { OfficeBranch, OfficePickupQuote } from "@/lib/api/types";
import { safeHttpUrl } from "@/lib/format";
import { paymentReturnUrl, rememberCheckout } from "@/lib/payments";
import { getListing, recordEngagement, toCardItem } from "@/lib/api/marketplace";
import type { SearchResultItem } from "@/lib/api/types";
import { uuidSchema } from "@/lib/validation";

/** Call tap on an ad - counts toward the seller's analytics. */
export async function recordCallClick(listingId: string): Promise<void> {
  const id = uuidSchema.safeParse(listingId);
  if (id.success) await recordEngagement(id.data, "CallClick");
}

/** Saved to favourites - favourites themselves stay in this browser, like on the app. */
export async function recordSave(listingId: string): Promise<void> {
  const id = uuidSchema.safeParse(listingId);
  if (id.success) await recordEngagement(id.data, "Save");
}

const MAX_FAVOURITES = 40;
const idsSchema = z.array(uuidSchema).max(MAX_FAVOURITES);

/**
 * Cards for the favourites page. `missing` lists ads that are gone for good (404 or back in
 * draft), which the caller drops from storage.
 */
export async function getFavouriteCards(ids: unknown): Promise<{ items: SearchResultItem[]; missing: string[] }> {
  const parsed = idsSchema.safeParse(Array.isArray(ids) ? ids.slice(0, MAX_FAVOURITES) : []);
  if (!parsed.success) return { items: [], missing: [] };

  const results = await Promise.allSettled(parsed.data.map((id) => getListing(id)));
  const items: SearchResultItem[] = [];
  const missing: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      if (result.value.status === "Draft") missing.push(parsed.data[i]);
      else items.push(toCardItem(result.value));
    } else if (result.reason instanceof ApiError && result.reason.status === 404) {
      // Gone for good. Anything else (API down, timeout) keeps the favourite for next time.
      missing.push(parsed.data[i]);
    }
  });
  return { items, missing };
}

// ---- Contacting a seller ----

const reasonSchema = z.string().trim().min(3, "Choose a reason").max(500);

/** "Message" on an ad: opens (or reuses) the chat about it and returns its id. */
export async function startChat(listingId: string): Promise<ActionResult<string>> {
  const id = uuidSchema.safeParse(listingId);
  if (!id.success) return fail("That ad couldn't be found.");
  return withUser(async () => (await startConversation(id.data)).id, "We couldn't start a chat.");
}

export async function reportAd(listingId: string, reason: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(listingId);
  const why = reasonSchema.safeParse(reason);
  if (!id.success || !why.success) return fail("Choose a reason.");
  return withUser(() => reportListing(id.data, why.data), "We couldn't send your report.");
}

export async function reportSeller(userId: string, reason: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(userId);
  const why = reasonSchema.safeParse(reason);
  if (!id.success || !why.success) return fail("Choose a reason.");
  return withUser(() => reportUser(id.data, why.data), "We couldn't send your report.");
}

export async function setBlocked(userId: string, blocked: boolean): Promise<ActionResult> {
  const id = uuidSchema.safeParse(userId);
  if (!id.success) return fail("That user couldn't be found.");
  return withUser(async () => {
    await (blocked ? blockUser(id.data) : unblockUser(id.data));
    revalidatePath("/", "layout");
  });
}

// ---- Office pickup ----

const coordsSchema = z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).nullable();

export async function loadOfficePickup(
  listingId: string,
  coords: { latitude: number; longitude: number } | null,
): Promise<ActionResult<{ quote: OfficePickupQuote; branches: OfficeBranch[] }>> {
  const id = uuidSchema.safeParse(listingId);
  const at = coordsSchema.safeParse(coords);
  if (!id.success) return fail("That ad couldn't be found.");
  return withUser(async () => {
    const [quote, branches] = await Promise.all([getPickupQuote(id.data), getBranches(at.success ? at.data : null)]);
    return { quote, branches };
  }, "We couldn't load office pickup details.");
}

/** Creates the request and returns the payment page to send the buyer to. */
export async function startOfficePickup(listingId: string, branchId: string): Promise<ActionResult<string>> {
  const listing = uuidSchema.safeParse(listingId);
  const branch = uuidSchema.safeParse(branchId);
  if (!listing.success || !branch.success) return fail("Choose a pickup branch.");
  return withUser(async () => {
    const checkout = await startPickup(listing.data, branch.data, paymentReturnUrl());
    const target = safeHttpUrl(checkout.redirectUrl);
    if (!target) throw new Error("No payment page");
    await rememberCheckout({ kind: "pickup", id: checkout.request.id, reference: checkout.paymentReference });
    return target;
  }, "We couldn't start office pickup.");
}
