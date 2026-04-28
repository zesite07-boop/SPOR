import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withPWA(nextConfig);
