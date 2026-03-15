// GET  /api/chat/[id]/messages — mensajes de una conversación
// POST /api/chat/[id]/messages — enviar mensaje
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { MessageFileType } from "@prisma/client"

type Params = { params: Promise<{ id: string }> }

async function getConversation(id: string, userId: string) {
  const conv = await db.conversation.findUnique({ where: { id } })
  if (!conv || (conv.clientId !== userId && conv.professionalUserId !== userId)) return null
  return conv
}

export async function GET(req: Request, { params }: Params) {
  const user = await requireAuth()
  const { id } = await params

  const conv = await getConversation(id, user.id)
  if (!conv) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const url = new URL(req.url)
  const since = url.searchParams.get("since") // ISO date — para polling incremental

  const messages = await db.message.findMany({
    where: {
      conversationId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  })

  // Marcar como leídos los mensajes que no son míos
  const unreadIds = messages
    .filter((m) => m.senderId !== user.id && !m.readAt)
    .map((m) => m.id)

  if (unreadIds.length > 0) {
    await db.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ messages })
}

const sendSchema = z.object({
  content: z.string().max(2000).optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.nativeEnum(MessageFileType).optional(),
  fileName: z.string().max(200).optional(),
})

export async function POST(req: Request, { params }: Params) {
  const user = await requireAuth()
  const { id } = await params

  const conv = await getConversation(id, user.id)
  if (!conv) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }
  if (!parsed.data.content && !parsed.data.fileUrl) {
    return NextResponse.json({ error: "Envía texto o un archivo" }, { status: 400 })
  }

  const recipientId = conv.clientId === user.id ? conv.professionalUserId : conv.clientId

  const [message] = await db.$transaction([
    db.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: parsed.data.content ?? null,
        fileUrl: parsed.data.fileUrl ?? null,
        fileType: parsed.data.fileType ?? null,
        fileName: parsed.data.fileName ?? null,
      },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    db.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    }),
    // Notificación al receptor
    db.notification.create({
      data: {
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: `Nuevo mensaje de ${user.name.split(" ")[0]}`,
        message: parsed.data.content
          ? parsed.data.content.slice(0, 80)
          : `📎 ${parsed.data.fileName ?? "Archivo adjunto"}`,
        link: `/mensajes/${id}`,
      },
    }),
  ])

  return NextResponse.json(message)
}
