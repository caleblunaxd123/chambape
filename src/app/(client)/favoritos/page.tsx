import { requireAuth } from "@/lib/auth"
import Link from "next/link"
import { Heart, Search, Star, MapPin } from "lucide-react"
import { db } from "@/lib/db"

export const metadata = { title: "Favoritos — ChambaPe" }

export default async function FavoritosPage() {
  const user = await requireAuth()

  // Obtener los mejores profesionales verificados para sugerir
  const profesionalesDestacados = await db.professionalProfile.findMany({
    where: { status: "ACTIVE", avgRating: { gt: 0 } },
    include: {
      user: { select: { name: true } },
      categories: { include: { category: true }, take: 1 },
    },
    orderBy: [{ avgRating: "desc" }, { totalJobs: "desc" }],
    take: 6,
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Favoritos
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Guarda a tus profesionales de confianza para contactarlos rápido
        </p>
      </div>

      {/* Estado vacío + próximamente */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Heart className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          ¡Función disponible muy pronto!
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
          Podrás guardar a tus profesionales favoritos para volver a contratarlos fácilmente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/solicitudes/nueva"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Publicar solicitud
          </Link>
          <Link
            href="/solicitudes"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Mis solicitudes
          </Link>
        </div>
      </div>

      {/* Mientras tanto, profesionales destacados */}
      {profesionalesDestacados.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Profesionales destacados</h2>
            <Link
              href="/solicitudes/nueva"
              className="text-xs text-orange-500 font-medium flex items-center gap-1 hover:text-orange-600"
            >
              <Search className="w-3 h-3" />
              Buscar servicio
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profesionalesDestacados.map((prof) => {
              const cat = prof.categories[0]?.category
              return (
                <Link
                  key={prof.id}
                  href={`/profesionales/${prof.id}`}
                  className="flex items-center gap-3 bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm rounded-2xl p-4 transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-xl font-bold text-orange-600 overflow-hidden">
                    {prof.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prof.avatarUrl} alt={prof.user.name} className="w-full h-full object-cover" />
                    ) : (
                      prof.user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {prof.user.name}
                    </p>
                    {cat && (
                      <p className="text-xs text-gray-400 truncate">
                        {cat.icon} {cat.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-medium">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {prof.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {prof.totalJobs} trabajo{prof.totalJobs !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Badge verificado */}
                  <div className="shrink-0">
                    <span className="text-xs bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">
                      Verificado
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            Publica una solicitud y estos profesionales podrán aplicar a tu trabajo
          </p>
        </div>
      )}
    </div>
  )
}
