import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatFechaRelativa } from "@/lib/utils"
import Link from "next/link"

export const metadata = { title: "Solicitudes — Admin ChambaPe" }

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
  EXPIRED: "bg-yellow-100 text-yellow-700",
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminSolicitudesPage({ searchParams }: Props) {
  await requireAdmin()
  const { status } = await searchParams

  const solicitudes = await db.serviceRequest.findMany({
    where: status ? { status: status as "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "EXPIRED" } : undefined,
    include: {
      category: true,
      client: { select: { name: true, email: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  })

  const statuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "EXPIRED"]

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/admin/solicitudes"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            !status ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          Todas
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/solicitudes?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              status === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500">{solicitudes.length} solicitudes</p>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {solicitudes.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay solicitudes con este filtro</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {solicitudes.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0">{s.category.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                    <p className="text-xs text-gray-400">
                      {s.client.name} · {s.district} · {formatFechaRelativa(new Date(s.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-3">
                  <span className="hidden sm:inline text-xs text-gray-400">{s._count.applications} propuestas</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
