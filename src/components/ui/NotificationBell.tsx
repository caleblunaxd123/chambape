"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

interface DropdownPos {
  top: number
  left?: number
  right?: number
  maxHeight: number
}

interface Props {
  count: number
  href: string
}

export function NotificationBell({ count: _initialCount, href }: Props) {
  const { notifCount } = useAppState()
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)

  // Calcular posición fixed basada en el botón
  const calcPosition = useCallback(() => {
    if (!buttonRef.current) return null
    const rect = buttonRef.current.getBoundingClientRect()
    const PANEL_W = 340
    const MARGIN = 8
    const vw = window.innerWidth
    const vh = window.innerHeight
    const top = rect.bottom + 6

    let left: number | undefined
    let right: number | undefined

    // ¿Cabe a la derecha del botón?
    if (rect.left + PANEL_W + MARGIN <= vw) {
      left = rect.left
    }
    // ¿Cabe alineado al borde derecho del botón?
    else if (rect.right - PANEL_W >= MARGIN) {
      left = rect.right - PANEL_W
    }
    // En móvil: fijar con márgenes laterales
    else {
      left = MARGIN
      right = undefined
    }

    // Si está muy cerca del borde derecho en mobile, forzar right
    if (vw < 640) {
      left = MARGIN
    }

    const maxHeight = Math.max(240, vh - top - 16)

    return { top, left, maxHeight }
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open])

  // Cerrar al hacer resize o scroll FUERA del dropdown (no cerrarse al deslizar dentro)
  useEffect(() => {
    if (!open) return
    function handleResize() { setOpen(false) }
    function handleScroll(e: Event) {
      // Si el scroll ocurre dentro del propio dropdown, no cerrar
      if (dropdownRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener("resize", handleResize, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true })
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [open])

  // Cerrar click fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  async function handleToggle() {
    if (open) { setOpen(false); return }

    const p = calcPosition()
    setPos(p)
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
    <>
      {/* ── Botón campanita ── */}
      <button
        ref={buttonRef}
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

      {/* ── Dropdown portal-like con position:fixed ── */}
      {open && pos && (
        <>
          {/* Backdrop solo en mobile */}
          <div
            className="fixed inset-0 z-[998] bg-black/20 sm:bg-transparent sm:pointer-events-none"
            onClick={() => setOpen(false)}
          />

          <div
            ref={dropdownRef}
            className="fixed z-[999] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col"
            style={{
              top: pos.top,
              left: pos.left,
              width: "min(340px, calc(100vw - 16px))",
              maxHeight: Math.min(pos.maxHeight, 520),
              boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
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
                    {markingRead
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <CheckCheck className="w-3 h-3" />
                    }
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

            {/* ── Lista ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
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
                        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                        n.read
                          ? "hover:bg-gray-50"
                          : "bg-orange-50/60 hover:bg-orange-50"
                      )}
                    >
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

            {/* ── Footer ── */}
            <div className="border-t border-gray-100 px-4 py-2.5 shrink-0">
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
    </>
  )
}
