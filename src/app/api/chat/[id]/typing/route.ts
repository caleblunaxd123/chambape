import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  if (!user.id) return new NextResponse("No autorizado", { status: 401 })

  const { id } = await params

  try {
    await pusherServer.trigger(`chat-${id}`, "typing", {
      userId: user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CHAT_TYPING_ERROR]", error)
    return new NextResponse("Error interno", { status: 500 })
  }
}
