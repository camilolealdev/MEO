// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meo-steel.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
