import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { baseCookie, OAUTH_COOKIE } from "@/lib/auth/cookies";
import { safeReturnPath } from "@/lib/auth/session";

// Starts Google or Facebook sign-in: a one-time state (and Google nonce) goes into an httpOnly
// cookie, then the browser is sent to the provider. It comes back to /auth/callback with the
// token in the URL fragment, which never reaches any server log.

const PROVIDERS = {
  google: "Google",
  facebook: "Facebook",
} as const;

export async function GET(request: Request, { params }: RouteContext<"/auth/[provider]">) {
  const { provider: key } = await params;
  const provider = PROVIDERS[key as keyof typeof PROVIDERS];
  const back = new URL("/sign-in", env.publicUrl);
  if (!provider) return NextResponse.redirect(back);

  const clientId = provider === "Google" ? env.googleClientId : env.facebookAppId;
  if (!clientId) {
    back.searchParams.set("reason", `${key}-unavailable`);
    return NextResponse.redirect(back);
  }

  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const next = safeReturnPath(new URL(request.url).searchParams.get("next"), "/account");
  (await cookies()).set(OAUTH_COOKIE, JSON.stringify({ provider, state, nonce, next }), { ...baseCookie, maxAge: 10 * 60 });

  const redirectUri = `${env.publicUrl}/auth/callback`;
  const target =
    provider === "Google"
      ? new URL("https://accounts.google.com/o/oauth2/v2/auth")
      : new URL("https://www.facebook.com/v19.0/dialog/oauth");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", redirectUri);
  target.searchParams.set("state", state);
  if (provider === "Google") {
    target.searchParams.set("response_type", "id_token");
    target.searchParams.set("scope", "openid email profile");
    target.searchParams.set("nonce", nonce);
    target.searchParams.set("prompt", "select_account");
  } else {
    target.searchParams.set("response_type", "token");
    target.searchParams.set("scope", "public_profile,email");
  }
  return NextResponse.redirect(target);
}
