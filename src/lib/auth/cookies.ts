// Session cookie names and options. Shared by src/proxy.ts and the server code, so this file must
// not import next/headers.
//
// The API's access and refresh tokens live only in httpOnly cookies: page scripts can never read
// them, so an XSS bug can't steal a session. SameSite=Lax plus Server Actions' own Origin check
// covers CSRF. The __Host- prefix (production only - it requires https) pins the cookies to this
// exact host and path, so a sibling subdomain can't plant or overwrite them.

const secure = process.env.NODE_ENV === "production";
const prefix = secure ? "__Host-" : "";

export const COOKIE = {
  access: `${prefix}og_at`,
  refresh: `${prefix}og_rt`,
  /** Epoch ms of the last page load/action - drives the idle sign-out. */
  seen: `${prefix}og_seen`,
} as const;

/** One-time state for a Google/Facebook sign-in in progress (see completeSocialSignIn). */
export const OAUTH_COOKIE = `${prefix}og_oauth`;

export const baseCookie = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

/** Seconds from now until an ISO timestamp, floored at 0. */
export function secondsUntil(iso: string): number {
  const ms = Date.parse(iso) - Date.now();
  return Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 1000)) : 0;
}

/**
 * The access token's `exp`, in epoch ms - read only to decide when to refresh, never trusted for
 * anything else (the API validates the token itself). Null if it can't be read.
 */
export function accessTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}
