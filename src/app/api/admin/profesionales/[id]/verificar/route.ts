// POST /api/admin/profesionales/[id]/verificar
// Admin aprueba o rechaza la verificación de un profesional
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { notifyVerificacionAprobada, notifyVerificacionRechazada } from "@/lib/notifications"

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), motivo: z.string().min(5) }),
])

const CREDITOS_BIENVENIDA = 5

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Solo admins
  await requireAdmin()

  const profesional = await db.professionalProfile.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!profesional) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
  }

  if (profesional.status !== "PENDING_VERIFICATION") {
    return NextResponse.json({ error: "Este profesional no está pendiente de verificación" }, { status: 400 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  if (parsed.data.action === "approve") {
    // Aprobar: activar cuenta + dar créditos de bienvenida
    await db.$transaction(async (tx) => {
      await tx.professionalProfile.update({
        where: { id },
        data: {
          status: "ACTIVE",
          verifiedAt: new Date(),
          credits: { increment: CREDITOS_BIENVENIDA },
        },
      })

      // Registrar transacción de créditos de bienvenida
      const updatedProfile = await tx.professionalProfile.findUnique({
        where: { id },
        select: { credits: true },
      })

      await tx.creditTransaction.create({
        data: {
          professionalId: id,
          type: "BONUS",
          credits: CREDITOS_BIENVENIDA,
          balance: updatedProfile!.credits,
          description: `Créditos de bienvenida por verificación aprobada`,
        },
      })
    })

    // Notificar en background
    notifyVerificacionAprobada(profesional.userId).catch(() => {})

    return NextResponse.json({ ok: true, action: "approved" })
  } else {
    // Rechazar: guardar motivo y cambiar estado
    const { motivo } = parsed.data

    await db.professionalProfile.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: motivo,
      },
    })

    // Notificar en background
    notifyVerificacionRechazada(profesional.userId, motivo).catch(() => {})

    return NextResponse.json({ ok: true, action: "rejected" })
  }
}
