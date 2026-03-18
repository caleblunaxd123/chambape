import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  icon: z.string().min(1, "Selecciona un ícono"),
  description: z.string().max(200).optional(),
  creditCost: z.number().int().min(1).max(100),
  order: z.number().int().min(0).optional(),
})

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      )
    }

    const { name, slug, icon, description, creditCost, order } = parsed.data

    // Verificar slug único
    const existe = await db.serviceCategory.findUnique({ where: { slug } })
    if (existe) {
      return NextResponse.json({ error: "Ya existe una categoría con ese slug" }, { status: 409 })
    }

    // Obtener el orden máximo si no se especifica
    const maxOrder = order ?? (await db.serviceCategory.count())

    const categoria = await db.serviceCategory.create({
      data: { name, slug, icon, description, creditCost, order: maxOrder, active: true },
      include: { _count: { select: { requests: true, professionals: true, subcategories: true } } },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error("Error creando categoría:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
