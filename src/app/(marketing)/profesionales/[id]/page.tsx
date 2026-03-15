import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db"
import { Star, MapPin, ShieldCheck, Briefcase, Calendar, MessageCircle, Zap, ChevronRight, FileText, FileUser, Award, ExternalLink, MessageCircleMore } from "lucide-react"
import { getBadge, getWhatsAppUrl, cn, getInitials } from "@/lib/utils"
import { ReviewCard } from "@/components/resenas/ReviewCard"
import { auth } from "@clerk/nextjs/server"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { BadgeNivel } from "@/components/ui/BadgeNivel"
import { PortfolioLightbox } from "@/components/ui/PortfolioLightbox"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const profile = await db.professionalProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  })
  if (!profile) return {}
  return {
    title: `${profile.user.name} — ChambaPe`,
    description: profile.bio ?? `Profesional verificado en ChambaPe`,
  }
}

// Gradientes de hero según nivel de badge
const HERO_GRADIENTS: Record<string, string> = {
  elite:   "from-violet-600 via-purple-600 to-indigo-700",
  oro:     "from-yellow-500 via-amber-500 to-orange-500",
  plata:   "from-slate-500 via-slate-400 to-gray-500",
  bronce:  "from-amber-700 via-amber-600 to-yellow-600",
  nuevo:   "from-orange-500 via-orange-400 to-amber-400",
}

export default async function PerfilPublicoPage({ params }: Props) {
  const { id } = await params
  const { userId: clerkId } = await auth()

  let isFavorite = false
  let currentUserId: string | null = null
  if (clerkId) {
    const currentUser = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    if (currentUser) {
      currentUserId = currentUser.id
      const existing = await db.favorite.findUnique({
        where: { userId_professionalId: { userId: currentUser.id, professionalId: id } },
      })
      isFavorite = !!existing
    }
  }

  const profile = await db.professionalProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, createdAt: true, phone: true } },
      categories: { include: { category: true } },
      portfolioImages: { orderBy: { order: "asc" } },
      badges: { include: { badge: true } },
      subscription: { include: { plan: { select: { name: true } } } },
      reviewsReceived: {
        where: { hidden: false },
        include: { client: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      workExperiences: { orderBy: { startYear: "desc" } },
      documents: { where: { isPublic: true }, orderBy: { createdAt: "desc" } },
      _count: { select: { reviewsReceived: true } },
    },
  })

  if (!profile || (profile.status !== "ACTIVE" && profile.status !== "VERIFIED")) {
    notFound()
  }

  const isVerified = profile.status === "ACTIVE" || profile.status === "VERIFIED"
  const badge = getBadge(profile.totalJobs, profile.avgRating)
  const heroGradient = HERO_GRADIENTS[badge.nivel] ?? HERO_GRADIENTS.nuevo
  const hasPro = profile.subscription?.status === "ACTIVE"
  const firstName = profile.user.name.split(" ")[0]

  const criminalRecord = profile.documents.find((d) => d.type === "CRIMINAL_RECORD")
  const cvDoc = profile.documents.find((d) => d.type === "CV")
  const certificates = profile.documents.filter((d) => d.type === "CERTIFICATE")

  const DOC_TYPE_CONFIG = {
    CV: { label: "Currículum Vitae", icon: FileUser, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    CERTIFICATE: { label: "Certificado", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    CRIMINAL_RECORD: { label: "Antecedentes penales", icon: ShieldCheck, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/profesionales" className="text-sm text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1 font-medium">
            ← Directorio
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-sm text-gray-600 font-semibold truncate">{profile.user.name.split(" ")[0]}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ── HERO CARD ─────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {/* Gradient banner */}
          <div className={cn("h-28 sm:h-36 bg-gradient-to-br relative", heroGradient)}>
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            {/* Top-right chips */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {hasPro && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3 fill-current" />
                  PRO
                </span>
              )}
              {isVerified && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verificado
                </span>
              )}
            </div>
          </div>

          <div className="px-5 pb-5">
            {/* Avatar + name row — overlaps banner; relative+z-10 para pintar sobre el banner */}
            <div className="relative z-10 flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-orange-100 border-4 border-white shadow-lg flex-shrink-0">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt={profile.user.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-2xl sm:text-3xl">
                      {getInitials(profile.user.name)}
                    </div>
                  )}
                </div>
                {/* Badge emoji floating on avatar */}
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-base border border-gray-100">
                  {badge.emoji}
                </span>
              </div>

              {/* Fav + CTA */}
              <div className="flex items-center gap-2 pb-1">
                {currentUserId && (
                  <FavoriteButton professionalId={id} isFavorite={isFavorite} iconOnly />
                )}
                {currentUserId && currentUserId !== profile.user.id && (
                  <Link
                    href={`/mensajes/nuevo?pro=${profile.user.id}`}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm border border-gray-200"
                  >
                    <MessageCircleMore className="w-4 h-4 text-orange-500" />
                    Mensaje
                  </Link>
                )}
                <Link
                  href={`/solicitudes/nueva?proId=${id}`}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Solicitar servicio
                </Link>
              </div>
            </div>

            {/* Name + subtitle */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {profile.user.name}
                </h1>
                {hasPro && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    {profile.subscription!.plan.name}
                  </span>
                )}
              </div>
              {profile.categories.length > 0 && (
                <p className="text-sm text-gray-500 font-medium">
                  {profile.categories.slice(0, 2).map(c => c.category.name).join(" · ")}
                  {profile.categories.length > 2 && ` · +${profile.categories.length - 2} más`}
                </p>
              )}
            </div>

            {/* Badge nivel */}
            <div className="mb-4">
              <BadgeNivel totalJobs={profile.totalJobs} avgRating={profile.avgRating} size="lg" showDescription />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  {profile.avgRating > 0 ? (
                    <>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {profile.avgRating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-black text-gray-300">—</span>
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {profile._count.reviewsReceived} reseñas
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Briefcase className="w-4 h-4 text-orange-400" />
                  <span className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {profile.totalJobs}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trabajos</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {new Date().getFullYear() - new Date(profile.user.createdAt).getFullYear() > 0
                      ? `${new Date().getFullYear() - new Date(profile.user.createdAt).getFullYear()}a`
                      : "<1a"}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">En ChambaPe</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mb-4">
                {profile.bio}
              </p>
            )}

            {/* Nivel y Membresía Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={cn(
                "p-4 rounded-2xl border flex items-center gap-4 transition-all",
                badge.nivel === "elite" ? "bg-violet-50 border-violet-100" :
                badge.nivel === "oro"   ? "bg-amber-50 border-amber-100" :
                badge.nivel === "plata" ? "bg-slate-50 border-slate-200" :
                "bg-gray-50 border-gray-100"
              )}>
                <div className="text-3xl">{badge.emoji}</div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Estatus</p>
                  <p className={cn("text-base font-black leading-none", 
                    badge.nivel === "elite" ? "text-violet-700" : 
                    badge.nivel === "oro" ? "text-amber-700" : 
                    "text-gray-900"
                  )}>{badge.label}</p>
                </div>
              </div>

              <div className={cn(
                "p-4 rounded-2xl border flex items-center gap-4 transition-all",
                hasPro ? "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100" : "bg-gray-50 border-gray-100 opacity-60"
              )}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", hasPro ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200" : "bg-gray-200 text-gray-400")}>
                  <Zap className={cn("w-5 h-5", hasPro && "fill-current")} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Membresía</p>
                  <p className={cn("text-base font-black leading-none", hasPro ? "text-indigo-700" : "text-gray-600")}>
                    {hasPro ? profile.subscription!.plan.name : "Plan Estándar"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ESPECIALIDADES ────────────────────────── */}
        {profile.categories.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full block" />
              Especialidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((c) => (
                <span
                  key={c.categoryId}
                  className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-sm font-semibold"
                >
                  <span>{c.category.icon}</span>
                  {c.category.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── ZONAS ─────────────────────────────────── */}
        {profile.districts.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full block" />
              <MapPin className="w-4 h-4 text-gray-400" />
              Zonas de atención
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.districts.map((d) => (
                <span key={d} className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGROS / INSIGNIAS ────────────────────── */}
        {profile.badges.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-yellow-400 rounded-full block" />
              Logros
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((b) => (
                <div key={b.badgeId} className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                  <span className="text-xl">{b.badge.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-yellow-800">{b.badge.name}</p>
                    <p className="text-xs text-yellow-600">{b.badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PORTFOLIO ─────────────────────────────── */}
        {profile.portfolioImages.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full block" />
              Trabajos anteriores
              <span className="ml-auto text-xs text-gray-400 font-normal">Haz clic para ampliar</span>
            </h2>
            <PortfolioLightbox
              images={profile.portfolioImages.map((img) => ({ url: img.url, caption: img.caption }))}
            />
          </div>
        )}

        {/* ── EXPERIENCIA LABORAL ───────────────────── */}
        {profile.workExperiences.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full block" />
              Experiencia laboral
            </h2>
            <div className="space-y-0">
              {profile.workExperiences.map((exp, i) => (
                <div key={exp.id} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4 text-orange-500" />
                    </div>
                    {i < profile.workExperiences.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-100 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={cn("flex-1 pb-4", i === profile.workExperiences.length - 1 && "pb-0")}>
                    <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                    <p className="text-sm text-orange-600 font-medium">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      {exp.startYear}
                      <ChevronRight className="w-3 h-3" />
                      {exp.endYear ?? (
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">Actualidad</span>
                      )}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTOS ────────────────────────────── */}
        {(cvDoc || certificates.length > 0 || criminalRecord) && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-violet-500 rounded-full block" />
              Documentos presentados
            </h2>
            <div className="space-y-2">
              {[...(cvDoc ? [cvDoc] : []), ...certificates, ...(criminalRecord ? [criminalRecord] : [])].map((doc) => {
                const conf = DOC_TYPE_CONFIG[doc.type as keyof typeof DOC_TYPE_CONFIG]
                const Icon = conf.icon
                return (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm group", conf.bg, conf.border)}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-white/70")}>
                      <Icon className={cn("w-4.5 h-4.5", conf.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                      <p className={cn("text-xs font-medium", conf.color)}>{conf.label}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SOLICITAR ANTECEDENTES ────────────────── */}
        {!criminalRecord && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">¿Necesitas ver sus antecedentes?</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">
                  Para contratos largos (limpieza mensual, clases, cuidado de personas) puedes solicitarle directamente su certificado de antecedentes penales.
                </p>
                {profile.user.phone ? (
                  <a
                    href={getWhatsAppUrl(
                      profile.user.phone,
                      `Hola ${firstName}, vi tu perfil en ChambaPe y me interesa contratarte. ¿Podrías compartirme tu certificado de antecedentes penales (CJDZ o PNP)? Gracias.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <MessageCircleMore className="w-4 h-4" />
                    Solicitar por WhatsApp
                  </a>
                ) : (
                  <Link
                    href={`/solicitudes/nueva?proId=${id}`}
                    className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Publicar solicitud para contactar
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RESEÑAS ───────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full block" />
            Reseñas de clientes
            {profile._count.reviewsReceived > 0 && (
              <span className="ml-1 text-sm font-normal text-gray-400">
                ({profile._count.reviewsReceived})
              </span>
            )}
          </h2>

          {profile.reviewsReceived.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl">
              <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aún no tiene reseñas</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sé el primero en contratar a {firstName}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.reviewsReceived.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={{
                    ...r,
                    client: { name: r.client.name, avatarUrl: r.client.avatarUrl },
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── CTA FINAL ─────────────────────────────── */}
        <div className={cn("rounded-3xl p-6 text-center text-white bg-gradient-to-br", heroGradient)}>
          <div className="text-3xl mb-2">{badge.emoji}</div>
          <h3 className="font-black text-lg mb-1">¿Necesitas a {firstName}?</h3>
          <p className="text-sm text-white/80 mb-4">
            Publica tu solicitud gratis y recibe su propuesta directamente
          </p>
          <Link
            href={`/solicitudes/nueva?proId=${id}`}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Publicar solicitud
          </Link>
        </div>

      </div>
    </div>
  )
}
