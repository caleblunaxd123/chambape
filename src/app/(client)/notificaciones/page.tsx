import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NotificacionesContent } from "@/components/notificaciones/NotificacionesContent"

export default async function NotificacionesClientePage() {
  const user = await requireAuth()

  const notificaciones = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unreadCount = notificaciones.filter((n) => !n.read).length

  return (
    <NotificacionesContent
      notificaciones={notificaciones}
      unreadCount={unreadCount}
    />
  )
}
