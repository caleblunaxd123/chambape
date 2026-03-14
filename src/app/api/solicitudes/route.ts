// GET  /api/solicitudes — lista solicitudes del cliente
// POST /api/solicitudes — crea una nueva solicitud
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { notifyNuevaSolicitud } from "@/lib/notifications"
import { getDistritoName } from "@/constants/distritos"

const createSchema = z.object({
  title: z.string().min(10).max(100),
  categorySlug: z.string().min(1),
  subcategorySlug: z.string().optional(),
  description: z.string().min(30).max(1000),
  district: z.string().min(1),
  address: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  urgency: z.enum(["TODAY", "THIS_WEEK", "THIS_MONTH", "FLEXIBLE"]),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredTime: z.string().max(100).optional(),
  photos: z.array(z.string().url()).max(3).default([]),
})

// ─── POST ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Buscar categoría y subcategoría por slug
  const category = await db.serviceCategory.findUnique({
    where: { slug: data.categorySlug },
  })
  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
  }

  let subcategoryId: string | undefined
  if (data.subcategorySlug) {
    const sub = await db.serviceSubcategory.findUnique({
      where: { slug: data.subcategorySlug },
    })
    subcategoryId = sub?.id
  }

  // Calcular expiración: 30 días desde hoy
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // Crear la solicitud
  const solicitud = await db.serviceRequest.create({
    data: {
      clientId: user.id,
      categoryId: category.id,
      subcategoryId,
      title: data.title,
      description: data.description,
      photos: data.photos,
      district: data.district,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      urgency: data.urgency,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      preferredTime: data.preferredTime,
      status: "OPEN",
      expiresAt,
    },
  })

  // Notificar a los profesionales de esa categoría y zona
  // (en background — no bloqueamos la respuesta)
  notificarProfesionales(solicitud.id, category.id, data.district, category.name).catch(
    (err) => console.error("[NOTIFICAR_PROFESIONALES]", err)
  )

  return NextResponse.json({ id: solicitud.id }, { status: 201 })
}

// ─── GET ──────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") ?? "1")
  const pageSize = 10

  const solicitudes = await db.serviceRequest.findMany({
    where: {
      clientId: user.id,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      category: true,
      subcategory: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const total = await db.serviceRequest.count({ where: { clientId: user.id } })

  return NextResponse.json({
    data: solicitudes,
    total,
    page,
    pageSize,
    hasMore: total > page * pageSize,
  })
}

// ─── Helper interno ───────────────────────────────────────────────

async function notificarProfesionales(
  requestId: string,
  categoryId: string,
  district: string,
  categoryName: string
) {
  // Buscar profesionales activos en esa categoría y zona
  const profesionales = await db.professionalProfile.findMany({
    where: {
      status: { in: ["VERIFIED", "ACTIVE"] },
      districts: { has: district },
      categories: { some: { categoryId } },
    },
    select: { userId: true },
    take: 50,  // máximo 50 notificaciones por solicitud
  })

  const distritoNombre = getDistritoName(district)

  await Promise.allSettled(
    profesionales.map((p) =>
      notifyNuevaSolicitud(p.userId, categoryName, distritoNombre, requestId)
    )
  )
}
