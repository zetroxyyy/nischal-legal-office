import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.vercel-storage.com;
  font-src 'self' data: https://fonts.gstatic.com;
  frame-src 'self' https://www.google.com https://maps.google.com;
  connect-src 'self' https://*.vercel-storage.com https://*.public.blob.vercel-storage.com;
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // Enable Next.js 16 Cache Components ("use cache" directive + cacheTag)
  cacheComponents: true,

  // Server Action origin restrictions & body size limit
  experimental: {
    serverActions: {
      allowedOrigins: [
        "nischallegalservice.com",
        "www.nischallegalservice.com",
        "nischal-legal-office.vercel.app",
        "localhost:3000",
      ],
      bodySizeLimit: "10mb",
    },
  },

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

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
