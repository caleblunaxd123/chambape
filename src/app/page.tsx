import Link from "next/link"
import { ArrowRight, CheckCircle2, Shield, Zap, Star, Wrench, TrendingUp, MapPin } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { HowItWorks } from "@/components/landing/HowItWorks"

const STATS = [
  { value: "500+", label: "Expertos verificados", icon: Shield },
  { value: "2,000+", label: "Servicios completados", icon: TrendingUp },
  { value: "44", label: "Distritos de Lima", icon: MapPin },
  { value: "4.8★", label: "Valoración promedio", icon: Star },
]

const BENEFITS = [
  {
    icon: "🛡️",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    title: "Expertos verificados",
    desc: "Revisamos el DNI y antecedentes de cada experto antes de que pueda atender solicitudes. Tu seguridad primero.",
  },
  {
    icon: "⚡",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    title: "Propuestas en minutos",
    desc: "Publica tu solicitud y recibe cotizaciones de expertos de tu zona en minutos. No días, minutos.",
  },
  {
    icon: "💸",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    title: "Sin costos ocultos",
    desc: "El cliente no paga comisiones. Coordinas directo con el experto y pagas solo por el trabajo realizado.",
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
    color: "from-blue-400 to-blue-600",
  },
  {
    nombre: "Ana L.",
    distrito: "Surco",
    texto: "Muy fácil de usar. Describí lo que necesitaba, el pintor llegó puntual y el resultado fue excelente. ¡Lo recomiendo totalmente!",
    servicio: "Pintura",
    iniciales: "AL",
    color: "from-orange-400 to-amber-500",
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
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden bg-white noise-bg">
        {/* Background Mesh Gradients - Much more vibrant now */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-orange-400/30 rounded-full blur-[130px] animate-pulse-glow mix-blend-soft-light pointer-events-none" />
        <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] bg-amber-300/20 rounded-full blur-[110px] mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-amber-200/40 rounded-full blur-[140px] mix-blend-soft-light pointer-events-none" />
        <div className="absolute top-[10%] left-[30%] w-[400px] h-[400px] bg-orange-300/15 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12 md:gap-8 z-10">
          {/* Left: copy */}
          <div className="flex-1 max-w-xl animate-fade-up">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 glass-panel bg-white/60 border-white/80 py-2 px-4 rounded-full mb-8 shadow-xl shadow-orange-500/5 hover:scale-105 transition-transform duration-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-orange-600 text-xs font-black uppercase tracking-wider">Más de 500 expertos para tu hogar</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-[0.9] mb-6 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              El técnico que{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
                necesitas
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 6 Q50 1 100 5 Q150 9 200 3" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" className="opacity-40" />
                </svg>
              </span>
              ,<br />
              al instante
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-md font-medium">
              Encuentra a la persona indicada para cualquier trabajo en tu hogar. Expertos <span className="text-slate-900 font-bold underline decoration-orange-300 decoration-4">verificados</span>, rápido y sin complicaciones.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/solicitudes/nueva"
                className="inline-flex items-center justify-center gap-2.5 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 relative overflow-hidden group"
                style={{ background: "var(--brand-gradient)" }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Wrench className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Necesito un servicio</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </Link>
              <Link
                href="/registrarse"
                className="glass-panel bg-white/40 text-slate-700 hover:text-orange-600 font-bold px-8 py-4 rounded-2xl transition-all text-base hover:-translate-y-1 flex items-center justify-center gap-2 border border-white"
              >
                Quiero ofrecer servicios →
              </Link>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-4 mt-8">
              {["Gratis para clientes", "Sin tarjeta de crédito", "Expertos verificados"].map((t) => (
                <span key={t} className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: floating UI cards */}
          <div className="hidden md:flex flex-col gap-4 flex-1 items-end relative h-[550px]">
            {/* Background glowing orb for cards - Enhanced */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-orange-400/40 rounded-full blur-[100px] z-0 pointer-events-none animate-pulse-glow" />

            {/* Notification badge */}
            <div className="absolute top-0 right-4 z-40 flex items-center gap-3 glass-panel border-white py-2.5 px-5 rounded-3xl animate-float delay-100 shadow-2xl">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-slate-800 text-[13px] font-black tracking-tight">3 propuestas nuevas 🎉</p>
            </div>

            {/* Card 1 — Proposal */}
            <div className="w-[340px] glass-panel bg-white/50 border-white p-6 relative z-20 animate-float translate-y-20 -translate-x-12 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shrink-0" style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}>
                  CM
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">Carlos M.</p>
                  <p className="text-xs font-bold text-orange-600 mt-1 uppercase tracking-wider">Gasfitería Pro</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-bold">5.0</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100/50">
                <p className="text-[13px] text-orange-900 leading-relaxed font-semibold">
                  💬 &ldquo;Puedo atenderte hoy mismo. Mi trabajo tiene 1 año de garantía.&rdquo;
                </p>
              </div>
              <div className="flex gap-3 mt-5">
                <button className="flex-1 bg-slate-900 hover:bg-black text-white text-[13px] font-black py-3 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                  Elegir
                </button>
                <button className="flex-1 bg-white border border-slate-200 text-slate-700 text-[13px] font-black py-3 rounded-2xl hover:bg-slate-50 transition-all">
                  Perfil
                </button>
              </div>
            </div>

            {/* Card 2 — Another pro */}
            <div className="absolute top-[320px] right-24 w-[300px] glass-panel bg-white/40 border-white/60 p-5 z-10 animate-float delay-500 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0" style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}>
                  JR
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Juan R. — Electricista</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-tighter">A 2km de distancia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 — Completed */}
            <div className="absolute top-24 right-72 w-[240px] glass-panel bg-emerald-500/10 border-emerald-500/20 px-5 py-4 flex items-center gap-4 z-0 animate-float delay-300 shadow-xl">
              <div className="w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-lg shrink-0 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Éxito</p>
                <p className="text-[13px] text-emerald-900 font-bold truncate">¡Trabajo listo!</p>
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
          <div className="text-center mb-16">
            <span className="section-label mb-4">Servicios disponibles</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              ¿Qué servicio necesitas?
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
              Encuentra al experto ideal para cualquier trabajo en tu hogar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {catDestacadas.map((cat) => (
              <Link
                key={cat.slug}
                href={`/solicitudes/nueva?categoria=${cat.slug}`}
                className={`group border border-slate-100 rounded-[2rem] p-5 sm:p-7 flex flex-col items-center text-center gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 bg-white hover:border-orange-200 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10 ${cat.iconBg}`}>
                  {cat.icon}
                </div>
                <p className={`text-[15px] font-bold leading-tight relative z-10 ${cat.color}`}>
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
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-all hover:gap-3"
            >
              Explorar expertos verificados
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BUSCAR PROFESIONALES DIRECTAMENTE
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[#0f172a]">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] animate-pulse-glow pointer-events-none delay-300" />
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left animate-fade-up">
            <span className="inline-block glass-panel-dark text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              ¿Ya sabes quién quieres?
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Busca y contacta<br />
              <span className="text-orange-400">profesionales directamente</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Explora perfiles, lee reseñas reales, compara especialidades y elige al experto que más te convenza — sin intermediarios.
            </p>
            <Link
              href="/profesionales"
              className="inline-flex items-center gap-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-1"
            >
              Ver todos los expertos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Mini cards decorativas */}
          <div className="flex-1 hidden md:flex flex-col gap-4 items-end relative h-[300px]">
            {[
              { name: "Carlos M.", cat: "Gasfitero", rating: "5.0", jobs: 87, emoji: "🥇", grad: "from-blue-400 to-blue-600", delay: "" },
              { name: "Ana R.", cat: "Pintora", rating: "4.9", jobs: 52, emoji: "🥈", grad: "from-rose-400 to-pink-500", delay: "delay-100" },
              { name: "Juan V.", cat: "Electricista", rating: "5.0", jobs: 123, emoji: "💎", grad: "from-orange-400 to-amber-500", delay: "delay-200" },
            ].map((p, i) => (
              <div key={p.name} className={`glass-panel-dark w-72 rounded-2xl px-5 py-4 flex items-center gap-4 animate-slide-in ${p.delay}`} style={{ transform: `translateX(${-i * 15}px)` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0`}>
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-bold truncate">{p.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{p.cat} · ⭐ {p.rating} · {p.jobs} jobs {p.emoji}</p>
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
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {STATS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="text-center glass-panel bg-white/10 border-white/20 p-6 rounded-3xl animate-fade-up delay-100 hover:bg-white/20 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="stat-number text-4xl md:text-5xl text-white mb-2">{s.value}</p>
                  <p className="text-sm text-orange-50 leading-snug font-medium">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>       {/* ════════════════════════════════════════
          BENEFICIOS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#fafafa] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="section-label mb-3">¿Por qué elegirnos?</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Ventajas de usar ChambaPe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="group relative glass-panel bg-white/80 hover:bg-white border-white/50 hover:border-orange-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full" />
                <div className={`w-14 h-14 ${b.bg} rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                  {b.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{b.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed relative z-10">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>        {/* ════════════════════════════════════════
          TESTIMONIOS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-50/60 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="section-label mb-3">Testimonios reales</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-slate-500 text-lg">Miles de limeños ya encontraron su experto en ChambaPe</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIOS.map((t, i) => (
              <div
                key={i}
                className="glass-panel hover:bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col group relative"
              >
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${star * 50}ms` }} />
                  ))}
                </div>
                <p className="text-slate-700 text-[15px] leading-relaxed italic mb-8 flex-1">
                  "{t.texto}"
                </p>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md bg-gradient-to-br ${t.color}`}>
                    {t.iniciales}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.nombre}</p>
                    <p className="text-xs text-slate-500">{t.distrito} · {t.servicio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>        {/* ════════════════════════════════════════
          CTA DUAL — Cliente + Profesional
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CTA Cliente */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-2xl shadow-orange-500/20 group hover:-translate-y-1 transition-transform duration-300" style={{ background: "var(--brand-gradient)" }}>
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-0 left-12 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¿Necesitas un servicio?</h3>
                <p className="text-orange-100 text-sm leading-relaxed mb-6">
                  Publica tu solicitud en 2 minutos y recibe presupuestos de expertos verificados en tu zona. Completamente gratis.
                </p>
                <Link
                  href="/solicitudes/nueva"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Publicar solicitud gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex flex-wrap gap-3 mt-5">
                  {["Sin registro obligatorio", "100% gratuito", "Resultado en minutos"].map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-orange-100 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Profesional */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 bg-[#0f172a] text-white shadow-2xl group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-orange-500 opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-12 w-24 h-24 rounded-full bg-orange-500 opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>¿Tienes un oficio?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Llega a miles de limeños que buscan exactamente lo que ofreces. Regístrate gratis, verifica tu perfil y empieza hoy.
                </p>
                <Link
                  href="/registrarse"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 text-white"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  Registrarme como experto
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex flex-wrap gap-3 mt-5">
                  {["Registro gratuito", "Tú pones el precio", "Alertas en tu zona"].map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs text-slate-500 font-medium">
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
                Conectamos a limeños con expertos del hogar verificados y de confianza.
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
