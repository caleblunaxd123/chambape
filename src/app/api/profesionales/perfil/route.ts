// PATCH /api/profesionales/perfil
// El profesional actualiza su propio perfil (bio, avatar, distritos, categorías)
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireProfessional } from "@/lib/auth"

const schema = z.object({
  bio: z.string().max(600).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  districts: z.array(z.string().min(1)).min(1, "Selecciona al menos un distrito").max(20).optional(),
  categoryIds: z.array(z.string().min(1)).min(1, "Selecciona al menos una especialidad").max(10).optional(),
  phone: z.string().regex(/^\d{9}$/, "Teléfono debe tener 9 dígitos").optional().or(z.literal("")),
})

export async function PATCH(req: Request) {
  const { profile } = await requireProfessional()

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const { bio, avatarUrl, districts, categoryIds, phone } = parsed.data

  await db.$transaction(async (tx) => {
    // Actualizar teléfono en User si se envió
    if (phone !== undefined) {
      await tx.user.update({
        where: { id: profile.userId },
        data: { phone: phone || null },
      })
    }

    // Actualizar datos del perfil
    await tx.professionalProfile.update({
      where: { id: profile.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
        ...(districts && { districts }),
      },
    })

    // Actualizar categorías si se enviaron
    if (categoryIds) {
      // Verificar que las categorías existen
      const categoriasExistentes = await tx.serviceCategory.findMany({
        where: { id: { in: categoryIds }, active: true },
        select: { id: true },
      })
      const idsValidos = categoriasExistentes.map((c) => c.id)

      // Eliminar todas las categorías actuales
      await tx.professionalCategory.deleteMany({
        where: { professionalId: profile.id },
      })

      // Insertar las nuevas
      if (idsValidos.length > 0) {
        await tx.professionalCategory.createMany({
          data: idsValidos.map((categoryId) => ({
            professionalId: profile.id,
            categoryId,
          })),
        })
      }
    }
  })

  return NextResponse.json({ ok: true })
}
