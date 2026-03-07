import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { EditarPerfilForm } from "@/components/profesionales/EditarPerfilForm"
import { ReviewCard } from "@/components/resenas/ReviewCard"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export const metadata = { title: "Editar mi perfil — ChambaPe" }

export default async function EditarPerfilPage() {
  const { profile, user } = await requireProfessional()

  // Cargar datos completos del perfil
  const perfilCompleto = await db.professionalProfile.findUnique({
    where: { id: profile.id },
    include: {
      categories: { include: { category: true } },
      portfolioImages: { orderBy: { order: "asc" } },
      reviewsReceived: {
        where: { hidden: false },
        include: { client: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  // Todas las categorías activas para el selector
  const todasLasCategorias = await db.serviceCategory.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, icon: true },
  })

  if (!perfilCompleto) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mi perfil</h1>
        <Link
          href={`/profesionales/${profile.id}`}
          target="_blank"
          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver perfil público
        </Link>
      </div>

      {/* Formulario principal de edición */}
      <EditarPerfilForm
        profileId={profile.id}
        initialBio={perfilCompleto.bio ?? ""}
        initialAvatarUrl={perfilCompleto.avatarUrl ?? ""}
        initialDistricts={perfilCompleto.districts}
        initialCategoryIds={perfilCompleto.categories.map((c) => c.categoryId)}
        categorias={todasLasCategorias}
      />

      {/* Reseñas recibidas */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">
          Mis reseñas
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({perfilCompleto.reviewsReceived.length})
          </span>
        </h2>

        {perfilCompleto.reviewsReceived.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-400">Aún no tienes reseñas</p>
            <p className="text-xs text-gray-400 mt-1">
              Las reseñas aparecerán cuando completes trabajos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {perfilCompleto.reviewsReceived.map((r) => (
              <ReviewCard
                key={r.id}
                review={{
                  ...r,
                  client: { name: r.client.name, avatarUrl: r.client.avatarUrl },
                }}
                canReply={!r.professionalReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
