import { z } from "zod";

// Same rules as OgaselaMobileClient/src/utils/validation.ts (and the API's NigerianPhoneNumber):
// 11 digits, local format - 0, then 7/8/9, then 0/1, then 8 more digits.
export const PHONE_REGEX = /^0[789][01][0-9]{8}$/;
const phoneMessage = "Enter an 11-digit phone number, e.g. 08012345678";

/** Strips anything that isn't a digit and keeps at most 11 - the shape phone inputs accept. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

const email = z.string().trim().toLowerCase().max(254).email("Enter a valid email address");
const phone = z.string().transform(normalizePhone).pipe(z.string().regex(PHONE_REGEX, phoneMessage));
const password = z.string().min(8, "Use at least 8 characters").max(128, "Keep it under 128 characters");
const otp = z.string().trim().regex(/^[0-9]{6}$/, "Enter the 6-digit code");

export const signInSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("email"), email, password: z.string().min(1, "Password is required").max(128) }),
  z.object({ method: z.literal("phone"), phone, password: z.string().min(1, "Password is required").max(128) }),
]);

export const otpSchema = z.object({ code: otp });

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email,
    phone,
    businessName: z.string().trim().min(2, "Enter your shop or business name").max(100, "Keep it under 100 characters"),
    password,
    confirmPassword: z.string(),
    acceptedTerms: z.literal("on", { message: "You must accept the Terms and Privacy Notice" }),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const forgotRequestSchema = z.discriminatedUnion("channel", [
  z.object({ channel: z.literal("Email"), email }),
  z.object({ channel: z.literal("Phone"), phone }),
]);

export const forgotConfirmSchema = z
  .object({ code: otp, newPassword: password, confirmNewPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmNewPassword, { path: ["confirmNewPassword"], message: "Passwords do not match" });

/**
 * An API id. .NET Guids don't have to follow RFC 4122's version/variant bits (the seed data's
 * 5eed0000-... ids don't), so check the 8-4-4-4-12 hex shape rather than z.uuid().
 */
export const uuidSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

/** Field -> first message, for showing under each input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
