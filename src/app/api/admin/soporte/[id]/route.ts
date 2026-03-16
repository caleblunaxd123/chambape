// PATCH /api/admin/soporte/[id]
// Cambia el estado de un ticket (ej: OPEN → CLOSED).
// Solo accesible para admins.

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { SupportTicketStatus } from "@prisma/client"

const schema = z.object({
  status: z.nativeEnum(SupportTicketStatus),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      )
    }

    const ticket = await db.supportTicket.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json({ ticket })
  } catch {
    return NextResponse.json({ error: "Error al actualizar ticket" }, { status: 500 })
  }
}
