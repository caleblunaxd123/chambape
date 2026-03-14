"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Star, MessageCircle, CheckCircle2, Award, ExternalLink, PhoneCall } from "lucide-react"
import { formatSoles, formatFechaRelativa, getInitials } from "@/lib/utils"
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

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pendiente", cls: "badge-pending" },
  ACCEPTED: { label: "✓ Seleccionado", cls: "badge-completed" },
  REJECTED: { label: "No seleccionado", cls: "badge-cancelled" },
  WITHDRAWN: { label: "Retirada", cls: "badge-cancelled" },
}

// Generate a consistent gradient from name
function getGradient(name: string): string {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-teal-500 to-emerald-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ]
  const idx = name.charCodeAt(0) % gradients.length
  return gradients[idx]
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
  const status = STATUS_MAP[aplicacion.status] ?? { label: aplicacion.status, cls: "" }
  const isAccepted = aplicacion.status === "ACCEPTED"
  const isPending = aplicacion.status === "PENDING"

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
      toast.success("¡Propuesta aceptada! Ya puedes contactar al profesional.")
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
        "bg-white rounded-2xl border overflow-hidden transition-all duration-200",
        isAccepted
          ? "border-emerald-200 shadow-[0_2px_16px_rgba(16,185,129,0.1)]"
          : "border-gray-100 hover:border-orange-100 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Top accent bar */}
      {isAccepted && <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />}

      {/* Accepted contact reveal banner */}
      {isAccepted && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-bold">¡Profesional seleccionado!</span>
          </div>
          <a
            href={`mailto:${prof.user.email}`}
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Contactar
          </a>
        </div>
      )}

      <div className="p-4">
        {/* Header: Avatar + Info + Status */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
            {prof.avatarUrl ? (
              <Image src={prof.avatarUrl} alt={prof.user.name} fill className="object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br", getGradient(prof.user.name))}>
                {getInitials(prof.user.name)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-gray-900 text-sm">{prof.user.name}</h4>
                  <Link
                    href={`/profesionales/${prof.id}`}
                    target="_blank"
                    className="text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          (prof.rating ?? 0) >= i ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {(prof.rating ?? 0) > 0 ? `${(prof.rating ?? 0).toFixed(1)}` : "Nuevo"}
                    {(prof.totalReviews ?? 0) > 0 && <span className="text-gray-400"> ({prof.totalReviews})</span>}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-gray-400">
                    <Award className="w-3 h-3" />
                    {prof.jobsCompleted ?? 0} trabajos
                  </span>
                </div>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", status.cls)}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Budget */}
        {aplicacion.proposedBudget && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5">
              <span className="text-xs text-amber-600 font-medium">Presupuesto:</span>
              <span className="text-base font-black text-amber-700" style={{ fontFamily: "Outfit, sans-serif" }}>
                {formatSoles(aplicacion.proposedBudget)}
              </span>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-gray-400 mb-2">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">Propuesta</span>
          </div>
          <p className={cn("text-sm text-gray-700 leading-relaxed", !expanded && "line-clamp-3")}>
            {aplicacion.message}
          </p>
          {aplicacion.message.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-orange-500 hover:text-orange-600 mt-1.5 font-semibold"
            >
              {expanded ? "Ver menos ↑" : "Ver más ↓"}
            </button>
          )}
        </div>

        {/* Portfolio */}
        {prof.portfolioImages.length > 0 && (
          <div className="flex gap-2 mt-3">
            {prof.portfolioImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                <Image src={img.url} alt={img.caption ?? "Portfolio"} fill className="object-cover" />
              </div>
            ))}
            {prof.portfolioImages.length > 4 && (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-semibold">
                +{prof.portfolioImages.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">{formatFechaRelativa(new Date(aplicacion.createdAt))}</span>

          {solicitudStatus === "OPEN" && isPending && (
            <button
              onClick={handleAceptar}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-200 hover:shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? "Aceptando..." : "Elegir este profesional"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
