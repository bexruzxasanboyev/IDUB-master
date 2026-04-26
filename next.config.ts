import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://idubbackend.asosit.uz";
let API_HOSTNAME = "idubbackend.asosit.uz";
try {
  API_HOSTNAME = new URL(API_URL).hostname;
} catch {}

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    // Serve modern formats when the browser supports them
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for a day (CDN / Next image cache)
    minimumCacheTTL: 60 * 60 * 24,
    // Restrict to known hosts only — avoids accepting any remote URL which
    // blocks optimization fallbacks and allows DNS prefetch/preconnect hints.
    remotePatterns: [
      { protocol: "https", hostname: API_HOSTNAME },
      { protocol: "https", hostname: "**.asosit.uz" },
    ],
    // Only generate sizes we actually use — smaller manifest, faster optimizer
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 64, 96, 128, 192, 256, 384],
  },
  experimental: {
    // Tree-shake named imports from these icon / util packages so we only
    // ship the icons actually used — big bundle-size win.
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // Long-lived caching for built static assets (Next already handles
        // /_next/static with immutable; this covers /public assets).
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache self-hosted fonts aggressively
        source: "/:all*(woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
