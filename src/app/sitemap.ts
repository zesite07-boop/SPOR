import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "http://localhost:3000";

  const routes = [
    "/landing",
    "/",
    "/bien-etre",
    "/oracle",
    "/logistique",
    "/rayonner",
    "/tresor",
    "/reservation",
    "/connexion",
  ];

  const now = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.7,
  }));
}
