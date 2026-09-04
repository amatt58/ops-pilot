import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma's generated client must be required natively at runtime, not
  // bundled — bundling it breaks its internal engine initialization.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
