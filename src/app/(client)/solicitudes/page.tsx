import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { PlusCircle, ClipboardList } from "lucide-react"
import { SolicitudCard } from "@/components/solicitudes/SolicitudCard"

const STATUS_TABS = [
  { label: "Todas", value: "" },
  { label: "Abiertas", value: "OPEN" },
  { label: "En progreso", value: "IN_PROGRESS" },
  { label: "Completadas", value: "COMPLETED" },
  { label: "Canceladas", value: "CANCELLED" },
]

interface Props {
  searchParams: { status?: string; page?: string }
}

export default async function MisSolicitudesPage({ searchParams }: Props) {
  const user = await requireAuth()

  const status = searchParams.status ?? ""
  const page = parseInt(searchParams.page ?? "1")
  const pageSize = 10

  const where = {
    clientId: user.id,
    ...(status ? { status: status as never } : {}),
  }

  const [solicitudes, total] = await Promise.all([
    db.serviceRequest.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.serviceRequest.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mis solicitudes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} solicitudes en total</p>
        </div>
        <Link
          href="/solicitudes/nueva"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva
        </Link>
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/solicitudes?status=${tab.value}` : "/solicitudes"}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              status === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Lista */}
      {solicitudes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {status ? "No hay solicitudes con este estado" : "Aún no tienes solicitudes"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {status
              ? "Prueba con otro filtro"
              : "Publica tu primera solicitud y recibe propuestas de profesionales"}
          </p>
          <Link
            href="/solicitudes/nueva"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Crear solicitud
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <SolicitudCard key={s.id} solicitud={s} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/solicitudes?${status ? `status=${status}&` : ""}page=${page - 1}`}
              className="px-4 py-2 text-sm text-gray-600 hover:text-orange-500 border border-gray-200 rounded-lg transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/solicitudes?${status ? `status=${status}&` : ""}page=${page + 1}`}
              className="px-4 py-2 text-sm text-gray-600 hover:text-orange-500 border border-gray-200 rounded-lg transition-colors"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
