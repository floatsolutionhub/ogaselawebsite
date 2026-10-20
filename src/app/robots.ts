import type { MetadataRoute } from "next";

import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/payment/",
        "/payments/",
        "/account",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/favourites",
        "/sell",
        "/my-ads",
        "/analytics",
        "/messages",
        "/notifications",
        "/office-pickups",
        "/disputes",
        "/auth",
        "/api",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
