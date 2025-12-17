/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**supabase.com",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  // Оптимизация для загрузки изображений
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Для больших файлов
  serverRuntimeConfig: {
    maxBodySize: "2mb",
  },
  // Для WebSocket соединений (если используете realtime)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
