# OgaselaWebClient

ogasela.com: the Ogasela marketplace on the web plus every page of the former marketing site
(OgaselaWebsite, merged in). It is a standalone client with the same features as
OgaselaMobileClient, built on the same Ogasela.API. When a feature changes in the app, it changes
here too.

## URLs that must never move

Published app builds and already-sent emails depend on these, so keep them at these exact paths:

- **`/payment/complete`**: the payment gateways' callback (`Payments:*:CallbackUrl` in the API).
  It shows the result, then hands the payer back to the app via `ogasela://payment-complete`.
- **`/wallet/callback`**: redirects to `/payment/complete`, keeping its query string.
- **`/terms-and-conditions`, `/privacy-policy`, `/contact`**: the app's `src/config/links.ts`.
- **`/account-deletion`**: the store listings' account deletion page.
- **`/help`, `/privacy`, `/terms`**: redirect to their pages, for links in the API's email footer.
- **Home anchors `/#download`, `/#faqs`, `/#get-involved`, `/#how-it-works`**: in-site links.

The merged marketing pages are `/about`, `/how-it-works`, `/trust-and-safety`, `/careers`,
`/contact`, `/locate-us`, `/privacy-policy`, `/terms-and-conditions`, `/account-deletion` and
`/payment/complete`. Their components are in `src/components/site/`. Their forms (contact, waiting
list, testers, deletion requests) post through a Server Action (`src/app/actions/marketing.ts`)
rather than from the browser, and keep their Cloudflare Turnstile check. The launch switches
(`NEXT_APP_LIVE`, store and donation URLs) keep the website's variable names.

Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, zod, @microsoft/signalr (server-side only).

## Run it

```bash
cp .env.example .env.local   # point OGASELA_API_URL at the API
npm install
npm run dev                  # http://localhost:3001  (OgaselaWebsite uses 3000)
npm run build && npm start   # production, also on 3001
```

## What's here (app screen → web page)

| App | Web |
| --- | --- |
| Home (location, Hot Picks by city, categories, verification badges, announcements, support button) | `/` |
| Search + filter sheet (subcategories, price, condition, verified sellers, sort, distance) | `/search` |
| Ad (gallery, message, call, office pickup, report ad/seller, dispute, reviews, similar ads) | `/listing/[id]` |
| Seller storefront | `/seller/[id]` |
| Sign in (email/phone + code, Google, Facebook), sign up, forgot password | `/sign-in`, `/sign-up`, `/forgot-password` |
| Post an ad (3 steps, AI description/price, drafts) → Promote & pay | `/sell`, `/sell/[id]/promote` |
| My ads (Active / Draft / Pending / Expired) | `/my-ads` |
| Analytics | `/analytics` |
| Messages + chat (live, block/unblock, office pickup prompt) | `/messages`, `/messages/[id]` |
| Notifications inbox | `/notifications` |
| Favourites (kept in this browser, like the app keeps them on the device) | `/favourites` |
| Profile, Settings, Personal info (live selfie, ID documents), Business info, change phone/email, password, notification settings, blocked users, delete account | `/account/...` |
| Office pickups | `/office-pickups`, `/office-pickups/[id]` |
| Disputes | `/disputes`, `/disputes/new`, `/disputes/[id]` |
| Payment return | `/payments/return` |

The app has its wallet, Facebook/TikTok ad boosting and AI image enhancement switched off, and
there's no buyer review form, so none of these are on the web either. Push notifications are the
one device-only feature: the web has the in-app inbox and live badges instead.

## Security model

- **The browser never talks to the API and never sees a token.** Pages (Server Components) and
  Server Actions call Ogasela.API from the Next server (`src/lib/api/client.ts`, server-only). The
  access and refresh tokens live in `httpOnly`, `SameSite=Lax` cookies (`__Host-` prefixed in
  production). There is no generic browser-to-API proxy.
- **Every Server Action re-checks the session and validates its input with zod**
  (`src/lib/actions.ts`, `src/app/actions/*`). Actions return safe messages and never throw raw
  errors to the browser.
- **Live chat without exposing tokens.** `/api/live` holds the SignalR hub connection on the
  server and relays new messages and unread counts to the browser as Server-Sent Events. Each
  stream ends after 8 minutes and reconnects through the proxy, so it always uses a fresh token.
- **Uploads.** Photos are compressed in the browser first (`src/lib/client/images.ts`, same edge
  limits as the app). The server re-checks each file's real type from its first bytes and its
  size (`src/lib/uploads.ts`) before forwarding it to the API.
- **`src/proxy.ts` runs before every render.** It:
  - sets a per-request nonce Content-Security-Policy;
  - refreshes tokens before they expire (single-flight, because the API rotates refresh tokens);
  - signs out sessions idle longer than `OGASELA_AUTO_LOGOUT_MINUTES` (default 10, as in the
    app; clicks and keys count as activity);
  - sends real 404s and sign-in redirects before streaming starts.
- **Payments.** Checkout sends the payer to Paystack/Flutterwave. What was paid for is kept in an
  `httpOnly` cookie, and the gateway sends the payer back to `/payments/return`, which confirms
  with the API.
- **Google/Facebook sign-in uses redirects only, with no third-party scripts on the page.** A
  one-time `state` (and a Google `nonce`) in an `httpOnly` cookie is checked when the provider
  returns, and the API verifies the token itself.
- **Static security headers** (HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy,
  Permissions-Policy allowing camera and location for this site only) are set in
  `next.config.ts`.

Cache Components / Partial Prefetching are turned off on purpose: nonce-based CSP needs every
page rendered per request.

## Deployment checklist

1. `.env`: `OGASELA_API_URL`, and `OGASELA_PUBLIC_URL` set to this site's real https origin.
2. Ogasela.API (`Payments:AllowedReturnUrls`): add `"<OGASELA_PUBLIC_URL>/payments/return"`.
   Without it, card checkouts are refused with `Payment.ReturnUrlNotAllowed`.
3. Ogasela.API (`ForwardedHeaders:KnownProxies`): add the IPs of the nginx in front of the API and
   of this web server, so rate limits count per visitor. The proxy in front of this app must set
   `X-Real-IP` (or append to `X-Forwarded-For`).
4. Google sign-in: set `OGASELA_GOOGLE_CLIENT_ID` (the API's `GOOGLE_WEB_CLIENT_ID`), and register
   `<OGASELA_PUBLIC_URL>/auth/callback` as an authorised redirect URI on that web client.
5. Cloudflare Turnstile: make sure the site key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` lists this
   site's domain.
6. Facebook sign-in: set `OGASELA_FACEBOOK_APP_ID`, and register the same callback as a valid OAuth
   redirect URI.

## Conventions

- **Brand tokens** (green and gold, Poppins) match the mobile app. Market-square styles are
  custom Tailwind utilities in `src/app/globals.css`: `awning`, `ankara`, `woven`, `price-tag`.
- **API types** in `src/lib/api/types.ts` mirror `OgaselaMobileClient/src/types/api.ts`. Services
  in `src/lib/api/services/` follow the app's `src/services/`, one function per route.
- **Phone inputs** take digits only, max 11, local format (`08012345678`), as in the app.
- **Dates** show in Nigerian time (Africa/Lagos), not the server's.
