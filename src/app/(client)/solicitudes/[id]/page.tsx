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
  ImageOff,
  Users,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SolicitudDetailClient } from "@/components/solicitudes/SolicitudDetailClient"

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
  EXPIRED: "bg-yellow-100 text-yellow-700",
}

interface Props {
  params: { id: string }
}

export default async function SolicitudDetailPage({ params }: Props) {
  const user = await requireAuth()

  const solicitud = await db.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      subcategory: true,
      applications: {
        include: {
          professional: {
            include: {
              user: { select: { name: true, email: true } },
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/solicitudes"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Mis solicitudes
      </Link>

      {/* Title + status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {solicitud.category.name}
            </span>
            {solicitud.subcategory && (
              <span className="text-xs text-gray-400">{solicitud.subcategory.name}</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{solicitud.title}</h1>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-3 py-1 rounded-full flex-shrink-0",
            STATUS_COLORS[solicitud.status] ?? "bg-gray-100 text-gray-500"
          )}
        >
          {REQUEST_STATUS_LABELS[solicitud.status as keyof typeof REQUEST_STATUS_LABELS] ?? solicitud.status}
        </span>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <MapPin className="w-3 h-3" />
            Distrito
          </div>
          <p className="text-sm font-medium text-gray-800">{solicitud.district}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Clock className="w-3 h-3" />
            Urgencia
          </div>
          <p className="text-sm font-medium text-gray-800">
            {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
          </p>
        </div>
        {(solicitud.budgetMin || solicitud.budgetMax) && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <Wallet className="w-3 h-3" />
              Presupuesto
            </div>
            <p className="text-sm font-medium text-gray-800">
              {solicitud.budgetMin && solicitud.budgetMax
                ? `${formatSoles(solicitud.budgetMin)} – ${formatSoles(solicitud.budgetMax)}`
                : solicitud.budgetMin
                ? `Desde ${formatSoles(solicitud.budgetMin)}`
                : `Hasta ${formatSoles(solicitud.budgetMax!)}`}
            </p>
          </div>
        )}
        {solicitud.preferredTime && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <Calendar className="w-3 h-3" />
              Horario preferido
            </div>
            <p className="text-sm font-medium text-gray-800">{solicitud.preferredTime}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {solicitud.description}
        </p>
      </div>

      {/* Photos */}
      {solicitud.photos.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Fotos adjuntas</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {solicitud.photos.map((url, i) => (
              <div
                key={i}
                className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100"
              >
                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <p className="text-xs text-gray-400 mb-6">
        Publicada el {formatFechaCompleta(new Date(solicitud.createdAt))}
        {solicitud.expiresAt && (
          <> · Expira el {formatFechaCompleta(new Date(solicitud.expiresAt))}</>
        )}
      </p>

      {/* Proposals section — client component for interactivity */}
      <SolicitudDetailClient
        solicitudId={params.id}
        solicitudStatus={solicitud.status}
        aplicaciones={solicitud.applications}
        totalAplicaciones={solicitud._count.applications}
      />
    </div>
  )
}
