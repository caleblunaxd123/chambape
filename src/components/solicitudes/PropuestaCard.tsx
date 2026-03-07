"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Star, MessageCircle, CheckCircle2, Clock, Award } from "lucide-react"
import { formatSoles, formatFechaRelativa } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface PropuestaCardProps {
  aplicacion: {
    id: string
    message: string
    proposedBudget?: number | null
    creditsSpent?: number
    status: string
    createdAt: Date | string
    professional: {
      id: string
      bio?: string | null
      avatarUrl?: string | null
      rating?: number
      totalReviews?: number
      jobsCompleted?: number
      user: { name: string; email: string }
      portfolioImages: Array<{ url: string; caption: string | null }>
    }
  }
  solicitudId: string
  solicitudStatus: string
  onAceptar?: () => void
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "Aceptada", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "No seleccionada", className: "bg-gray-100 text-gray-500" },
  WITHDRAWN: { label: "Retirada", className: "bg-red-100 text-red-500" },
}

export function PropuestaCard({
  aplicacion,
  solicitudId,
  solicitudStatus,
  onAceptar,
}: PropuestaCardProps) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const prof = aplicacion.professional
  const status = STATUS_MAP[aplicacion.status] ?? { label: aplicacion.status, className: "" }

  async function handleAceptar() {
    setLoading(true)
    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: aplicacion.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al aceptar propuesta")
        return
      }
      toast.success("¡Propuesta aceptada! El profesional verá tu contacto.")
      onAceptar?.()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-4 transition-all",
        aplicacion.status === "ACCEPTED"
          ? "border-green-200 shadow-sm"
          : "border-gray-100"
      )}
    >
      {/* Accepted banner */}
      {aplicacion.status === "ACCEPTED" && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Profesional seleccionado — verás su contacto directo
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
          {prof.avatarUrl ? (
            <Image src={prof.avatarUrl} alt={prof.user.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-sm">
              {getInitials(prof.user.name)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{prof.user.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5 text-xs text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="font-medium text-gray-700">
                    {(prof.rating ?? 0) > 0 ? (prof.rating ?? 0).toFixed(1) : "Nuevo"}
                  </span>
                  {(prof.totalReviews ?? 0) > 0 && (
                    <span className="text-gray-400">({prof.totalReviews})</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {prof.jobsCompleted ?? 0} trabajos
                </span>
              </div>
            </div>
            <span
              className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0", status.className)}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing + timeline */}
      {aplicacion.proposedBudget && (
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs">Precio propuesto:</span>
            <span className="font-bold text-gray-900">{formatSoles(aplicacion.proposedBudget)}</span>
          </div>
        </div>
      )}

      {/* Message */}
      <div className="mt-3">
        <p
          className={cn(
            "text-sm text-gray-600 leading-relaxed",
            !expanded && "line-clamp-3"
          )}
        >
          {aplicacion.message}
        </p>
        {aplicacion.message.length > 180 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-orange-500 hover:text-orange-600 mt-1 font-medium"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      {/* Portfolio preview */}
      {prof.portfolioImages.length > 0 && (
        <div className="flex gap-2 mt-3">
          {prof.portfolioImages.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <Image src={img.url} alt={img.caption ?? "Portfolio"} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {formatFechaRelativa(new Date(aplicacion.createdAt))}
        </span>

        {solicitudStatus === "OPEN" && aplicacion.status === "PENDING" && (
          <button
            onClick={handleAceptar}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? "Aceptando..." : "Aceptar propuesta"}
          </button>
        )}

        {aplicacion.status === "ACCEPTED" && (
          <a
            href={`mailto:${prof.user.email}`}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contactar
          </a>
        )}
      </div>
    </div>
  )
}
