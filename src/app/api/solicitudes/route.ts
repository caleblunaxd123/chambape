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
  // Solicitud directa: ID del perfil del profesional destino
  targetProfessionalId: z.string().optional(),
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

  // Validar profesional destino si es solicitud directa
  let targetPro: { id: string; userId: string; user: { name: string } } | null = null
  if (data.targetProfessionalId) {
    targetPro = await db.professionalProfile.findUnique({
      where: { id: data.targetProfessionalId, status: { in: ["ACTIVE", "VERIFIED"] } },
      select: { id: true, userId: true, user: { select: { name: true } } },
    })
    if (!targetPro) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
    }
    // El cliente no puede enviarse solicitud a sí mismo
    if (targetPro.userId === user.id) {
      return NextResponse.json({ error: "No puedes enviarte una solicitud a ti mismo" }, { status: 400 })
    }
  }

  // Crear solicitud + (si es directa) auto-aplicar al profesional
  const solicitud = await db.$transaction(async (tx) => {
    const req = await tx.serviceRequest.create({
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
        ...(targetPro ? { targetProfessionalId: targetPro.id } : {}),
      },
    })

    // Solicitud directa: auto-aplicar al profesional sin cobrar créditos
    if (targetPro) {
      await tx.serviceApplication.create({
        data: {
          request: { connect: { id: req.id } },
          professional: { connect: { id: targetPro.id } },
          message: "",
          creditsSpent: 0,
          status: "PENDING",
        },
      })
    }

    return req
  })

  if (targetPro) {
    // Notificar SOLO al profesional destino
    const { createNotification } = await import("@/lib/notifications")
    createNotification({
      userId: targetPro.userId,
      type: "NEW_APPLICATION",
      title: "Nueva solicitud directa 📩",
      message: `${user.name} te envió una solicitud directa: "${data.title}"`,
      link: `/profesional/solicitudes/${solicitud.id}`,
    }).catch(() => {})
  } else {
    // Solicitud general: notificar a profesionales de la zona
    notificarProfesionales(solicitud.id, category.id, data.district, category.name).catch(
      (err) => console.error("[NOTIFICAR_PROFESIONALES]", err)
    )
  }

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
