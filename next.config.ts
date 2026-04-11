import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://idubbackend.asosit.uz"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
