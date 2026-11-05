import type { MetadataRoute } from "next";

// Written to a file at build time (the site is a static export).
export const dynamic = "force-static";

const pages = [
  "",
  "/how-it-works",
  "/about",
  "/trust-and-safety",
  "/contact",
  "/locate-us",
  "/careers",
  "/privacy-policy",
  "/terms-and-conditions",
  "/account-deletion",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: `https://ogasela.com${path}` }));
}
