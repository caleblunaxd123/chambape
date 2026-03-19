import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://chambape.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/solicitudes/",
          "/favoritos",
          "/profesional/",
          "/admin/",
          "/api/",
          "/registrarse/tipo",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
