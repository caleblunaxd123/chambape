"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { pusherClient } from "@/lib/pusher"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RealtimeNotifications() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    const channel = pusherClient.subscribe(`user-${user.id}`)

    channel.bind("new-notification", (data: { 
      id: string; 
      title: string; 
      message: string; 
      link?: string;
      type: string;
    }) => {
      // Mostrar Toast
      toast(data.title, {
        description: data.message,
        action: data.link ? {
          label: "Ver",
          onClick: () => router.push(data.link!),
        } : undefined,
      })

      // Opcional: Sonido sutil
      try {
        const audio = new Audio("/sounds/notification.mp3")
        audio.play().catch(() => {}) // Ignorar si el navegador bloquea autoplay
      } catch (e) {}
    })

    return () => {
      pusherClient.unsubscribe(`user-${user.id}`)
    }
  }, [user, router])

  return null
}
