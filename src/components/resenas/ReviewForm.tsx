"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Star, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  requestId: string
  applicationId: string
  profesionalNombre: string
  onSuccess?: () => void
}

export function ReviewForm({ requestId, applicationId, profesionalNombre, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const ratingLabels: Record<number, string> = {
    1: "Muy malo",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Selecciona una calificación")
      return
    }
    if (comment.length < 10) {
      toast.error("El comentario debe tener al menos 10 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, applicationId, rating, comment }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al enviar la reseña")
        return
      }
      toast.success("¡Reseña enviada! Gracias por tu opinión.")
      onSuccess?.()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-1">¿Cómo te fue con {profesionalNombre}?</h3>
      <p className="text-sm text-gray-500 mb-4">
        Tu reseña ayuda a otros clientes a elegir mejor.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Calificación</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    star <= (hovered || rating)
                      ? "fill-orange-400 text-orange-400"
                      : "text-gray-200 fill-gray-200"
                  )}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm font-medium text-orange-600 self-center">
                {ratingLabels[hovered || rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Comentario <span className="text-gray-400 font-normal">({comment.length}/1000)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos cómo fue tu experiencia con este profesional..."
            rows={3}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 resize-none bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          {loading ? "Enviando..." : "Enviar reseña"}
        </button>
      </form>
    </div>
  )
}
