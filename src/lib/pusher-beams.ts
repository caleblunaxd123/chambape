import PushNotifications from "@pusher/push-notifications-server"

const instanceId = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID
const secretKey = process.env.PUSHER_BEAMS_SECRET_KEY

export const beamsServer = instanceId && secretKey 
  ? new PushNotifications({ instanceId, secretKey })
  : null
