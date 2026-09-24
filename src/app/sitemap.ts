import type { MetadataRoute } from "next";
import { contentUpdated, siteUrl } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(contentUpdated),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
