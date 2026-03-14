import { requireAuth } from "@/lib/auth"
import Link from "next/link"
import { Heart, Star, PlusCircle } from "lucide-react"
import { db } from "@/lib/db"
import { FavoriteButton } from "@/components/ui/FavoriteButton"

export const metadata = { title: "Favoritos — ChambaPe" }

export default async function FavoritosPage() {
  const user = await requireAuth()

  const favoritos = await db.favorite.findMany({
    where: { userId: user.id },
    include: {
      professional: {
        include: {
          user: { select: { name: true } },
          categories: { include: { category: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Sugerir profesionales destacados solo cuando no hay favoritos
  const sugeridos = favoritos.length === 0
    ? await db.professionalProfile.findMany({
        where: { status: "ACTIVE", avgRating: { gt: 0 } },
        include: {
          user: { select: { name: true } },
          categories: { include: { category: true }, take: 1 },
        },
        orderBy: [{ avgRating: "desc" }, { totalJobs: "desc" }],
        take: 6,
      })
    : []

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="cp-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Mis favoritos
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {favoritos.length > 0
                ? `${favoritos.length} profesional${favoritos.length !== 1 ? "es" : ""} guardado${favoritos.length !== 1 ? "s" : ""}`
                : "Guarda profesionales de confianza para contratarlos rápido"}
            </p>
          </div>
          <Link href="/solicitudes/nueva" className="btn-primary text-sm hidden sm:inline-flex">
            <PlusCircle className="w-4 h-4" />
            Nueva solicitud
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {favoritos.length > 0 ? (
          <div className="space-y-3">
            {favoritos.map(({ professional }) => {
              const cat = professional.categories[0]?.category
              return (
                <div
                  key={professional.id}
                  className="flex items-center gap-3 bg-white border border-gray-100 hover:border-orange-100 rounded-2xl p-4 transition-all group shadow-sm hover:shadow-md"
                >
                  {/* Avatar */}
                  <Link href={`/profesionales/${professional.id}`} className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-sm">
                      {professional.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={professional.avatarUrl} alt={professional.user.name} className="w-full h-full object-cover" />
                      ) : (
                        professional.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <Link href={`/profesionales/${professional.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {professional.user.name}
                    </p>
                    {cat && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {cat.icon} {cat.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {professional.avgRating > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                          {professional.avgRating.toFixed(1)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-medium border-l border-gray-200 pl-2">
                        {professional.totalJobs} trabajo{professional.totalJobs !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Link>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/solicitudes/nueva`}
                      className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-sm hidden sm:block"
                    >
                      Contratar
                    </Link>
                    <FavoriteButton professionalId={professional.id} isFavorite={true} iconOnly />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Empty state */}
            <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-orange-100 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60" />
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-2xl border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Heart className="w-8 h-8 text-red-400 fill-red-50" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Aún no tienes favoritos
                </h2>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6 leading-relaxed">
                  Cuando veas un profesional que hace un buen trabajo, toca el corazón para guardarlo aquí y contratarlo más rápido la próxima vez.
                </p>
                <Link
                  href="/solicitudes/nueva"
                  className="btn-primary"
                >
                  <PlusCircle className="w-4 h-4" />
                  Publicar una solicitud
                </Link>
              </div>
            </div>

            {/* Profesionales sugeridos */}
            {sugeridos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-base">Profesionales destacados</h2>
                  <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">Toca ♡ para guardar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sugeridos.map((prof) => {
                    const cat = prof.categories[0]?.category
                    return (
                      <div
                        key={prof.id}
                        className="flex items-center gap-3 bg-white border border-gray-100 hover:border-orange-200 rounded-2xl p-4 transition-all hover:shadow-md"
                      >
                        <Link href={`/profesionales/${prof.id}`} className="shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl font-black text-gray-400 overflow-hidden border border-gray-100">
                            {prof.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={prof.avatarUrl} alt={prof.user.name} className="w-full h-full object-cover" />
                            ) : (
                              prof.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </Link>
                        <Link href={`/profesionales/${prof.id}`} className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate hover:text-orange-600 transition-colors">{prof.user.name}</p>
                          {cat && <p className="text-xs text-gray-500 truncate mt-0.5">{cat.icon} {cat.name}</p>}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-bold bg-yellow-50 px-1 py-0.5 rounded border border-yellow-100">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                              {prof.avgRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">· {prof.totalJobs} trabajos</span>
                          </div>
                        </Link>
                        <FavoriteButton professionalId={prof.id} isFavorite={false} iconOnly />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
