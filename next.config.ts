import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Увеличиваем лимит до 10MB для загрузки аватаров
    },
  },
};

export default nextConfig;
