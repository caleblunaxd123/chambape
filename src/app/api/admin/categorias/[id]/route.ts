import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  icon: z.string().min(1).optional(),
  description: z.string().max(200).nullable().optional(),
  creditCost: z.number().int().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      )
    }

    const categoria = await db.serviceCategory.findUnique({ where: { id } })
    if (!categoria) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    const updated = await db.serviceCategory.update({
      where: { id },
      data: parsed.data,
      include: { _count: { select: { requests: true, professionals: true, subcategories: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error actualizando categoría:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const categoria = await db.serviceCategory.findUnique({
      where: { id },
      include: { _count: { select: { requests: true, professionals: true } } },
    })
    if (!categoria) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    if (categoria._count.requests > 0 || categoria._count.professionals > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar: tiene profesionales o solicitudes asociadas. Desactívala en su lugar." },
        { status: 409 }
      )
    }

    await db.serviceCategory.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error eliminando categoría:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
