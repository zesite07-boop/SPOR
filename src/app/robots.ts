import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL
      : "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],

    },
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  };
}
