import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatFechaRelativa, formatSoles } from "@/lib/utils"
import { TrendingUp, TrendingDown, RefreshCw, Gift, CreditCard } from "lucide-react"
import ReprocesarPagoMP from "@/components/admin/ReprocesarPagoMP"

export const metadata = { title: "Transacciones — Admin ChambaPe" }

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; colorCredit: string; colorBadge: string }
> = {
  PURCHASE: {
    label: "Compra",
    icon: <CreditCard className="w-3.5 h-3.5" />,
    colorCredit: "text-green-600",
    colorBadge: "bg-green-100 text-green-700",
  },
  SPEND: {
    label: "Gasto",
    icon: <TrendingDown className="w-3.5 h-3.5" />,
    colorCredit: "text-red-500",
    colorBadge: "bg-red-100 text-red-600",
  },
  REFUND: {
    label: "Reembolso",
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    colorCredit: "text-blue-600",
    colorBadge: "bg-blue-100 text-blue-700",
  },
  BONUS: {
    label: "Bonus",
    icon: <Gift className="w-3.5 h-3.5" />,
    colorCredit: "text-purple-600",
    colorBadge: "bg-purple-100 text-purple-700",
  },
}

interface Props {
  searchParams: Promise<{ type?: string; page?: string }>
}

export default async function AdminTransaccionesPage({ searchParams }: Props) {
  await requireAdmin()
  const { type, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1"))
  const pageSize = 30

  const where = type ? { type: type as "PURCHASE" | "SPEND" | "REFUND" | "BONUS" } : undefined

  const [transacciones, total] = await Promise.all([
    db.creditTransaction.findMany({
      where,
      include: {
        professional: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.creditTransaction.count({ where }),
  ])

  // Resumen global
  const resumen = await db.creditTransaction.groupBy({
    by: ["type"],
    _sum: { credits: true, amountPen: true },
    _count: true,
  })
  const resumenMap = Object.fromEntries(
    resumen.map((r) => [r.type, { sum: r._sum, count: r._count }])
  )

  const totalPages = Math.ceil(total / pageSize)
  const types = ["PURCHASE", "SPEND", "REFUND", "BONUS"]

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transacciones de créditos</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} transacciones{type ? ` de tipo ${TYPE_CONFIG[type]?.label}` : ""}</p>
      </div>

      {/* Herramienta para reprocesar pagos fallidos */}
      <ReprocesarPagoMP />

      {/* Resumen por tipo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {types.map((t) => {
          const cfg = TYPE_CONFIG[t]
          const data = resumenMap[t]
          return (
            <div key={t} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className={`flex items-center gap-1.5 mb-2 ${cfg.colorCredit}`}>
                {cfg.icon}
                <span className="text-xs font-semibold">{cfg.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{data?.count ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {data?.sum?.credits != null
                  ? `${data.sum.credits > 0 ? "+" : ""}${data.sum.credits} cr`
                  : "0 cr"}
              </p>
              {t === "PURCHASE" && data?.sum?.amountPen && (
                <p className="text-xs text-green-600 font-medium mt-0.5">
                  {formatSoles(Math.round(data.sum.amountPen / 100))} recaudado
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <a
          href="/admin/transacciones"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            !type
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          Todas
        </a>
        {types.map((t) => (
          <a
            key={t}
            href={`/admin/transacciones?type=${t}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              type === t
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {TYPE_CONFIG[t].label}
          </a>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {transacciones.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay transacciones con este filtro</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transacciones.map((tx) => {
              const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG["SPEND"]
              const isPositive = tx.credits > 0
              return (
                <div key={tx.id} className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
                  {/* Left: tipo + profesional */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.colorBadge}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
                        {tx.description}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {tx.professional.user.name} · {tx.professional.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: monto + fecha */}
                  <div className="text-right shrink-0">
                    <p
                      className={`text-base font-bold ${
                        isPositive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}{tx.credits} cr
                    </p>
                    {tx.amountPen && (
                      <p className="text-xs text-gray-500 font-medium">
                        {formatSoles(Math.round(tx.amountPen / 100))}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatFechaRelativa(new Date(tx.createdAt))}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Saldo → {tx.balance} cr
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`/admin/transacciones?${type ? `type=${type}&` : ""}page=${page - 1}`}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:text-orange-500 transition-colors"
            >
              Anterior
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-400">{page} / {totalPages}</span>
          {page < totalPages && (
            <a
              href={`/admin/transacciones?${type ? `type=${type}&` : ""}page=${page + 1}`}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:text-orange-500 transition-colors"
            >
              Siguiente
            </a>
          )}
        </div>
      )}
    </div>
  )
}
