// GET /api/creditos/balance — saldo y últimas transacciones del profesional
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { professionalProfile: true },
  })

  if (!user?.professionalProfile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
  }

  const transactions = await db.creditTransaction.findMany({
    where: { professionalId: user.professionalProfile.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json({
    credits: user.professionalProfile.credits,
    transactions,
  })
}
