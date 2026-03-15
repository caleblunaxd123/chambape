import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { PlusCircle, ClipboardList, ArrowRight } from "lucide-react"
import { SolicitudCard } from "@/components/solicitudes/SolicitudCard"
import { expireSolicitudesVencidas } from "@/lib/expiracion"

const STATUS_TABS = [
  { label: "Todas", value: "" },
  { label: "🟢 Abiertas", value: "OPEN" },
  { label: "🔶 En progreso", value: "IN_PROGRESS" },
  { label: "✅ Completadas", value: "COMPLETED" },
  { label: "Canceladas", value: "CANCELLED" },
]

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export const metadata = { title: "Mis solicitudes" }

export default async function MisSolicitudesPage({ searchParams }: Props) {
  const user = await requireAuth()
  await expireSolicitudesVencidas()
  const { status: statusParam, page: pageParam } = await searchParams

  const status = statusParam ?? ""
  const page = parseInt(pageParam ?? "1")
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
    <div>
      {/* ── Page Header ─────────────────────── */}
      <div className="cp-page-header">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Mis solicitudes
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} solicitud{total !== 1 ? "es" : ""} en total
            </p>
          </div>
          <Link href="/solicitudes/nueva" className="btn-primary text-sm">
            <PlusCircle className="w-4 h-4" />
            Nueva
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* ── Tabs filtro ──────────────────────── */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hidden">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/solicitudes?status=${tab.value}` : "/solicitudes"}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                status === tab.value
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-orange-200 hover:text-orange-600"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* ── Lista ────────────────────────────── */}
        {solicitudes.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              {status ? "Sin solicitudes con este filtro" : "Aún no tienes solicitudes"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              {status
                ? "Prueba cambiando el filtro o crea una nueva solicitud."
                : "Publica tu primera solicitud y recibe presupuestos gratuitos de profesionales verificados en tu zona."}
            </p>
            {!status && (
              <Link href="/solicitudes/nueva" className="btn-primary">
                <PlusCircle className="w-4 h-4" />
                Crear mi primera solicitud
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {solicitudes.map((s) => (
              <SolicitudCard key={s.id} solicitud={s} />
            ))}
          </div>
        )}

        {/* ── Paginación ──────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/solicitudes?${status ? `status=${status}&` : ""}page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 border border-gray-200 rounded-xl transition-colors hover:border-orange-200"
              >
                ← Anterior
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500 font-semibold">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/solicitudes?${status ? `status=${status}&` : ""}page=${page + 1}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 border border-gray-200 rounded-xl transition-colors hover:border-orange-200"
              >
                Siguiente →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
