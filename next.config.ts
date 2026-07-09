import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "pino",
    "pino-pretty",
    "sanitize-html",
  ],
};

export default nextConfig;
