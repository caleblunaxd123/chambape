"use client"

import { useRouter } from "next/navigation"
import { Users, Loader2, Star, CheckCircle2 } from "lucide-react"
import { PropuestaCard } from "./PropuestaCard"
import { ReviewForm } from "@/components/resenas/ReviewForm"
import { useState } from "react"

interface Aplicacion {
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

interface Props {
  solicitudId: string
  solicitudStatus: string
  aplicaciones: Aplicacion[]
  totalAplicaciones: number
  existingReview?: boolean
}

export function SolicitudDetailClient({
  solicitudId,
  solicitudStatus,
  aplicaciones,
  totalAplicaciones,
  existingReview,
}: Props) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [completing, setCompleting] = useState(false)

  const aplicacionAceptada = aplicaciones.find((a) => a.status === "ACCEPTED")

  async function handleCancelar() {
    if (!confirm("¿Seguro que deseas cancelar esta solicitud?")) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancelar" }),
      })
      if (res.ok) router.refresh()
    } finally {
      setCancelling(false)
    }
  }

  async function handleCompletar() {
    if (!confirm("¿Confirmas que el trabajo fue completado satisfactoriamente?")) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "completar" }),
      })
      if (res.ok) router.refresh()
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Formulario de reseña — solo si hay profesional aceptado y aún no hay reseña */}
      {aplicacionAceptada &&
        (solicitudStatus === "IN_PROGRESS" || solicitudStatus === "COMPLETED") &&
        !existingReview && (
          <ReviewForm
            requestId={solicitudId}
            applicationId={aplicacionAceptada.id}
            profesionalNombre={aplicacionAceptada.professional.user.name.split(" ")[0]}
            onSuccess={() => router.refresh()}
          />
        )}

      {/* Reseña ya dejada */}
      {existingReview && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
          <Star className="w-4 h-4 fill-current" />
          Ya dejaste tu reseña para este trabajo. ¡Gracias!
        </div>
      )}

      {/* Marcar como completado */}
      {solicitudStatus === "IN_PROGRESS" && aplicacionAceptada && (
        <button
          onClick={handleCompletar}
          disabled={completing}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm"
        >
          {completing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Marcar trabajo como completado
        </button>
      )}

      {/* Header propuestas */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          Propuestas recibidas
          <span className="text-sm font-normal text-gray-400">({totalAplicaciones})</span>
        </h2>

        {solicitudStatus === "OPEN" && (
          <button
            onClick={handleCancelar}
            disabled={cancelling}
            className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {cancelling && <Loader2 className="w-3 h-3 animate-spin" />}
            Cancelar solicitud
          </button>
        )}
      </div>

      {aplicaciones.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">Aún no hay propuestas</p>
          <p className="text-xs text-gray-400 mt-1">
            Los profesionales de tu zona están siendo notificados
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {aplicaciones.map((a) => (
            <PropuestaCard
              key={a.id}
              aplicacion={a}
              solicitudId={solicitudId}
              solicitudStatus={solicitudStatus}
              onAceptar={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
