import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { engineSlugs } from "@/lib/stock";
import { legal } from "@/content/legal.en";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({
    url: new URL(path, site.url).toString(),
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/engines", 0.9, "daily"),
    ...engineSlugs().map((s) => page(`/engines/${s}`, 0.8, "daily")),
    page("/grades", 0.6, "monthly"),
    page("/delivery", 0.6, "monthly"),
    page("/sourcing", 0.6, "monthly"),
    page("/trade-account", 0.5, "monthly"),
    page("/contact", 0.5, "monthly"),
    ...Object.keys(legal).map((d) => page(`/legal/${d}`, 0.2, "monthly")),
  ];
}
