import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Linketus",
    short_name: "Linketus",
    description: "Presence over communication / Присутствие важнее общения",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    lang: "en",
    icons: [
      {
        src: "/icon-192-v6.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512-v6.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon-v6.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
