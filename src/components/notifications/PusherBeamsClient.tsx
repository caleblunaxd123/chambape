"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"

const INSTANCE_ID = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID

export function PusherBeamsClient() {
  const { user, isLoaded } = useUser()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beamsRef = useRef<any>(null)

  useEffect(() => {
    if (!INSTANCE_ID || !isLoaded || !user?.id) return
    // Solo navegadores con soporte de push
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    // Si el usuario ya bloqueó notificaciones, no insistir
    if ("Notification" in window && Notification.permission === "denied") return

    // Capturar userId fuera de la función async para evitar closures sobre valor nullable
    const userId = user.id
    let isMounted = true

    async function init() {
      try {
        // Import dinámico: evita crash en SSR y falla gracefully si el paquete no está
        const { Client } = await import("@pusher/push-notifications-web")
        if (!isMounted) return

        const beamsClient = new Client({ instanceId: INSTANCE_ID! })

        // Pedir permiso de notificaciones (el browser muestra su diálogo)
        const permission = await Notification.requestPermission()
        if (permission !== "granted" || !isMounted) return

        await beamsClient.start()
        if (!isMounted) {
          beamsClient.stop().catch(() => {})
          return
        }

        // Suscribirse al canal de notificaciones del usuario
        await beamsClient.addDeviceInterest(`user-${userId}`)
        beamsRef.current = beamsClient
      } catch (err) {
        // Push notifications son opcionales — no romper la app
        console.warn("[Beams] Push notifications no disponibles:", err)
      }
    }

    init()

    return () => {
      isMounted = false
      if (beamsRef.current) {
        beamsRef.current.stop().catch(() => {})
        beamsRef.current = null
      }
    }
  }, [user?.id, isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
