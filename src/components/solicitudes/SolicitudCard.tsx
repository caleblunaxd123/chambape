"use client"

import Link from "next/link"
import { formatFechaRelativa, formatSoles, URGENCY_LABELS, STATUS_LABELS } from "@/lib/utils"
import { MapPin, Clock, Users, ChevronRight, AlertCircle } from "lucide-react"
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
    expiresAt: Date | string
    category: { name: string; slug: string }
    subcategory?: { name: string } | null
    _count: { applications: number }
  }
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
  EXPIRED: "bg-yellow-100 text-yellow-700",
}

const URGENCY_COLORS: Record<string, string> = {
  TODAY: "text-red-500",
  THIS_WEEK: "text-orange-500",
  THIS_MONTH: "text-yellow-600",
  FLEXIBLE: "text-gray-500",
}

export function SolicitudCard({ solicitud }: SolicitudCardProps) {
  const isExpiringSoon =
    solicitud.status === "OPEN" &&
    new Date(solicitud.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000

  return (
    <Link href={`/solicitudes/${solicitud.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-orange-200 hover:shadow-sm transition-all group">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {solicitud.category.name}
              </span>
              {solicitud.subcategory && (
                <span className="text-xs text-gray-400">{solicitud.subcategory.name}</span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
              {solicitud.title}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                STATUS_COLORS[solicitud.status] ?? "bg-gray-100 text-gray-500"
              )}
            >
              {STATUS_LABELS[solicitud.status as keyof typeof STATUS_LABELS] ?? solicitud.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{solicitud.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {solicitud.district}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 font-medium",
              URGENCY_COLORS[solicitud.urgency] ?? "text-gray-400"
            )}
          >
            <Clock className="w-3 h-3" />
            {URGENCY_LABELS[solicitud.urgency as keyof typeof URGENCY_LABELS] ?? solicitud.urgency}
          </span>
          {(solicitud.budgetMin || solicitud.budgetMax) && (
            <span className="text-gray-500">
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
              <span className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertCircle className="w-3 h-3" />
                Expira pronto
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}
