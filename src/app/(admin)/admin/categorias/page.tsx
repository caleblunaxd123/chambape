import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { Tag, Users, ClipboardList } from "lucide-react"
import CategoriasCRUD from "./CategoriasCRUD"

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

      {/* CRUD interactivo */}
      <CategoriasCRUD categorias={categorias} />
    </div>
  )
}
