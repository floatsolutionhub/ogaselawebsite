import "server-only";

function parseMinutes(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Only https links (or blank) - a typo'd env value must never become a javascript: href. */
function httpsUrl(value: string | undefined): string {
  if (!value) return "";
  try {
    return new URL(value).protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}

function requireApiUrl(): string {
  const value = process.env.OGASELA_API_URL;
  if (!value) {
    // Fails loudly rather than producing confusing fetch errors later.
    throw new Error("OGASELA_API_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  return value.replace(/\/+$/, "");
}

/** This site's own public origin - never derived from the Host header, which a client controls. */
function publicUrl(): string {
  const value = process.env.OGASELA_PUBLIC_URL ?? "http://localhost:3001";
  try {
    return new URL(value).origin;
  } catch {
    throw new Error("OGASELA_PUBLIC_URL must be a full URL, e.g. https://market.ogasela.com");
  }
}

export const env = {
  get apiUrl() {
    return requireApiUrl();
  },
  /** The API host root (no /api/v1) - where the SignalR hub lives. */
  get apiOrigin() {
    return requireApiUrl().replace(/\/api\/v1$/, "");
  },
  get publicUrl() {
    return publicUrl();
  },
  /** Social sign-in. Blank keeps the button but it answers "not available yet", like the app. */
  googleClientId: process.env.OGASELA_GOOGLE_CLIENT_ID ?? "",
  facebookAppId: process.env.OGASELA_FACEBOOK_APP_ID ?? "",
  autoLogoutMinutes: parseMinutes(process.env.OGASELA_AUTO_LOGOUT_MINUTES, 10),
  supportPhone: (process.env.OGASELA_SUPPORT_PHONE ?? "").replace(/[^\d+]/g, ""),
  supportWhatsappUrl: httpsUrl(process.env.OGASELA_SUPPORT_WHATSAPP_URL),
  isProduction: process.env.NODE_ENV === "production",
};
