import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db"
import { Star, MapPin, ShieldCheck, Briefcase, Calendar, MessageCircle } from "lucide-react"
import { formatFechaCompleta } from "@/lib/utils"
import { ReviewCard } from "@/components/resenas/ReviewCard"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

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

export default async function PerfilPublicoPage({ params }: Props) {
  const { id } = await params

  const profile = await db.professionalProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, createdAt: true } },
      categories: { include: { category: true } },
      portfolioImages: { orderBy: { order: "asc" } },
      badges: { include: { badge: true } },
      reviewsReceived: {
        where: { hidden: false },
        include: { client: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviewsReceived: true } },
    },
  })

  if (!profile || (profile.status !== "ACTIVE" && profile.status !== "VERIFIED")) {
    notFound()
  }

  const isVerified = profile.status === "ACTIVE" || profile.status === "VERIFIED"
  const hasDocuments = !!(profile.dniFrontUrl && profile.dniBackUrl)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Card de perfil principal */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-orange-100 flex-shrink-0">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-2xl">
                  {getInitials(profile.user.name)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{profile.user.name}</h1>
                  {isVerified && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-blue-600 font-medium">
                        Identidad verificada
                        {profile.verifiedAt && ` · ${formatFechaCompleta(new Date(profile.verifiedAt))}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating y stats */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {profile.avgRating > 0 ? (
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-4 h-4",
                          s <= Math.round(profile.avgRating)
                            ? "fill-orange-400 text-orange-400"
                            : "fill-gray-100 text-gray-100"
                        )}
                      />
                    ))}
                    <span className="text-sm font-semibold text-gray-900 ml-1">
                      {profile.avgRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({profile._count.reviewsReceived} reseñas)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Sin reseñas aún</span>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  {profile.totalJobs} trabajos completados
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Desde {formatFechaCompleta(new Date(profile.user.createdAt))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-4">
            <Link
              href="/solicitudes/nueva"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar este servicio
            </Link>
          </div>
        </div>

        {/* Especialidades */}
        {profile.categories.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((c) => (
                <span
                  key={c.categoryId}
                  className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl text-sm font-medium"
                >
                  <span>{c.category.icon}</span>
                  {c.category.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Zonas de cobertura */}
        {profile.districts.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              Zonas de atención en Lima
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.districts.map((d) => (
                <span key={d} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Insignias */}
        {profile.badges.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Logros</h2>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((b) => (
                <div key={b.badgeId} className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                  <span className="text-xl">{b.badge.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-yellow-800">{b.badge.name}</p>
                    <p className="text-xs text-yellow-600">{b.badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolioImages.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Trabajos anteriores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {profile.portfolioImages.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={img.url} alt={img.caption ?? "Trabajo"} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  {img.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white line-clamp-1">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">
            Reseñas de clientes
            {profile._count.reviewsReceived > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({profile._count.reviewsReceived})
              </span>
            )}
          </h2>

          {profile.reviewsReceived.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aún no tiene reseñas</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sé el primero en contratar a {profile.user.name.split(" ")[0]}
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

        {/* CTA final */}
        <div className="bg-orange-500 rounded-2xl p-5 text-center text-white">
          <h3 className="font-bold text-lg mb-1">¿Necesitas este servicio?</h3>
          <p className="text-sm text-orange-100 mb-4">
            Publica tu solicitud gratis y recibe propuestas de profesionales verificados
          </p>
          <Link
            href="/solicitudes/nueva"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
          >
            Publicar solicitud
          </Link>
        </div>
      </div>
    </div>
  )
}
