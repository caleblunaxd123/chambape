// POST   /api/favoritos/[id] — agrega un profesional a favoritos
// DELETE /api/favoritos/[id] — quita un profesional de favoritos
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

async function getUser(userId: string) {
  return db.user.findUnique({ where: { clerkId: userId } })
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: professionalId } = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await getUser(userId)
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  const professional = await db.professionalProfile.findUnique({ where: { id: professionalId } })
  if (!professional) return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })

  // Upsert — no falla si ya existe
  const favorite = await db.favorite.upsert({
    where: { userId_professionalId: { userId: user.id, professionalId } },
    create: { userId: user.id, professionalId },
    update: {},
  })

  return NextResponse.json({ ok: true, favorite })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: professionalId } = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await getUser(userId)
  if (!user) return new NextResponse("Usuario no encontrado", { status: 404 })

  await db.favorite.deleteMany({
    where: { userId: user.id, professionalId },
  })

  return NextResponse.json({ ok: true })
}
