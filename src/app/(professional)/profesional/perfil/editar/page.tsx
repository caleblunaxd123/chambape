import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { EditarPerfilForm } from "@/components/profesionales/EditarPerfilForm"
import { ExperienciaSection } from "@/components/profesionales/ExperienciaSection"
import { DocumentosSection } from "@/components/profesionales/DocumentosSection"
import { ReviewCard } from "@/components/resenas/ReviewCard"
import { BadgeNivel } from "@/components/ui/BadgeNivel"
import { getBadge, getInitials } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import {
  ExternalLink, Star, Briefcase, Coins, MapPin,
  User, ClipboardList, FileText, MessageSquare, ShieldCheck, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = { title: "Mi perfil — ChambaPe" }

const HERO_GRADIENTS: Record<string, string> = {
  elite:  "from-violet-600 via-purple-600 to-indigo-700",
  oro:    "from-yellow-500 via-amber-500 to-orange-500",
  plata:  "from-slate-500 via-slate-400 to-gray-500",
  bronce: "from-amber-700 via-amber-600 to-yellow-600",
  nuevo:  "from-orange-500 via-orange-400 to-amber-400",
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING_VERIFICATION: { label: "Pendiente verificación", color: "bg-yellow-100 text-yellow-700" },
  VERIFIED: { label: "Verificado", color: "bg-blue-100 text-blue-700" },
  ACTIVE: { label: "Activo", color: "bg-green-100 text-green-700" },
  SUSPENDED: { label: "Suspendido", color: "bg-red-100 text-red-700" },
  REJECTED: { label: "Rechazado", color: "bg-red-100 text-red-700" },
}

const TABS = [
  { id: "perfil",      label: "Mi Perfil",    icon: User },
  { id: "experiencia", label: "Experiencia",  icon: Briefcase },
  { id: "documentos",  label: "Documentos",   icon: FileText },
  { id: "resenas",     label: "Reseñas",      icon: MessageSquare },
]

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function EditarPerfilPage({ searchParams }: Props) {
  const { profile, user } = await requireProfessional()
  const { tab = "perfil" } = await searchParams

  // Datos siempre necesarios (hero)
  const base = await db.professionalProfile.findUnique({
    where: { id: profile.id },
    include: {
      categories: { include: { category: { select: { name: true, icon: true } } } },
      subscription: { include: { plan: { select: { name: true } } } },
      _count: { select: { reviewsReceived: true } },
    },
  })
  if (!base) return null

  const badge = getBadge(base.totalJobs, base.avgRating)
  const heroGradient = HERO_GRADIENTS[badge.nivel] ?? HERO_GRADIENTS.nuevo
  const hasPro = base.subscription?.status === "ACTIVE"
  const statusInfo = STATUS_LABELS[base.status] ?? STATUS_LABELS.PENDING_VERIFICATION

  // Datos por tab
  let tabData: {
    categorias?: Array<{ id: string; name: string; icon: string }>
    experiencias?: Array<{ id: string; company: string; role: string; startYear: number; endYear: number | null; description: string | null }>
    documentos?: Array<{ id: string; type: "CV" | "CERTIFICATE" | "CRIMINAL_RECORD"; title: string; fileUrl: string; isPublic: boolean; createdAt: string }>
    resenas?: Array<any>
  } = {}

  if (tab === "perfil") {
    const cats = await db.serviceCategory.findMany({
      where: { active: true }, orderBy: { order: "asc" }, select: { id: true, name: true, icon: true },
    })
    tabData.categorias = cats
  }

  if (tab === "experiencia") {
    const exps = await db.workExperience.findMany({
      where: { professionalId: profile.id }, orderBy: { startYear: "desc" },
    })
    tabData.experiencias = exps
  }

  if (tab === "documentos") {
    const docs = await db.professionalDocument.findMany({
      where: { professionalId: profile.id }, orderBy: { createdAt: "desc" },
    })
    tabData.documentos = docs.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() })) as typeof tabData.documentos
  }

  if (tab === "resenas") {
    const resenas = await db.review.findMany({
      where: { professionalId: profile.id, hidden: false },
      include: { client: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    })
    tabData.resenas = resenas
  }

  const portfolioCount = await db.portfolioImage.count({ where: { professionalId: profile.id } })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── HERO CARD ─────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {/* Banner gradient */}
          <div className={cn("h-24 sm:h-28 bg-gradient-to-br relative", heroGradient)}>
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            />
            {/* Chips top-right */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {hasPro && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3 fill-current" /> PRO
                </span>
              )}
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar + acciones */}
            <div className="flex items-end justify-between -mt-8 sm:-mt-10 mb-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-orange-100 border-4 border-white shadow-lg">
                  {base.avatarUrl ? (
                    <Image src={base.avatarUrl} alt={user.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xl sm:text-2xl">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md text-sm border border-gray-100">
                  {badge.emoji}
                </span>
              </div>

              <Link
                href={`/profesionales/${profile.id}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-semibold border border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Ver perfil público
              </Link>
            </div>

            {/* Nombre + badge */}
            <div className="mb-4">
              <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                {user.name}
              </h1>
              {base.categories.length > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {base.categories.slice(0, 3).map((c) => `${c.category.icon} ${c.category.name}`).join(" · ")}
                </p>
              )}
              <div className="mt-2">
                <BadgeNivel totalJobs={base.totalJobs} avgRating={base.avgRating} size="sm" showDescription />
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Star, value: base.avgRating > 0 ? base.avgRating.toFixed(1) : "—", label: "Rating", color: "text-amber-500" },
                { icon: Briefcase, value: base.totalJobs, label: "Trabajos", color: "text-orange-500" },
                { icon: Coins, value: base.credits, label: "Créditos", color: "text-emerald-500" },
                { icon: MessageSquare, value: base._count.reviewsReceived, label: "Reseñas", color: "text-blue-500" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                  <Icon className={cn("w-4 h-4 mx-auto mb-0.5", color)} />
                  <p className="text-base font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ──────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = tab === id
              const extra = id === "resenas" && base._count.reviewsReceived > 0 ? ` (${base._count.reviewsReceived})` : ""
              return (
                <Link
                  key={id}
                  href={`/profesional/perfil/editar?tab=${id}`}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2",
                    isActive
                      ? "border-orange-500 text-orange-600 bg-orange-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}{extra}
                </Link>
              )
            })}
          </div>

          <div className="p-5">

            {/* ── TAB: PERFIL ─────────────────────── */}
            {tab === "perfil" && tabData.categorias && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-400">Edita tu información pública visible en el directorio y perfil</p>
                </div>
                <EditarPerfilForm
                  profileId={profile.id}
                  initialBio={base.bio ?? ""}
                  initialAvatarUrl={base.avatarUrl ?? ""}
                  initialDistricts={base.districts}
                  initialCategoryIds={base.categories.map((c) => c.categoryId)}
                  initialPhone={user.phone ?? ""}
                  categorias={tabData.categorias}
                />
              </>
            )}

            {/* ── TAB: EXPERIENCIA ────────────────── */}
            {tab === "experiencia" && tabData.experiencias !== undefined && (
              <>
                <div className="mb-4">
                  <p className="text-xs text-gray-400">Agrega tus empleos anteriores para generar más confianza con los clientes</p>
                </div>
                <ExperienciaSection
                  experiencias={tabData.experiencias}
                  profileId={profile.id}
                />
              </>
            )}

            {/* ── TAB: DOCUMENTOS ─────────────────── */}
            {tab === "documentos" && tabData.documentos !== undefined && (
              <>
                <div className="mb-4">
                  <p className="text-xs text-gray-400">Sube tu CV, certificados y más. Los clientes podrán ver los documentos que marques como públicos.</p>
                </div>
                <DocumentosSection documentos={tabData.documentos} />
              </>
            )}

            {/* ── TAB: RESEÑAS ────────────────────── */}
            {tab === "resenas" && tabData.resenas !== undefined && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {tabData.resenas.length === 0
                      ? "Aún no tienes reseñas. Aparecerán cuando completes trabajos."
                      : `${tabData.resenas.length} reseña${tabData.resenas.length !== 1 ? "s" : ""} recibida${tabData.resenas.length !== 1 ? "s" : ""}`
                    }
                  </p>
                  {base.avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-gray-900 text-sm">{base.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {tabData.resenas.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Sin reseñas aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tabData.resenas.map((r) => (
                      <ReviewCard
                        key={r.id}
                        review={{ ...r, client: { name: r.client.name, avatarUrl: r.client.avatarUrl } }}
                        canReply={!r.professionalReply}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* ── QUICK LINKS ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/profesional/creditos"
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm group"
          >
            <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
              <Coins className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{base.credits} créditos</p>
              <p className="text-xs text-gray-400">Comprar más</p>
            </div>
          </Link>
          <Link
            href="/profesional/oportunidades"
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm group"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center transition-colors">
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Oportunidades</p>
              <p className="text-xs text-gray-400">Ver solicitudes</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
