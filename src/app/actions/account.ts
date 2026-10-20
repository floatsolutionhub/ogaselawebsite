"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { fail, withUser, type ActionResult } from "@/lib/actions";
import { api } from "@/lib/api/client";
import {
  cancelChangeRequest,
  deleteMyAccount,
  requestContactChangeCode,
  submitBusinessInfoChange,
  submitContactChange,
  updateProfile,
  uploadDocument as uploadDocumentToApi,
  uploadProfilePhoto,
} from "@/lib/api/services/me";
import { updateNotificationPreferences } from "@/lib/api/services/messaging";
import type { IdDocumentType, NotificationChannel, ProfileChange, UserDocument, UserDocumentType } from "@/lib/api/types";
import { endSession } from "@/lib/auth/session";
import { checkUpload } from "@/lib/uploads";
import { PHONE_REGEX, normalizePhone, uuidSchema } from "@/lib/validation";

// Profile and settings - the app's personal-info, business-info, change-contact, update-password,
// notification-settings, blocked-users and delete-account screens, server side.

export async function saveName(name: string): Promise<ActionResult> {
  const parsed = z.string().trim().min(1, "Enter your name").max(100).safeParse(name);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  return withUser(async () => {
    await updateProfile(parsed.data);
    revalidatePath("/", "layout");
  }, "We couldn't save your changes.");
}

/** The API checks it shows exactly one clear face and says why if not. */
export async function saveProfilePhoto(form: FormData): Promise<ActionResult> {
  const file = await checkUpload(form.get("image"), false);
  if (typeof file === "string") return fail(file);
  return withUser(async () => {
    await uploadProfilePhoto(file);
    revalidatePath("/", "layout");
  }, "We couldn't upload the photo.");
}

const DOCUMENT_TYPES: UserDocumentType[] = ["IdCard", "UtilityBill", "BusinessRegistration", "OfficeUtilityBill"];
const ID_TYPES: IdDocumentType[] = ["NationalIdCard", "NinSlip", "VotersCard", "DriversLicence", "InternationalPassport"];

export async function saveDocument(form: FormData): Promise<ActionResult<UserDocument>> {
  const type = form.get("type");
  if (typeof type !== "string" || !DOCUMENT_TYPES.includes(type as UserDocumentType)) return fail("Choose a document type.");
  const isId = type === "IdCard";
  const idType = form.get("idType");
  const idNumber = typeof form.get("idNumber") === "string" ? String(form.get("idNumber")).trim().toUpperCase() : "";
  if (isId && (typeof idType !== "string" || !ID_TYPES.includes(idType as IdDocumentType))) return fail("Choose the ID type.");
  if (isId && !/^[A-Z0-9]{5,20}$/.test(idNumber)) return fail("Use 5-20 letters or digits for the ID number.");

  const file = await checkUpload(form.get("file"), true);
  if (typeof file === "string") return fail(file);
  return withUser(async () => {
    const document = await uploadDocumentToApi({
      type: type as UserDocumentType,
      idType: isId ? (idType as IdDocumentType) : undefined,
      idNumber: isId ? idNumber : undefined,
      file,
    });
    revalidatePath("/account", "layout");
    return document;
  }, "Upload failed.");
}

export async function saveBusinessInfo(businessName: string, storeAddress: string): Promise<ActionResult<ProfileChange>> {
  const name = z.string().trim().min(2, "Enter your business name").max(200).safeParse(businessName);
  const address = z.string().trim().max(300).safeParse(storeAddress);
  if (!name.success) return fail(name.error.issues[0].message);
  if (!address.success) return fail("Keep the address under 300 characters.");
  return withUser(() => submitBusinessInfoChange(name.data, address.data), "We couldn't submit your changes.");
}

export async function withdrawChange(id: string): Promise<ActionResult> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return fail("That request couldn't be found.");
  return withUser(() => cancelChangeRequest(parsed.data), "We couldn't withdraw the request.");
}

function contactValue(kind: "Phone" | "Email", value: string): string | null {
  if (kind === "Phone") {
    const phone = normalizePhone(value);
    return PHONE_REGEX.test(phone) ? phone : null;
  }
  const email = z.string().trim().toLowerCase().email().max(254).safeParse(value);
  return email.success ? email.data : null;
}

export async function sendContactCode(kind: "Phone" | "Email", value: string): Promise<ActionResult> {
  if (kind !== "Phone" && kind !== "Email") return fail("Choose phone or email.");
  const clean = contactValue(kind, value);
  if (!clean) return fail(kind === "Phone" ? "Enter an 11-digit phone number, e.g. 08012345678" : "Enter a valid email address");
  return withUser(() => requestContactChangeCode(kind, clean), "We couldn't send the code.");
}

export async function confirmContactChange(kind: "Phone" | "Email", value: string, code: string): Promise<ActionResult<ProfileChange>> {
  if (kind !== "Phone" && kind !== "Email") return fail("Choose phone or email.");
  const clean = contactValue(kind, value);
  if (!clean || !/^[0-9]{6}$/.test(code)) return fail("Enter the 6-digit code.");
  return withUser(() => submitContactChange(kind, clean, code), "We couldn't confirm the code.");
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(128),
    newPassword: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: "Choose a different password" })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export async function changePassword(input: z.input<typeof passwordSchema>): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  return withUser(
    () => api.post<void>("/auth/change-password", { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword }),
    "We couldn't update your password.",
  );
}

const CHANNELS: NotificationChannel[] = ["Push", "Sms", "Email", "WhatsApp"];

export async function setNotificationPreference(channel: NotificationChannel, category: string, enabled: boolean): Promise<ActionResult> {
  if (!CHANNELS.includes(channel) || !/^[A-Za-z]{1,50}$/.test(category) || typeof enabled !== "boolean") return fail("That setting couldn't be saved.");
  return withUser(() => updateNotificationPreferences([{ channel, category, enabled }]), "We couldn't save that change.");
}

/** Permanent and immediate: ads come down, personal data is erased, every session is revoked. */
export async function deleteAccount(confirmation: string): Promise<ActionResult> {
  if (confirmation.trim().toUpperCase() !== "DELETE") return fail("Type DELETE to confirm.");
  const result = await withUser(() => deleteMyAccount(), "We couldn't delete your account.");
  if (!result.ok) return result;
  await endSession();
  redirect("/?deleted=1");
}
