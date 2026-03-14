import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  formatFechaCompleta,
  formatSoles,
  URGENCIA_LABELS,
  REQUEST_STATUS_LABELS,
} from "@/lib/utils"
import {
  MapPin,
  Clock,
  Calendar,
  ChevronLeft,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SolicitudDetailClient } from "@/components/solicitudes/SolicitudDetailClient"
import { PhotoGallery } from "@/components/ui/PhotoGallery"

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  EXPIRED: "bg-amber-100 text-amber-800 border-amber-200",
}

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: "Detalle de Solicitud — ChambaPe" }

export default async function SolicitudDetailPage({ params }: Props) {
  const { id } = await params
  const user = await requireAuth()

  const solicitud = await db.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      review: { select: { id: true } },
      applications: {
        include: {
          professional: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
              portfolioImages: { take: 3 },
            },
          },
        },
        orderBy: [
          { status: "asc" }, // ACCEPTED first (alphabetically before PENDING)
          { createdAt: "desc" },
        ],
      },
      _count: { select: { applications: true } },
    },
  })

  if (!solicitud) notFound()

  // Solo el dueño puede ver esta página
  if (solicitud.clientId !== user.id) redirect("/solicitudes")

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link
        href="/solicitudes"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver a mis solicitudes
      </Link>

      {/* Title + status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decorative corner blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-[40px] opacity-60 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                {solicitud.category.name}
              </span>
              {solicitud.subcategory && (
                <span className="text-xs font-bold text-gray-400 border border-gray-100 px-3 py-1 rounded-full">{solicitud.subcategory.name}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              {solicitud.title}
            </h1>
          </div>
          <span
            className={cn(
              "text-xs font-black px-4 py-1.5 rounded-full flex-shrink-0 border self-start",
              STATUS_COLORS[solicitud.status] ?? "bg-gray-100 text-gray-500 border-gray-200"
            )}
          >
            {REQUEST_STATUS_LABELS[solicitud.status as keyof typeof REQUEST_STATUS_LABELS] ?? solicitud.status}
          </span>
        </div>

        {/* Dates */}
        <p className="text-xs font-medium text-gray-400 mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-x-2">
          <span>Publicada el {formatFechaCompleta(new Date(solicitud.createdAt))}</span>
          {solicitud.expiresAt && (
            <span className="text-gray-300">· Expira el {formatFechaCompleta(new Date(solicitud.expiresAt))}</span>
          )}
        </p>
      </div>

      {/* Meta info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Distrito
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{solicitud.district}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            Urgencia
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Presupuesto
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {(solicitud.budgetMin || solicitud.budgetMax) ? (
              solicitud.budgetMin && solicitud.budgetMax
                ? `${formatSoles(solicitud.budgetMin)} – ${formatSoles(solicitud.budgetMax)}`
                : solicitud.budgetMin
                ? `Desde ${formatSoles(solicitud.budgetMin)}`
                : `Hasta ${formatSoles(solicitud.budgetMax!)}`
            ) : "A convenir"}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Horario
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{solicitud.preferredTime || "Cualquier hora"}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-100 hover:border-orange-100 transition-colors rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Detalles del problema</h2>
        <p className="text-sm text-gray-600 leading-loose whitespace-pre-line">
          {solicitud.description}
        </p>

        {/* Photos — con lightbox expandible */}
        {solicitud.photos.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <PhotoGallery photos={solicitud.photos} label="Fotos adjuntas" />
          </div>
        )}
      </div>

      {/* Proposals section — client component for interactivity */}
      <div className="mt-10">
        <h2 className="text-xl font-black text-gray-900 mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>Propuestas recibidas</h2>
        <SolicitudDetailClient
          solicitudId={id}
          solicitudStatus={solicitud.status}
          aplicaciones={solicitud.applications}
          totalAplicaciones={solicitud._count.applications}
          existingReview={!!solicitud.review}
        />
      </div>
    </div>
  )
}
