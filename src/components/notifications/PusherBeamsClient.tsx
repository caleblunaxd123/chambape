"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import * as PusherPushNotifications from "@pusher/push-notifications-web"

const INSTANCE_ID = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID

export function PusherBeamsClient() {
  const { user } = useUser()

  useEffect(() => {
    if (!INSTANCE_ID || !user) return

    const beamsClient = new PusherPushNotifications.Client({
      instanceId: INSTANCE_ID,
    })

    beamsClient
      .start()
      .then(() => beamsClient.addDeviceInterest(`user-${user.id}`))
      .then(() => console.log("[BEAMS] Suscrito correctamente"))
      .catch(console.error)
  }, [user])

  return null
}
