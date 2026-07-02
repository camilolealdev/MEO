// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllFrameworks, getAllPaths } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meo-steel.vercel.app";

  // Solo se indexa el contenido público (free). Los frameworks de pago no se
  // exponen en el sitemap para no filtrar contenido premium a los buscadores.
  const frameworks = getAllFrameworks()
    .filter((fw) => fw.tier === "free")
    .map((fw) => ({
      url: `${baseUrl}/learn/${fw.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
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
