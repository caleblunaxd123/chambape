"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, ExternalLink } from "lucide-react"
import { formatFechaRelativa } from "@/lib/utils"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notificacion {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: Date | string
}

const TYPE_ICONS: Record<string, string> = {
  NEW_APPLICATION: "📋",
  APPLICATION_ACCEPTED: "🎉",
  NEW_REQUEST: "🔍",
  LOW_CREDITS: "💰",
  VERIFICATION_APPROVED: "✅",
  VERIFICATION_REJECTED: "❌",
  NEW_REVIEW: "⭐",
}

export function NotificacionesContent({
  notificaciones,
  unreadCount,
}: {
  notificaciones: Notificacion[]
  unreadCount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markAllRead() {
    setLoading(true)
    try {
      await fetch("/api/notificaciones/leer", { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas leídas
          </button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Sin notificaciones</h3>
          <p className="text-sm text-gray-500">Aquí aparecerán tus notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n) => (
            <div
              key={n.id}
              className={cn(
                "rounded-xl border p-3.5 transition-colors",
                n.read
                  ? "bg-white border-gray-100"
                  : "bg-orange-50 border-orange-100"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">
                  {TYPE_ICONS[n.type] ?? "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">
                      {formatFechaRelativa(new Date(n.createdAt))}
                    </span>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        Ver <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
