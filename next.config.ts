import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The payment gateways' original callback path - the query string (reference etc.) is kept.
      { source: "/wallet/callback", destination: "/payment/complete", permanent: false },
    ];
  },
};

export default nextConfig;
