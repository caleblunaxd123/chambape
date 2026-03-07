"use client"

import { useState } from "react"
import { Star, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { formatFechaRelativa } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment: string
    professionalReply?: string | null
    repliedAt?: Date | string | null
    createdAt: Date | string
    client: { name: string; avatarUrl?: string | null }
  }
  // Si se pasa, muestra el formulario de respuesta (solo para profesional dueño)
  canReply?: boolean
  onReplySuccess?: () => void
}

export function ReviewCard({ review, canReply, onReplySuccess }: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (reply.length < 5) {
      toast.error("La respuesta debe tener al menos 5 caracteres")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/resenas/${review.id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al responder")
        return
      }
      toast.success("Respuesta enviada")
      setShowReplyForm(false)
      onReplySuccess?.()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-orange-600">
              {getInitials(review.client.name)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{review.client.name}</p>
            <p className="text-xs text-gray-400">{formatFechaRelativa(new Date(review.createdAt))}</p>
          </div>
        </div>
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "w-3.5 h-3.5",
                s <= review.rating ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-100"
              )}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

      {/* Professional reply */}
      {review.professionalReply && (
        <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-orange-200">
          <p className="text-xs font-semibold text-gray-500 mb-1">Respuesta del profesional</p>
          <p className="text-sm text-gray-700">{review.professionalReply}</p>
          {review.repliedAt && (
            <p className="text-xs text-gray-400 mt-1">
              {formatFechaRelativa(new Date(review.repliedAt))}
            </p>
          )}
        </div>
      )}

      {/* Reply button (only if can reply and hasn't replied yet) */}
      {canReply && !review.professionalReply && (
        <div>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {showReplyForm ? "Cancelar" : "Responder reseña"}
            {showReplyForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-2 space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={2}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-xs bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                {loading ? "Enviando..." : "Publicar respuesta"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
