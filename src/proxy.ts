import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { accessTokenExpiry, baseCookie, COOKIE, secondsUntil } from "@/lib/auth/cookies";
import type { AuthTokenResponse } from "@/lib/api/types";

// Runs before every page render and Server Action:
//  1. a strict, per-request nonce Content-Security-Policy;
//  2. ends a signed-in session left idle past OGASELA_AUTO_LOGOUT_MINUTES;
//  3. refreshes the API access token shortly before it expires, so pages always render with a
//     valid one (Server Components can read cookies but can't write them);
//  4. answers what it can before rendering starts - malformed ad/stall ids (404) and signed-out
//     visits to account pages (307 to sign in) - since a streamed page can't change its status.

const isDev = process.env.NODE_ENV === "development";
const REFRESH_EARLY_MS = 60_000;
/** Don't re-write the "last seen" cookie on every request - once a minute is plenty. */
const SEEN_WRITE_INTERVAL_MS = 60_000;

function idleLimitMs(): number {
  const minutes = Number(process.env.OGASELA_AUTO_LOGOUT_MINUTES);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60_000;
}

function apiUrl(): string | null {
  return process.env.OGASELA_API_URL?.replace(/\/+$/, "") ?? null;
}

function buildCsp(nonce: string, https: boolean): string {
  return [
    "default-src 'self'",
    // Cloudflare Turnstile protects the contact, waiting-list and deletion forms. ('strict-dynamic'
    // browsers trust it because our nonce'd code loads it; the host is for older browsers.)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Development injects <style> tags at runtime without a nonce, and a nonce would make browsers
    // ignore 'unsafe-inline' - so dev allows inline styles and production requires the nonce.
    isDev ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    // React writes a few style="" attributes (e.g. image aspect boxes) - attributes can't run code.
    "style-src-attr 'unsafe-inline'",
    // Listing photos come from the API's storage/CDN host.
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    "font-src 'self'",
    `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws: wss:" : ""}`,
    // Sellers' YouTube videos (privacy-enhanced domain), the Turnstile check, and the Locate us map
    // (loaded only when the visitor asks for it).
    "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Only over https - on plain http (a local `npm start`) it would break the page's own requests.
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/**
 * The API rotates refresh tokens, so two refreshes with the same token would sign the user out.
 * A page load fires several requests at once (document, RSC, actions); they all share the first
 * refresh's result for a short while instead of each sending the token again.
 */
const inflight = new Map<string, Promise<AuthTokenResponse | null>>();

function refreshOnce(refreshToken: string): Promise<AuthTokenResponse | null> {
  let pending = inflight.get(refreshToken);
  if (!pending) {
    pending = refresh(refreshToken);
    inflight.set(refreshToken, pending);
    setTimeout(() => inflight.delete(refreshToken), 30_000);
  }
  return pending;
}

/** null: the API rejected the refresh token (session over). Throws on network trouble. */
async function refresh(refreshToken: string): Promise<AuthTokenResponse | null> {
  const base = apiUrl();
  if (!base) return null;
  const response = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status >= 400 && response.status < 500) return null;
  if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);
  return (await response.json()) as AuthTokenResponse;
}

function revoke(refreshToken: string): Promise<void> {
  const base = apiUrl();
  if (!base) return Promise.resolve();
  return fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    signal: AbortSignal.timeout(5_000),
  })
    .then(() => undefined)
    .catch(() => undefined);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_ROUTE = /^\/(listing|seller)\/([^/]+)\/?$/;
const SIGNED_IN_ONLY = [
  "/account",
  "/sell",
  "/my-ads",
  "/analytics",
  "/messages",
  "/notifications",
  "/favourites",
  "/office-pickups",
  "/disputes",
  "/payments",
];
/** Background requests a page makes on its own - they must not count as the user being active. */
const PASSIVE = new Set(["/api/live"]);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const idRoute = pathname.match(ID_ROUTE);
  if (idRoute && !UUID.test(idRoute[2])) {
    // No such page: rewriting to an unknown path renders not-found.tsx with a real 404.
    return NextResponse.rewrite(new URL("/_ogasela-not-found", request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const https = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const csp = buildCsp(nonce, https);
  const now = Date.now();

  // Cookie changes to apply to this request (so the render sees them) and to the response.
  const set: { name: string; value: string; maxAge: number }[] = [];
  const remove: string[] = [];

  const accessToken = request.cookies.get(COOKIE.access)?.value;
  const refreshToken = request.cookies.get(COOKIE.refresh)?.value;
  const lastSeen = Number(request.cookies.get(COOKIE.seen)?.value);

  if (accessToken || refreshToken) {
    const idle = Number.isFinite(lastSeen) && lastSeen > 0 && now - lastSeen >= idleLimitMs();
    if (idle) {
      if (refreshToken) event.waitUntil(revoke(refreshToken));
      remove.push(COOKIE.access, COOKIE.refresh, COOKIE.seen);
    } else {
      const expiry = accessToken ? accessTokenExpiry(accessToken) : null;
      const needsRefresh = !accessToken || expiry === null || expiry - now < REFRESH_EARLY_MS;
      let refreshTtl: number | null = null;

      if (needsRefresh && refreshToken) {
        try {
          const tokens = await refreshOnce(refreshToken);
          if (tokens) {
            refreshTtl = secondsUntil(tokens.refreshTokenExpiresAt);
            set.push({ name: COOKIE.access, value: tokens.accessToken, maxAge: secondsUntil(tokens.accessTokenExpiresAt) });
            set.push({ name: COOKIE.refresh, value: tokens.refreshToken, maxAge: refreshTtl });
          } else {
            remove.push(COOKIE.access, COOKIE.refresh, COOKIE.seen);
          }
        } catch {
          // API unreachable: keep the session; the page renders signed out this time and the
          // next request tries again.
        }
      } else if (needsRefresh && !refreshToken) {
        remove.push(COOKIE.access);
      }

      const passive = PASSIVE.has(pathname);
      if (!passive && !remove.includes(COOKIE.seen) && (!(lastSeen > 0) || now - lastSeen >= SEEN_WRITE_INTERVAL_MS)) {
        set.push({ name: COOKIE.seen, value: String(now), maxAge: refreshTtl ?? 30 * 24 * 3600 });
      }
    }
  }

  const signedIn = request.cookies.has(COOKIE.refresh) && !remove.includes(COOKIE.refresh);
  if (!signedIn && SIGNED_IN_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(signIn);
    for (const name of remove) response.cookies.delete({ name, ...baseCookie });
    return response;
  }

  for (const name of remove) request.cookies.delete(name);
  for (const cookie of set) request.cookies.set(cookie.name, cookie.value);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.set(
    "cookie",
    request.cookies
      .getAll()
      .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
      .join("; "),
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  for (const name of remove) response.cookies.delete({ name, ...baseCookie });
  for (const cookie of set) response.cookies.set(cookie.name, cookie.value, { ...baseCookie, maxAge: cookie.maxAge });
  return response;
}

export const config = {
  matcher: [
    // Everything except build assets and public images.
    "/((?!_next/static|_next/image|images/|icon.png|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
