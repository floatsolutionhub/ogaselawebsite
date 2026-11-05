import type { MetadataRoute } from "next";

// Written to a file at build time (the site is a static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/payment/" },
    sitemap: "https://ogasela.com/sitemap.xml",
  };
}
