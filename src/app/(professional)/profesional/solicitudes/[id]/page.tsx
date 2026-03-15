import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { requireProfessional } from "@/lib/auth"
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  ImageOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { PhotoGallery } from "@/components/ui/PhotoGallery"

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
  EXPIRED: "bg-yellow-100 text-yellow-700",
}

const APP_STATUS: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING: {
    label: "Esperando respuesta",
    icon: <AlertCircle className="w-4 h-4" />,
    className: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  ACCEPTED: {
    label: "¡Fuiste seleccionado!",
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: "bg-green-50 border-green-200 text-green-700",
  },
  REJECTED: {
    label: "No seleccionado",
    icon: <XCircle className="w-4 h-4" />,
    className: "bg-gray-50 border-gray-200 text-gray-500",
  },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SolicitudProfesionalPage({ params }: Props) {
  const { id } = await params
  const { user, profile } = await requireProfessional()

  const solicitud = await db.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      client: { select: { name: true, email: true } },
      applications: {
        where: { professionalId: profile.id },
        take: 1,
      },
    },
  })

  if (!solicitud) notFound()

  // Solo puede ver si aplicó a esta solicitud
  const miAplicacion = solicitud.applications[0]
  if (!miAplicacion) redirect("/profesional/aplicaciones")

  const appStatus = APP_STATUS[miAplicacion.status] ?? APP_STATUS["PENDING"]
  const isAccepted = miAplicacion.status === "ACCEPTED"

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/profesional/aplicaciones"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Mis aplicaciones
      </Link>

      {/* Tu aplicación — estado destacado */}
      <div className={cn("flex items-center gap-3 border rounded-xl px-4 py-3 mb-5", appStatus.className)}>
        {appStatus.icon}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{appStatus.label}</p>
          {isAccepted && (
            <p className="text-xs mt-0.5 opacity-80">
              El cliente te eligió. Contáctalo para coordinar.
            </p>
          )}
          {miAplicacion.status === "REJECTED" && (
            <p className="text-xs mt-0.5 opacity-70">
              El cliente eligió a otro profesional para este trabajo.
            </p>
          )}
        </div>
        <span className="text-xs opacity-70 shrink-0">
          {miAplicacion.creditsSpent} cr. gastados
        </span>
      </div>

      {/* Contacto del cliente (solo si fue aceptado) */}
      {isAccepted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-green-800 mb-2">Datos de contacto del cliente</p>
          <p className="text-sm font-semibold text-green-900">{solicitud.client.name}</p>
          <a
            href={`mailto:${solicitud.client.email}`}
            className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 mt-1 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            {solicitud.client.email}
          </a>
        </div>
      )}

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
              Presupuesto del cliente
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
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción del cliente</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {solicitud.description}
        </p>
      </div>

      {/* Photos */}
      {solicitud.photos.length > 0 && (
        <div className="mb-6">
          <PhotoGallery photos={solicitud.photos} label="Fotos adjuntas" />
        </div>
      )}

      {/* Mi propuesta */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Tu propuesta enviada</h2>
        <p className="text-sm text-gray-600 italic leading-relaxed">
          &ldquo;{miAplicacion.message}&rdquo;
        </p>
        {miAplicacion.proposedBudget && (
          <p className="text-sm font-semibold text-gray-800 mt-2">
            Presupuesto ofrecido: {formatSoles(miAplicacion.proposedBudget)}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Enviada el {formatFechaCompleta(new Date(miAplicacion.createdAt))}
        </p>
      </div>

      {/* Dates */}
      <p className="text-xs text-gray-400">
        Solicitud publicada el {formatFechaCompleta(new Date(solicitud.createdAt))}
        {solicitud.expiresAt && (
          <> · Expira el {formatFechaCompleta(new Date(solicitud.expiresAt))}</>
        )}
      </p>
    </div>
  )
}
