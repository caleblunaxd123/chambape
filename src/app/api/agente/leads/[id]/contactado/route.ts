// Marca un lead como contactado por el agente (n8n), tras enviarle la
// invitación por el canal correspondiente.

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { verifyAgentSecret } from "@/lib/agentAuth"

const schema = z.object({
  canal: z.enum(["email", "whatsapp", "social", "llamada"]),
  convertido: z.boolean().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAgentSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    )
  }

  const lead = await db.acquisitionLead.findUnique({ where: { id } })
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 })
  }

  const updated = await db.acquisitionLead.update({
    where: { id },
    data: {
      estado: parsed.data.convertido ? "CONVERTIDO" : "CONTACTADO",
      lastChannel: parsed.data.canal,
      contactedAt: new Date(),
      contactCount: { increment: 1 },
      ...(parsed.data.convertido ? { convertedAt: new Date() } : {}),
    },
  })

  return NextResponse.json({ lead: updated })
}
