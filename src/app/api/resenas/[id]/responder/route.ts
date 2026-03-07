// POST /api/resenas/[id]/responder
// El profesional responde a una reseña recibida (una sola vez)
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

const schema = z.object({
  reply: z.string().min(5, "La respuesta debe tener al menos 5 caracteres").max(500),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { professionalProfile: true },
  })

  if (!user || !user.professionalProfile) {
    return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 })
  }

  const review = await db.review.findUnique({
    where: { id },
    include: { client: true },
  })

  if (!review) {
    return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 })
  }

  if (review.professionalId !== user.professionalProfile.id) {
    return NextResponse.json({ error: "No tienes permiso para responder esta reseña" }, { status: 403 })
  }

  if (review.professionalReply) {
    return NextResponse.json({ error: "Ya respondiste esta reseña" }, { status: 409 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  await db.review.update({
    where: { id },
    data: {
      professionalReply: parsed.data.reply,
      repliedAt: new Date(),
    },
  })

  // Notificar al cliente que el profesional respondió
  createNotification({
    userId: review.clientId,
    type: "REVIEW_REPLY",
    title: "El profesional respondió tu reseña",
    message: `${user.name} respondió a tu comentario sobre el trabajo`,
    link: `/solicitudes/${review.requestId}`,
    metadata: { reviewId: id },
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
