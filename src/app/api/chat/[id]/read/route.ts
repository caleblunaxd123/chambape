import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  if (!user.id) return new NextResponse("No autorizado", { status: 401 })

  const { id } = await params

  try {
    const now = new Date()
    const updated = await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        readAt: null
      },
      data: {
        readAt: now
      }
    })

    if (updated.count > 0) {
      await pusherServer.trigger(`chat-${id}`, "messages-read", {
        readByUserId: user.id,
        readAt: now.toISOString()
      })
    }

    return NextResponse.json({ success: true, count: updated.count })
  } catch (error) {
    console.error("[CHAT_READ_ERROR]", error)
    return new NextResponse("Error interno", { status: 500 })
  }
}
