import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  PlusCircle, ArrowRight, Users, Sparkles, Search,
  Star, CheckCircle2, TrendingUp, Lightbulb, ChevronRight,
  ClipboardList, MessageSquare,
} from "lucide-react"
import { REQUEST_STATUS_LABELS, formatFechaRelativa } from "@/lib/utils"
import { CATEGORIAS_MAP } from "@/constants/categorias"
import TutorialModal from "@/components/tutorial/TutorialModal"
import ProductTour from "@/components/tutorial/ProductTour"

export const metadata = { title: "Mi panel — ChambaPe" }

const CATEGORIAS_RAPIDAS = [
  "gasfiteria", "electricidad", "pintura", "limpieza-hogar",
  "carpinteria", "cerrajeria", "fumigacion", "mudanzas",
]

const STATUS_STYLE: Record<string, string> = {
  OPEN:        "badge-open",
  IN_PROGRESS: "badge-progress",
  COMPLETED:   "badge-completed",
  CANCELLED:   "badge-cancelled",
  EXPIRED:     "badge-cancelled",
}

const TIPS = [
  { icon: "📸", text: "Agrega fotos a tu solicitud para recibir mejores propuestas" },
  { icon: "💬", text: "Chatea con el profesional antes de aceptar su propuesta" },
  { icon: "⭐", text: "Deja una reseña al terminar — ayuda a otros clientes" },
  { icon: "🎯", text: "Especifica tu presupuesto para atraer más profesionales" },
]

export default async function DashboardClientePage() {
  const user = await requireAuth()
  if (user.role === "PROFESSIONAL") redirect("/profesional/dashboard")
  if (user.role === "ADMIN") redirect("/admin/dashboard")

  const [solicitudes, totalSolicitudes, featuredPros, unreadCount] = await Promise.all([
    db.serviceRequest.findMany({
      where: { clientId: user.id },
      include: {
        category: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.serviceRequest.count({ where: { clientId: user.id } }),
    db.professionalProfile.findMany({
      where: { status: { in: ["ACTIVE", "VERIFIED"] }, avgRating: { gt: 4 } },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        categories: { include: { category: true }, take: 1 },
      },
      orderBy: [{ avgRating: "desc" }, { totalJobs: "desc" }],
      take: 4,
    }),
    db.notification.count({
      where: { userId: user.id, read: false },
    }),
  ])

  const totalActivas     = solicitudes.filter((s) => s.status === "OPEN" || s.status === "IN_PROGRESS").length
  const totalCompletadas = solicitudes.filter((s) => s.status === "COMPLETED").length
  const porcentajeCompletadas = totalSolicitudes > 0
    ? Math.round((totalCompletadas / totalSolicitudes) * 100)
    : 0
  const firstTime = totalSolicitudes === 0
  const randomTip = TIPS[Math.floor(Date.now() / 86400000) % TIPS.length]

  return (
    <>
      <div>
        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="cp-page-header">
          <div className="max-w-7xl mx-auto flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Hola, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">¿Qué necesitas arreglar hoy?</p>
            </div>
            <Link
              href="/solicitudes/nueva"
              id="tour-nueva-solicitud"
              className="btn-primary text-sm hidden sm:inline-flex"
            >
              <PlusCircle className="w-4 h-4" />
              Publicar trabajo
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* ══════════════ MAIN COLUMN ══════════════ */}
            <div className="space-y-6 min-w-0">

              {/* ── Primer uso — banner de bienvenida ─── */}
              {firstTime && (
                <div
                  className="relative overflow-hidden rounded-2xl p-6 text-white"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white opacity-5" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                      🎉
                    </div>
                    <div>
                      <p className="font-black text-lg mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                        ¡Bienvenido a ChambaPe!
                      </p>
                      <p className="text-orange-100 text-sm leading-relaxed mb-4">
                        Publica tu primer trabajo y recibe presupuestos de técnicos verificados en minutos.
                      </p>
                      <Link
                        href="/solicitudes/nueva"
                        className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:shadow-md transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Publicar mi primer trabajo
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CTA principal (usuarios con historial) ── */}
              {!firstTime && (
                <Link
                  href="/solicitudes/nueva"
                  className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl p-5 transition-all shadow-md shadow-orange-200/50 hover:shadow-lg hover:-translate-y-0.5 group"
                >
                  <div>
                    <p className="font-black text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>
                      Publicar un nuevo trabajo
                    </p>
                    <p className="text-orange-100 text-sm mt-0.5">
                      Recibe hasta 5 presupuestos de técnicos verificados
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                </Link>
              )}

              {/* ── Buscar profesional directamente ──── */}
              <Link
                href="/profesionales"
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                  <Search className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">Buscar técnico directamente</p>
                  <p className="text-xs text-gray-400 mt-0.5">Explora el directorio, ve sus reseñas y contáctalos</p>
                </div>
                <div className="flex items-center gap-1 text-orange-500 shrink-0">
                  <Users className="w-4 h-4" />
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* ── Servicios rápidos ──────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    Servicios populares
                  </h2>
                  <span className="text-xs text-gray-400">Toca para publicar</span>
                </div>
                <div id="tour-categorias-rapidas" className="grid grid-cols-4 gap-2">
                  {CATEGORIAS_RAPIDAS.map((slug) => {
                    const cat = CATEGORIAS_MAP[slug]
                    if (!cat) return null
                    return (
                      <Link
                        key={slug}
                        href={`/solicitudes/nueva?categoria=${slug}`}
                        className="group flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 p-3 hover:border-orange-200 hover:shadow-sm hover:bg-orange-50 transition-all text-center"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="text-[11px] text-gray-600 leading-tight font-medium line-clamp-1">{cat.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* ── Mis trabajos recientes ─────────────── */}
              {solicitudes.length > 0 && (
                <div id="tour-mis-solicitudes">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-900 text-base">Mis trabajos publicados</h2>
                    <Link
                      href="/solicitudes"
                      className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
                    >
                      Ver todos <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {solicitudes.map((s) => (
                      <Link
                        key={s.id}
                        href={`/solicitudes/${s.id}`}
                        className="cp-card-link flex items-center gap-3 p-3.5"
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                          {s.category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_STYLE[s.status]}`}>
                              {REQUEST_STATUS_LABELS[s.status]}
                            </span>
                            {s._count.applications > 0 && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Users className="w-3 h-3" />
                                {s._count.applications} propuesta{s._count.applications !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[11px] text-gray-400">{formatFechaRelativa(s.createdAt)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* ══════════════ END MAIN COLUMN ══════════════ */}

            {/* ══════════════ SIDEBAR ══════════════ */}
            <div className="space-y-4 lg:sticky lg:top-24">

              {/* ── Stats ───────────────────────────── */}
              {!firstTime && (
                <div id="tour-mi-actividad" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    Mi actividad
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total publicados</span>
                      <span className="text-sm font-black text-gray-900">{totalSolicitudes}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${porcentajeCompletadas}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-orange-400 rounded-full inline-block" />
                        Activos
                      </span>
                      <span className="text-sm font-bold text-orange-600">{totalActivas}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
                        Completados
                      </span>
                      <span className="text-sm font-bold text-emerald-600">{totalCompletadas}</span>
                    </div>
                  </div>
                  <Link
                    href="/solicitudes"
                    className="mt-4 flex items-center justify-between text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                  >
                    Ver historial completo
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* ── Profesionales destacados ─────────── */}
              {featuredPros.length > 0 && (
                <div id="tour-pros-destacados" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    Técnicos top
                  </h3>
                  <div className="space-y-3">
                    {featuredPros.map((pro) => {
                      const cat = pro.categories[0]?.category
                      const initials = pro.user.name.split(" ").slice(0, 2).map((n) => n[0]).join("")
                      return (
                        <Link
                          key={pro.id}
                          href={`/profesionales/${pro.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-black shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                            {pro.avatarUrl || pro.user.avatarUrl
                              ? <img src={pro.avatarUrl ?? pro.user.avatarUrl!} alt={pro.user.name} className="w-full h-full object-cover" />
                              : initials
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                              {pro.user.name}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{cat?.name ?? "Multiservicios"}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-bold text-gray-700">{pro.avgRating.toFixed(1)}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{pro.totalJobs} trabajos</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <Link
                    href="/profesionales"
                    className="mt-4 flex items-center justify-between text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                  >
                    Ver todos los técnicos
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* ── Consejo del día ──────────────────── */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 text-base">
                    {randomTip.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3 h-3" />
                      Consejo del día
                    </p>
                    <p className="text-sm text-orange-800 leading-relaxed">{randomTip.text}</p>
                  </div>
                </div>
              </div>

              {/* ── Cómo funciona (solo primer uso) ── */}
              {firstTime && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ¿Cómo funciona?
                  </h3>
                  <div className="space-y-3">
                    {[
                      { n: "1", t: "Publica lo que necesitas", s: "Describe el trabajo en minutos" },
                      { n: "2", t: "Recibe propuestas", s: "Técnicos verificados te contactan" },
                      { n: "3", t: "Elige al mejor", s: "Compara, chatea y decide" },
                    ].map((step) => (
                      <div key={step.n} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-black text-orange-600 shrink-0 mt-0.5">
                          {step.n}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{step.t}</p>
                          <p className="text-xs text-gray-400">{step.s}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Accesos rápidos (usuarios con historial) ── */}
              {!firstTime && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Accesos rápidos</h3>
                  <div className="space-y-1">
                    {[
                      {
                        href: "/solicitudes",
                        icon: <ClipboardList className="w-4 h-4 text-orange-400" />,
                        label: "Mis trabajos publicados",
                        badge: null,
                      },
                      {
                        href: "/profesionales",
                        icon: <Users className="w-4 h-4 text-emerald-500" />,
                        label: "Directorio de técnicos",
                        badge: null,
                      },
                      {
                        href: "/notificaciones",
                        icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
                        label: "Notificaciones",
                        badge: unreadCount > 0 ? unreadCount : null,
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
              )}

            </div>
            {/* ══════════════ END SIDEBAR ══════════════ */}

          </div>
        </div>
      </div>

      {/* Tutorial de bienvenida — se abre automáticamente la primera vez */}
      <TutorialModal rol="CLIENT" userId={user.id} />
      {/* Tour guiado con driver.js — se activa con el evento chambape:start-tour */}
      <ProductTour rol="CLIENT" />
    </>
  )
}
