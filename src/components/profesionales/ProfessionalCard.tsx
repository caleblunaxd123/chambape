import Image from "next/image"
import Link from "next/link"
import { Star, Briefcase, MapPin } from "lucide-react"
import { getInitials, getBadge } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Props {
  professional: {
    id: string
    avatarUrl: string | null
    bio: string | null
    avgRating: number
    totalJobs: number
    districts: string[]
    user: { name: string }
    categories: Array<{ category: { name: string; icon: string; slug: string } }>
  }
}

const GRADIENTS = [
  "from-orange-400 to-pink-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
]

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % GRADIENTS.length
  return GRADIENTS[idx]
}

export function ProfessionalCard({ professional: pro }: Props) {
  const badge = getBadge(pro.totalJobs, pro.avgRating)
  const firstName = pro.user.name.split(" ")[0]
  const mainCategory = pro.categories[0]?.category
  const extraCats = pro.categories.length - 1

  return (
    <Link
      href={`/profesionales/${pro.id}`}
      className="group bg-white border border-gray-100 hover:border-orange-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
    >
      {/* Top color bar based on badge */}
      <div className={cn(
        "h-1.5",
        badge.nivel === "elite" ? "bg-gradient-to-r from-violet-500 to-indigo-500" :
        badge.nivel === "oro"   ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
        badge.nivel === "plata" ? "bg-gradient-to-r from-slate-400 to-gray-500" :
        badge.nivel === "bronce"? "bg-gradient-to-r from-amber-600 to-yellow-600" :
                                  "bg-gradient-to-r from-orange-400 to-amber-400"
      )} />

      <div className="p-4 flex flex-col flex-1">
        {/* Avatar + info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
            {pro.avatarUrl ? (
              <Image src={pro.avatarUrl} alt={pro.user.name} fill className="object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br", getGradient(pro.user.name))}>
                {getInitials(pro.user.name)}
              </div>
            )}
            {/* Badge emoji */}
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow border border-gray-100">
              {badge.emoji}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-orange-600 transition-colors truncate">
              {pro.user.name}
            </h3>
            {mainCategory && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {mainCategory.icon} {mainCategory.name}
                {extraCats > 0 && <span className="text-gray-400"> +{extraCats} más</span>}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {pro.avgRating > 0 ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        className={cn("w-3 h-3", s <= Math.round(pro.avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-100")}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{pro.avgRating.toFixed(1)}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">Sin reseñas aún</span>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <Briefcase className="w-3 h-3" />
                {pro.totalJobs} trabajos
              </span>
            </div>
          </div>
        </div>

        {/* Bio snippet */}
        {pro.bio && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">
            {pro.bio}
          </p>
        )}

        {/* Distritos */}
        {pro.districts.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            {pro.districts.slice(0, 3).map((d) => (
              <span key={d} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md font-medium capitalize">
                {d.replace(/-/g, " ")}
              </span>
            ))}
            {pro.districts.length > 3 && (
              <span className="text-[10px] text-gray-400">+{pro.districts.length - 3}</span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex gap-2">
          <Link
            href={`/profesionales/${pro.id}`}
            className="flex-1 text-center text-xs font-bold text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600 py-2 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Ver perfil
          </Link>
          <Link
            href={`/solicitudes/nueva${mainCategory ? `?categoria=${mainCategory.slug}` : ""}`}
            className="flex-1 text-center text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 py-2 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Solicitar
          </Link>
        </div>
      </div>
    </Link>
  )
}
