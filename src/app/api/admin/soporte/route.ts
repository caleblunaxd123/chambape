// GET /api/admin/soporte
// Lista todos los tickets de soporte con filtro opcional por status.
// Solo accesible para admins.

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { SupportTicketStatus } from "@prisma/client"

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get("status")

    const where = statusParam && Object.values(SupportTicketStatus).includes(statusParam as SupportTicketStatus)
      ? { status: statusParam as SupportTicketStatus }
      : {}

    const [tickets, counts] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      db.supportTicket.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ])

    const countMap: Record<string, number> = { OPEN: 0, REPLIED: 0, CLOSED: 0 }
    for (const row of counts) {
      countMap[row.status] = row._count._all
    }

    return NextResponse.json({ tickets, counts: countMap })
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
}
