import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  }
  // basePath ve assetPrefix ayarları kaldırıldı (Vercel dağıtımı için)
};

export default nextConfig;
