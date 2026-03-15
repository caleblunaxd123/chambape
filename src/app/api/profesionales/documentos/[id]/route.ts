import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { deleteCloudinaryFile } from "@/lib/cloudinary"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { profile } = await requireProfessional()
  const { id } = await params

  const doc = await db.professionalDocument.findUnique({ where: { id } })
  if (!doc || doc.professionalId !== profile.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  // Borrar archivo de Cloudinary antes de eliminar el registro
  deleteCloudinaryFile(doc.fileUrl).catch(() => {})

  await db.professionalDocument.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
