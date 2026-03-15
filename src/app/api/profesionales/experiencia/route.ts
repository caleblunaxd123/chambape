import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  company: z.string().min(2, "Empresa requerida").max(100),
  role: z.string().min(2, "Cargo requerido").max(100),
  startYear: z.number().int().min(1970).max(new Date().getFullYear()),
  endYear: z.number().int().min(1970).max(new Date().getFullYear()).nullable().optional(),
  description: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  const { profile } = await requireProfessional()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const exp = await db.workExperience.create({
    data: {
      professionalId: profile.id,
      company: parsed.data.company,
      role: parsed.data.role,
      startYear: parsed.data.startYear,
      endYear: parsed.data.endYear ?? null,
      description: parsed.data.description ?? null,
    },
  })

  return NextResponse.json(exp)
}
