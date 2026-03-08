// POST /api/admin/profesionales/[id]/creditos
// Admin puede añadir o quitar créditos a un profesional
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const schema = z.object({
  amount: z.number().int().refine((n) => n !== 0, "La cantidad no puede ser 0"),
  reason: z.string().min(1, "Ingresa un motivo").max(200),
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

  const { amount, reason } = parsed.data

  const prof = await db.professionalProfile.findUnique({ where: { id } })
  if (!prof) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
  }

  const newBalance = prof.credits + amount
  if (newBalance < 0) {
    return NextResponse.json(
      { error: `No se pueden quitar más créditos de los que tiene (${prof.credits})` },
      { status: 400 }
    )
  }

  await db.$transaction([
    db.professionalProfile.update({
      where: { id },
      data: { credits: { increment: amount } },
    }),
    db.creditTransaction.create({
      data: {
        professionalId: id,
        type: amount > 0 ? "BONUS" : "SPEND",
        credits: amount,
        balance: newBalance,
        description: `Admin: ${reason}`,
      },
    }),
  ])

  return NextResponse.json({ ok: true, newBalance })
}
