import Link from "next/link"
import { ArrowRight, CheckCircle2, Shield, Zap, Star, Wrench, TrendingUp, MapPin } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { HowItWorks } from "@/components/landing/HowItWorks"

const STATS = [
  { value: "500+", label: "Profesionales verificados", icon: Shield },
  { value: "2,000+", label: "Servicios completados", icon: TrendingUp },
  { value: "44", label: "Distritos de Lima", icon: MapPin },
  { value: "4.8★", label: "Valoración promedio", icon: Star },
]

const BENEFITS = [
  {
    icon: "🛡️",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    title: "Profesionales verificados",
    desc: "Revisamos el DNI y antecedentes de cada profesional antes de que pueda atender solicitudes. Tu seguridad primero.",
  },
  {
    icon: "⚡",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    title: "Propuestas en minutos",
    desc: "Publica tu solicitud y recibe cotizaciones de profesionales de tu zona en minutos. No días, minutos.",
  },
  {
    icon: "💸",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    title: "Sin costos ocultos",
    desc: "El cliente no paga comisiones. Coordinas directo con el profesional y pagas solo por el trabajo realizado.",
  },
]

const TESTIMONIOS = [
  {
    nombre: "María C.",
    distrito: "Miraflores",
    texto: "En menos de una hora tenía 3 propuestas para arreglar mi cocina. Al final pagué menos de lo esperado y el trabajo quedó perfecto.",
    servicio: "Gasfitería",
    iniciales: "MC",
    color: "from-pink-400 to-rose-500",
  },
  {
    nombre: "Rodrigo V.",
    distrito: "San Isidro",
    texto: "Como electricista, ChambaPe me ha conseguido más clientes en 2 meses de lo que conseguía en 6 meses por recomendación.",
    servicio: "Electricista",
    iniciales: "RV",
    color: "from-blue-400 to-indigo-500",
  },
  {
    nombre: "Ana L.",
    distrito: "Surco",
    texto: "Muy fácil de usar. Describí lo que necesitaba, el pintor llegó puntual y el resultado fue excelente. ¡Lo recomiendo totalmente!",
    servicio: "Pintura",
    iniciales: "AL",
    color: "from-violet-400 to-purple-500",
  },
]

const CATEGORIAS_DESTACADAS: { slug: string; color: string; bg: string; iconBg: string }[] = [
  { slug: "gasfiteria",    color: "text-blue-700",   bg: "bg-blue-50 hover:bg-blue-100 border-blue-100",     iconBg: "bg-blue-100" },
  { slug: "electricidad",  color: "text-yellow-700", bg: "bg-yellow-50 hover:bg-yellow-100 border-yellow-100", iconBg: "bg-yellow-100" },
  { slug: "pintura",       color: "text-rose-700",   bg: "bg-rose-50 hover:bg-rose-100 border-rose-100",      iconBg: "bg-rose-100" },
  { slug: "limpieza-hogar",color: "text-teal-700",   bg: "bg-teal-50 hover:bg-teal-100 border-teal-100",      iconBg: "bg-teal-100" },
  { slug: "carpinteria",   color: "text-amber-700",  bg: "bg-amber-50 hover:bg-amber-100 border-amber-100",   iconBg: "bg-amber-100" },
  { slug: "cerrajeria",    color: "text-slate-700",  bg: "bg-slate-50 hover:bg-slate-100 border-slate-100",   iconBg: "bg-slate-200" },
  { slug: "fumigacion",    color: "text-green-700",  bg: "bg-green-50 hover:bg-green-100 border-green-100",   iconBg: "bg-green-100" },
  { slug: "mudanzas",      color: "text-orange-700", bg: "bg-orange-50 hover:bg-orange-100 border-orange-100",iconBg: "bg-orange-100" },
]

export default function LandingPage() {
  const catDestacadas = CATEGORIAS_DESTACADAS.map((meta) => ({
    ...meta,
    ...(CATEGORIAS.find((c) => c.slug === meta.slug) ?? { slug: meta.slug, name: meta.slug, icon: "🔧", description: "" }),
  }))

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff7ed] via-white to-[#fef9f0]" />
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #fb923c, #fbbf24)" }} />
        <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #f97316, #f59e0b)" }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #f97316 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12 md:gap-8">
          {/* Left: copy */}
          <div className="flex-1 max-w-xl animate-fade-up">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Más de 500 profesionales activos en Lima
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 leading-[1.05] mb-5 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              El técnico que{" "}
              <span className="relative inline-block text-orange-500">
                necesitas
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 6 Q50 1 100 5 Q150 9 200 3"
                    stroke="#fed7aa"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              ,<br />
              cuando lo necesitas
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Gasfiteros, electricistas, pintores y más. Profesionales verificados
              en Lima listos para ayudarte.{" "}
              <span className="font-semibold text-gray-700">Presupuestos gratis en minutos.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/solicitudes/nueva"
                className="inline-flex items-center justify-center gap-2.5 text-white font-bold px-7 py-4 rounded-2xl transition-all text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: "var(--brand-gradient)" }}
              >
                <Wrench className="w-5 h-5" />
                Necesito un servicio
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/registrarse"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-bold px-7 py-4 rounded-2xl transition-all text-base"
              >
                Soy profesional →
              </Link>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-4 mt-7">
              {["Gratis para clientes", "Sin tarjeta de crédito", "Profesionales verificados"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: floating UI cards */}
          <div className="hidden md:flex flex-col gap-3 flex-1 items-end relative animate-fade-up delay-200">
            {/* Notification badge */}
            <div className="absolute -top-2 right-8 z-10 flex items-center gap-1.5 bg-white border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              3 propuestas nuevas 🎉
            </div>

            {/* Card 1 — Proposal */}
            <div className="w-[300px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                  CM
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Carlos M. — Gasfitero</p>
                  <p className="text-xs text-gray-400">Disponible hoy · Miraflores</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">5.0 (34 reseñas)</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-xs text-orange-700 leading-relaxed">
                  💬 &ldquo;Puedo atenderte hoy por la tarde. Presupuesto estimado: <strong>S/.80</strong> incluye materiales.&rdquo;
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                  ✓ Elegir
                </button>
                <button className="flex-1 border border-gray-200 text-gray-500 text-xs font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Ver más
                </button>
              </div>
            </div>

            {/* Card 2 — Another pro */}
            <div className="w-[260px] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
                  JR
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Juan R. — Electricista</p>
                  <p className="text-xs text-gray-400">Disponible mañana · San Isidro</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">4.9 (87)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 — Completed */}
            <div className="w-[250px] bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm shrink-0">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800">Trabajo completado</p>
                <p className="text-xs text-emerald-600">María C. dejó 5 ★ a Carlos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CATEGORÍAS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white" id="categorias">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">Servicios disponibles</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
              ¿Qué servicio necesitas?
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Encuentra el profesional ideal para cualquier trabajo en tu hogar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {catDestacadas.map((cat) => (
              <Link
                key={cat.slug}
                href={`/solicitudes/nueva?categoria=${cat.slug}`}
                className={`group border rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cat.bg}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${cat.iconBg}`}>
                  {cat.icon}
                </div>
                <p className={`text-sm font-bold leading-tight ${cat.color}`}>
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/solicitudes/nueva"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-all hover:gap-3"
            >
              Ver todos los {CATEGORIAS.length} servicios
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <Link
              href="/profesionales"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-all hover:gap-3"
            >
              Explorar profesionales verificados
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BUSCAR PROFESIONALES DIRECTAMENTE
      ════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-[#1e1b4b] to-[#2d2a6e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-orange-500/30">
              ¿Ya sabes quién quieres?
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Busca y contacta<br />
              <span className="text-orange-400">profesionales directamente</span>
            </h2>
            <p className="text-indigo-200 text-base mb-6 max-w-md">
              Explora perfiles, lee reseñas reales, compara especialidades y elige el profesional que más te convenza — sin intermediarios.
            </p>
            <Link
              href="/profesionales"
              className="inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Ver todos los profesionales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Mini cards decorativas */}
          <div className="flex-1 hidden md:flex flex-col gap-3 items-end">
            {[
              { name: "Carlos M.", cat: "Gasfitero", rating: "5.0", jobs: 87, emoji: "🥇", grad: "from-blue-400 to-blue-600" },
              { name: "Ana R.", cat: "Pintora", rating: "4.9", jobs: 52, emoji: "🥈", grad: "from-rose-400 to-pink-500" },
              { name: "Juan V.", cat: "Electricista", rating: "5.0", jobs: 123, emoji: "💎", grad: "from-violet-400 to-indigo-500" },
            ].map((p) => (
              <div key={p.name} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 w-64">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{p.name} <span className="text-white/60 font-normal text-xs">· {p.cat}</span></p>
                  <p className="text-white/70 text-xs">⭐ {p.rating} · {p.jobs} trabajos {p.emoji}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CÓMO FUNCIONA
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#f8f7f5]" id="como-funciona">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">Simple y rápido</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
              ¿Cómo funciona ChambaPe?
            </h2>
            <p className="text-gray-500 text-base">Desde tu solicitud hasta el trabajo terminado, en 4 pasos</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* ════════════════════════════════════════
          ESTADÍSTICAS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--brand-gradient)" }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {STATS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="stat-number text-4xl md:text-5xl text-white mb-1">{s.value}</p>
                  <p className="text-sm text-orange-100 leading-snug">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BENEFICIOS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">¿Por qué ChambaPe?</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
              La forma más fácil de encontrar
              <br className="hidden sm:block" /> profesionales de confianza
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="group relative bg-white border border-gray-100 hover:border-orange-100 rounded-2xl p-6 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(249,115,22,0.1)] overflow-hidden"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${b.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className={`w-14 h-14 ${b.bg} rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-5 group-hover:scale-105 transition-transform duration-200`}>
                  {b.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIOS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#f8f7f5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">Testimonios reales</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-gray-500 text-base">Miles de limeños ya encontraron su profesional en ChambaPe</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIOS.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 flex flex-col"
              >
                {/* Quote mark */}
                <div className="text-5xl text-orange-100 font-black leading-none mb-2" style={{ fontFamily: "Georgia, serif" }}>&ldquo;</div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">
                  {t.texto}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.iniciales}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.nombre}</p>
                    <p className="text-xs text-gray-400">{t.distrito} · {t.servicio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA DUAL — Cliente + Profesional
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CTA Cliente */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white" style={{ background: "var(--brand-gradient)" }}>
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-5" />
              <div className="absolute bottom-0 left-12 w-24 h-24 rounded-full bg-white opacity-5" />
              <div className="relative">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¿Necesitas un servicio?</h3>
                <p className="text-orange-100 text-sm leading-relaxed mb-6">
                  Publica tu solicitud en 2 minutos y recibe presupuestos de profesionales verificados en tu zona. Completamente gratis.
                </p>
                <Link
                  href="/solicitudes/nueva"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Publicar solicitud gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex flex-wrap gap-3 mt-5">
                  {["Sin registro obligatorio", "100% gratuito", "Resultado en minutos"].map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-orange-100">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Profesional */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-[#0f172a] text-white">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-orange-500 opacity-5" />
              <div className="absolute bottom-0 left-12 w-24 h-24 rounded-full bg-orange-500 opacity-5" />
              <div className="relative">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¿Tienes un oficio?</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Llega a miles de limeños que buscan exactamente lo que ofreces. Regístrate gratis, verifica tu perfil y empieza hoy.
                </p>
                <Link
                  href="/registrarse"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 text-white"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  Registrarme como profesional
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex flex-wrap gap-3 mt-5">
                  {["Registro gratuito", "Tú pones el precio", "Alertas en tu zona"].map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-orange-500" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-[#0a0f1e] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: "var(--brand-gradient)" }}>
                  <Wrench className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="brand-name text-xl text-white">
                  Chamba<span className="text-orange-400">Pe</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Conectamos a limeños con profesionales del hogar verificados y de confianza.
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                🇵🇪 <span>Lima, Perú</span>
              </p>
            </div>

            {/* Para clientes */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Para clientes</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Publicar solicitud", href: "/solicitudes/nueva" },
                  { label: "Cómo funciona", href: "/#como-funciona" },
                  { label: "Categorías", href: "/#categorias" },
                  { label: "Mis solicitudes", href: "/solicitudes" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Para profesionales */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Para profesionales</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Registrarme", href: "/registrarse" },
                  { label: "Panel de trabajo", href: "/profesional/dashboard" },
                  { label: "Oportunidades", href: "/profesional/oportunidades" },
                  { label: "Mis créditos", href: "/profesional/creditos" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Iniciar sesión", href: "/iniciar-sesion" },
                  { label: "Términos de uso", href: "/terminos" },
                  { label: "Privacidad", href: "/privacidad" },
                  { label: "Contacto", href: "/contacto" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-orange-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} ChambaPe. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-600">Hecho con ❤️ en Lima, Perú</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
