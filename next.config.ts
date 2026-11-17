import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Phase 1: standard Next.js rendering. cacheComponents + partialPrefetching
     (Next 16 experimental defaults) are disabled so cookie/session-based routes
     (account, admin) use standard dynamic rendering. Re-enable in Phase 2. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
