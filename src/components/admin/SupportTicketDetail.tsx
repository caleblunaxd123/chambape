"use client"

import { useState, useTransition } from "react"
import { Send, X, CheckCircle, Clock, MessageSquare, Mail, User, Tag, Calendar } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TicketStatus = "OPEN" | "REPLIED" | "CLOSED"

interface Ticket {
  id: string
  nombre: string
  email: string
  asunto: string
  mensaje: string
  status: TicketStatus
  respuesta: string | null
  repliedAt: Date | string | null
  createdAt: Date | string
}

interface Props {
  ticket: Ticket
  onStatusChange?: (id: string, status: TicketStatus) => void
  onReplied?: (id: string, respuesta: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN:    { label: "Abierto",     color: "bg-blue-50 text-blue-700 border-blue-200",    icon: <Clock className="w-3 h-3" /> },
  REPLIED: { label: "Respondido",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3 h-3" /> },
  CLOSED:  { label: "Cerrado",     color: "bg-gray-100 text-gray-500 border-gray-200",   icon: <X className="w-3 h-3" /> },
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SupportTicketDetail({ ticket: initial, onStatusChange, onReplied }: Props) {
  const [ticket, setTicket] = useState(initial)
  const [respuesta, setRespuesta] = useState("")
  const [isPending, startTransition] = useTransition()

  async function handleResponder() {
    if (respuesta.trim().length < 10) {
      toast.error("La respuesta debe tener al menos 10 caracteres")
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/soporte/${ticket.id}/responder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ respuesta: respuesta.trim() }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setTicket(data.ticket)
        setRespuesta("")
        onReplied?.(ticket.id, respuesta.trim())
        toast.success("✅ Respuesta enviada al usuario por email")
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error al enviar respuesta")
      }
    })
  }

  async function handleCerrar() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/soporte/${ticket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CLOSED" }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setTicket(data.ticket)
        onStatusChange?.(ticket.id, "CLOSED")
        toast.success("Ticket cerrado")
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error al cerrar ticket")
      }
    })
  }

  async function handleReoar() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/soporte/${ticket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "OPEN" }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setTicket(data.ticket)
        onStatusChange?.(ticket.id, "OPEN")
        toast.success("Ticket reabierto")
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error al reabrir ticket")
      }
    })
  }

  const sc = STATUS_CONFIG[ticket.status]

  return (
    <div className="flex flex-col gap-5">
      {/* ── Cabecera del ticket ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner naranja */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
              Ticket #{ticket.id.slice(-8).toUpperCase()}
            </p>
            <h2 className="text-white font-black text-lg leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              {ticket.asunto}
            </h2>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border", sc.color)}>
            {sc.icon} {sc.label}
          </span>
        </div>

        {/* Metadatos */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-700 font-semibold">{ticket.nombre}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <a href={`mailto:${ticket.email}`} className="text-orange-600 font-medium hover:underline truncate">
              {ticket.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-600 truncate">{ticket.asunto}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 text-xs">{formatDate(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Mensaje */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mensaje del usuario</p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl px-4 py-4 border border-gray-100">
            {ticket.mensaje}
          </p>
        </div>
      </div>

      {/* ── Respuesta existente ── */}
      {ticket.respuesta && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Tu respuesta — {ticket.repliedAt ? formatDate(ticket.repliedAt) : ""}
            </p>
          </div>
          <p className="text-emerald-800 text-sm leading-relaxed whitespace-pre-wrap">
            {ticket.respuesta}
          </p>
        </div>
      )}

      {/* ── Form de respuesta (solo si no está cerrado) ── */}
      {ticket.status !== "CLOSED" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-orange-500" />
            {ticket.respuesta ? "Enviar nueva respuesta" : "Responder al usuario"}
          </p>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder={`Hola ${ticket.nombre.split(" ")[0]}, gracias por contactarnos...`}
            rows={5}
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1.5 mb-4">
            El email llegará a <strong>{ticket.email}</strong> desde la cuenta de Resend.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResponder}
              disabled={isPending || respuesta.trim().length < 10}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ background: "var(--brand-gradient)" }}
            >
              <Send className="w-4 h-4" />
              {isPending ? "Enviando..." : "Responder por email"}
            </button>

            <button
              onClick={handleCerrar}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cerrar ticket
            </button>
          </div>
        </div>
      )}

      {/* ── Ticket cerrado: opción de reabrir ── */}
      {ticket.status === "CLOSED" && (
        <div className="text-center py-4">
          <button
            onClick={handleReoar}
            disabled={isPending}
            className="text-sm text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            Reabrir ticket
          </button>
        </div>
      )}
    </div>
  )
}
