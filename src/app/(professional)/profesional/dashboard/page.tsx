import { redirect } from "next/navigation"
import { requireProfessional } from "@/lib/auth"
import { db } from "@/lib/db"
import { PROFESSIONAL_STATUS_LABELS, formatFechaRelativa } from "@/lib/utils"
import {
  AlertCircle, CheckCircle2, Clock, Coins, Star, Briefcase,
  ArrowRight, Search, Zap, TrendingUp, ChevronRight,
  UserCircle, MessageSquare, Wallet, BarChart3,
} from "lucide-react"
import Link from "next/link"
import TutorialModal from "@/components/tutorial/TutorialModal"

export const metadata = { title: "Mi panel — ChambaPe" }

const APP_STATUS_STYLE: Record<string, string> = {
  PENDING:   "badge-pending",
  ACCEPTED:  "badge-completed",
  REJECTED:  "badge-cancelled",
  WITHDRAWN: "badge-cancelled",
}
const APP_STATUS_LABEL: Record<string, string> = {
  PENDING:   "⏳ Pendiente",
  ACCEPTED:  "✓ Seleccionado",
  REJECTED:  "No seleccionado",
  WITHDRAWN: "Retirada",
}

export default async function DashboardProfesionalPage() {
  const { user, profile } = await requireProfessional()

  if (profile.onboardingStep < 6) redirect("/registrarse/profesional")

  const [aplicaciones, solicitudesDisponibles, totalApps, acceptedApps, earnings, unreadCount] =
    await Promise.all([
      db.serviceApplication.findMany({
        where: { professionalId: profile.id },
        include: { request: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.serviceRequest.findMany({
        where: {
          status: "OPEN",
          expiresAt: { gt: new Date() },
          district: { in: profile.districts },
          category: { professionals: { some: { professionalId: profile.id } } },
          NOT: { applications: { some: { professionalId: profile.id } } },
        },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.serviceApplication.count({ where: { professionalId: profile.id } }),
      db.serviceApplication.count({ where: { professionalId: profile.id, status: "ACCEPTED" } }),
      db.creditTransaction.aggregate({
        where: {
          professionalId: profile.id,
          type: "PURCHASE",
          amountPen: { not: null },
        },
        _sum: { amountPen: true },
      }),
      db.notification.count({
        where: { userId: user.id, read: false },
      }),
    ])

  const isPending    = profile.status === "PENDING_VERIFICATION"
  const isActive     = profile.status === "ACTIVE" || profile.status === "VERIFIED"
  const creditsBajos = profile.credits <= 3
  const successRate  = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0
  // amountPen is stored in cents
  const totalEarned  = Math.round((earnings._sum.amountPen ?? 0) / 100)
  // Credits bar: show relative to a reference of 20 credits
  const creditsRef   = Math.max(profile.credits, 20)
  const creditsPct   = Math.min(100, Math.round((profile.credits / creditsRef) * 100))
  const creditsColor = profile.credits <= 3 ? "bg-red-400" : profile.credits <= 8 ? "bg-amber-400" : "bg-emerald-400"

  return (
    <>
    <div>
      {/* ── Page Header — full width ─────────────────────────── */}
      <div className="cp-page-header">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
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

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ══════════════ MAIN COLUMN ══════════════ */}
          <div className="space-y-5 min-w-0">

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
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400">{s.district}</p>
                          <span className="text-gray-200">·</span>
                          <p className="text-xs text-gray-400">{s.category.name}</p>
                          <span className="text-gray-200">·</span>
                          <p className="text-xs text-gray-400">{formatFechaRelativa(s.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1.5 rounded-xl shrink-0 border border-amber-100">
                        <Coins className="w-3 h-3" />
                        {s.category.creditCost}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ── Mis últimas aplicaciones ─────────────── */}
            {aplicaciones.length > 0 ? (
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
                    <div key={app.id} className="cp-card flex items-center gap-3 p-3.5">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                        {app.request.category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{app.request.title}</p>
                        <p className="text-xs text-gray-400">{app.request.district} · {formatFechaRelativa(app.createdAt)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${APP_STATUS_STYLE[app.status]}`}>
                        {APP_STATUS_LABEL[app.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : isActive ? (
              <div className="relative overflow-hidden rounded-2xl p-6 text-white" style={{ background: "var(--brand-gradient)" }}>
                <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white opacity-5" />
                <div className="relative">
                  <p className="text-4xl mb-3">🚀</p>
                  <p className="font-black text-lg mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¡Empieza a conseguir trabajo!</p>
                  <p className="text-orange-100 text-sm leading-relaxed mb-4">
                    Mira las solicitudes disponibles en tu zona y envía tu primera propuesta.
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
            ) : null}

          </div>
          {/* ══════════════ END MAIN ══════════════ */}

          {/* ══════════════ SIDEBAR ══════════════ */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* ── Créditos ───────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Mis créditos
                </h3>
                <Link
                  href="/profesional/creditos"
                  className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                >
                  Recargar
                </Link>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <p className="text-4xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {profile.credits}
                </p>
                <p className="text-sm text-gray-400 mb-1">créditos disponibles</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${creditsColor}`}
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              {creditsBajos && (
                <p className="text-xs text-red-500 font-semibold mt-2">⚠ Créditos bajos — recarga para no perder oportunidades</p>
              )}
            </div>

            {/* ── Rendimiento ────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Mi rendimiento
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">Calificación</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    {profile.avgRating > 0 ? `${profile.avgRating.toFixed(1)} / 5.0` : "Sin reseñas"}
                  </span>
                </div>
                {profile.avgRating > 0 && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`flex-1 h-1.5 rounded-full ${n <= Math.round(profile.avgRating) ? "bg-yellow-400" : "bg-gray-100"}`}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Trabajos completados</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">{profile.totalJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">Tasa de éxito</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600">
                    {totalApps > 0 ? `${successRate}%` : "—"}
                  </span>
                </div>
                {totalEarned > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Invertido en créditos</span>
                    </div>
                    <span className="text-sm font-black text-orange-600">S/ {totalEarned}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Accesos rápidos ──────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Accesos rápidos</h3>
              <div className="space-y-1">
                {[
                  {
                    href: "/mensajes",
                    icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
                    label: "Mis mensajes",
                    badge: unreadCount > 0 ? unreadCount : null,
                  },
                  {
                    href: "/profesional/aplicaciones",
                    icon: <Briefcase className="w-4 h-4 text-orange-400" />,
                    label: "Mis aplicaciones",
                    badge: totalApps > 0 ? null : null,
                  },
                  {
                    href: "/profesional/perfil/editar",
                    icon: <UserCircle className="w-4 h-4 text-orange-500" />,
                    label: "Editar mi perfil",
                    badge: null,
                  },
                  {
                    href: "/profesional/creditos",
                    icon: <Coins className="w-4 h-4 text-amber-500" />,
                    label: "Recargar créditos",
                    badge: null,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
          {/* ══════════════ END SIDEBAR ══════════════ */}

        </div>
      </div>
    </div> /* max-w-7xl */

    {/* Tutorial de bienvenida — se abre automáticamente la primera vez */}
    <TutorialModal rol="PROFESSIONAL" userId={user.id} />
    </>
  )
}
