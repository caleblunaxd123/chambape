// GET  /api/chat — lista las conversaciones del usuario actual
// POST /api/chat — crea o recupera una conversación
//   { professionalUserId } — lo llama el cliente (él es clientId)
//   { clientId }           — lo llama el profesional (él es professionalUserId)
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const user = await requireAuth()

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ clientId: user.id }, { professionalUserId: user.id }],
    },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      professionalUser: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, fileName: true, createdAt: true, senderId: true, readAt: true },
      },
      _count: {
        select: {
          messages: {
            where: { readAt: null, senderId: { not: user.id } },
          },
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  return NextResponse.json(conversations)
}

const createSchema = z.union([
  z.object({ professionalUserId: z.string().min(1) }),
  z.object({ clientId: z.string().min(1) }),
])

export async function POST(req: Request) {
  const user = await requireAuth()
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  let clientId: string
  let professionalUserId: string

  if ('professionalUserId' in parsed.data) {
    clientId = user.id
    professionalUserId = parsed.data.professionalUserId
  } else {
    professionalUserId = user.id
    clientId = parsed.data.clientId
  }

  if (clientId === professionalUserId) {
    return NextResponse.json({ error: 'No puedes chatear contigo mismo' }, { status: 400 })
  }

  const conversation = await db.conversation.upsert({
    where: { clientId_professionalUserId: { clientId, professionalUserId } },
    create: { clientId, professionalUserId },
    update: {},
    select: { id: true },
  })

  return NextResponse.json(conversation)
}
