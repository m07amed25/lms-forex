import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "salma-forex-lms.t3.storage.dev",
      },
    ],
  },
};

export default nextConfig;
