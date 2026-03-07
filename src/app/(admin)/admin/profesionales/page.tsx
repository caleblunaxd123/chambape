import { requireAdmin } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { formatFechaRelativa, PROFESSIONAL_STATUS_LABELS } from "@/lib/utils"
import { Search, ShieldCheck, Clock, XCircle } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Profesionales — Admin ChambaPe" }

const STATUS_COLORS: Record<string, string> = {
  PENDING_VERIFICATION: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-600",
  REJECTED: "bg-gray-100 text-gray-500",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING_VERIFICATION: <Clock className="w-3.5 h-3.5" />,
  VERIFIED: <ShieldCheck className="w-3.5 h-3.5" />,
  ACTIVE: <ShieldCheck className="w-3.5 h-3.5" />,
  SUSPENDED: <XCircle className="w-3.5 h-3.5" />,
  REJECTED: <XCircle className="w-3.5 h-3.5" />,
}

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>
}

export default async function AdminProfesionalesPage({ searchParams }: Props) {
  await requireAdmin()
  const { filter, q } = await searchParams

  const where: Prisma.ProfessionalProfileWhereInput = {}

  if (filter && filter !== "TODOS") {
    where.status = filter as "PENDING_VERIFICATION" | "VERIFIED" | "ACTIVE" | "SUSPENDED" | "REJECTED"
  }

  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { dni: { contains: q } },
    ]
  }

  const profesionales = await db.professionalProfile.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      categories: { include: { category: { select: { name: true, icon: true } } }, take: 3 },
      _count: { select: { applications: true, reviewsReceived: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  // Conteo por estado
  const counts = await db.professionalProfile.groupBy({
    by: ["status"],
    _count: true,
  })
  const countMap: Record<string, number> = {}
  counts.forEach((c) => (countMap[c.status] = c._count))

  const filters = [
    { value: "TODOS", label: "Todos", count: profesionales.length },
    { value: "PENDING_VERIFICATION", label: "Pendientes", count: countMap.PENDING_VERIFICATION ?? 0 },
    { value: "ACTIVE", label: "Activos", count: countMap.ACTIVE ?? 0 },
    { value: "VERIFIED", label: "Verificados", count: countMap.VERIFIED ?? 0 },
    { value: "SUSPENDED", label: "Suspendidos", count: countMap.SUSPENDED ?? 0 },
    { value: "REJECTED", label: "Rechazados", count: countMap.REJECTED ?? 0 },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
        <p className="text-sm text-gray-500 mt-0.5">{profesionales.length} resultados</p>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/admin/profesionales${f.value !== "TODOS" ? `?filter=${f.value}` : ""}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              (filter ?? "TODOS") === f.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {f.label}
            <span className={`text-xs ${(filter ?? "TODOS") === f.value ? "text-gray-300" : "text-gray-400"}`}>
              ({f.count})
            </span>
          </Link>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {profesionales.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No hay profesionales con este filtro
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {profesionales.map((p) => (
              <Link
                key={p.id}
                href={`/admin/profesionales/${p.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-orange-600">
                    {p.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{p.user.name}</p>
                    <p className="text-xs text-gray-400">{p.user.email} · DNI {p.dni}</p>
                    {/* Categorías */}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.categories.slice(0, 2).map((c) => (
                        <span key={c.categoryId} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {c.category.icon} {c.category.name}
                        </span>
                      ))}
                      {p.categories.length > 2 && (
                        <span className="text-xs text-gray-400">+{p.categories.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">
                      {p._count.applications} aplicaciones · {p._count.reviewsReceived} reseñas
                    </p>
                    <p className="text-xs text-gray-400">{formatFechaRelativa(new Date(p.createdAt))}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                    {STATUS_ICONS[p.status]}
                    {PROFESSIONAL_STATUS_LABELS[p.status]}
                  </div>
                  <span className="text-gray-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
