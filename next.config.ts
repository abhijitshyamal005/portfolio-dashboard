import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  reactStrictMode: true,
  
  // Optimize images if you add them later
  images: {
    remotePatterns: [],
  },
  
  // Ensure proper transpilation
  transpilePackages: [],
};

export default nextConfig;
