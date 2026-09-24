import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
  poweredByHeader: false,
  // lets phones on the same Wi-Fi open the dev server (dev only)
  allowedDevOrigins: ["192.168.68.106"],
};

export default nextConfig;
