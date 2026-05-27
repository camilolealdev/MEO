// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllFrameworks, getAllPaths } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://meo.com";

  const frameworks = getAllFrameworks().map((fw) => ({
    url: `${baseUrl}/learn/${fw.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: fw.tier === "free" ? 0.9 : 0.7,
  }));

  const paths = getAllPaths().map((p) => ({
    url: `${baseUrl}/learn/ruta/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/curso`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/precios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...frameworks,
    ...paths,
  ];
}
