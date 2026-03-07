import { redirect } from "next/navigation"
import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock, Coins, Star, Briefcase } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Mi panel" }

export default async function DashboardProfesionalPage() {
  const { user, profile } = await requireProfessional()

  // Onboarding incompleto → redirigir
  if (profile.onboardingStep < 6) {
    redirect("/registrarse/profesional")
  }

  // Últimas 5 aplicaciones
  const aplicaciones = await db.serviceApplication.findMany({
    where: { professionalId: profile.id },
    include: { request: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Solicitudes disponibles en zona del profesional (max 3 para preview)
  const solicitudesDisponibles = await db.serviceRequest.findMany({
    where: {
      status: "OPEN",
      expiresAt: { gt: new Date() },
      district: { in: profile.districts },
      category: { professionals: { some: { professionalId: profile.id } } },
      NOT: {
        applications: { some: { professionalId: profile.id } },
      },
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const isPendingVerification = profile.status === "PENDING_VERIFICATION"

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Banner de estado de verificación */}
      {isPendingVerification && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">Tu cuenta está siendo verificada</p>
            <p className="text-amber-600 mt-0.5">
              El equipo de ChambaPe revisará tus documentos en 24 horas. Te notificaremos por email.
            </p>
          </div>
        </div>
      )}

      {profile.status === "ACTIVE" && (
        <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-green-800">¡Cuenta verificada!</p>
            <p className="text-green-600 mt-0.5">
              Ya puedes aplicar a solicitudes de clientes en tu zona.
            </p>
          </div>
        </div>
      )}

      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {PROFESSIONAL_STATUS_LABELS[profile.status]}
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <Coins className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{profile.credits}</p>
          <p className="text-xs text-gray-400">Créditos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-400">Rating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
          <Briefcase className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{profile.totalJobs}</p>
          <p className="text-xs text-gray-400">Trabajos</p>
        </div>
      </div>

      {/* CTA créditos bajos */}
      {profile.credits <= 3 && (
        <Link
          href="/profesional/creditos"
          className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-4 hover:bg-orange-100 transition-colors"
        >
          <div className="flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">
              Créditos bajos — recarga para no perderte oportunidades
            </span>
          </div>
          <span className="text-orange-500 text-sm font-semibold">→</span>
        </Link>
      )}

      {/* Solicitudes disponibles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Oportunidades en tu zona</h2>
          <Link href="/profesional/oportunidades" className="text-xs text-orange-500 font-medium">
            Ver todas →
          </Link>
        </div>

        {solicitudesDisponibles.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-400">
            No hay solicitudes nuevas en tu zona por ahora.
            <br />
            <span className="text-xs mt-1 block">Te avisaremos cuando lleguen.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {solicitudesDisponibles.map((s) => (
              <Link
                key={s.id}
                href={`/profesional/oportunidades/${s.id}`}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.category.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.district} · {s.category.name}</p>
                  </div>
                </div>
                <span className="text-xs text-orange-500 font-semibold shrink-0 ml-2">
                  {s.category.creditCost} créditos
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mis últimas aplicaciones */}
      {aplicaciones.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Mis últimas aplicaciones</h2>
            <Link href="/profesional/aplicaciones" className="text-xs text-orange-500 font-medium">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {aplicaciones.map((app) => {
              const statusColor: Record<string, string> = {
                PENDING: "text-yellow-600 bg-yellow-50",
                ACCEPTED: "text-green-600 bg-green-50",
                REJECTED: "text-gray-500 bg-gray-50",
                WITHDRAWN: "text-gray-400 bg-gray-50",
              }
              const statusLabel: Record<string, string> = {
                PENDING: "Pendiente",
                ACCEPTED: "Seleccionado ✓",
                REJECTED: "No seleccionado",
                WITHDRAWN: "Retirada",
              }

              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{app.request.category.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {app.request.title}
                      </p>
                      <p className="text-xs text-gray-400">{app.request.district}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[app.status]}`}>
                    {statusLabel[app.status]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
