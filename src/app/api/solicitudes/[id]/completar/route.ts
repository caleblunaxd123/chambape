// POST /api/solicitudes/[id]/completar — el cliente marca el trabajo como completado
// Efectos: ServiceRequest.status → COMPLETED, habilita escritura de reseña
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth()
  const { id } = await params

  const solicitud = await db.serviceRequest.findUnique({
    where: { id },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: {
          professional: { select: { userId: true } },
        },
        take: 1,
      },
    },
  })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }
  if (solicitud.clientId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (solicitud.status === "COMPLETED") {
    return NextResponse.json({ error: "Ya está marcada como completada" }, { status: 400 })
  }
  if (solicitud.status !== "IN_PROGRESS" && solicitud.status !== "OPEN") {
    return NextResponse.json({ error: "No se puede completar en este estado" }, { status: 400 })
  }

  await db.serviceRequest.update({
    where: { id },
    data: { status: "COMPLETED" },
  })

  // Notificar al profesional
  const acceptedApp = solicitud.applications[0]
  if (acceptedApp) {
    createNotification({
      userId: acceptedApp.professional.userId,
      type: "APPLICATION_ACCEPTED",
      title: "✅ Trabajo completado",
      message: `El cliente ha marcado "${solicitud.title}" como completado. ¡Bien hecho! Ya puedes recibir una reseña.`,
      link: `/profesional/aplicaciones`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
