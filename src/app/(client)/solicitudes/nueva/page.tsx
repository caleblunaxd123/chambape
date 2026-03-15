import { SolicitudForm } from "@/components/solicitudes/SolicitudForm"
import { db } from "@/lib/db"
import { getInitials } from "@/lib/utils"
import Image from "next/image"
import { UserCheck } from "lucide-react"

export const metadata = { title: "Nueva solicitud" }

export default async function NuevaSolicitudPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; proId?: string }>
}) {
  const { categoria, proId } = await searchParams

  // Si hay proId, cargar datos del profesional destino
  let targetPro: { id: string; avatarUrl: string | null; user: { name: string }; categories: { category: { name: string } }[] } | null = null
  if (proId) {
    targetPro = await db.professionalProfile.findUnique({
      where: { id: proId, status: { in: ["ACTIVE", "VERIFIED"] } },
      select: {
        id: true,
        avatarUrl: true,
        user: { select: { name: true } },
        categories: { include: { category: { select: { name: true } } }, take: 2 },
      },
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      {/* Banner profesional destino */}
      {targetPro && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-100 flex-shrink-0">
            {targetPro.avatarUrl ? (
              <Image src={targetPro.avatarUrl} alt={targetPro.user.name} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-sm">
                {getInitials(targetPro.user.name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <UserCheck className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Solicitud directa a</span>
            </div>
            <p className="font-bold text-gray-900 text-sm">{targetPro.user.name}</p>
            {targetPro.categories.length > 0 && (
              <p className="text-xs text-gray-500">{targetPro.categories.map(c => c.category.name).join(" · ")}</p>
            )}
          </div>
          <span className="text-xs bg-orange-500 text-white font-bold px-2.5 py-1 rounded-full flex-shrink-0">Gratis</span>
        </div>
      )}

      <SolicitudForm defaultCategoria={categoria} targetProfessionalId={targetPro?.id} />
    </div>
  )
}
