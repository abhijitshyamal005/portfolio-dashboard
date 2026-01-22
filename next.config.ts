import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles deployment automatically, no need for standalone output
  
  // Optimize images if you add them later
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
