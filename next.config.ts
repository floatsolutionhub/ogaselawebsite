import type { NextConfig } from "next";

// A fully static site (`next build` writes plain files to out/): Netlify serves it from its CDN
// with no server functions. So nothing here may need a server - no Route Handlers, no
// per-request rendering, no image optimisation - and redirects live in netlify.toml instead.
// The marketplace pages load their data in the browser, straight from Ogasela.API.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
