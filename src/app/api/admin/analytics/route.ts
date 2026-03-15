import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse("No autorizado", { status: 401 })

  // Verificar admin
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  })

  if (user?.role !== "ADMIN") {
    return new NextResponse("No autorizado", { status: 403 })
  }

  try {
    // 1. Ingresos por mes (últimos 6 meses)
    const revenueData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)

      const total = await db.creditTransaction.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          type: { in: ["PURCHASE", "SUBSCRIPTION_PAYMENT"] },
        },
        _sum: { amountPen: true },
      })

      revenueData.push({
        month: format(monthDate, "MMM", { locale: es }),
        total: total._sum.amountPen ?? 0,
      })
    }

    // 2. Demanda por categoría (Top 6)
    const categoryStats = await db.serviceRequest.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 6,
    })

    const categoryIds = categoryStats.map((s) => s.categoryId)
    const categories = await db.serviceCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    })
    
    const categoryDemand = categoryStats.map(stat => {
      const cat = categories.find(c => c.id === stat.categoryId)
      return {
        name: cat?.name || "Otros",
        value: stat._count._all,
      }
    })

    // 3. Distribución de usuarios
    const [clients, professionals] = await Promise.all([
      db.user.count({ where: { role: "CLIENT" } }),
      db.user.count({ where: { role: "PROFESSIONAL" } }),
    ])

    return NextResponse.json({
      revenue: revenueData,
      demand: categoryDemand,
      users: [
        { name: "Clientes", value: clients },
        { name: "Profesionales", value: professionals },
      ],
    })
  } catch (error) {
    console.error("[ANALYTICS_API] Error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
