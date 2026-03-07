import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PlusCircle, ArrowRight, Clock, CheckCircle2, Users } from "lucide-react"
import { URGENCIA_LABELS, REQUEST_STATUS_LABELS, formatFechaRelativa } from "@/lib/utils"
import { CATEGORIAS_MAP } from "@/constants/categorias"

export const metadata = { title: "Mi panel" }

export default async function DashboardClientePage() {
  const user = await requireAuth()

  // Si es profesional, redirigir a su panel
  if (user.role === "PROFESSIONAL") redirect("/profesional/dashboard")
  if (user.role === "ADMIN") redirect("/admin/dashboard")

  // Solicitudes activas del cliente
  const solicitudes = await db.serviceRequest.findMany({
    where: { clientId: user.id },
    include: {
      category: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const totalActivas = solicitudes.filter((s) => s.status === "OPEN" || s.status === "IN_PROGRESS").length

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          ¿Qué necesitas hoy?
        </p>
      </div>

      {/* CTA principal */}
      <Link
        href="/solicitudes/nueva"
        className="flex items-center justify-between bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-5 transition-colors shadow-sm"
      >
        <div>
          <p className="font-bold text-lg">Publicar una solicitud</p>
          <p className="text-orange-100 text-sm mt-0.5">
            Recibe hasta 5 presupuestos de profesionales verificados
          </p>
        </div>
        <PlusCircle className="w-8 h-8 shrink-0 opacity-90" />
      </Link>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{solicitudes.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Solicitudes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500">{totalActivas}</p>
          <p className="text-xs text-gray-400 mt-0.5">Activas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">
            {solicitudes.filter((s) => s.status === "COMPLETED").length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Completadas</p>
        </div>
      </div>

      {/* Categorías rápidas */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Servicios populares</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {["gasfiteria", "electricidad", "pintura", "limpieza-hogar", "carpinteria", "cerrajeria", "fumigacion", "mudanzas"].map((slug) => {
            const cat = CATEGORIAS_MAP[slug]
            if (!cat) return null
            return (
              <Link
                key={slug}
                href={`/solicitudes/nueva?categoria=${slug}`}
                className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 p-3 hover:border-orange-300 hover:shadow-sm transition-all text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-gray-600 leading-tight font-medium">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mis solicitudes recientes */}
      {solicitudes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Mis solicitudes</h2>
            <Link href="/solicitudes" className="text-xs text-orange-500 font-medium flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {solicitudes.map((s) => {
              const statusColor: Record<string, string> = {
                OPEN: "text-blue-600 bg-blue-50",
                IN_PROGRESS: "text-orange-600 bg-orange-50",
                COMPLETED: "text-green-600 bg-green-50",
                CANCELLED: "text-gray-400 bg-gray-50",
                EXPIRED: "text-gray-400 bg-gray-50",
              }

              return (
                <Link
                  key={s.id}
                  href={`/solicitudes/${s.id}`}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{s.category.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor[s.status]}`}>
                          {REQUEST_STATUS_LABELS[s.status]}
                        </span>
                        {s._count.applications > 0 && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Users className="w-3 h-3" />
                            {s._count.applications} propuesta{s._count.applications !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {formatFechaRelativa(s.createdAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {solicitudes.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">🔧</p>
          <p className="text-gray-600 font-medium mb-1">¿Qué necesitas arreglar?</p>
          <p className="text-sm text-gray-400 mb-5">
            Publica tu primera solicitud y recibe presupuestos gratis
          </p>
          <Link
            href="/solicitudes/nueva"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Publicar solicitud
          </Link>
        </div>
      )}
    </div>
  )
}
