import type { NextConfig } from "next";

// Cache Components / Partial Prefetching stay off on purpose: every page is rendered per request
// so it can carry a per-request CSP nonce (see src/proxy.ts). The Next docs list nonce-based CSP as
// incompatible with prerendered static shells, and a marketplace's pages are live data anyway.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The SignalR client (live chat relay, src/app/api/live) ships Node-only optional modules.
  serverExternalPackages: ["@microsoft/signalr"],
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Proxy buffers request bodies up to this - must cover the largest upload.
    proxyClientMaxBodySize: "11mb",
    serverActions: {
      // Photos are compressed in the browser first (a few hundred KB); PDFs are capped at 10MB.
      bodySizeLimit: "11mb",
    },
  },
  async redirects() {
    return [
      // Kept from OgaselaWebsite: the payment gateways' original callback path (the query string
      // - reference etc. - is kept). Published app builds depend on it.
      { source: "/wallet/callback", destination: "/payment/complete", permanent: false },
      // Links already sent in Ogasela.API's emails (BrandedEmailTemplate footer).
      { source: "/help", destination: "/contact", permanent: false },
      { source: "/privacy", destination: "/privacy-policy", permanent: false },
      { source: "/terms", destination: "/terms-and-conditions", permanent: false },
    ];
  },
  // Static security headers. The CSP is per request (it needs a fresh nonce), so it's set in
  // src/proxy.ts instead.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
