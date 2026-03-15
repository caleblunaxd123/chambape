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

      // Sonido sutil usando Web Audio API (no requiere archivo externo)
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      } catch {}
    })

    return () => {
      pusherClient.unsubscribe(`user-${user.id}`)
    }
  }, [user, router])

  return null
}
