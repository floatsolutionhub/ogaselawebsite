"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, withUser, type ActionResult } from "@/lib/actions";
import { confirmPickupPayment, raiseDispute, replyToDispute, requestPickupCancellation } from "@/lib/api/services/deals";
import type { DisputeReason, DisputeSummary, DisputeThreadMessage, OfficePickupDetail } from "@/lib/api/types";
import { checkUpload } from "@/lib/uploads";
import { uuidSchema } from "@/lib/validation";

// Office pickups and disputes - the app's office-pickups/[id] and disputes screens, server side.

export async function checkPickupPayment(id: string): Promise<ActionResult<OfficePickupDetail>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return fail("That request couldn't be found.");
  return withUser(async () => {
    const detail = await confirmPickupPayment(parsed.data);
    revalidatePath(`/office-pickups/${parsed.data}`);
    return detail;
  }, "We couldn't check the payment.");
}

export async function cancelPickup(id: string, reason: string): Promise<ActionResult> {
  const parsed = uuidSchema.safeParse(id);
  const why = z.string().trim().min(1, "Tell us why you're cancelling.").max(1000).safeParse(reason);
  if (!parsed.success) return fail("That request couldn't be found.");
  if (!why.success) return fail(why.error.issues[0].message);
  return withUser(async () => {
    await requestPickupCancellation(parsed.data, why.data);
    revalidatePath(`/office-pickups/${parsed.data}`);
  }, "We couldn't request cancellation.");
}

const REASONS: DisputeReason[] = ["ItemNotAsDescribed", "NotDelivered", "PaidNoResponse", "FakeOrCounterfeit", "BuyerDidNotPay", "Other"];
const MAX_EVIDENCE = 4;

export async function openDispute(form: FormData): Promise<ActionResult<DisputeSummary>> {
  const listingId = uuidSchema.safeParse(form.get("listingId"));
  const conversationRaw = form.get("conversationId");
  const conversationId = conversationRaw ? uuidSchema.safeParse(conversationRaw) : null;
  const reason = form.get("reason");
  const description = z.string().trim().min(20, "Tell us a bit more: at least 20 characters.").max(2000).safeParse(form.get("description"));
  if (!listingId.success) return fail("That ad couldn't be found.");
  if (conversationId && !conversationId.success) return fail("That chat couldn't be found.");
  if (typeof reason !== "string" || !REASONS.includes(reason as DisputeReason)) return fail("Choose what went wrong.");
  if (!description.success) return fail(description.error.issues[0].message);

  const evidence: File[] = [];
  for (const entry of form.getAll("evidence").slice(0, MAX_EVIDENCE)) {
    const file = await checkUpload(entry, true);
    if (typeof file === "string") return fail(file);
    evidence.push(file);
  }

  return withUser(
    () =>
      raiseDispute({
        listingId: listingId.data,
        conversationId: conversationId?.success ? conversationId.data : null,
        reason: reason as DisputeReason,
        description: description.data,
        evidence,
      }),
    "We couldn't open the dispute.",
  );
}

export async function replyDispute(form: FormData): Promise<ActionResult<DisputeThreadMessage>> {
  const id = uuidSchema.safeParse(form.get("disputeId"));
  const body = z.string().trim().min(1, "Write a reply.").max(2000).safeParse(form.get("body"));
  if (!id.success) return fail("That dispute couldn't be found.");
  if (!body.success) return fail(body.error.issues[0].message);
  const attachmentEntry = form.get("attachment");
  let attachment: File | null = null;
  if (attachmentEntry instanceof File && attachmentEntry.size > 0) {
    const file = await checkUpload(attachmentEntry, false);
    if (typeof file === "string") return fail(file);
    attachment = file;
  }
  return withUser(() => replyToDispute(id.data, body.data, attachment), "Reply not sent.");
}
