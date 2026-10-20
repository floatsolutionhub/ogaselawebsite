"use server";

import { api, ApiError, userMessage } from "@/lib/api/client";

// The website's anonymous forms (contact, waiting list, testers, account deletion request). Each
// carries a Cloudflare Turnstile token that Ogasela.API verifies, and the API rate-limits these
// per visitor IP (passed on by the API client). Only these four endpoints can be reached here.

const ENDPOINTS = new Set(["/marketing/contact", "/marketing/waitlist", "/marketing/testers", "/marketing/deletion-requests"]);
const MAX_FIELDS = 20;
const MAX_LENGTH = 5000;

type Result = { ok: true } | { ok: false; status: number; message: string; code?: string };

/** Only a flat object of short strings, booleans, numbers and nulls is forwarded. */
function clean(data: unknown): Record<string, string | number | boolean | null> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length > MAX_FIELDS) return null;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of entries) {
    if (!/^[A-Za-z][A-Za-z0-9]{0,40}$/.test(key)) return null;
    if (value === null || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) out[key] = value;
    else if (typeof value === "string" && value.length <= MAX_LENGTH) out[key] = value;
    else return null;
  }
  return out;
}

export async function postMarketingForm(path: string, data: unknown): Promise<Result> {
  const body = clean(data);
  if (!ENDPOINTS.has(path) || !body) return { ok: false, status: 400, message: "Please check the form and try again." };
  if (typeof body.turnstileToken !== "string" || !body.turnstileToken) {
    return { ok: false, status: 400, message: "Please complete the security check." };
  }
  try {
    await api.post<void>(path, body, false);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof ApiError ? error.status : 0,
      message: userMessage(error, "Something went wrong. Please try again."),
      code: error instanceof ApiError ? error.code : undefined,
    };
  }
}
