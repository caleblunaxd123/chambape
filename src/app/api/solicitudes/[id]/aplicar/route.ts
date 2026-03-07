// POST /api/solicitudes/[id]/aplicar
// El profesional aplica a una solicitud de servicio gastando créditos
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import { notifyNuevaPropuesta, notifyCreditosBajos } from "@/lib/notifications"
import { CREDITOS_BAJOS_UMBRAL } from "@/constants/paquetes"

const schema = z.object({
  message: z.string().min(30, "El mensaje debe tener al menos 30 caracteres").max(1000),
  proposedBudget: z.number().positive().int().optional(),
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

  if (!user || user.role !== "PROFESSIONAL" || !user.professionalProfile) {
    return NextResponse.json(
      { error: "Debes ser profesional para aplicar" },
      { status: 403 }
    )
  }

  const prof = user.professionalProfile

  const solicitud = await db.serviceRequest.findUnique({
    where: { id: id },
    include: {
      category: true,
      client: { select: { id: true } },
    },
  })

  if (!solicitud) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  if (solicitud.status !== "OPEN") {
    return NextResponse.json(
      { error: "Esta solicitud ya no está disponible" },
      { status: 400 }
    )
  }

  if (solicitud.expiresAt && new Date() > solicitud.expiresAt) {
    return NextResponse.json({ error: "Esta solicitud ha expirado" }, { status: 400 })
  }

  // Verificar que no haya aplicado ya
  const existing = await db.serviceApplication.findUnique({
    where: {
      requestId_professionalId: {
        requestId: id,
        professionalId: prof.id,
      },
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Ya aplicaste a esta solicitud" }, { status: 400 })
  }

  // Costo en créditos según categoría
  const categoria = CATEGORIAS_MAP[solicitud.category.slug]
  const creditCost = categoria?.creditCost ?? 5

  if (prof.credits < creditCost) {
    return NextResponse.json(
      {
        error: `Necesitas ${creditCost} créditos para aplicar. Tienes ${prof.credits}.`,
        needsCredits: true,
        required: creditCost,
        current: prof.credits,
      },
      { status: 400 }
    )
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    )
  }

  const { message, proposedBudget } = parsed.data

  // Transacción: descontar créditos + crear aplicación + registrar transacción
  const [application] = await db.$transaction([
    db.serviceApplication.create({
      data: {
        requestId: id,
        professionalId: prof.id,
        message,
        proposedBudget,
        creditsSpent: creditCost,
      },
    }),
    db.professionalProfile.update({
      where: { id: prof.id },
      data: { credits: { decrement: creditCost } },
    }),
    db.creditTransaction.create({
      data: {
        professionalId: prof.id,
        type: "SPEND",
        credits: -creditCost,
        balance: prof.credits - creditCost,
        description: `Aplicación a: ${solicitud.title}`,
      },
    }),
  ])

  // Notificaciones en background
  const newBalance = prof.credits - creditCost
  notifyNuevaPropuesta(solicitud.client.id, solicitud.title, id).catch(() => {})
  if (newBalance <= CREDITOS_BAJOS_UMBRAL) {
    notifyCreditosBajos(user.id, newBalance).catch(() => {})
  }

  return NextResponse.json({ ok: true, application, newBalance })
}
