import type { MetadataRoute } from "next"
import { CATEGORIAS } from "@/constants/categorias"
import { DISTRITOS } from "@/constants/distritos"

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://chambape.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── Rutas estáticas de marketing ────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                       lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/profesionales`,    lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/iniciar-sesion`,   lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/registrarse`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]

  // ── Páginas por categoría (/gasfiteria) ─────────────────────────────────────
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIAS.map((cat) => ({
    url: `${BASE}/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }))

  // ── Páginas por categoría + distrito (/gasfiteria/miraflores) ───────────────
  // 12 categorías × 45 distritos = 540 páginas de alta intención de búsqueda
  const localRoutes: MetadataRoute.Sitemap = CATEGORIAS.flatMap((cat) =>
    DISTRITOS.map((dist) => ({
      url: `${BASE}/${cat.slug}/${dist.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  )

  return [...staticRoutes, ...categoryRoutes, ...localRoutes]
}
