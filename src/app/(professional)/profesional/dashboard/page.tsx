import { redirect } from "next/navigation"
import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { PROFESSIONAL_STATUS_LABELS } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock, Coins, Star, Briefcase, ArrowRight, Search, Zap } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Mi panel" }

const APP_STATUS_STYLE: Record<string, string> = {
  PENDING: "badge-pending",
  ACCEPTED: "badge-completed",
  REJECTED: "badge-cancelled",
  WITHDRAWN: "badge-cancelled",
}
const APP_STATUS_LABEL: Record<string, string> = {
  PENDING: "⏳ Pendiente",
  ACCEPTED: "✓ Seleccionado",
  REJECTED: "No seleccionado",
  WITHDRAWN: "Retirada",
}

export default async function DashboardProfesionalPage() {
  const { user, profile } = await requireProfessional()

  if (profile.onboardingStep < 6) redirect("/registrarse/profesional")

  const aplicaciones = await db.serviceApplication.findMany({
    where: { professionalId: profile.id },
    include: { request: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const solicitudesDisponibles = await db.serviceRequest.findMany({
    where: {
      status: "OPEN",
      expiresAt: { gt: new Date() },
      district: { in: profile.districts },
      category: { professionals: { some: { professionalId: profile.id } } },
      NOT: { applications: { some: { professionalId: profile.id } } },
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const isPending = profile.status === "PENDING_VERIFICATION"
  const isActive = profile.status === "ACTIVE" || profile.status === "VERIFIED"
  const creditsBajos = profile.credits <= 3

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Page Header ─────────────────────────── */}
      <div className="cp-page-header">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Hola, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{PROFESSIONAL_STATUS_LABELS[profile.status]}</p>
          </div>
          <Link href="/profesional/oportunidades" className="btn-primary text-sm hidden sm:inline-flex">
            <Search className="w-4 h-4" />
            Ver oportunidades
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Banner Verificación ─────────────────── */}
        {isPending && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm">Tu cuenta está siendo verificada</p>
              <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
                El equipo de ChambaPe revisará tus documentos en hasta 24 horas. Te notificaremos por email.
              </p>
            </div>
          </div>
        )}

        {isActive && (
          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 text-sm">¡Cuenta verificada y activa!</p>
              <p className="text-emerald-600 text-xs mt-0.5">Ya puedes aplicar a solicitudes de clientes en tu zona.</p>
            </div>
          </div>
        )}

        {/* ── Créditos bajos ──────────────────────── */}
        {creditsBajos && (
          <Link
            href="/profesional/creditos"
            className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 hover:bg-orange-100 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-orange-800 text-sm">Créditos bajos — solo te quedan {profile.credits}</p>
              <p className="text-orange-600 text-xs mt-0.5">Recarga para no perderte oportunidades en tu zona</p>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}

        {/* ── Stats ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="cp-stat-card">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <p className="stat-number text-2xl text-gray-900">{profile.credits}</p>
            <p className="text-xs text-gray-400 mt-0.5">Créditos</p>
          </div>
          <div className="cp-stat-card">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="stat-number text-2xl text-gray-900">
              {profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Rating</p>
          </div>
          <div className="cp-stat-card">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
            </div>
            <p className="stat-number text-2xl text-gray-900">{profile.totalJobs}</p>
            <p className="text-xs text-gray-400 mt-0.5">Trabajos</p>
          </div>
        </div>

        {/* ── Oportunidades en tu zona ─────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Oportunidades en tu zona
            </h2>
            <Link
              href="/profesional/oportunidades"
              className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {solicitudesDisponibles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">No hay solicitudes nuevas ahora</p>
              <p className="text-xs text-gray-400">Te notificaremos cuando lleguen nuevas en tu zona.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {solicitudesDisponibles.map((s) => (
                <Link
                  key={s.id}
                  href={`/profesional/oportunidades/${s.id}`}
                  className="cp-card-link flex items-center gap-3 p-3.5"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {s.category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.district} · {s.category.name}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg shrink-0 border border-amber-100">
                    <Coins className="w-3 h-3" />
                    {s.category.creditCost}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Mis últimas aplicaciones ─────────────── */}
        {aplicaciones.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-base">Mis últimas aplicaciones</h2>
              <Link
                href="/profesional/aplicaciones"
                className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {aplicaciones.map((app) => (
                <div
                  key={app.id}
                  className="cp-card flex items-center gap-3 p-3.5"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {app.request.category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{app.request.title}</p>
                    <p className="text-xs text-gray-400">{app.request.district}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${APP_STATUS_STYLE[app.status]}`}>
                    {APP_STATUS_LABEL[app.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state primer uso ─────────────── */}
        {aplicaciones.length === 0 && isActive && (
          <div className="relative overflow-hidden rounded-2xl p-6 text-white" style={{ background: "var(--brand-gradient)" }}>
            <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white opacity-5" />
            <div className="relative">
              <p className="text-4xl mb-3">🚀</p>
              <p className="font-black text-lg mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¡Empieza a conseguir trabajo!</p>
              <p className="text-orange-100 text-sm leading-relaxed mb-4">
                Mira las solicitudes disponibles en tu zona y envía tu primera propuesta a un cliente.
              </p>
              <Link
                href="/profesional/oportunidades"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:shadow-md transition-all"
              >
                <Search className="w-4 h-4" />
                Ver oportunidades
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
