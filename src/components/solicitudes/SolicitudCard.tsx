"use client"

import Link from "next/link"
import { formatFechaRelativa, formatSoles, URGENCIA_LABELS, REQUEST_STATUS_LABELS } from "@/lib/utils"
import { MapPin, Clock, Users, ChevronRight, AlertCircle, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface SolicitudCardProps {
  solicitud: {
    id: string
    title: string
    description: string
    district: string
    urgency: string
    status: string
    budgetMin: number | null
    budgetMax: number | null
    createdAt: Date | string
    expiresAt: Date | string | null
    category: { name: string; slug: string; icon?: string }
    subcategory?: { name: string } | null
    _count: { applications: number }
  }
  href?: string
}

const STATUS_STYLE: Record<string, { cls: string; dot: string; label: string }> = {
  OPEN: { cls: "badge-open", dot: "bg-blue-500", label: "Abierta" },
  IN_PROGRESS: { cls: "badge-progress", dot: "bg-orange-500", label: "En progreso" },
  COMPLETED: { cls: "badge-completed", dot: "bg-emerald-500", label: "Completada" },
  CANCELLED: { cls: "badge-cancelled", dot: "bg-gray-400", label: "Cancelada" },
  EXPIRED: { cls: "badge-cancelled", dot: "bg-gray-400", label: "Expirada" },
}

const URGENCY_STYLE: Record<string, string> = {
  TODAY: "text-red-500",
  THIS_WEEK: "text-orange-500",
  THIS_MONTH: "text-yellow-600",
  FLEXIBLE: "text-gray-400",
}

export function SolicitudCard({ solicitud, href }: SolicitudCardProps) {
  const isExpiringSoon =
    solicitud.status === "OPEN" &&
    solicitud.expiresAt != null &&
    new Date(solicitud.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000

  const isUrgentToday = solicitud.urgency === "TODAY"
  const statusInfo = STATUS_STYLE[solicitud.status] ?? STATUS_STYLE.EXPIRED
  const link = href ?? `/solicitudes/${solicitud.id}`

  return (
    <Link href={link}>
      <div className={cn(
        "group bg-white rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden",
        solicitud.status === "OPEN" ? "border-gray-100 hover:border-orange-200" : "border-gray-100 hover:border-gray-200"
      )}>
        {/* Urgency stripe */}
        {isUrgentToday && (
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                  {solicitud.category.icon} {solicitud.category.name}
                </span>
                {solicitud.subcategory && (
                  <span className="text-xs text-gray-400">{solicitud.subcategory.name}</span>
                )}
                {isUrgentToday && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-red-600">
                    <Flame className="w-3 h-3" />
                    ¡Urgente hoy!
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                {solicitud.title}
              </h3>
            </div>

            {/* Status badge */}
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0", statusInfo.cls)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
              {REQUEST_STATUS_LABELS[solicitud.status as keyof typeof REQUEST_STATUS_LABELS] ?? solicitud.status}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{solicitud.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-300" />
              {solicitud.district}
            </span>
            <span className={cn("flex items-center gap-1 font-semibold", URGENCY_STYLE[solicitud.urgency])}>
              <Clock className="w-3 h-3" />
              {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
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
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {solicitud._count.applications}{" "}
                {solicitud._count.applications === 1 ? "propuesta" : "propuestas"}
              </span>
              <span>{formatFechaRelativa(new Date(solicitud.createdAt))}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isExpiringSoon && (
                <span className="flex items-center gap-1 text-[10px] text-yellow-600 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Expira pronto
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-orange-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
