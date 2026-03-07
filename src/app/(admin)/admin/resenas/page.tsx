import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatFechaRelativa } from "@/lib/utils"
import { Star } from "lucide-react"

export const metadata = { title: "Reseñas — Admin ChambaPe" }

export default async function AdminResenasPage() {
  await requireAdmin()

  const resenas = await db.review.findMany({
    include: {
      client: { select: { name: true } },
      professional: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  })

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
        <p className="text-sm text-gray-500 mt-0.5">{resenas.length} reseñas en total</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {resenas.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay reseñas todavía</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {resenas.map((r) => (
              <div key={r.id} className={`px-5 py-4 ${r.hidden ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{r.client.name}</span>
                      <span className="text-gray-300">→</span>
                      <span className="text-sm text-gray-700">{r.professional.user.name}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-100"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{r.comment}</p>
                    {r.hidden && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Oculta
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatFechaRelativa(new Date(r.createdAt))}</p>
                    {r.reportedBy && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Reportada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
