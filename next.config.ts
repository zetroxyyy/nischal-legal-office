import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All images are local, served from /public/images/
    // No remote domains needed for Phase 1
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
