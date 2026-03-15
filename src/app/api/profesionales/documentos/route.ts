import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { DocumentType } from "@prisma/client"
import { deleteCloudinaryFile } from "@/lib/cloudinary"

const schema = z.object({
  type: z.nativeEnum(DocumentType),
  title: z.string().min(2, "Título requerido").max(150),
  fileUrl: z.string().url("URL inválida"),
  isPublic: z.boolean().default(true),
})

export async function POST(req: Request) {
  const { profile } = await requireProfessional()
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  // Para tipos únicos (CV y CRIMINAL_RECORD), borrar el anterior de Cloudinary y DB
  if (parsed.data.type === "CV" || parsed.data.type === "CRIMINAL_RECORD") {
    const existing = await db.professionalDocument.findFirst({
      where: { professionalId: profile.id, type: parsed.data.type },
      select: { id: true, fileUrl: true },
    })
    if (existing) {
      deleteCloudinaryFile(existing.fileUrl).catch(() => {})
      await db.professionalDocument.delete({ where: { id: existing.id } })
    }
  }

  const doc = await db.professionalDocument.create({
    data: {
      professionalId: profile.id,
      type: parsed.data.type,
      title: parsed.data.title,
      fileUrl: parsed.data.fileUrl,
      isPublic: parsed.data.isPublic,
    },
  })

  return NextResponse.json(doc)
}
