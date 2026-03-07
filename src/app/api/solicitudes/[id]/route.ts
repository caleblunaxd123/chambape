// GET  /api/solicitudes/[id] — detalle de una solicitud con sus propuestas
// PATCH /api/solicitudes/[id] — cancelar solicitud (solo el cliente dueño)
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// ─── GET ──────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const solicitud = await db.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      subcategory: true,
      applications: {
        include: {
          professional: {
            include: {
              user: {
                select: { name: true, email: true },
              },
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

  // Solo el cliente dueño o un profesional que aplicó puede verla
  const esCliente = solicitud.clientId === user.id
  const esProfesional =
    user.role === "PROFESSIONAL" &&
    solicitud.applications.some((a) => a.professional.userId === user.id)

  if (!esCliente && !esProfesional && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  // Si es profesional (no el cliente), ocultamos contacto de otros profesionales
  // y solo retornamos su propia aplicación
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
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const solicitud = await db.serviceRequest.findUnique({
    where: { id: params.id },
  })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  if (solicitud.clientId !== user.id) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  if (solicitud.status !== "OPEN") {
    return NextResponse.json(
      { error: "Solo se pueden cancelar solicitudes abiertas" },
      { status: 400 }
    )
  }

  const updated = await db.serviceRequest.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  })

  return NextResponse.json(updated)
}
