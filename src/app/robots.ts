import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/payment/" },
    sitemap: "https://ogasela.com/sitemap.xml",
  };
}
