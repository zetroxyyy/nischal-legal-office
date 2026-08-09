import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Next.js 16 Cache Components ("use cache" directive + cacheTag)
  cacheComponents: true,

  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        // Vercel Blob storage for Phase 3+ image uploads
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
