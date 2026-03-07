// POST /api/resenas
// Cliente deja una reseña para el profesional después de un trabajo completado o en progreso
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { notifyNuevaReseña } from "@/lib/notifications"

const schema = z.object({
  requestId: z.string().min(1),
  applicationId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres").max(1000),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const { requestId, applicationId, rating, comment } = parsed.data

  // Verificar que la solicitud pertenece al cliente
  const solicitud = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: { review: true },
  })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  if (solicitud.clientId !== user.id) {
    return NextResponse.json({ error: "No tienes permiso para reseñar este trabajo" }, { status: 403 })
  }

  if (solicitud.status !== "IN_PROGRESS" && solicitud.status !== "COMPLETED") {
    return NextResponse.json({ error: "Solo puedes reseñar trabajos en progreso o completados" }, { status: 400 })
  }

  if (solicitud.review) {
    return NextResponse.json({ error: "Ya dejaste una reseña para este trabajo" }, { status: 409 })
  }

  // Verificar que la aplicación fue aceptada en esta solicitud
  const aplicacion = await db.serviceApplication.findUnique({
    where: { id: applicationId },
    include: { professional: true },
  })

  if (!aplicacion || aplicacion.requestId !== requestId || aplicacion.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Aplicación no válida" }, { status: 400 })
  }

  // Crear la reseña y actualizar estadísticas del profesional en transacción
  const review = await db.$transaction(async (tx) => {
    const nuevaReseña = await tx.review.create({
      data: {
        requestId,
        applicationId,
        clientId: user.id,
        professionalId: aplicacion.professionalId,
        rating,
        comment,
      },
    })

    // Calcular nuevo avgRating
    const todasLasReseñas = await tx.review.findMany({
      where: { professionalId: aplicacion.professionalId, hidden: false },
      select: { rating: true },
    })

    const avgRating =
      todasLasReseñas.reduce((acc, r) => acc + r.rating, 0) / todasLasReseñas.length

    // Actualizar perfil profesional
    await tx.professionalProfile.update({
      where: { id: aplicacion.professionalId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalJobs: { increment: 1 },
        status: "ACTIVE", // Asegurar que está activo
      },
    })

    // Marcar solicitud como completada
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: { status: "COMPLETED", completedAt: new Date() },
    })

    return nuevaReseña
  })

  // Notificar al profesional en background
  notifyNuevaReseña(
    aplicacion.professional.userId,
    user.name,
    rating
  ).catch(() => {})

  return NextResponse.json({ ok: true, reviewId: review.id }, { status: 201 })
}
