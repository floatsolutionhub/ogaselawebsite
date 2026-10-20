import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { api, ApiError } from "@/lib/api/client";
import type { AuthTokenResponse, CurrentUser } from "@/lib/api/types";
import { baseCookie, COOKIE, secondsUntil } from "./cookies";

/** Only roles the consumer app serves - staff accounts use the Control Portal. */
const CONSUMER_ROLES = new Set(["Buyer", "Seller"]);

/** Stores a fresh token pair. Call only from a Server Action or Route Handler. */
export async function setSession(tokens: AuthTokenResponse): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE.access, tokens.accessToken, { ...baseCookie, maxAge: secondsUntil(tokens.accessTokenExpiresAt) });
  jar.set(COOKIE.refresh, tokens.refreshToken, { ...baseCookie, maxAge: secondsUntil(tokens.refreshTokenExpiresAt) });
  jar.set(COOKIE.seen, String(Date.now()), { ...baseCookie, maxAge: secondsUntil(tokens.refreshTokenExpiresAt) });
}

/** Revokes the refresh token on the API (best effort) and clears the cookies. */
export async function endSession(): Promise<void> {
  const jar = await cookies();
  const refreshToken = jar.get(COOKIE.refresh)?.value;
  if (refreshToken) {
    await api.post<void>("/auth/logout", { refreshToken }, false).catch(() => {});
  }
  jar.delete({ name: COOKIE.access, ...baseCookie });
  jar.delete({ name: COOKIE.refresh, ...baseCookie });
  jar.delete({ name: COOKIE.seen, ...baseCookie });
}

/**
 * The signed-in user, or null. One /me call per render however many components ask. A 401 here
 * means the token was rejected (src/proxy.ts already refreshed it if it could), so treat it as
 * signed out; an API outage also renders signed out rather than crashing the page.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  if (!jar.get(COOKIE.access)?.value) return null;
  try {
    const me = await api.get<CurrentUser>("/me");
    return CONSUMER_ROLES.has(me.role) ? me : null;
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
});

/** For pages and actions that need a user: sends signed-out visitors to sign in and back. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Same-site relative paths only, so ?next= can't bounce a fresh sign-in to another site. */
export function safeReturnPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
