// GET /api/notifications/stream — SSE para notificaciones en tiempo real
// Polling cada 4 segundos a la DB y emite eventos cuando hay nuevas notificaciones
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
      // Ping inicial para establecer la conexión
      controller.enqueue(encoder.encode(": ping\n\n"))

      const interval = setInterval(async () => {
        if (closed) return
        try {
          const count = await db.notification.count({
            where: {
              userId: user.id,
              read: false,
              createdAt: { gt: lastCheck },
            },
          })

          lastCheck = new Date()

          if (count > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "notification", count })}\n\n`)
            )
          }
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
