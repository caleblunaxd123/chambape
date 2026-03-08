// POST /api/notificaciones/leer — marca todas las notificaciones del usuario como leídas
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
