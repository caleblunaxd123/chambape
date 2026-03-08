// POST /api/admin/profesionales/[id]/estado
// Admin puede suspender o reactivar a un profesional
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

const schema = z.object({
  action: z.enum(["suspend", "activate"]),
  reason: z.string().max(200).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await requireAdmin()

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    )
  }

  const { action, reason } = parsed.data

  const prof = await db.professionalProfile.findUnique({
    where: { id },
    select: { id: true, status: true, userId: true },
  })
  if (!prof) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
  }

  if (action === "suspend" && prof.status === "SUSPENDED") {
    return NextResponse.json({ error: "Ya está suspendido" }, { status: 400 })
  }
  if (action === "activate" && prof.status !== "SUSPENDED") {
    return NextResponse.json({ error: "Solo se puede activar una cuenta suspendida" }, { status: 400 })
  }

  const newStatus = action === "suspend" ? "SUSPENDED" : "ACTIVE"

  await db.professionalProfile.update({
    where: { id },
    data: {
      status: newStatus,
      ...(action === "suspend" && reason ? { rejectionReason: reason } : {}),
    },
  })

  // Notificar al profesional
  if (action === "suspend") {
    createNotification({
      userId: prof.userId,
      type: "VERIFICATION_REJECTED",
      title: "Cuenta suspendida",
      message: reason
        ? `Tu cuenta fue suspendida. Motivo: ${reason}`
        : "Tu cuenta fue suspendida por el administrador.",
      link: "/profesional/dashboard",
    }).catch(() => {})
  } else {
    createNotification({
      userId: prof.userId,
      type: "VERIFICATION_APPROVED",
      title: "Cuenta reactivada",
      message: "Tu cuenta ha sido reactivada. Ya puedes aplicar a solicitudes.",
      link: "/profesional/oportunidades",
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
