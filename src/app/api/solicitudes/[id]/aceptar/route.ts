// POST /api/solicitudes/[id]/aceptar
// El cliente acepta la propuesta de un profesional:
//  1. Marca la aplicación como ACCEPTED
//  2. Marca las demás aplicaciones como REJECTED
//  3. Cambia la solicitud a IN_PROGRESS
//  4. Notifica al profesional aceptado y a los rechazados
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import {
  notifyAplicacionAceptada,
  createNotification,
} from "@/lib/notifications"

const schema = z.object({
  applicationId: z.string().min(1),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  // Verificar que la solicitud pertenece al cliente
  const solicitud = await db.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      applications: {
        include: {
          professional: { select: { userId: true, user: true } },
        },
      },
    },
  })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  if (solicitud.clientId !== user.id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  if (solicitud.status !== "OPEN") {
    return NextResponse.json(
      { error: "Esta solicitud ya no está disponible" },
      { status: 400 }
    )
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { applicationId } = parsed.data

  // Verificar que la aplicación pertenece a esta solicitud
  const aplicacion = solicitud.applications.find((a) => a.id === applicationId)
  if (!aplicacion) {
    return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 })
  }

  if (aplicacion.status !== "PENDING") {
    return NextResponse.json({ error: "Esta propuesta ya fue procesada" }, { status: 400 })
  }

  // Transacción: aceptar una, rechazar el resto, actualizar solicitud
  await db.$transaction(async (tx) => {
    // Aceptar la aplicación seleccionada
    await tx.serviceApplication.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    })

    // Rechazar las otras aplicaciones
    const otrasIds = solicitud.applications
      .filter((a) => a.id !== applicationId && a.status === "PENDING")
      .map((a) => a.id)

    if (otrasIds.length > 0) {
      await tx.serviceApplication.updateMany({
        where: { id: { in: otrasIds } },
        data: { status: "REJECTED" },
      })
    }

    // Cambiar estado de la solicitud
    await tx.serviceRequest.update({
      where: { id: params.id },
      data: { status: "IN_PROGRESS" },
    })
  })

  // Notificaciones en background
  notifyAplicacionAceptada(
    aplicacion.professional.userId,
    solicitud.title,
    params.id
  ).catch((err) => console.error("[NOTIFY_ACEPTADA]", err))

  // Notificar a los rechazados
  const rechazados = solicitud.applications.filter(
    (a) => a.id !== applicationId && a.status === "PENDING"
  )
  for (const r of rechazados) {
    createNotification({
      userId: r.professional.userId,
      type: "GENERAL",
      title: "Propuesta no seleccionada",
      message: `El cliente eligió a otro profesional para "${solicitud.title}". ¡Sigue aplicando!`,
      data: { requestId: params.id },
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
