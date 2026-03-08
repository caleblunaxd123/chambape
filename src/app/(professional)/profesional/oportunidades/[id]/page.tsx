import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  formatFechaCompleta,
  formatFechaRelativa,
  formatSoles,
  URGENCIA_LABELS,
} from "@/lib/utils"
import {
  MapPin,
  Clock,
  Calendar,
  ChevronLeft,
  Wallet,
  Users,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import { AplicarButton } from "@/components/profesionales/AplicarButton"

const URGENCY_COLORS: Record<string, string> = {
  TODAY: "bg-red-100 text-red-700",
  THIS_WEEK: "bg-orange-100 text-orange-700",
  THIS_MONTH: "bg-yellow-100 text-yellow-700",
  FLEXIBLE: "bg-gray-100 text-gray-600",
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function OportunidadDetailPage({ params }: Props) {
  const { id } = await params
  const { user, profile } = await requireProfessional()

  const solicitud = await db.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      _count: { select: { applications: true } },
      applications: {
        where: { professionalId: profile.id },
        select: { id: true },
        take: 1,
      },
    },
  })

  if (!solicitud) notFound()

  // Solo mostrar solicitudes OPEN
  if (solicitud.status !== "OPEN") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/profesional/oportunidades"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Oportunidades
        </Link>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" />
          <h2 className="font-bold text-gray-900 mb-1">Esta solicitud ya no está disponible</h2>
          <p className="text-sm text-gray-500 mb-5">Fue completada, cancelada o expiró.</p>
          <Link
            href="/profesional/oportunidades"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Ver otras oportunidades
          </Link>
        </div>
      </div>
    )
  }

  const yaAplie = solicitud.applications.length > 0
  const categoria = CATEGORIAS_MAP[solicitud.category.slug]
  const creditCost = categoria?.creditCost ?? 5

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/profesional/oportunidades"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Oportunidades
      </Link>

      {/* Category + title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
            {categoria?.icon ?? "🔧"} {solicitud.category.name}
          </span>
          {solicitud.subcategory && (
            <span className="text-xs text-gray-400">{solicitud.subcategory.name}</span>
          )}
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              URGENCY_COLORS[solicitud.urgency] ?? "bg-gray-100 text-gray-500"
            )}
          >
            {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{solicitud.title}</h1>
        <p className="text-xs text-gray-400 mt-1">
          Publicada {formatFechaRelativa(new Date(solicitud.createdAt))}
          {" · "}
          <span className="flex items-center gap-1 inline-flex">
            <Users className="w-3 h-3" />
            {solicitud._count.applications} propuesta{solicitud._count.applications !== 1 ? "s" : ""} recibidas
          </span>
        </p>
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
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Descripción del trabajo</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {solicitud.description}
        </p>
      </div>

      {/* Photos */}
      {solicitud.photos.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Fotos del cliente</h2>
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

      {/* Expiry */}
      {solicitud.expiresAt && (
        <p className="text-xs text-gray-400 mb-4">
          Expira el {formatFechaCompleta(new Date(solicitud.expiresAt))}
        </p>
      )}

      {/* Apply CTA */}
      <AplicarButton
        solicitudId={solicitud.id}
        solicitudTitle={solicitud.title}
        categoriaSlug={solicitud.category.slug}
        creditCost={creditCost}
        currentCredits={profile.credits}
        yaAplie={yaAplie}
      />
    </div>
  )
}
