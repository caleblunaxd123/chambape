// GET  /api/solicitudes/[id] — detalle de una solicitud con sus propuestas
// PATCH /api/solicitudes/[id] — cancelar o completar solicitud (solo el cliente dueño)
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

// ─── GET ──────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const solicitud = await db.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      applications: {
        include: {
          professional: {
            include: {
              user: { select: { name: true, email: true } },
              portfolioImages: { take: 3 },
            },
          },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { applications: true } },
    },
  })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  const esCliente = solicitud.clientId === user.id
  const esProfesional =
    user.role === "PROFESSIONAL" &&
    solicitud.applications.some((a) => a.professional.userId === user.id)

  if (!esCliente && !esProfesional && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  if (!esCliente && user.role === "PROFESSIONAL") {
    const miAplicacion = solicitud.applications.find(
      (a) => a.professional.userId === user.id
    )
    return NextResponse.json({ ...solicitud, applications: miAplicacion ? [miAplicacion] : [] })
  }

  return NextResponse.json(solicitud)
}

// ─── PATCH ─────────────────────────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const solicitud = await db.serviceRequest.findUnique({ where: { id } })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  if (solicitud.clientId !== user.id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  let body: { action?: string } = {}
  try { body = await req.json() } catch { /* no body */ }

  if (body.action === "completar") {
    if (solicitud.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Solo se pueden completar solicitudes en progreso" },
        { status: 400 }
      )
    }
    const updated = await db.serviceRequest.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    })
    return NextResponse.json(updated)
  }

  // Cancelar (acción por defecto)
  if (solicitud.status !== "OPEN") {
    return NextResponse.json(
      { error: "Solo se pueden cancelar solicitudes abiertas" },
      { status: 400 }
    )
  }

  // Obtener aplicaciones PENDING que hayan gastado créditos
  const aplicacionesPendientes = await db.serviceApplication.findMany({
    where: { requestId: id, status: "PENDING", creditsSpent: { gt: 0 } },
    include: { professional: { select: { id: true, credits: true, userId: true } } },
  })

  // Transacción: cancelar solicitud + devolver créditos a cada profesional
  await db.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    for (const app of aplicacionesPendientes) {
      const prof = app.professional
      const newBalance = prof.credits + app.creditsSpent

      await tx.serviceApplication.update({
        where: { id: app.id },
        data: { status: "REJECTED" },
      })

      await tx.professionalProfile.update({
        where: { id: prof.id },
        data: { credits: { increment: app.creditsSpent } },
      })

      await tx.creditTransaction.create({
        data: {
          professionalId: prof.id,
          type: "REFUND",
          credits: app.creditsSpent,
          balance: newBalance,
          description: `Devolución: solicitud cancelada por el cliente`,
        },
      })
    }
  })

  // Notificar a los profesionales afectados (en background)
  for (const app of aplicacionesPendientes) {
    createNotification({
      userId: app.professional.userId,
      type: "APPLICATION_REJECTED",
      title: "Solicitud cancelada",
      message: `El cliente canceló la solicitud. Se te devolvieron ${app.creditsSpent} crédito${app.creditsSpent !== 1 ? "s" : ""}.`,
      link: "/profesional/creditos",
    }).catch(() => {})
  }

  const updated = await db.serviceRequest.findUnique({ where: { id } })
  return NextResponse.json(updated)
}
