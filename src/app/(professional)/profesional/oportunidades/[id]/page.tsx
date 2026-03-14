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
  TODAY: "bg-red-50 text-red-700 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
  THIS_WEEK: "bg-orange-50 text-orange-700 border-orange-200",
  THIS_MONTH: "bg-blue-50 text-blue-700 border-blue-200",
  FLEXIBLE: "bg-gray-50 text-gray-700 border-gray-200",
}

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: "Detalle de Oportunidad — ChambaPe" }

export default async function OportunidadDetailPage({ params }: Props) {
  const { id } = await params
  const { profile } = await requireProfessional()

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/profesional/oportunidades"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-orange-500 mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver a oportunidades
        </Link>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 rotate-3">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Esta solicitud ya no está disponible</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-sm">El cliente ya contrató a alguien, la canceló o simplemente el tiempo expiró.</p>
          <Link
            href="/profesional/oportunidades"
            className="btn-primary"
          >
            Buscar otras oportunidades
          </Link>
        </div>
      </div>
    )
  }

  const yaAplie = solicitud.applications.length > 0
  const categoria = CATEGORIAS_MAP[solicitud.category.slug]
  const creditCost = categoria?.creditCost ?? 5

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link
        href="/profesional/oportunidades"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver a oportunidades
      </Link>

      {/* Category + title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />
        
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 flex items-center gap-1.5">
            <span className="text-base">{categoria?.icon ?? "🔧"}</span> {solicitud.category.name}
          </span>
          {solicitud.subcategory && (
            <span className="text-[11px] font-bold text-gray-500 border border-gray-100 px-3 py-1.5 rounded-full bg-gray-50">
              {solicitud.subcategory.name}
            </span>
          )}
          <span
            className={cn(
              "text-[11px] font-black px-3 py-1.5 rounded-full border",
              URGENCY_COLORS[solicitud.urgency] ?? "bg-gray-50 text-gray-500 border-gray-200"
            )}
          >
            {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
          {solicitud.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-400">
          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-600">
            <Users className="w-4 h-4 text-orange-500" />
            {solicitud._count.applications} propuesta{solicitud._count.applications !== 1 ? "s" : ""}
          </span>
          <span>Publicada {formatFechaRelativa(new Date(solicitud.createdAt))}</span>
        </div>
      </div>

      {/* Meta info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 border border-gray-100 hover:border-orange-100 transition-colors rounded-2xl p-4 group">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">
            <MapPin className="w-3.5 h-3.5" />
            Zona
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{solicitud.district}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 hover:border-orange-100 transition-colors rounded-2xl p-4 group">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">
            <Clock className="w-3.5 h-3.5" />
            Urgencia
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {URGENCIA_LABELS[solicitud.urgency as keyof typeof URGENCIA_LABELS] ?? solicitud.urgency}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 hover:border-orange-100 transition-colors rounded-2xl p-4 group">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">
            <Wallet className="w-3.5 h-3.5" />
            Ppto Cliente
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {(solicitud.budgetMin || solicitud.budgetMax) ? (
              solicitud.budgetMin && solicitud.budgetMax
                ? `${formatSoles(solicitud.budgetMin)} – ${formatSoles(solicitud.budgetMax)}`
                : solicitud.budgetMin
                ? `> ${formatSoles(solicitud.budgetMin)}`
                : `< ${formatSoles(solicitud.budgetMax!)}`
            ) : "A convenir"}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 hover:border-orange-100 transition-colors rounded-2xl p-4 group">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-orange-500 transition-colors">
            <Calendar className="w-3.5 h-3.5" />
            Horario
          </div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{solicitud.preferredTime || "Cualquiera"}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-100 hover:border-orange-100 transition-colors rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Lo que necesita el cliente</h2>
        <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-5">
          <p className="text-sm text-gray-700 leading-loose whitespace-pre-line italic">
            &ldquo;{solicitud.description}&rdquo;
          </p>
        </div>

        {/* Photos */}
        {solicitud.photos.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Fotos de referencia</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
              {solicitud.photos.map((url, i) => (
                <div
                  key={i}
                  className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm"
                >
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expiry */}
      {solicitud.expiresAt && (
        <p className="text-xs font-bold text-center text-gray-400">
          Esta oportunidad expirará el {formatFechaCompleta(new Date(solicitud.expiresAt))}
        </p>
      )}

      {/* Apply CTA Component */}
      <div className="sticky bottom-6 z-20">
        <AplicarButton
          solicitudId={solicitud.id}
          solicitudTitle={solicitud.title}
          categoriaSlug={solicitud.category.slug}
          creditCost={creditCost}
          currentCredits={profile.credits}
          yaAplie={yaAplie}
        />
      </div>
    </div>
  )
}
