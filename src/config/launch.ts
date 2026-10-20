/**
 * Server-only: import this from server components, never from a "use client" file (the values
 * would be undefined in the browser). Launch settings from .env. These are deliberately not NEXT_PUBLIC_, so they're read here on the
 * server (in the root layout) and handed to client components through LaunchProvider. Like
 * NEXT_PUBLIC_ values they're fixed when the site is built, so rebuild/redeploy after changing them.
 */
export interface LaunchConfig {
  /** NEXT_APP_LIVE=true once the app is in the stores. Until then every "Get the app" becomes "Join waiting list". */
  appLive: boolean;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  /** The Paystack donation page. Null hides the donate button rather than linking nowhere. */
  donationUrl: string | null;
}

/** Only absolute https links are used, so a typo in .env can't produce a dead or relative link. */
function httpsUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

export function getLaunchConfig(): LaunchConfig {
  return {
    appLive: process.env.NEXT_APP_LIVE?.trim().toLowerCase() === "true",
    appStoreUrl: httpsUrl(process.env.NEXT_APPSTORE_URL),
    playStoreUrl: httpsUrl(process.env.NEXT_PLAYSTORE_URL),
    donationUrl: httpsUrl(process.env.NEXT_DONATION_PAGE_URL),
  };
}
