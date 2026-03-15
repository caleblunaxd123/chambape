import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { Search, Users, SlidersHorizontal } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { DISTRITOS } from "@/constants/distritos"
import { ProfessionalCard } from "@/components/profesionales/ProfessionalCard"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { DistrictFilter } from "@/components/profesionales/DistrictFilter"

export const metadata = {
  title: "Profesionales verificados en Lima — ChambaPe",
  description: "Encuentra gasfiteros, electricistas, pintores y más profesionales verificados en Lima. Contáctalos directamente o solicita presupuesto gratis.",
}

// Colores por categoría para los filtros
const CAT_COLORS: Record<string, string> = {
  gasfiteria:     "bg-blue-100 text-blue-700 border-blue-200",
  electricidad:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  pintura:        "bg-rose-100 text-rose-700 border-rose-200",
  "limpieza-hogar":"bg-teal-100 text-teal-700 border-teal-200",
  carpinteria:    "bg-amber-100 text-amber-700 border-amber-200",
  cerrajeria:     "bg-slate-100 text-slate-700 border-slate-200",
  fumigacion:     "bg-green-100 text-green-700 border-green-200",
  mudanzas:       "bg-orange-100 text-orange-700 border-orange-200",
}
const CAT_COLORS_ACTIVE: Record<string, string> = {
  gasfiteria:     "bg-blue-600 text-white border-blue-600",
  electricidad:   "bg-yellow-500 text-white border-yellow-500",
  pintura:        "bg-rose-500 text-white border-rose-500",
  "limpieza-hogar":"bg-teal-500 text-white border-teal-500",
  carpinteria:    "bg-amber-600 text-white border-amber-600",
  cerrajeria:     "bg-slate-600 text-white border-slate-600",
  fumigacion:     "bg-green-600 text-white border-green-600",
  mudanzas:       "bg-orange-500 text-white border-orange-500",
}

const PAGE_SIZE = 18

interface Props {
  searchParams: Promise<{ categoria?: string; distrito?: string; q?: string; page?: string }>
}

export default async function DirectorioProfesionalesPage({ searchParams }: Props) {
  const { categoria, distrito, q, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1"))

  // Construir where dinámico
  const where: Prisma.ProfessionalProfileWhereInput = {
    status: { in: ["ACTIVE", "VERIFIED"] },
    ...(categoria ? { categories: { some: { category: { slug: categoria } } } } : {}),
    ...(distrito ? { districts: { has: distrito } } : {}),
    ...(q ? { user: { name: { contains: q, mode: "insensitive" } } } : {}),
  }

  const [profesionalesRaw, total] = await Promise.all([
    db.professionalProfile.findMany({
      where,
      include: {
        user: { select: { name: true } },
        categories: {
          include: { category: { select: { name: true, icon: true, slug: true } } },
          take: 4,
        },
      },
      orderBy: [{ avgRating: "desc" }, { totalJobs: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.professionalProfile.count({ where }),
  ])

  // Cast para incluir relaciones
  const profesionales = profesionalesRaw as unknown as Array<{
    id: string; avatarUrl: string | null; bio: string | null
    avgRating: number; totalJobs: number; districts: string[]
    user: { name: string }
    categories: Array<{ category: { name: string; icon: string; slug: string } }>
  }>

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const categoriaActual = CATEGORIAS.find((c) => c.slug === categoria)

  // URL helper para filtros
  function buildUrl(params: Record<string, string | undefined>) {
    const base: Record<string, string> = {}
    if (categoria) base.categoria = categoria
    if (distrito) base.distrito = distrito
    if (q) base.q = q
    Object.assign(base, params)
    // Limpiar undefined
    Object.keys(base).forEach((k) => base[k] === undefined && delete base[k])
    const qs = new URLSearchParams(base).toString()
    return `/profesionales${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />

      {/* Hero compacto */}
      <div className="bg-gradient-to-br from-[#1e1b4b] to-[#2d2a6e] pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            {categoriaActual ? `${categoriaActual.icon} ${categoriaActual.name}` : "Profesionales verificados"}
          </h1>
          <p className="text-indigo-200 text-base mb-6">
            {total} profesional{total !== 1 ? "es" : ""} disponible{total !== 1 ? "s" : ""} en Lima
          </p>

          {/* Búsqueda por nombre */}
          <form action="/profesionales" method="GET" className="flex gap-2">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            {distrito && <input type="hidden" name="distrito" value={distrito} />}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Filtros de categoría (scroll horizontal) */}
        <div className="overflow-x-auto pb-1 -mx-4 px-4">
          <div className="flex gap-2 w-max">
            <Link
              href={buildUrl({ categoria: undefined, page: undefined })}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                !categoria
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              Todos
            </Link>
            {CATEGORIAS.map((cat) => {
              const isActive = categoria === cat.slug
              const colorClass = isActive
                ? (CAT_COLORS_ACTIVE[cat.slug] ?? "bg-orange-500 text-white border-orange-500")
                : (CAT_COLORS[cat.slug] ?? "bg-white text-gray-600 border-gray-200 hover:border-gray-300")
              return (
                <Link
                  key={cat.slug}
                  href={buildUrl({ categoria: isActive ? undefined : cat.slug, page: undefined })}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${colorClass}`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Filtro de distrito + contador */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">
              {total} profesionale{total !== 1 ? "s" : ""}
              {categoriaActual && ` de ${categoriaActual.name}`}
              {distrito && ` en ${DISTRITOS.find((d) => d.slug === distrito)?.name ?? distrito}`}
            </span>
          </div>
          <DistrictFilter
            currentDistrito={distrito}
            currentCategoria={categoria}
            currentQ={q}
          />
        </div>

        {/* Grid de profesionales */}
        {profesionales.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              No encontramos profesionales
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Intenta con otra categoría o distrito, o publica tu solicitud y los profesionales te encontrarán.
            </p>
            <Link
              href="/solicitudes/nueva"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Publicar solicitud gratis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profesionales.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl text-gray-600 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all"
              >
                ← Anterior
              </Link>
            )}
            <span className="px-4 py-2 text-sm font-bold text-gray-400">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl text-gray-600 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all"
              >
                Siguiente →
              </Link>
            )}
          </div>
        )}

        {/* CTA publicar solicitud */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white text-center mt-4">
          <h3 className="font-black text-xl mb-1">¿No encontraste lo que buscas?</h3>
          <p className="text-orange-100 text-sm mb-4">
            Publica tu solicitud gratis y recibe hasta 5 presupuestos de profesionales verificados en tu zona.
          </p>
          <Link
            href="/solicitudes/nueva"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
          >
            Publicar solicitud gratis →
          </Link>
        </div>

      </div>
    </div>
  )
}
