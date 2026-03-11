import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const noCacheHeaders = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
      {
        key: "Pragma",
        value: "no-cache",
      },
      {
        key: "Expires",
        value: "0",
      },
    ];

    return [
      {
        source: "/sw.js",
        headers: noCacheHeaders,
      },
      {
        source: "/manifest.webmanifest",
        headers: noCacheHeaders,
      },
      {
        source: "/favicon.ico",
        headers: noCacheHeaders,
      },
      {
        source: "/favicon-v6.png",
        headers: noCacheHeaders,
      },
      {
        source: "/icon-192-v6.png",
        headers: noCacheHeaders,
      },
      {
        source: "/icon-512-v6.png",
        headers: noCacheHeaders,
      },
      {
        source: "/apple-touch-icon-v6.png",
        headers: noCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
