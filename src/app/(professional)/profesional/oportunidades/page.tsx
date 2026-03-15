import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import { Coins, SearchX, Zap, ArrowRight, ArrowLeft } from "lucide-react"
import { OportunidadCard } from "@/components/profesionales/OportunidadCard"
import Link from "next/link"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import { expireSolicitudesVencidas } from "@/lib/expiracion"

interface Props {
  searchParams: Promise<{ categoria?: string; urgencia?: string }>
}

export const metadata = { title: "Oportunidades — ChambaPe" }

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

  const hasCategories = profile.categories.length > 0
  const hasDistricts = profile.districts.length > 0

  if (!hasCategories || !hasDistricts) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-up">
        <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Zap className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
          Completa tu perfil
        </h2>
        <p className="text-base text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Necesitas definir tus especialidades y distritos de cobertura para que te mostremos solicitudes relevantes en tu zona.
        </p>
        <Link
          href="/registrarse/profesional"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-orange-200/50 hover:shadow-lg hover:-translate-y-0.5 text-base"
        >
          Completar mi perfil
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    )
  }

  const categoryIds = profile.categories.map((c) => c.categoryId)
  const filterCategoryId = categoriaParam
    ? profile.categories.find((c) => c.category.slug === categoriaParam)?.categoryId
    : undefined

  const solicitudes = await db.serviceRequest.findMany({
    where: {
      status: "OPEN",
      expiresAt: { gt: new Date() },
      categoryId: filterCategoryId ?? { in: categoryIds },
      district: { in: profile.districts },
      ...(urgenciaParam ? { urgency: urgenciaParam as never } : {}),
      // Excluir solicitudes directas destinadas a OTRO profesional
      OR: [
        { targetProfessionalId: null },
        { targetProfessionalId: profile.id },
      ],
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
    { label: "🔥 Hoy", value: "TODAY" },
    { label: "Esta semana", value: "THIS_WEEK" },
    { label: "Este mes", value: "THIS_MONTH" },
    { label: "Flexible", value: "FLEXIBLE" },
  ]

  const activeUrgency = urgenciaParam ?? ""
  const activeCategoria = categoriaParam ?? ""

  return (
    <div>
      {/* Header — full width */}
      <div className="cp-page-header">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Oportunidades
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""} en tu zona
            </p>
          </div>

          <Link
            href="/profesional/creditos"
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-amber-100"
          >
            <Coins className="w-4 h-4 text-amber-600" />
            {profile.credits} <span className="hidden sm:inline">créditos</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Filtro urgencia */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hidden">
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
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeUrgency === f.value
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Filtro categorías */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-hidden">
          <Link
            href={activeUrgency ? `?urgencia=${activeUrgency}` : "?"}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              !activeCategoria
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategoria === pc.category.slug
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{cat?.icon}</span> {pc.category.name}
              </Link>
            )
          })}
        </div>

        {/* Lista */}
        {solicitudes.length === 0 ? (
          <div className="empty-state mt-8">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <SearchX className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              No hay oportunidades disponibles
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
              {activeCategoria || activeUrgency
                ? "Prueba quitando los filtros para ver más solicitudes en tu zona."
                : "Aún no hay solicitudes de clientes en tu zona. Te notificaremos por correo cuando envíen una."}
            </p>
            {(activeCategoria || activeUrgency) && (
              <Link
                href="?"
                className="btn-secondary text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Quitar todos los filtros
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <div className="fixed bottom-20 lg:bottom-6 inset-x-4 max-w-sm mx-auto bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between z-50 animate-fade-up border border-orange-400">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base leading-none">¡Atención!</span>
                <span className="text-orange-100 mt-1">Solo te quedan {profile.credits} créditos</span>
              </div>
            </div>
            <Link
              href="/profesional/creditos"
              className="text-sm font-bold bg-white text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
            >
              Recargar
            </Link>
          </div>
        )}
      </div>
    </div> /* max-w-5xl */
  )
}
