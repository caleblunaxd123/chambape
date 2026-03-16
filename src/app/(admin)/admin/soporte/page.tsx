import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { SupportTicketStatus } from "@prisma/client"
import SoporteInbox from "@/components/admin/SoporteInbox"

export const metadata = { title: "Mesa de ayuda — Admin ChambaPe" }

const STATUS_TABS = [
  { key: "ALL",    label: "Todos" },
  { key: "OPEN",   label: "Abiertos" },
  { key: "REPLIED",label: "Respondidos" },
  { key: "CLOSED", label: "Cerrados" },
] as const

export default async function SoportePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>
}) {
  await requireAdmin()

  const { status: statusParam, id: selectedId } = await searchParams
  const validStatus = Object.values(SupportTicketStatus)
  const filterStatus = validStatus.includes(statusParam as SupportTicketStatus)
    ? (statusParam as SupportTicketStatus)
    : undefined

  const [tickets, counts] = await Promise.all([
    db.supportTicket.findMany({
      where: filterStatus ? { status: filterStatus } : {},
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
  const totalAll = Object.values(countMap).reduce((a, b) => a + b, 0)

  // Ticket seleccionado (por query param ?id=...)
  const selectedTicket = selectedId
    ? tickets.find((t) => t.id === selectedId) ?? tickets[0]
    : tickets[0]

  return (
    <div>
      {/* ── Header ───────────────────────────── */}
      <div className="cp-page-header">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Mesa de ayuda
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gestiona y responde los mensajes de soporte de usuarios
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* ── Tabs de filtro ─────────────────── */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {STATUS_TABS.map(({ key, label }) => {
            const count = key === "ALL" ? totalAll : (countMap[key] ?? 0)
            const isActive = (key === "ALL" && !filterStatus) || key === filterStatus
            return (
              <a
                key={key}
                href={key === "ALL" ? "/admin/soporte" : `/admin/soporte?status=${key}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {label}
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </a>
            )
          })}
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-bold text-gray-700 mb-1">No hay tickets</p>
            <p className="text-sm text-gray-400">
              {filterStatus
                ? `No hay tickets con estado "${filterStatus.toLowerCase()}".`
                : "Aún no has recibido mensajes de soporte."}
            </p>
          </div>
        ) : (
          <SoporteInbox tickets={tickets} selectedId={selectedTicket?.id ?? null} />
        )}
      </div>
    </div>
  )
}
