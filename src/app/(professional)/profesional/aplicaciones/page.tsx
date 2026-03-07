import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import React from "react"
import {
  formatFechaRelativa,
  formatSoles,
  URGENCIA_LABELS,
} from "@/lib/utils"
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Coins,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AplicacionItem {
  id: string
  requestId: string
  message: string
  proposedBudget: number | null
  creditsSpent: number
  status: string
  createdAt: Date
  request: {
    id: string
    title: string
    district: string
    urgency: string
    category: { name: string }
  }
}

const STATUS_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  PENDING: {
    label: "Pendiente",
    icon: <Clock className="w-3.5 h-3.5" />,
    className: "bg-yellow-100 text-yellow-700",
  },
  ACCEPTED: {
    label: "¡Aceptada!",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    className: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "No seleccionado",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-gray-100 text-gray-500",
  },
  WITHDRAWN: {
    label: "Retirada",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-red-100 text-red-500",
  },
}

const STATUS_TABS = [
  { label: "Todas", value: "" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Aceptadas", value: "ACCEPTED" },
  { label: "No seleccionadas", value: "REJECTED" },
]

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function MisAplicacionesPage({ searchParams }: Props) {
  const user = await requireRole("PROFESSIONAL")

  const profile = await db.professionalProfile.findUnique({
    where: { userId: user.id },
  })
  if (!profile) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        Perfil no encontrado.
      </div>
    )
  }

  const { status: statusParam, page: pageParam } = await searchParams
  const status = statusParam ?? ""
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const pageSize = 15

  const where = {
    professionalId: profile.id,
    ...(status ? { status: status as never } : {}),
  }

  const [aplicaciones, total] = await Promise.all([
    db.serviceApplication.findMany({
      where,
      include: {
        request: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }) as unknown as AplicacionItem[],
    db.serviceApplication.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  // Stats rápidas
  const stats = await db.serviceApplication.groupBy({
    by: ["status"],
    where: { professionalId: profile.id },
    _count: true,
  })
  const statsMap = Object.fromEntries(stats.map((s) => [s.status, s._count]))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Mis aplicaciones</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} aplicaciones en total</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Enviadas", value: (statsMap["PENDING"] ?? 0) + (statsMap["ACCEPTED"] ?? 0) + (statsMap["REJECTED"] ?? 0), color: "text-gray-900" },
          { label: "Aceptadas", value: statsMap["ACCEPTED"] ?? 0, color: "text-green-600" },
          { label: "Tasa éxito", value: total > 0 ? `${Math.round(((statsMap["ACCEPTED"] ?? 0) / total) * 100)}%` : "—", color: "text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/profesional/aplicaciones?status=${tab.value}` : "/profesional/aplicaciones"}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              status === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.value && statsMap[tab.value] ? (
              <span className="ml-1 text-gray-400">({statsMap[tab.value]})</span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Lista */}
      {aplicaciones.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Sin aplicaciones</h3>
          <p className="text-sm text-gray-500 mb-5">
            {status ? "No hay aplicaciones con este estado." : "Aún no has aplicado a ninguna solicitud."}
          </p>
          <Link
            href="/profesional/oportunidades"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Ver oportunidades
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {aplicaciones.map((a) => {
            const s = STATUS_MAP[a.status] ?? STATUS_MAP["PENDING"]
            return (
              <div
                key={a.id}
                className={cn(
                  "bg-white border rounded-2xl p-4 transition-all",
                  a.status === "ACCEPTED"
                    ? "border-green-200 shadow-sm"
                    : "border-gray-100"
                )}
              >
                {/* Request info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {a.request.category.name}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1.5 line-clamp-1">
                      {a.request.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0",
                      s.className
                    )}
                  >
                    {s.icon}
                    {s.label}
                  </span>
                </div>

                {/* My proposal details */}
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">
                  &ldquo;{a.message}&rdquo;
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {a.request.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {URGENCIA_LABELS[a.request.urgency as keyof typeof URGENCIA_LABELS] ?? a.request.urgency}
                  </span>
                  {a.proposedBudget && (
                    <span className="font-semibold text-gray-600">
                      {formatSoles(a.proposedBudget)}
                    </span>
                  )}
                </div>

                {/* Accepted: show contact info hint */}
                {a.status === "ACCEPTED" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-xs text-green-700 font-medium">
                    🎉 ¡El cliente te eligió! Revisa la solicitud para ver su contacto.
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    Aplicaste {formatFechaRelativa(new Date(a.createdAt))}
                  </span>
                  <Link
                    href={`/solicitudes/${a.requestId}`}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition-colors"
                  >
                    Ver solicitud <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/profesional/aplicaciones?${status ? `status=${status}&` : ""}page=${page - 1}`}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:text-orange-500 transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-400">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/profesional/aplicaciones?${status ? `status=${status}&` : ""}page=${page + 1}`}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:text-orange-500 transition-colors"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
