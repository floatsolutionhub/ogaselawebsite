import type { MetadataRoute } from "next";

import { site } from "@/config/site";

// ogasela.com's pages (from OgaselaWebsite) plus the marketplace's public entry points. Ads and
// sellers are reached from these by crawling.
const pages = [
  "",
  "/search",
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
  return pages.map((path) => ({ url: `${site.url}${path}` }));
}
