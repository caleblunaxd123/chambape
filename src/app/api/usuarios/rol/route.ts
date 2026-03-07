// POST /api/usuarios/rol — asigna rol inicial al usuario recién registrado
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const schema = z.object({
  role: z.enum(["CLIENT", "PROFESSIONAL"]),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return new NextResponse("Datos inválidos", { status: 400 })

  const { role } = parsed.data

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  // Solo permite asignar rol si aún es CLIENT (estado por defecto)
  // No permite degradar un admin
  if (user.role === "ADMIN") {
    return new NextResponse("No permitido", { status: 403 })
  }

  await db.user.update({
    where: { clerkId: userId },
    data: { role },
  })

  // Si elige profesional, crea el perfil vacío para empezar el wizard
  if (role === "PROFESSIONAL") {
    const existing = await db.professionalProfile.findUnique({
      where: { userId: user.id },
    })
    if (!existing) {
      await db.professionalProfile.create({
        data: {
          userId: user.id,
          dni: "",           // Se completará en Step 1
          districts: [],
          onboardingStep: 1,
        },
      })
    }
  }

  return NextResponse.json({ ok: true, role })
}
