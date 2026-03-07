import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { Users, ClipboardList, Coins, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export const metadata = { title: "Panel Admin — ChambaPe" }

export default async function AdminDashboardPage() {
  await requireAdmin()

  // Métricas generales en paralelo
  const [
    totalProfesionales,
    pendienteVerificacion,
    totalClientes,
    totalSolicitudes,
    solicitudesAbiertas,
    solicitudesCompletadas,
    totalReseñas,
    ingresosTotal,
    profesionalesHoy,
    solicitudesHoy,
  ] = await Promise.all([
    db.professionalProfile.count(),
    db.professionalProfile.count({ where: { status: "PENDING_VERIFICATION" } }),
    db.user.count({ where: { role: "CLIENT" } }),
    db.serviceRequest.count(),
    db.serviceRequest.count({ where: { status: "OPEN" } }),
    db.serviceRequest.count({ where: { status: "COMPLETED" } }),
    db.review.count({ where: { hidden: false } }),
    db.creditTransaction.aggregate({
      where: { type: "PURCHASE" },
      _sum: { amountPen: true },
    }),
    db.professionalProfile.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    db.serviceRequest.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ])

  const ingresosSoles = Math.round((ingresosTotal._sum.amountPen ?? 0) / 100)

  // Últimos profesionales pendientes de verificación
  const pendientes = await db.professionalProfile.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" }, // Más antiguos primero
    take: 5,
  })

  // Últimas solicitudes
  const ultimasSolicitudes = await db.serviceRequest.findMany({
    include: { category: true, client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Alerta de verificaciones pendientes */}
      {pendienteVerificacion > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-amber-800">
              {pendienteVerificacion} profesional{pendienteVerificacion > 1 ? "es" : ""} esperando verificación
            </span>
            <span className="text-amber-600 ml-1">— revisa sus documentos para activarlos</span>
          </div>
          <a
            href="/admin/profesionales?filter=PENDING_VERIFICATION"
            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-amber-600 shrink-0"
          >
            Revisar
          </a>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Profesionales"
          value={totalProfesionales}
          sub={`${pendienteVerificacion} pendientes`}
          subColor="text-amber-500"
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-green-500" />}
          label="Clientes"
          value={totalClientes}
          sub={`+${solicitudesHoy} solicitudes hoy`}
          bg="bg-green-50"
        />
        <StatCard
          icon={<ClipboardList className="w-5 h-5 text-orange-500" />}
          label="Solicitudes"
          value={totalSolicitudes}
          sub={`${solicitudesAbiertas} abiertas`}
          bg="bg-orange-50"
        />
        <StatCard
          icon={<Coins className="w-5 h-5 text-emerald-500" />}
          label="Ingresos totales"
          value={`S/. ${ingresosSoles.toLocaleString("es-PE")}`}
          sub={`${totalReseñas} reseñas`}
          bg="bg-emerald-50"
        />
      </div>

      {/* Stats secundarias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Tasa de conversión
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalSolicitudes > 0 ? Math.round((solicitudesCompletadas / totalSolicitudes) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400">{solicitudesCompletadas} completadas</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Clock className="w-3.5 h-3.5" />
            Nuevos hoy
          </div>
          <p className="text-2xl font-bold text-gray-900">{profesionalesHoy + solicitudesHoy}</p>
          <p className="text-xs text-gray-400">
            {profesionalesHoy} profesionales · {solicitudesHoy} solicitudes
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Solicitudes abiertas
          </div>
          <p className="text-2xl font-bold text-gray-900">{solicitudesAbiertas}</p>
          <p className="text-xs text-gray-400">esperando profesionales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendientes de verificación */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Pendientes de verificación</h2>
            <a href="/admin/profesionales?filter=PENDING_VERIFICATION" className="text-xs text-orange-500 font-medium">
              Ver todos →
            </a>
          </div>
          {pendientes.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No hay verificaciones pendientes 🎉
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendientes.map((p) => (
                <a
                  key={p.id}
                  href={`/admin/profesionales/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.user.name}</p>
                    <p className="text-xs text-gray-400">{p.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                      Pendiente
                    </span>
                    <span className="text-gray-300 text-sm">→</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Últimas solicitudes */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Últimas solicitudes</h2>
            <a href="/admin/solicitudes" className="text-xs text-orange-500 font-medium">Ver todas →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {ultimasSolicitudes.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{s.category.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.client.name} · {s.district}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor = "text-gray-400",
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  subColor?: string
  bg: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  )
}

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
