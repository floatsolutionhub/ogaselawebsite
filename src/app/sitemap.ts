import type { MetadataRoute } from "next";

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
