"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, ExternalLink, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFechaRelativa } from "@/lib/utils"
import { useAppState } from "@/components/providers/AppStateProvider"
import Link from "next/link"

interface Notif {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  NEW_APPLICATION: "📋",
  APPLICATION_ACCEPTED: "🎉",
  APPLICATION_REJECTED: "😔",
  APPLICATION_WITHDRAWN: "↩️",
  NEW_REQUEST: "🔍",
  LOW_CREDITS: "💰",
  CREDITS_PURCHASED: "💳",
  VERIFICATION_APPROVED: "✅",
  VERIFICATION_REJECTED: "❌",
  NEW_REVIEW: "⭐",
  REVIEW_REPLY: "💬",
  REQUEST_EXPIRED: "⏰",
}

interface Props {
  /** count inicial del servidor (SSE lo actualiza automáticamente) */
  count: number
  href: string
}

export function NotificationBell({ count: _initialCount, href }: Props) {
  const { notifCount } = useAppState()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open])

  async function handleToggle() {
    if (open) { setOpen(false); return }

    setOpen(true)
    setLoading(true)
    try {
      const res = await fetch("/api/notificaciones/recientes")
      const data = await res.json()
      setNotifs(data.notifications ?? [])
    } catch {}
    setLoading(false)
  }

  async function markAllRead() {
    setMarkingRead(true)
    try {
      await fetch("/api/notificaciones/leer", { method: "POST" })
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
    } finally {
      setMarkingRead(false)
    }
  }

  function handleNotifClick(n: Notif) {
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  const unread = notifCount

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Botón campanita ── */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-150",
          open
            ? "text-orange-500 bg-orange-50"
            : "text-gray-400 hover:text-orange-500 hover:bg-gray-50"
        )}
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none ring-2 ring-white animate-pulse">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <>
          {/* Overlay sutil en mobile */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className={cn(
              "absolute z-50 bg-white rounded-2xl shadow-2xl border border-gray-100",
              "w-[calc(100vw-32px)] max-w-sm",
              // En desktop sidebar (izquierda) → despliega a la derecha
              // En header mobile (derecha) → despliega a la izquierda
              "right-0 top-full mt-2",
            )}
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Notificaciones</h3>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    {unread} nuevas
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={markingRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    {markingRead ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3 h-3" />
                    )}
                    Marcar leídas
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <span className="text-3xl">🔔</span>
                  <p className="text-sm font-semibold text-gray-700 mt-2">Sin notificaciones</p>
                  <p className="text-xs text-gray-400 mt-0.5">Te avisaremos cuando haya novedades</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                        !n.read && "bg-orange-50/60 hover:bg-orange-50"
                      )}
                    >
                      {/* Emoji icon */}
                      <span className="text-lg leading-none mt-0.5 shrink-0">
                        {TYPE_ICONS[n.type] ?? "🔔"}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={cn(
                            "text-xs leading-tight",
                            n.read ? "text-gray-600 font-medium" : "text-gray-900 font-bold"
                          )}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-300 mt-1">
                          {formatFechaRelativa(new Date(n.createdAt))}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — ver todas */}
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors py-1"
              >
                Ver todas las notificaciones
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
