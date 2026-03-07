import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { Tag, Users, ClipboardList, Coins } from "lucide-react"

export const metadata = { title: "Categorías — Admin ChambaPe" }

export default async function AdminCategoriasPage() {
  await requireAdmin()

  const categorias = await db.serviceCategory.findMany({
    include: {
      _count: {
        select: {
          requests: true,
          professionals: true,
          subcategories: true,
        },
      },
    },
    orderBy: { order: "asc" },
  })

  const totalActivas = categorias.filter((c) => c.active).length
  const totalProfesionales = categorias.reduce((acc, c) => acc + c._count.professionals, 0)
  const totalSolicitudes = categorias.reduce((acc, c) => acc + c._count.requests, 0)

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categorías de servicio</h1>
        <p className="text-sm text-gray-500 mt-0.5">{categorias.length} categorías registradas en el sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total categorías", value: categorias.length, icon: Tag, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Activas", value: totalActivas, icon: Tag, color: "text-green-700", bg: "bg-green-50" },
          { label: "Profesionales", value: totalProfesionales, icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Solicitudes", value: totalSolicitudes, icon: ClipboardList, color: "text-orange-700", bg: "bg-orange-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de categorías */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 hidden sm:grid sm:grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <div className="col-span-5">Categoría</div>
          <div className="col-span-2 text-center">Crédito/app</div>
          <div className="col-span-2 text-center">Profesionales</div>
          <div className="col-span-2 text-center">Solicitudes</div>
          <div className="col-span-1 text-center">Estado</div>
        </div>

        {categorias.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay categorías registradas</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className={`px-4 sm:px-5 py-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center ${
                  !cat.active ? "opacity-60" : ""
                }`}
              >
                {/* Nombre */}
                <div className="col-span-5 flex items-center gap-3 mb-3 sm:mb-0">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{cat.description}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {cat._count.subcategories} subcategorías · slug: {cat.slug}
                    </p>
                  </div>
                </div>

                {/* Stats en mobile: grid 3 cols */}
                <div className="grid grid-cols-3 gap-2 sm:contents text-center">
                  {/* Costo crédito */}
                  <div className="sm:col-span-2 bg-amber-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                    <p className="text-xs text-gray-400 sm:hidden">Crédito/app</p>
                    <span className="flex items-center justify-center gap-1 text-sm font-bold text-amber-700">
                      <Coins className="w-3.5 h-3.5" />
                      {cat.creditCost}
                    </span>
                  </div>

                  {/* Profesionales */}
                  <div className="sm:col-span-2 bg-blue-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                    <p className="text-xs text-gray-400 sm:hidden">Profesionales</p>
                    <span className="flex items-center justify-center gap-1 text-sm font-bold text-blue-700">
                      <Users className="w-3.5 h-3.5" />
                      {cat._count.professionals}
                    </span>
                  </div>

                  {/* Solicitudes */}
                  <div className="sm:col-span-2 bg-orange-50 rounded-lg p-2 sm:bg-transparent sm:p-0">
                    <p className="text-xs text-gray-400 sm:hidden">Solicitudes</p>
                    <span className="flex items-center justify-center gap-1 text-sm font-bold text-orange-700">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {cat._count.requests}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div className="col-span-1 flex justify-start sm:justify-center mt-3 sm:mt-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      cat.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {cat.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Las categorías se gestionan desde el código fuente (<code className="font-mono">src/constants/categorias.ts</code>) y se sincronizan con la base de datos al iniciar.
      </p>
    </div>
  )
}
