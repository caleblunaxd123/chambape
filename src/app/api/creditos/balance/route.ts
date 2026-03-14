// GET /api/creditos/balance — saldo y últimas transacciones del profesional
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { 
      // @ts-ignore prisma cache
      professionalProfile: {
        include: { subscription: true }
      } 
    },
  })

  const userAny = user as any

  if (!userAny?.professionalProfile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
  }

  const transactions = await db.creditTransaction.findMany({
    where: { professionalId: userAny.professionalProfile.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const profProfile = userAny.professionalProfile as any

  return NextResponse.json({
    credits: profProfile.credits,
    transactions,
    subscription: profProfile.subscription,
  })
}
