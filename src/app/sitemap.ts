import type { MetadataRoute } from "next";
import { getCategories, getStories } from "@/lib/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mjphotography.art";

  const [categories, stories] = await Promise.all([
    getCategories(),
    getStories(),
  ]);

  const staticRoutes = [
    "",
    "/about",
    "/gallery",
    "/categories",
    "/exhibition",
    "/services",
    "/stories",
    "/contact",
    "/privacy",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-11-01"),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const categoryRoutes = categories.map((cat) => ({
    url: `${siteUrl}/categories/${cat.slug}`,
    lastModified: new Date("2026-11-01"),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const storyRoutes = stories.map((story) => ({
    url: `${siteUrl}/stories/${story.slug}`,
    lastModified: new Date("2026-11-01"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...storyRoutes];
}

