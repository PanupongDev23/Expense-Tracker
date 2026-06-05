import type { NextConfig } from "next";

// Allow NEXTAUTH_URL to be derived from VERCEL_URL when not explicitly set
if (process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const nextConfig: NextConfig = {
  typedRoutes: false
};

export default nextConfig;
