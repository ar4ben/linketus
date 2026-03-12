import type { NextConfig } from "next";

// Next.js default html-limited bots list + TelegramBot.
// Source (Next 16.1.6): packages/next/src/shared/lib/router/utils/html-bots.ts
const htmlLimitedBots =
  /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|TelegramBot/i;

const nextConfig: NextConfig = {
  htmlLimitedBots,
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
