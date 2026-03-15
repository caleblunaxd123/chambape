"use client"

/**
 * AppStateProvider — contexto global para datos en tiempo real.
 * Abre UNA sola conexión SSE y distribuye a toda la app:
 *  - notifCount: notificaciones no leídas
 *  - msgCount: mensajes no leídos
 *  - toast in-app cuando llega una notificación nueva
 */

import { createContext, useContext, useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import Link from "next/link"

interface AppState {
  notifCount: number
  msgCount: number
}

const AppStateCtx = createContext<AppState>({ notifCount: 0, msgCount: 0 })

export function useAppState() {
  return useContext(AppStateCtx)
}

const TYPE_EMOJIS: Record<string, string> = {
  NEW_APPLICATION: "📋",
  APPLICATION_ACCEPTED: "🎉",
  APPLICATION_REJECTED: "😔",
  APPLICATION_WITHDRAWN: "↩️",
  NEW_REQUEST: "🔍",
  LOW_CREDITS: "💰",
  CREDITS_PURCHASED: "✅",
  VERIFICATION_APPROVED: "✅",
  VERIFICATION_REJECTED: "❌",
  NEW_REVIEW: "⭐",
  REVIEW_REPLY: "💬",
  REQUEST_EXPIRED: "⏰",
}

interface NewNotif {
  type: string
  title: string
  message: string
  link: string | null
}

export function AppStateProvider({
  children,
  initialNotifs,
  initialMsgs,
}: {
  children: React.ReactNode
  initialNotifs: number
  initialMsgs: number
}) {
  const [notifCount, setNotifCount] = useState(initialNotifs)
  const [msgCount, setMsgCount] = useState(initialMsgs)
  const isFirstMessage = useRef(true)

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream")

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type !== "update") return

        const newNotifCount: number = data.notifCount ?? 0
        const newMsgCount: number = data.msgCount ?? 0
        const newNotif: NewNotif | null = data.newNotif ?? null

        setNotifCount(newNotifCount)
        setMsgCount(newMsgCount)

        // Toast in-app solo cuando realmente llega algo nuevo (no en el primer ping)
        if (!isFirstMessage.current && newNotif) {
          const emoji = TYPE_EMOJIS[newNotif.type] ?? "🔔"
          toast(newNotif.title, {
            description: newNotif.message,
            duration: 6000,
            icon: <span className="text-base leading-none">{emoji}</span>,
            action: newNotif.link
              ? {
                  label: "Ver",
                  onClick: () => { window.location.href = newNotif.link! },
                }
              : undefined,
          })
        }
        isFirstMessage.current = false
      } catch {}
    }

    es.onerror = () => {
      // Reconexión automática del navegador
    }

    return () => es.close()
  }, [])

  return (
    <AppStateCtx.Provider value={{ notifCount, msgCount }}>
      {children}
    </AppStateCtx.Provider>
  )
}
