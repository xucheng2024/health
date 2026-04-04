import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async redirects() {
    return [
      {
        source: "/privacypolicy.html",
        destination: "/privacypolicy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
