import { requireRole } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import React from "react"
import {
  formatFechaRelativa,
  formatSoles,
  URGENCIA_LABELS,
  getWhatsAppUrl,
} from "@/lib/utils"
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  Mail,
  UserCheck,
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
    status: string
    targetProfessionalId: string | null
    category: { name: string }
    client: { name: string; email: string; phone: string | null }
  }
}

const STATUS_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; cls: string; border: string }
> = {
  PENDING: {
    label: "Pendiente",
    icon: <Clock className="w-3.5 h-3.5" />,
    cls: "bg-amber-50 text-amber-700",
    border: "border-gray-100 hover:border-amber-200 focus-within:border-amber-200",
  },
  ACCEPTED: {
    label: "¡Aceptada!",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    cls: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200 shadow-[0_2px_16px_rgba(16,185,129,0.1)]",
  },
  REJECTED: {
    label: "No seleccionado",
    icon: <XCircle className="w-3.5 h-3.5" />,
    cls: "bg-gray-100 text-gray-500",
    border: "border-gray-100 opacity-75",
  },
  WITHDRAWN: {
    label: "Retirada",
    icon: <XCircle className="w-3.5 h-3.5" />,
    cls: "bg-red-50 text-red-600",
    border: "border-gray-100 opacity-75",
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

export const metadata = { title: "Mis Aplicaciones — ChambaPe" }

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
            client: { select: { name: true, email: true, phone: true } },
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="cp-page-header">
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Mis aplicaciones
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {total} aplicación{total !== 1 ? "es" : ""} enviada{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="px-4 sm:px-6 space-y-6">
        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Enviadas", value: (statsMap["PENDING"] ?? 0) + (statsMap["ACCEPTED"] ?? 0) + (statsMap["REJECTED"] ?? 0), color: "text-gray-900" },
            { label: "Aceptadas", value: statsMap["ACCEPTED"] ?? 0, color: "text-emerald-600" },
            { label: "Tasa éxito", value: total > 0 ? `${Math.round(((statsMap["ACCEPTED"] ?? 0) / total) * 100)}%` : "—", color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <p className={`text-3xl font-black ${s.color}`} style={{ fontFamily: "Outfit, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hidden">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.value
            return (
              <Link
                key={tab.value}
                href={tab.value ? `/profesional/aplicaciones?status=${tab.value}` : "/profesional/aplicaciones"}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.value && statsMap[tab.value] ? (
                  <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]", isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
                    {statsMap[tab.value]}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>

        {/* Lista */}
        {aplicaciones.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ClipboardList className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Sin aplicaciones
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {status ? "No tienes aplicaciones enviadas con este estado." : "Aún no has enviado propuestas a ninguna solicitud."}
            </p>
            {!status && (
              <Link
                href="/profesional/oportunidades"
                className="btn-primary"
              >
                Buscar oportunidades
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {aplicaciones.map((a) => {
              const s = STATUS_MAP[a.status] ?? STATUS_MAP["PENDING"]
              const isAccepted = a.status === "ACCEPTED"
              const isDirect = a.request.targetProfessionalId === profile.id
              return (
                <div
                  key={a.id}
                  className={cn(
                    "bg-white border rounded-2xl overflow-hidden transition-all duration-200 group",
                    s.border
                  )}
                >
                  {/* Top accent bar */}
                  {isAccepted && <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />}
                  {!isAccepted && isDirect && <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-400" />}

                  <div className="p-4 sm:p-5">
                    {/* Request info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                            {a.request.category.name}
                          </span>
                          {isDirect && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
                              <UserCheck className="w-3 h-3" />
                              Solicitud directa
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mt-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                          {a.request.title}
                        </h3>
                      </div>
                      <span className={cn("flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0", s.cls, isAccepted ? "border-emerald-200" : "border-transparent")}>
                        {s.icon}
                        {s.label}
                      </span>
                    </div>

                    {/* My proposal details */}
                    {isDirect ? (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-orange-500 shrink-0" />
                        <p className="text-sm text-orange-700 font-medium">El cliente te eligió directamente · <span className="font-bold">0 créditos</span></p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Mí propuesta</p>
                        <p className="text-sm text-gray-700 italic leading-relaxed line-clamp-3">
                          &ldquo;{a.message}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs flex-wrap mb-4">
                      <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {a.request.district}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {URGENCIA_LABELS[a.request.urgency as keyof typeof URGENCIA_LABELS] ?? a.request.urgency}
                      </span>
                      {a.proposedBudget && (
                        <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          Presupuesto: {formatSoles(a.proposedBudget)}
                        </span>
                      )}
                    </div>

                    {/* Accepted: show client contact info */}
                    {isAccepted && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
                        <p className="text-sm font-black text-emerald-800 mb-2">🎉 ¡El cliente te ha elegido!</p>
                        <p className="text-xs text-emerald-600 mb-3">Contáctale directamente para coordinar el trabajo.</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {a.request.client.phone && (
                            <a
                              href={getWhatsAppUrl(a.request.client.phone, `Hola ${a.request.client.name}, soy el profesional asignado para tu solicitud "${a.request.title}" en ChambaPe. ¿Cuándo podemos coordinar?`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba58] text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              WhatsApp
                            </a>
                          )}
                          <a
                            href={`mailto:${a.request.client.email}`}
                            className="inline-flex items-center justify-center gap-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Correo
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-xs font-medium text-gray-400">
                        {formatFechaRelativa(new Date(a.createdAt))}
                      </span>
                      <Link
                        href={`/profesional/oportunidades/${a.requestId}`}
                        className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg"
                      >
                        Ver solicitud origen <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-6">
            {page > 1 && (
              <Link
                href={`/profesional/aplicaciones?${status ? `status=${status}&` : ""}page=${page - 1}`}
                className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl text-gray-600 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all"
              >
                ← Anterior
              </Link>
            )}
            <span className="px-4 py-2 text-sm font-bold text-gray-400">{page} / {totalPages}</span>
            {page < totalPages && (
              <Link
                href={`/profesional/aplicaciones?${status ? `status=${status}&` : ""}page=${page + 1}`}
                className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-xl text-gray-600 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 transition-all"
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
