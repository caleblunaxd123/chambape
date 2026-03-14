"use client"

import { useState } from "react"
import { MapPin, Clock, Users, Coins, CheckCircle2, ChevronRight, Flame, ArrowRight } from "lucide-react"
import { formatFechaRelativa, formatSoles, URGENCIA_LABELS } from "@/lib/utils"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import { AplicarModal } from "./AplicarModal"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface OportunidadCardProps {
  solicitud: {
    id: string
    title: string
    description: string
    district: string
    urgency: string
    budgetMin: number | null
    budgetMax: number | null
    createdAt: Date | string
    category: { slug: string; name: string }
    subcategory?: { name: string } | null
    _count: { applications: number }
  }
  currentCredits: number
  yaAplie?: boolean
}

const URGENCY_BADGE: Record<string, string> = {
  TODAY: "bg-red-50 text-red-700 border-red-100",
  THIS_WEEK: "bg-orange-50 text-orange-700 border-orange-100",
  THIS_MONTH: "bg-yellow-50 text-yellow-700 border-yellow-100",
  FLEXIBLE: "bg-gray-50 text-gray-600 border-gray-100",
}

export function OportunidadCard({
  solicitud,
  currentCredits,
  yaAplie = false,
}: OportunidadCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [applied, setApplied] = useState(yaAplie)
  const [liveCredits, setLiveCredits] = useState(currentCredits)

  const categoria = CATEGORIAS_MAP[solicitud.category.slug]
  const creditCost = categoria?.creditCost ?? 5
  const canApply = liveCredits >= creditCost
  const isUrgent = solicitud.urgency === "TODAY"

  function handleSuccess(newBalance: number) {
    setApplied(true)
    setLiveCredits(newBalance)
    setShowModal(false)
  }

  return (
    <>
      <div
        className={cn(
          "group bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
          applied
            ? "border-emerald-200 opacity-80"
            : canApply
            ? "border-gray-100 hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] hover:-translate-y-0.5"
            : "border-gray-100 opacity-75"
        )}
      >
        {/* Top accent */}
        {isUrgent && !applied && (
          <div className="h-0.5 bg-gradient-to-r from-red-500 to-orange-400" />
        )}
        {applied && (
          <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                  {categoria?.icon ?? "🔧"} {solicitud.category.name}
                </span>
                {solicitud.subcategory && (
                  <span className="text-xs text-gray-400">{solicitud.subcategory.name}</span>
                )}
                {isUrgent && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600">
                    <Flame className="w-3 h-3" />
                    HOY
                  </span>
                )}
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", URGENCY_BADGE[solicitud.urgency])}>
                  {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                {solicitud.title}
              </h3>
            </div>

            {applied && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Aplicaste
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{solicitud.description}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-300" />
              {solicitud.district}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-300" />
              {formatFechaRelativa(new Date(solicitud.createdAt))}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-300" />
              {solicitud._count.applications}{" "}
              {solicitud._count.applications === 1 ? "propuesta" : "propuestas"}
            </span>
            {(solicitud.budgetMin || solicitud.budgetMax) && (
              <span className="font-semibold text-gray-600">
                {solicitud.budgetMin && solicitud.budgetMax
                  ? `${formatSoles(solicitud.budgetMin)} – ${formatSoles(solicitud.budgetMax)}`
                  : solicitud.budgetMin
                  ? `Desde ${formatSoles(solicitud.budgetMin)}`
                  : `Hasta ${formatSoles(solicitud.budgetMax!)}`}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            {/* Credit cost chip */}
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg",
              canApply
                ? "bg-amber-50 text-amber-700 border border-amber-100"
                : "bg-red-50 text-red-600 border border-red-100"
            )}>
              <Coins className="w-3.5 h-3.5" />
              {creditCost} créditos
              {!canApply && <span className="text-[10px] font-medium">(insuficientes)</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/profesional/oportunidades/${solicitud.id}`}
                className="text-xs text-gray-400 hover:text-orange-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50"
              >
                Ver más
              </Link>
              {applied ? (
                <span className="text-[11px] text-emerald-600 font-semibold">✓ Enviada</span>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  disabled={!canApply}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all",
                    canApply
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 hover:shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {canApply ? (
                    <>Aplicar <ArrowRight className="w-3.5 h-3.5" /></>
                  ) : (
                    "Sin créditos"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AplicarModal
          solicitudId={solicitud.id}
          solicitudTitle={solicitud.title}
          categoriaSlug={solicitud.category.slug}
          creditCost={creditCost}
          currentCredits={liveCredits}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
