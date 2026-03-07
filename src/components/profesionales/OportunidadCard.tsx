"use client"

import { useState } from "react"
import { MapPin, Clock, Users, Coins, CheckCircle2, ChevronRight } from "lucide-react"
import { formatFechaRelativa, formatSoles, URGENCIA_LABELS } from "@/lib/utils"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import { AplicarModal } from "./AplicarModal"
import { cn } from "@/lib/utils"

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

const URGENCY_COLORS: Record<string, string> = {
  TODAY: "bg-red-100 text-red-700",
  THIS_WEEK: "bg-orange-100 text-orange-700",
  THIS_MONTH: "bg-yellow-100 text-yellow-700",
  FLEXIBLE: "bg-gray-100 text-gray-600",
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

  function handleSuccess(newBalance: number) {
    setApplied(true)
    setLiveCredits(newBalance)
    setShowModal(false)
  }

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-2xl border p-4 transition-all",
          applied
            ? "border-green-200 opacity-75"
            : canApply
            ? "border-gray-100 hover:border-orange-200 hover:shadow-sm"
            : "border-gray-100 opacity-80"
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {categoria?.icon ?? "🔧"} {solicitud.category.name}
              </span>
              {solicitud.subcategory && (
                <span className="text-xs text-gray-400">{solicitud.subcategory.name}</span>
              )}
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  URGENCY_COLORS[solicitud.urgency] ?? "bg-gray-100 text-gray-500"
                )}
              >
                {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ??
                  solicitud.urgency}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
              {solicitud.title}
            </h3>
          </div>

          {applied && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Aplicaste
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {solicitud.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {solicitud.district}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatFechaRelativa(new Date(solicitud.createdAt))}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {solicitud._count.applications}{" "}
            {solicitud._count.applications === 1 ? "propuesta" : "propuestas"}
          </span>
          {(solicitud.budgetMin || solicitud.budgetMax) && (
            <span className="text-gray-500 font-medium">
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
          {/* Credit cost */}
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold",
              canApply ? "text-orange-600" : "text-red-500"
            )}
          >
            <Coins className="w-3.5 h-3.5" />
            {creditCost} créditos para aplicar
          </div>

          {/* Action button */}
          {applied ? (
            <span className="text-xs text-gray-400">Propuesta enviada</span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-colors",
                canApply
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
              disabled={!canApply}
            >
              {canApply ? (
                <>
                  Aplicar
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              ) : (
                "Sin créditos"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Apply modal */}
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
