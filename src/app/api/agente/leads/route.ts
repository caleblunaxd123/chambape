// API para el agente de captación (n8n).
// POST: registra/actualiza un lead descubierto (técnico o cliente potencial).
// GET:  devuelve leads pendientes de contactar (nunca opt-out, nunca CONTACTADO).
//
// Autenticación: header `x-agent-secret` (ver AGENT_API_SECRET en .env).

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { verifyAgentSecret } from "@/lib/agentAuth"
import { LeadTipo } from "@prisma/client"

const createSchema = z.object({
  tipo: z.enum(["PROFESIONAL", "CLIENTE"]).default("PROFESIONAL"),
  nombre: z.string().max(120).optional(),
  telefono: z.string().max(30).optional(),
  email: z.string().email().optional(),
  categoria: z.string().max(50).optional(),
  distrito: z.string().max(50).optional(),
  direccion: z.string().max(200).optional(),
  fuente: z.string().min(2).max(50),
  fuenteRef: z.string().max(150).optional(),
})

export async function POST(req: NextRequest) {
  if (!verifyAgentSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    )
  }

  const data = parsed.data

  if (!data.telefono && !data.email && !data.fuenteRef) {
    return NextResponse.json(
      { error: "Se requiere al menos telefono, email o fuenteRef para identificar el lead" },
      { status: 400 }
    )
  }

  // ── Buscar duplicado ──────────────────────────────────────────────────────
  const existing = data.fuenteRef
    ? await db.acquisitionLead.findUnique({ where: { fuenteRef: data.fuenteRef } })
    : await db.acquisitionLead.findFirst({
        where: {
          tipo: data.tipo as LeadTipo,
          OR: [
            ...(data.telefono ? [{ telefono: data.telefono }] : []),
            ...(data.email ? [{ email: data.email }] : []),
          ],
        },
      })

  if (existing) {
    const updated = await db.acquisitionLead.update({
      where: { id: existing.id },
      data: {
        nombre: data.nombre ?? existing.nombre,
        telefono: data.telefono ?? existing.telefono,
        email: data.email ?? existing.email,
        categoria: data.categoria ?? existing.categoria,
        distrito: data.distrito ?? existing.distrito,
        direccion: data.direccion ?? existing.direccion,
      },
    })
    return NextResponse.json({ isNew: false, lead: updated })
  }

  const lead = await db.acquisitionLead.create({
    data: {
      tipo: data.tipo as LeadTipo,
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email,
      categoria: data.categoria,
      distrito: data.distrito,
      direccion: data.direccion,
      fuente: data.fuente,
      fuenteRef: data.fuenteRef,
    },
  })

  return NextResponse.json({ isNew: true, lead }, { status: 201 })
}

export async function GET(req: NextRequest) {
  if (!verifyAgentSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get("tipo")
  const categoria = searchParams.get("categoria")
  const distrito = searchParams.get("distrito")
  const conEmail = searchParams.get("conEmail") === "true"
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)

  const leads = await db.acquisitionLead.findMany({
    where: {
      estado: "NUEVO",
      optedOutAt: null,
      ...(tipo ? { tipo: tipo as LeadTipo } : {}),
      ...(categoria ? { categoria } : {}),
      ...(distrito ? { distrito } : {}),
      ...(conEmail ? { email: { not: null } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  })

  return NextResponse.json({ leads, count: leads.length })
}
