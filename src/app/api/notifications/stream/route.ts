// GET /api/notifications/stream — SSE para datos en tiempo real
// Envía: notifCount (total no leídas), msgCount (mensajes no leídos), newNotif (última notif nueva)
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return new Response("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })
  if (!user) return new Response("Usuario no encontrado", { status: 404 })

  const encoder = new TextEncoder()
  let lastCheck = new Date()
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      // Ping inicial
      controller.enqueue(encoder.encode(": ping\n\n"))

      const interval = setInterval(async () => {
        if (closed) return
        try {
          // Verificar si hay nuevas notificaciones desde el último check
          const newNotifCount = await db.notification.count({
            where: {
              userId: user.id,
              read: false,
              createdAt: { gt: lastCheck },
            },
          })

          lastCheck = new Date()

          // Siempre consultar totales para mantener el estado actualizado
          const [totalNotifs, totalMsgs, latestNewNotif] = await Promise.all([
            db.notification.count({
              where: { userId: user.id, read: false },
            }),
            db.message.count({
              where: {
                readAt: null,
                senderId: { not: user.id },
                conversation: {
                  OR: [
                    { clientId: user.id },
                    { professionalUserId: user.id },
                  ],
                },
              },
            }),
            // Solo buscar la última notif nueva si realmente llegó algo nuevo
            newNotifCount > 0
              ? db.notification.findFirst({
                  where: {
                    userId: user.id,
                    read: false,
                  },
                  orderBy: { createdAt: "desc" },
                  select: { type: true, title: true, message: true, link: true },
                })
              : null,
          ])

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "update",
                notifCount: totalNotifs,
                msgCount: totalMsgs,
                newNotif: latestNewNotif ?? null,
              })}\n\n`
            )
          )
        } catch {
          clearInterval(interval)
        }
      }, 4000)

      req.signal.addEventListener("abort", () => {
        closed = true
        clearInterval(interval)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
