"use client"

import { useState } from "react"
import { Clock, CheckCircle, X, Mail, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import SupportTicketDetail from "./SupportTicketDetail"

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
  tickets: Ticket[]
  selectedId: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<TicketStatus, React.ReactNode> = {
  OPEN:    <Clock className="w-3 h-3 text-blue-500" />,
  REPLIED: <CheckCircle className="w-3 h-3 text-emerald-500" />,
  CLOSED:  <X className="w-3 h-3 text-gray-400" />,
}

const STATUS_DOT: Record<TicketStatus, string> = {
  OPEN:    "bg-blue-500",
  REPLIED: "bg-emerald-500",
  CLOSED:  "bg-gray-300",
}

function formatDateShort(d: Date | string) {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SoporteInbox({ tickets: initialTickets, selectedId: initialSelectedId }: Props) {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? initialTickets[0]?.id ?? null)

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null

  function handleStatusChange(id: string, status: TicketStatus) {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))
  }

  function handleReplied(id: string, respuesta: string) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "REPLIED" as TicketStatus, respuesta, repliedAt: new Date() } : t
      )
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">

      {/* ══ Lista de tickets ══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-400" />
          <p className="text-sm font-bold text-gray-700">{tickets.length} mensaje{tickets.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="divide-y divide-gray-50 max-h-[calc(100vh-280px)] overflow-y-auto">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedId(ticket.id)}
              className={cn(
                "w-full text-left px-4 py-3.5 transition-all hover:bg-gray-50 flex items-start gap-3",
                selectedId === ticket.id && "bg-orange-50 border-l-2 border-orange-500"
              )}
            >
              {/* Avatar / inicial */}
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-black text-orange-600 shrink-0 mt-0.5">
                {ticket.nombre[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    ticket.status === "OPEN" ? "text-gray-900" : "text-gray-500"
                  )}>
                    {ticket.nombre}
                  </p>
                  <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                    {formatDateShort(ticket.createdAt)}
                  </p>
                </div>

                <p className={cn(
                  "text-xs truncate mb-1",
                  ticket.status === "OPEN" ? "text-gray-700 font-medium" : "text-gray-400"
                )}>
                  {ticket.asunto}
                </p>

                <p className="text-xs text-gray-400 truncate leading-relaxed">
                  {ticket.mensaje}
                </p>

                <div className="flex items-center gap-1.5 mt-1.5">
                  {STATUS_ICON[ticket.status]}
                  <span className={cn(
                    "text-[10px] font-semibold",
                    ticket.status === "OPEN" ? "text-blue-600" :
                    ticket.status === "REPLIED" ? "text-emerald-600" : "text-gray-400"
                  )}>
                    {ticket.status === "OPEN" ? "Pendiente" :
                     ticket.status === "REPLIED" ? "Respondido" : "Cerrado"}
                  </span>
                  {ticket.status === "OPEN" && (
                    <span className="ml-auto">
                      <span className={cn("w-2 h-2 rounded-full inline-block", STATUS_DOT[ticket.status])} />
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className={cn(
                "w-4 h-4 shrink-0 mt-2 transition-colors",
                selectedId === ticket.id ? "text-orange-400" : "text-gray-200"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* ══ Detalle del ticket ══ */}
      <div className="min-w-0">
        {selectedTicket ? (
          <SupportTicketDetail
            ticket={selectedTicket}
            onStatusChange={handleStatusChange}
            onReplied={handleReplied}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500 text-sm">Selecciona un ticket para ver el detalle</p>
          </div>
        )}
      </div>

    </div>
  )
}
