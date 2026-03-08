import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import { Coins, SearchX, Zap, ArrowRight } from "lucide-react"
import { OportunidadCard } from "@/components/profesionales/OportunidadCard"
import Link from "next/link"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import { expireSolicitudesVencidas } from "@/lib/expiracion"

interface Props {
  searchParams: Promise<{ categoria?: string; urgencia?: string }>
}

export default async function OportunidadesPage({ searchParams }: Props) {
  const user = await requireRole("PROFESSIONAL")
  await expireSolicitudesVencidas()
  const { categoria: categoriaParam, urgencia: urgenciaParam } = await searchParams

  const profile = await db.professionalProfile.findUnique({
    where: { userId: user.id },
    include: {
      categories: { include: { category: true } },
    },
  })

  if (!profile) redirect("/profesional/onboarding")

  // Si no completó onboarding (sin categorías o distritos)
  const hasCategories = profile.categories.length > 0
  const hasDistricts = profile.districts.length > 0

  if (!hasCategories || !hasDistricts) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Completa tu perfil para ver oportunidades
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Necesitas definir tus especialidades y distritos de cobertura para que te mostremos
          solicitudes relevantes.
        </p>
        <Link
          href="/registrarse/profesional"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Completar perfil
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const categoryIds = profile.categories.map((c) => c.categoryId)
  const filterCategoryId = categoriaParam
    ? profile.categories.find((c) => c.category.slug === categoriaParam)?.categoryId
    : undefined

  // Solicitudes abiertas que coinciden con las categorías y distritos del profesional
  const solicitudes = await db.serviceRequest.findMany({
    where: {
      status: "OPEN",
      expiresAt: { gt: new Date() },
      categoryId: filterCategoryId ?? { in: categoryIds },
      district: { in: profile.districts },
      ...(urgenciaParam ? { urgency: urgenciaParam as never } : {}),
      // Excluir las ya aplicadas
      NOT: {
        applications: {
          some: { professionalId: profile.id },
        },
      },
    },
    include: {
      category: true,
      subcategory: true,
      _count: { select: { applications: true } },
    },
    orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
    take: 50,
  })

  const URGENCY_FILTER = [
    { label: "Todas", value: "" },
    { label: "Hoy", value: "TODAY" },
    { label: "Esta semana", value: "THIS_WEEK" },
    { label: "Este mes", value: "THIS_MONTH" },
    { label: "Flexible", value: "FLEXIBLE" },
  ]

  const activeUrgency = urgenciaParam ?? ""
  const activeCategoria = categoriaParam ?? ""

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Oportunidades</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {solicitudes.length} solicitudes disponibles en tu zona
          </p>
        </div>

        {/* Credit balance chip */}
        <Link
          href="/profesional/creditos"
          className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 hover:bg-orange-100 text-orange-700 text-sm font-bold px-3 py-2 rounded-xl transition-colors"
        >
          <Coins className="w-4 h-4" />
          {profile.credits} créditos
        </Link>
      </div>

      {/* Filtro urgencia */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
        {URGENCY_FILTER.map((f) => {
          const href =
            `?${[
              f.value ? `urgencia=${f.value}` : null,
              activeCategoria ? `categoria=${activeCategoria}` : null,
            ]
              .filter(Boolean)
              .join("&")}` || "?"
          return (
            <Link
              key={f.value}
              href={href}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeUrgency === f.value
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* Filtro categorías */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5">
        <Link
          href={activeUrgency ? `?urgencia=${activeUrgency}` : "?"}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            !activeCategoria
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Todas mis categorías
        </Link>
        {profile.categories.map((pc) => {
          const cat = CATEGORIAS_MAP[pc.category.slug]
          const href = `?categoria=${pc.category.slug}${activeUrgency ? `&urgencia=${activeUrgency}` : ""}`
          return (
            <Link
              key={pc.category.slug}
              href={href}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategoria === pc.category.slug
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {cat?.icon} {pc.category.name}
            </Link>
          )
        })}
      </div>

      {/* Lista */}
      {solicitudes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">No hay oportunidades disponibles</h3>
          <p className="text-sm text-gray-500">
            {activeCategoria || activeUrgency
              ? "Prueba quitando los filtros para ver más solicitudes."
              : "Aún no hay solicitudes en tu zona. Te notificaremos cuando lleguen."}
          </p>
          {(activeCategoria || activeUrgency) && (
            <Link
              href="?"
              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 text-sm font-semibold mt-4"
            >
              Quitar filtros
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <OportunidadCard
              key={s.id}
              solicitud={s}
              currentCredits={profile.credits}
            />
          ))}
        </div>
      )}

      {/* Low credits banner */}
      {profile.credits < 5 && (
        <div className="fixed bottom-20 lg:bottom-6 inset-x-4 max-w-sm mx-auto bg-orange-500 text-white rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 shrink-0" />
            <span>
              <strong>{profile.credits} créditos</strong> restantes
            </span>
          </div>
          <Link
            href="/profesional/creditos"
            className="text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Recargar
          </Link>
        </div>
      )}
    </div>
  )
}
