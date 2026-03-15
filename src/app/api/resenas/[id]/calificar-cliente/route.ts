// POST /api/resenas/[id]/calificar-cliente — el profesional califica al cliente
import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { profile } = await requireProfessional()
  const { id } = await params

  const review = await db.review.findUnique({ where: { id } })
  if (!review || review.professionalId !== profile.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }
  if (review.clientRatingScore !== null) {
    return NextResponse.json({ error: "Ya calificaste a este cliente" }, { status: 400 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const updated = await db.review.update({
    where: { id },
    data: {
      clientRatingScore: parsed.data.score,
      clientRatingComment: parsed.data.comment ?? null,
    },
  })

  return NextResponse.json(updated)
}
