// GET /api/notificaciones/recientes — últimas notificaciones para el dropdown
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  })
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      link: true,
      read: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ notifications })
}
