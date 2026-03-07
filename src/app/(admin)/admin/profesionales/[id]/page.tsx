import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  ShieldCheck,
  Clock,
  XCircle,
  MapPin,
  Star,
  Briefcase,
  Coins,
  Calendar,
} from "lucide-react"
import { formatFechaCompleta, PROFESSIONAL_STATUS_LABELS } from "@/lib/utils"
import { AdminVerificacionActions } from "@/components/admin/AdminVerificacionActions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProfesionalDetailPage({ params }: Props) {
  const { id } = await params
  await requireAdmin()

  const profesional = await db.professionalProfile.findUnique({
    where: { id },
    include: {
      user: true,
      categories: { include: { category: true } },
      portfolioImages: { orderBy: { order: "asc" } },
      reviewsReceived: {
        where: { hidden: false },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: { applications: true, reviewsReceived: true },
      },
    },
  })

  if (!profesional) notFound()

  const STATUS_COLOR: Record<string, string> = {
    PENDING_VERIFICATION: "bg-amber-100 text-amber-700 border-amber-200",
    VERIFIED: "bg-blue-100 text-blue-700 border-blue-200",
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    SUSPENDED: "bg-red-100 text-red-600 border-red-200",
    REJECTED: "bg-gray-100 text-gray-500 border-gray-200",
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/profesionales"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a profesionales
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600 overflow-hidden flex-shrink-0">
              {profesional.avatarUrl ? (
                <Image
                  src={profesional.avatarUrl}
                  alt={profesional.user.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                profesional.user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profesional.user.name}</h1>
              <p className="text-sm text-gray-500">{profesional.user.email}</p>
              <p className="text-sm text-gray-500">Tel: {profesional.user.phone ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-1">DNI: {profesional.dni}</p>
            </div>
          </div>

          <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${STATUS_COLOR[profesional.status]}`}>
            {profesional.status === "PENDING_VERIFICATION" && <Clock className="w-4 h-4" />}
            {profesional.status === "ACTIVE" && <ShieldCheck className="w-4 h-4" />}
            {profesional.status === "REJECTED" && <XCircle className="w-4 h-4" />}
            {PROFESSIONAL_STATUS_LABELS[profesional.status]}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-50">
          <div className="text-center">
            <Coins className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{profesional.credits}</p>
            <p className="text-xs text-gray-400">Créditos</p>
          </div>
          <div className="text-center">
            <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              {profesional.avgRating > 0 ? profesional.avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-400">Rating</p>
          </div>
          <div className="text-center">
            <Briefcase className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{profesional.totalJobs}</p>
            <p className="text-xs text-gray-400">Trabajos</p>
          </div>
          <div className="text-center">
            <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700">
              {formatFechaCompleta(new Date(profesional.createdAt))}
            </p>
            <p className="text-xs text-gray-400">Registro</p>
          </div>
        </div>
      </div>

      {/* Info general */}
      <div className="grid grid-cols-2 gap-4">
        {/* Especialidades */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Especialidades</h2>
          {profesional.categories.length === 0 ? (
            <p className="text-sm text-gray-400">Sin especialidades</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {profesional.categories.map((c) => (
                <span key={c.categoryId} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg font-medium">
                  {c.category.icon} {c.category.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Zonas de cobertura */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            Zonas de cobertura
          </h2>
          {profesional.districts.length === 0 ? (
            <p className="text-sm text-gray-400">Sin zonas definidas</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {profesional.districts.map((d) => (
                <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {profesional.bio && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción profesional</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{profesional.bio}</p>
        </div>
      )}

      {/* Documentos de identidad */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Documentos de verificación</h2>

        {!profesional.dniFrontUrl && !profesional.dniBackUrl && !profesional.selfieDniUrl ? (
          <p className="text-sm text-gray-400">No se han subido documentos aún</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DocImage label="DNI — Anverso" url={profesional.dniFrontUrl} />
            <DocImage label="DNI — Reverso" url={profesional.dniBackUrl} />
            <DocImage label="Selfie con DNI" url={profesional.selfieDniUrl} />
          </div>
        )}
      </div>

      {/* Portfolio */}
      {profesional.portfolioImages.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Portfolio</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {profesional.portfolioImages.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={img.url} alt={img.caption ?? "Portfolio"} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones de verificación */}
      {profesional.status === "PENDING_VERIFICATION" && (
        <AdminVerificacionActions profesionalId={profesional.id} userId={profesional.userId} />
      )}

      {/* Si ya fue procesado */}
      {profesional.status === "REJECTED" && profesional.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Motivo de rechazo</p>
          <p className="text-sm text-red-600">{profesional.rejectionReason}</p>
        </div>
      )}

      {/* Reseñas recibidas */}
      {profesional.reviewsReceived.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Reseñas ({profesional._count.reviewsReceived})
          </h2>
          <div className="space-y-3">
            {profesional.reviewsReceived.map((r) => (
              <div key={r.id} className="border border-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800">{r.client.name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= r.rating ? "fill-orange-400 text-orange-400" : "text-gray-200 fill-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DocImage({ label, url }: { label: string; url: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity">
            <Image src={url} alt={label} fill className="object-cover" />
          </div>
          <p className="text-xs text-orange-500 mt-1">Abrir en tamaño completo →</p>
        </a>
      ) : (
        <div className="aspect-[4/3] rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
          <p className="text-xs text-gray-400">No subido</p>
        </div>
      )}
    </div>
  )
}
