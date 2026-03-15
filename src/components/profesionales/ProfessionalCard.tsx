"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Briefcase, MapPin, BadgeCheck, Zap } from "lucide-react"
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
    status?: string
    user: { name: string }
    categories: Array<{ category: { name: string; icon: string; slug: string } }>
    subscription?: { status: string } | null
  }
}

const AVATAR_GRADIENTS = [
  "from-orange-400 to-pink-500",
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
]

function getAvatarGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

// Cover gradient based on badge level
function getCoverStyle(nivel: string, isPro: boolean) {
  if (isPro) return "from-amber-400 via-orange-400 to-amber-500"
  if (nivel === "elite") return "from-gray-800 via-gray-700 to-gray-800"
  if (nivel === "oro")   return "from-yellow-400 via-amber-400 to-orange-400"
  if (nivel === "plata") return "from-slate-400 via-gray-400 to-slate-500"
  if (nivel === "bronce")return "from-amber-600 via-yellow-600 to-amber-700"
  return "from-orange-400 via-rose-400 to-pink-500"
}

export function ProfessionalCard({ professional: pro }: Props) {
  const badge = getBadge(pro.totalJobs, pro.avgRating)
  const mainCategory = pro.categories[0]?.category
  const extraCats = pro.categories.length - 1
  const isPro = pro.subscription?.status === "ACTIVE"
  const isVerified = pro.status === "VERIFIED"
  const coverGradient = getCoverStyle(badge.nivel, isPro)

  return (
    <Link
      href={`/profesionales/${pro.id}`}
      className={cn(
        "group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border",
        isPro
          ? "border-amber-200 ring-1 ring-amber-100 shadow-amber-500/10"
          : "border-gray-100 hover:border-orange-200"
      )}
    >
      {/* Cover gradient + PRO badge */}
      <div className={cn("relative h-16 bg-gradient-to-br", coverGradient)}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {isPro && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
            <Zap className="w-2.5 h-2.5" />
            PRO
          </div>
        )}
      </div>

      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* Avatar — overlapping the cover */}
        <div className="flex items-end justify-between -mt-7 mb-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-[3px] border-white shadow-md bg-white">
              {pro.avatarUrl ? (
                <Image src={pro.avatarUrl} alt={pro.user.name} fill className="object-cover" />
              ) : (
                <div className={cn("w-full h-full flex items-center justify-center text-white font-black text-xl bg-gradient-to-br", getAvatarGradient(pro.user.name))}>
                  {getInitials(pro.user.name)}
                </div>
              )}
            </div>
            {/* Badge emoji pill */}
            <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full px-1 py-0.5 shadow border border-gray-100 text-sm leading-none">
              {badge.emoji}
            </div>
          </div>

          {/* Rating bubble */}
          {pro.avgRating > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1.5 mt-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-amber-700">{pro.avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Name + verified */}
        <div className="mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-black text-gray-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
              {pro.user.name}
            </h3>
            {isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
            )}
          </div>

          {/* Category */}
          {mainCategory && (
            <p className="text-xs text-gray-500 mt-0.5">
              {mainCategory.icon}{" "}{mainCategory.name}
              {extraCats > 0 && <span className="text-gray-400"> +{extraCats} más</span>}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          {pro.avgRating > 0 ? (
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "w-3 h-3",
                    s <= Math.round(pro.avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-100 text-gray-200"
                  )}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">({pro.avgRating.toFixed(1)})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Sin reseñas aún</span>
          )}
          {pro.totalJobs > 0 && (
            <>
              <span className="text-gray-200">|</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Briefcase className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-gray-700">{pro.totalJobs}</span> trabajos
              </span>
            </>
          )}
        </div>

        {/* Bio */}
        {pro.bio ? (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">
            {pro.bio}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Distritos */}
        {pro.districts.length > 0 && (
          <div className="flex items-start gap-1 flex-wrap mb-3">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
            {pro.districts.slice(0, 2).map((d) => (
              <span
                key={d}
                className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md font-medium capitalize leading-tight"
              >
                {d.replace(/-/g, " ")}
              </span>
            ))}
            {pro.districts.length > 2 && (
              <span className="text-[10px] text-gray-400 self-center">
                +{pro.districts.length - 2} más
              </span>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2 pt-3 border-t border-gray-50">
          <Link
            href={`/profesionales/${pro.id}`}
            className="flex-1 text-center text-xs font-bold text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 py-2 rounded-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            Ver perfil
          </Link>
          <Link
            href={`/solicitudes/nueva?proId=${pro.id}${mainCategory ? `&categoria=${mainCategory.slug}` : ""}`}
            className="flex-1 text-center text-xs font-bold text-white py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0"
            style={{ background: "var(--brand-gradient)" }}
            onClick={(e) => e.stopPropagation()}
          >
            Solicitar →
          </Link>
        </div>
      </div>
    </Link>
  )
}
