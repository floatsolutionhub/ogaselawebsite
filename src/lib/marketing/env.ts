// The website's public settings. The Turnstile site key is public by design (the secret lives
// only on Ogasela.API), so it's a NEXT_PUBLIC_ value the forms read in the browser.
export const env = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
};
