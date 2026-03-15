"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star, MessageCircle, CheckCircle2, Award, ExternalLink, Mail, MessageSquare, Wallet, X, ChevronLeft, ChevronRight } from "lucide-react"
import { formatSoles, formatFechaRelativa, getInitials, getWhatsAppUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { BadgeNivel } from "@/components/ui/BadgeNivel"

interface PropuestaCardProps {
  aplicacion: {
    id: string
    message: string
    proposedBudget?: number | null
    creditsSpent?: number
    status: string
    createdAt: Date | string
    conversationId?: string | null
    professional: {
      id: string
      bio?: string | null
      avatarUrl?: string | null
      avgRating?: number | null
      totalReviews?: number | null
      totalJobs?: number | null
      user: { id: string; name: string; email: string; phone?: string | null }
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

function getGradient(name: string): string {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-teal-500 to-emerald-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ]
  return gradients[name.charCodeAt(0) % gradients.length]
}

export function PropuestaCard({
  aplicacion,
  solicitudId,
  solicitudStatus,
  onAceptar,
}: PropuestaCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const prof = aplicacion.professional
  const status = STATUS_MAP[aplicacion.status] ?? { label: aplicacion.status, cls: "" }
  const isAccepted = aplicacion.status === "ACCEPTED"
  const isPending = aplicacion.status === "PENDING"

  const rating = prof.avgRating ?? 0
  const reviews = prof.totalReviews ?? 0
  const jobs = prof.totalJobs ?? 0

  async function handleAceptar() {
    setLoading(true)
    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}/aceptar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: aplicacion.id }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? "Error al aceptar propuesta"); return }
      toast.success("¡Propuesta aceptada! Ya puedes contactar al profesional.")
      onAceptar?.()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function handleChat() {
    // Si ya hay conversationId, ir directo
    if (aplicacion.conversationId) {
      router.push(`/mensajes/${aplicacion.conversationId}`)
      return
    }
    // Si no, crear/encontrar la conversación vía API
    setChatLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalUserId: prof.user.id }),
      })
      if (!res.ok) { toast.error("No se pudo abrir el chat"); return }
      const { id } = await res.json()
      router.push(`/mensajes/${id}`)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setChatLoading(false)
    }
  }

  const portfolioImgs = prof.portfolioImages

  return (
    <>
      {/* ── Lightbox ──────────────────────────────────────── */}
      {lightboxIdx !== null && portfolioImgs.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {portfolioImgs.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + portfolioImgs.length) % portfolioImgs.length) }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % portfolioImgs.length) }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative max-w-2xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={portfolioImgs[lightboxIdx].url}
              alt={portfolioImgs[lightboxIdx].caption ?? "Portfolio"}
              className="w-full h-full object-contain rounded-xl max-h-[80vh]"
            />
            {portfolioImgs[lightboxIdx].caption && (
              <p className="text-white/70 text-sm text-center mt-2">{portfolioImgs[lightboxIdx].caption}</p>
            )}
            <p className="text-white/40 text-xs text-center mt-1">{lightboxIdx + 1} / {portfolioImgs.length}</p>
          </div>
        </div>
      )}

      {/* ── Card ─────────────────────────────────────────── */}
      <div className={cn(
        "bg-white rounded-2xl border overflow-hidden transition-all duration-200",
        isAccepted
          ? "border-emerald-200 shadow-[0_2px_16px_rgba(16,185,129,0.1)]"
          : "border-gray-100 hover:border-orange-100 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      )}>
        {isAccepted && <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />}

        {/* Accepted banner */}
        {isAccepted && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-bold">¡Profesional seleccionado!</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prof.user.phone && (
                <a
                  href={getWhatsAppUrl(prof.user.phone, `Hola ${prof.user.name}, te contacto desde ChambaPe. ¿Podemos coordinar el servicio?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba58] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              <a
                href={`mailto:${prof.user.email}`}
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Correo
              </a>
              <button
                type="button"
                onClick={handleChat}
                disabled={chatLoading}
                className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {chatLoading ? "Abriendo..." : "Chat en ChambaPe"}
              </button>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header: Avatar + Info + Status */}
          <div className="flex items-start gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
              {prof.avatarUrl ? (
                <Image src={prof.avatarUrl} alt={prof.user.name} fill className="object-cover" />
              ) : (
                <div className={cn("w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br", getGradient(prof.user.name))}>
                  {getInitials(prof.user.name)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-gray-900 text-sm">{prof.user.name}</h4>
                    <Link href={`/profesionales/${prof.id}`} target="_blank" className="text-gray-300 hover:text-orange-400 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {/* Estrellas */}
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={cn("w-3 h-3", rating >= i ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200")} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {rating > 0 ? rating.toFixed(1) : "Nuevo"}
                      {reviews > 0 && <span className="text-gray-400"> ({reviews})</span>}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-gray-400">
                      <Award className="w-3 h-3" />
                      {jobs} {jobs === 1 ? "trabajo" : "trabajos"}
                    </span>
                    <BadgeNivel totalJobs={jobs} avgRating={rating} size="sm" />
                  </div>
                </div>
                {/* Badge estado + monto propuesto en la misma fila */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", status.cls)}>
                    {status.label}
                  </span>
                  {aplicacion.proposedBudget && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1">
                      <Wallet className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="text-sm font-black text-amber-700 tabular-nums" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {formatSoles(aplicacion.proposedBudget)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-orange-500 hover:text-orange-600 mt-1.5 font-semibold">
                {expanded ? "Ver menos ↑" : "Ver más ↓"}
              </button>
            )}
          </div>

          {/* Portfolio con zoom */}
          {portfolioImgs.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Trabajos realizados</p>
              <div className="flex gap-2 flex-wrap">
                {portfolioImgs.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIdx(i)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 hover:scale-105 transition-all cursor-zoom-in"
                    title="Ver en grande"
                  >
                    <Image src={img.url} alt={img.caption ?? "Portfolio"} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
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
    </>
  )
}
