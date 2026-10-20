"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { api, userMessage } from "@/lib/api/client";
import type { AuthTokenResponse, LoginOtpSentResponse, RegisterResponse, SocialLoginResponse } from "@/lib/api/types";
import { baseCookie, OAUTH_COOKIE } from "@/lib/auth/cookies";
import { endSession, safeReturnPath, setSession } from "@/lib/auth/session";
import {
  fieldErrors,
  forgotConfirmSchema,
  forgotRequestSchema,
  otpSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation";

// Every auth step runs here on the server: passwords and codes go browser -> this server -> API,
// and the tokens the API returns go straight into httpOnly cookies. Nothing token-shaped is ever
// returned to the browser. Server Actions also reject cross-origin posts (Origin check).

export type FormState = {
  step: "form" | "code" | "done";
  errors?: Record<string, string>;
  message?: string;
  /** Where the code went, already masked by the API. */
  sentTo?: string;
  /** Heading for the code step - "Verify your email" when that's what the code also does. */
  codeTitle?: string;
  codeMessage?: string;
  /** Echoed back so a failed submit doesn't wipe the form (never passwords). */
  values?: Record<string, string>;
};

/** The email/phone a code was sent to, kept server-side between the two steps. */
const PENDING_LOGIN = "og_pending_login";
const PENDING_RESET = "og_pending_reset";
const PENDING_TTL = 10 * 60;

type Identifier = { email: string } | { phone: string };

async function setPending(name: string, identifier: Identifier) {
  (await cookies()).set(name, JSON.stringify(identifier), { ...baseCookie, maxAge: PENDING_TTL });
}

async function readPending(name: string): Promise<Identifier | null> {
  const raw = (await cookies()).get(name)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.email === "string") return { email: parsed.email };
    if (typeof parsed.phone === "string") return { phone: parsed.phone };
  } catch {
    // Tampered or stale - start over.
  }
  return null;
}

function sentTo(response: LoginOtpSentResponse): string {
  return [response.maskedPhone, response.maskedEmail].filter(Boolean).join(" and ") || "your phone or email";
}

/** Same wording as the app (OgaselaMobileClient/src/utils/loginOtp.ts). */
function codeCopy(sent: LoginOtpSentResponse): Pick<FormState, "sentTo" | "codeTitle" | "codeMessage"> {
  if (sent.verificationRequired) {
    const destination = sent.channel === "Email" ? sent.maskedEmail : sent.maskedPhone;
    const what = sent.channel === "Email" ? "email" : "phone number";
    return {
      sentTo: destination,
      codeTitle: sent.channel === "Email" ? "Verify your email" : "Verify your phone number",
      codeMessage: `Your ${what} isn't verified yet. Enter the 6-digit code we sent to ${destination} to verify it and finish signing in.`,
    };
  }
  const destinations = sentTo(sent);
  return { sentTo: destinations, codeTitle: "Enter your code", codeMessage: `We sent a 6-digit code to ${destinations}.` };
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Sign in: step 1 (password) -> step 2 (6-digit code)

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const method = str(formData, "method") === "phone" ? "phone" : "email";
  const values = { method, email: str(formData, "email"), phone: str(formData, "phone") };
  const parsed = signInSchema.safeParse({ ...values, password: str(formData, "password") });
  if (!parsed.success) return { step: "form", errors: fieldErrors(parsed.error), values };

  const identifier: Identifier = parsed.data.method === "email" ? { email: parsed.data.email } : { phone: parsed.data.phone };
  try {
    const response = await api.post<LoginOtpSentResponse>(
      "/auth/login",
      { email: null, phone: null, ...identifier, password: parsed.data.password },
      false,
    );
    await setPending(PENDING_LOGIN, identifier);
    return { step: "code", ...codeCopy(response), values };
  } catch (error) {
    return { step: "form", message: userMessage(error, "We couldn't sign you in."), values };
  }
}

export async function verifySignIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = await readPending(PENDING_LOGIN);
  if (!identifier) return { step: "form", message: "That code has expired. Please sign in again." };

  const parsed = otpSchema.safeParse({ code: str(formData, "code") });
  if (!parsed.success) return { step: "code", errors: fieldErrors(parsed.error) };

  try {
    const tokens = await api.post<AuthTokenResponse>(
      "/auth/login/verify",
      { email: null, phone: null, ...identifier, code: parsed.data.code },
      false,
    );
    await setSession(tokens);
    (await cookies()).delete({ name: PENDING_LOGIN, ...baseCookie });
  } catch (error) {
    return { step: "code", message: userMessage(error, "That code didn't work.") };
  }
  redirect(safeReturnPath(str(formData, "next"), "/account"));
}

// Sign up: create the account, then the same code step as sign-in

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    fullName: str(formData, "fullName"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    businessName: str(formData, "businessName"),
  };
  const parsed = signUpSchema.safeParse({
    ...values,
    password: str(formData, "password"),
    confirmPassword: str(formData, "confirmPassword"),
    acceptedTerms: str(formData, "acceptedTerms"),
  });
  if (!parsed.success) return { step: "form", errors: fieldErrors(parsed.error), values };

  const input = parsed.data;
  try {
    // Same as the app: every new account is a Seller with a shop name (buyers can still just buy).
    await api.post<RegisterResponse>(
      "/auth/register",
      {
        phone: input.phone,
        email: input.email,
        password: input.password,
        accountType: "Seller",
        businessName: input.businessName,
        rcNumber: null,
        nin: null,
        name: input.fullName,
      },
      false,
    );
    const response = await api.post<LoginOtpSentResponse>(
      "/auth/login",
      { phone: input.phone, email: null, password: input.password },
      false,
    );
    await setPending(PENDING_LOGIN, { phone: input.phone });
    return { step: "code", ...codeCopy(response), values };
  } catch (error) {
    return { step: "form", message: userMessage(error, "We couldn't create your account."), values };
  }
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/");
}

/** The tab sat idle past the auto sign-out limit (see SessionProvider). */
export async function signOutForInactivity(): Promise<void> {
  await endSession();
  redirect("/sign-in?reason=idle");
}

// Forgot password: request a code -> code + new password

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const channel = str(formData, "channel") === "Phone" ? "Phone" : "Email";
  const values = { channel, email: str(formData, "email"), phone: str(formData, "phone") };
  const parsed = forgotRequestSchema.safeParse(values);
  if (!parsed.success) return { step: "form", errors: fieldErrors(parsed.error), values };

  const identifier: Identifier = parsed.data.channel === "Email" ? { email: parsed.data.email } : { phone: parsed.data.phone };
  try {
    await api.post<void>(
      "/auth/password-reset/request",
      { channel: parsed.data.channel, email: null, phone: null, ...identifier },
      false,
    );
  } catch (error) {
    return { step: "form", message: userMessage(error), values };
  }
  await setPending(PENDING_RESET, identifier);
  // The API never says whether an account matched, and neither do we.
  return {
    step: "code",
    sentTo: "email" in identifier ? identifier.email : identifier.phone,
    values,
  };
}

/** "Resend code" on the reset step - to the same email or phone as before. */
export async function resendPasswordReset(): Promise<{ ok: boolean; message: string }> {
  const identifier = await readPending(PENDING_RESET);
  if (!identifier) return { ok: false, message: "That request has expired. Please start again." };
  try {
    await api.post<void>(
      "/auth/password-reset/request",
      { channel: "email" in identifier ? "Email" : "Phone", email: null, phone: null, ...identifier },
      false,
    );
    await setPending(PENDING_RESET, identifier);
    return { ok: true, message: "New code sent." };
  } catch (error) {
    return { ok: false, message: userMessage(error, "We couldn't resend the code.") };
  }
}

export async function confirmPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = await readPending(PENDING_RESET);
  if (!identifier) return { step: "form", message: "That code has expired. Please request a new one." };

  const parsed = forgotConfirmSchema.safeParse({
    code: str(formData, "code"),
    newPassword: str(formData, "newPassword"),
    confirmNewPassword: str(formData, "confirmNewPassword"),
  });
  if (!parsed.success) return { step: "code", errors: fieldErrors(parsed.error) };

  try {
    await api.post<void>(
      "/auth/password-reset/confirm",
      { email: null, phone: null, ...identifier, code: parsed.data.code, newPassword: parsed.data.newPassword },
      false,
    );
  } catch (error) {
    return { step: "code", message: userMessage(error, "That code didn't work.") };
  }
  (await cookies()).delete({ name: PENDING_RESET, ...baseCookie });
  return { step: "done" };
}

// Google / Facebook sign-in. /auth/[provider] (route handler) sends the browser to the provider
// with a one-time state (and, for Google, a nonce) kept in an httpOnly cookie; the provider
// returns the token in the URL fragment to /auth/callback, which hands it here. Nothing is
// trusted unless the state matches. The API verifies the token itself before signing in.

const oauthSchema = z.object({
  provider: z.enum(["Google", "Facebook"]),
  state: z.string().min(16),
  nonce: z.string().min(16),
  next: z.string(),
});

function jwtClaim(token: string, claim: string): unknown {
  try {
    const payload = token.split(".")[1];
    return (JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>)[claim];
  } catch {
    return undefined;
  }
}

export async function completeSocialSignIn(input: {
  state: string;
  idToken?: string;
  accessToken?: string;
}): Promise<{ ok: false; message: string } | never> {
  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, ...baseCookie });

  let pending: z.infer<typeof oauthSchema>;
  try {
    pending = oauthSchema.parse(JSON.parse(raw ?? ""));
  } catch {
    return { ok: false, message: "That sign-in link has expired. Please try again." };
  }
  if (typeof input.state !== "string" || input.state !== pending.state) {
    return { ok: false, message: "We couldn't confirm that sign-in. Please try again." };
  }

  const token = pending.provider === "Google" ? input.idToken : input.accessToken;
  if (typeof token !== "string" || token.length < 20 || token.length > 8192) {
    return { ok: false, message: `${pending.provider} sign-in was cancelled.` };
  }
  // The ID token must be the one minted for this attempt, not one lifted from elsewhere.
  if (pending.provider === "Google" && jwtClaim(token, "nonce") !== pending.nonce) {
    return { ok: false, message: "We couldn't confirm that sign-in. Please try again." };
  }

  try {
    // New accounts are Sellers, matching the app's sign-up.
    const result = await api.post<SocialLoginResponse>(
      "/auth/social",
      { provider: pending.provider, token, name: null, accountType: "Seller" },
      false,
    );
    await setSession(result);
  } catch (error) {
    return { ok: false, message: userMessage(error, `${pending.provider} sign-in failed.`) };
  }
  redirect(safeReturnPath(pending.next, "/account"));
}
