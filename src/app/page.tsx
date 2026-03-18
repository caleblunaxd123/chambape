import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Star,
  Wrench,
  MapPin,
  Briefcase,
  ClipboardList,
  MessageSquare,
  ThumbsUp,
  Bell,
  BadgeCheck,
} from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { LandingHeader } from "@/components/landing/LandingHeader"

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIAS_DESTACADAS: { slug: string; color: string; bg: string; iconBg: string }[] = [
  { slug: "gasfiteria",     color: "text-blue-700",   bg: "bg-blue-50   hover:bg-blue-100   border-blue-100",   iconBg: "bg-blue-100"   },
  { slug: "electricidad",   color: "text-yellow-700", bg: "bg-yellow-50 hover:bg-yellow-100 border-yellow-100", iconBg: "bg-yellow-100" },
  { slug: "pintura",        color: "text-rose-700",   bg: "bg-rose-50   hover:bg-rose-100   border-rose-100",   iconBg: "bg-rose-100"   },
  { slug: "limpieza-hogar", color: "text-teal-700",   bg: "bg-teal-50   hover:bg-teal-100   border-teal-100",   iconBg: "bg-teal-100"   },
  { slug: "carpinteria",    color: "text-amber-700",  bg: "bg-amber-50  hover:bg-amber-100  border-amber-100",  iconBg: "bg-amber-100"  },
  { slug: "cerrajeria",     color: "text-slate-700",  bg: "bg-slate-50  hover:bg-slate-100  border-slate-100",  iconBg: "bg-slate-200"  },
  { slug: "fumigacion",     color: "text-green-700",  bg: "bg-green-50  hover:bg-green-100  border-green-100",  iconBg: "bg-green-100"  },
  { slug: "mudanzas",       color: "text-orange-700", bg: "bg-orange-50 hover:bg-orange-100 border-orange-100", iconBg: "bg-orange-100" },
]

const PASOS = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Publica tu solicitud",
    desc: "Describe el trabajo, agrega fotos si tienes y elige tu distrito. Listo en menos de 2 minutos, completamente gratis.",
    iconBg: "bg-orange-500",
    textColor: "text-orange-600",
  },
  {
    num: "02",
    icon: MessageSquare,
    title: "Recibe propuestas",
    desc: "Técnicos verificados de tu zona ven tu solicitud y te envían cotizaciones con precios y disponibilidad real.",
    iconBg: "bg-blue-500",
    textColor: "text-blue-600",
  },
  {
    num: "03",
    icon: ThumbsUp,
    title: "Elige tu técnico",
    desc: "Revisa perfiles, lee reseñas reales y acepta la propuesta que más te convenza. Tú tienes el control.",
    iconBg: "bg-emerald-500",
    textColor: "text-emerald-600",
  },
]

const BENEFICIOS_TECNICOS = [
  { icon: BadgeCheck, text: "Perfil verificado que genera confianza en los clientes" },
  { icon: Bell,       text: "Alertas de trabajos en tiempo real en tu zona" },
  { icon: MapPin,     text: "Clientes reales en los 44 distritos de Lima" },
  { icon: Shield,     text: "Sin comisiones por trabajo — tú pones el precio" },
]

const TESTIMONIOS = [
  {
    nombre: "María C.",
    distrito: "Miraflores",
    texto: "En menos de una hora tenía 3 propuestas para arreglar mi cocina. Pagué menos de lo esperado y el trabajo quedó perfecto.",
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
    texto: "Muy fácil de usar. Describí lo que necesitaba, el pintor llegó puntual y el resultado fue excelente. ¡Lo recomiendo!",
    servicio: "Pintura",
    iniciales: "AL",
    color: "from-orange-400 to-amber-500",
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const catDestacadas = CATEGORIAS_DESTACADAS.map((meta) => ({
    ...meta,
    ...(CATEGORIAS.find((c) => c.slug === meta.slug) ?? {
      slug: meta.slug,
      name: meta.slug,
      icon: "🔧",
      description: "",
    }),
  }))

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ══════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════ */}
      <section className="relative pt-16 overflow-hidden flex items-center min-h-[92vh]">
        {/* Fondo blanco base */}
        <div className="absolute inset-0 bg-white" />

        {/* Gradiente oscuro derecha — desktop: absorbe el fondo negro de la imagen */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[48%] hidden md:block pointer-events-none"
          style={{ background: "linear-gradient(to right, #fff7ed 0%, #7c2d12 40%, #0c0501 100%)" }}
        />

        {/* Glow sutil en mobile */}
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-orange-400/20 rounded-full blur-[80px] md:hidden pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full flex flex-col md:flex-row items-center z-10 py-10 md:py-0 gap-6 md:gap-0">

          {/* ── LEFT: Contenido ── */}
          <div className="w-full md:w-[54%] flex flex-col justify-center md:py-24 md:pr-10 animate-fade-up">

            {/* Badge live */}
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 py-2 px-4 rounded-full mb-6 w-fit shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-orange-700 text-xs font-black tracking-wide">
                +500 técnicos verificados en Lima
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-5 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Encuentra técnicos{" "}
              <span className="text-orange-500">confiables</span>{" "}
              para tu hogar en minutos
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-[430px]">
              Gasfiteros, electricistas, cerrajeros y más. Cotizaciones gratis,
              técnicos verificados en tu zona.
            </p>

            {/* CTAs — primario más pesado que secundario */}
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Link
                href="/solicitudes/nueva"
                className="inline-flex items-center justify-center gap-2.5 text-white font-black px-7 py-4 rounded-2xl transition-all text-base shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 w-full sm:w-auto"
                style={{ background: "var(--brand-gradient)" }}
              >
                <Wrench className="w-5 h-5 shrink-0" />
                Necesito un técnico
              </Link>
              <Link
                href="/registrarse"
                className="inline-flex items-center justify-center gap-2.5 bg-slate-900 text-white font-bold px-7 py-4 rounded-2xl transition-all text-base hover:-translate-y-0.5 hover:bg-slate-800 w-full sm:w-auto opacity-90 hover:opacity-100"
              >
                <Briefcase className="w-5 h-5 shrink-0" />
                Quiero trabajar como técnico
              </Link>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: "🛡️", text: "Técnicos verificados" },
                { icon: "⭐", text: "Reseñas de clientes" },
                { icon: "📍", text: "Atención por zona" },
              ].map((t) => (
                <span
                  key={t.text}
                  className="flex items-center gap-1.5 text-sm text-slate-500 font-semibold"
                >
                  <span>{t.icon}</span>
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Imagen desktop ── */}
          <div className="hidden md:flex flex-1 items-end justify-center self-stretch relative">
            {/* Badge rating flotante */}
            <div className="absolute top-[28%] left-2 bg-white shadow-xl px-4 py-3 rounded-2xl z-20 animate-float border border-slate-100">
              <div className="flex items-center gap-1.5 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-slate-800 ml-1">4.8</span>
              </div>
              <p className="text-[11px] text-slate-500">+2,000 servicios completados</p>
            </div>

            {/* Badge propuesta nueva */}
            <div
              className="absolute top-[14%] right-8 bg-white shadow-xl px-4 py-2.5 rounded-2xl z-20 animate-float border border-slate-100"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-[12px] font-bold text-slate-800">3 propuestas nuevas 🎉</p>
              </div>
            </div>

            <Image
              src="/tecnico.png"
              alt="Técnico profesional ChambaPe"
              width={480}
              height={600}
              className="object-contain object-bottom max-h-[600px] w-auto relative z-10"
              priority
            />
          </div>

          {/* ── Imagen mobile: strip con gradiente ── */}
          <div
            className="block md:hidden w-full rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #9a3412 50%, #0c0501 100%)",
            }}
          >
            <div className="flex justify-center py-2">
              <Image
                src="/tecnico.png"
                alt="Técnico profesional ChambaPe"
                width={280}
                height={320}
                className="object-contain max-h-[240px] w-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. TRUST BAR
      ══════════════════════════════════════════════ */}
      <div className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-slate-100">
            {[
              { value: "500+",   label: "Técnicos verificados",  icon: "🛡️" },
              { value: "4.8★",   label: "Valoración promedio",   icon: "⭐" },
              { value: "2,000+", label: "Servicios completados", icon: "✅" },
              { value: "Gratis", label: "Para clientes",          icon: "💰" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center text-center px-4 py-1"
              >
                <span className="text-2xl mb-1">{s.icon}</span>
                <p className="text-xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          3. SERVICIOS POPULARES
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white" id="categorias">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="section-label mb-3">Servicios disponibles</span>
            <h2
              className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
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
                className={`group border rounded-[2rem] p-5 sm:p-7 flex flex-col items-center text-center gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 bg-white hover:border-orange-200 relative overflow-hidden ${cat.bg}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10 ${cat.iconBg}`}
                >
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

      {/* ══════════════════════════════════════════════
          4. CÓMO FUNCIONA — 3 pasos
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#f8f7f5]" id="como-funciona">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="section-label mb-3">Simple y rápido</span>
            <h2
              className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              ¿Cómo funciona ChambaPe?
            </h2>
            <p className="text-slate-500 text-base">
              Desde tu solicitud hasta el trabajo terminado, en 3 pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Línea conectora desktop */}
            <div className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-orange-200 via-blue-200 to-emerald-200 z-0" />

            {PASOS.map((paso, i) => {
              const Icon = paso.icon
              return (
                <div
                  key={i}
                  className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-10"
                >
                  <div
                    className={`w-14 h-14 ${paso.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span
                    className={`text-xs font-black uppercase tracking-widest ${paso.textColor} mb-2 block`}
                  >
                    Paso {paso.num}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {paso.title}
                  </h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{paso.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/solicitudes/nueva"
              className="inline-flex items-center gap-2.5 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              style={{ background: "var(--brand-gradient)" }}
            >
              <Wrench className="w-5 h-5" />
              Publicar solicitud gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. PARA TÉCNICOS
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[#0f172a]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12 md:gap-16 z-10">
          {/* Contenido */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              Para técnicos y profesionales
            </span>
            <h2
              className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              ¿Tienes un oficio?
              <br />
              <span className="text-orange-400">
                Consigue clientes sin comisiones
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Únete gratis a ChambaPe y recibe solicitudes reales de clientes en
              tu zona. Tú pones el precio, sin intermediarios.
            </p>

            <ul className="flex flex-col gap-3 mb-8 text-left max-w-md mx-auto md:mx-0">
              {BENEFICIOS_TECNICOS.map((b, i) => {
                const Icon = b.icon
                return (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-slate-300 text-[15px] font-medium">
                      {b.text}
                    </span>
                  </li>
                )
              })}
            </ul>

            <Link
              href="/registrarse"
              className="inline-flex items-center gap-2.5 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              style={{ background: "var(--brand-gradient)" }}
            >
              <Briefcase className="w-5 h-5" />
              Registrarme como técnico
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-slate-600 text-xs mt-3">
              Registro 100% gratuito. Sin tarjeta de crédito.
            </p>
          </div>

          {/* Cards de profesionales — desktop */}
          <div className="flex-1 hidden md:flex flex-col gap-4 items-end">
            {[
              { name: "Carlos M.", cat: "Gasfitero",    rating: "5.0", jobs: 87,  grad: "from-blue-400 to-blue-600"   },
              { name: "Ana R.",    cat: "Pintora",       rating: "4.9", jobs: 52,  grad: "from-rose-400 to-pink-500"   },
              { name: "Juan V.",   cat: "Electricista",  rating: "5.0", jobs: 123, grad: "from-orange-400 to-amber-500" },
            ].map((p, i) => (
              <div
                key={p.name}
                className="w-72 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
                style={{ transform: `translateX(${-i * 20}px)` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-white font-bold shrink-0`}
                >
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{p.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {p.cat} · ⭐ {p.rating} · {p.jobs} trabajos
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ))}

            {/* Stat chip */}
            <div
              className="w-72 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-4 text-center"
              style={{ transform: "translateX(-20px)" }}
            >
              <p className="text-orange-400 text-3xl font-black">+500</p>
              <p className="text-slate-400 text-sm">
                profesionales activos en Lima
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. TESTIMONIOS
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-50/60 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <span className="section-label mb-3">Testimonios reales</span>
            <h2
              className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-slate-500">
              Miles de limeños ya encontraron su experto en ChambaPe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIOS.map((t, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-[15px] leading-relaxed italic mb-6 flex-1">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${t.color}`}
                  >
                    {t.iniciales}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {t.distrito} · {t.servicio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. CTA DUAL FINAL
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CTA Cliente */}
            <div
              className="relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-2xl shadow-orange-500/20 group hover:-translate-y-1 transition-transform duration-300"
              style={{ background: "var(--brand-gradient)" }}
            >
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-0 left-12 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏠</div>
                <h3
                  className="text-2xl font-black mb-2"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  ¿Necesitas un servicio?
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed mb-6">
                  Publica tu solicitud en 2 minutos y recibe presupuestos de
                  expertos verificados en tu zona. Completamente gratis.
                </p>
                <Link
                  href="/solicitudes/nueva"
                  className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Publicar solicitud gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex flex-wrap gap-3 mt-5">
                  {["Sin registro obligatorio", "100% gratuito", "Resultado en minutos"].map(
                    (f) => (
                      <span
                        key={f}
                        className="flex items-center gap-1 text-xs text-orange-100 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        {f}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* CTA Profesional */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 bg-[#0f172a] text-white shadow-2xl group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-orange-500 opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-12 w-24 h-24 rounded-full bg-orange-500 opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="text-4xl mb-4">🔧</div>
                <h3
                  className="text-2xl font-black mb-2"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  ¿Tienes un oficio?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Llega a miles de limeños que buscan exactamente lo que ofreces.
                  Regístrate gratis y empieza hoy.
                </p>
                <Link
                  href="/registrarse"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 text-white"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  Registrarme como experto
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex flex-wrap gap-3 mt-5">
                  {["Registro gratuito", "Tú pones el precio", "Alertas en tu zona"].map(
                    (f) => (
                      <span
                        key={f}
                        className="flex items-center gap-1 text-xs text-slate-500 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-orange-500" />
                        {f}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="bg-[#0a0f1e] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="brand-name text-xl text-white">
                  Chamba<span className="text-orange-400">Pe</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Conectamos a limeños con expertos del hogar verificados y de
                confianza.
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                🇵🇪 <span>Lima, Perú</span>
              </p>
            </div>

            {/* Para clientes */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">
                Para clientes
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Publicar solicitud", href: "/solicitudes/nueva" },
                  { label: "Cómo funciona",      href: "/#como-funciona"   },
                  { label: "Categorías",          href: "/#categorias"      },
                  { label: "Mis solicitudes",     href: "/solicitudes"      },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-500 hover:text-orange-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Para profesionales */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">
                Para profesionales
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Registrarme",      href: "/registrarse"               },
                  { label: "Panel de trabajo", href: "/profesional/dashboard"     },
                  { label: "Oportunidades",    href: "/profesional/oportunidades" },
                  { label: "Mis créditos",     href: "/profesional/creditos"      },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-500 hover:text-orange-400 transition-colors"
                    >
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
                  { label: "Iniciar sesión",  href: "/iniciar-sesion" },
                  { label: "Términos de uso", href: "/terminos"       },
                  { label: "Privacidad",      href: "/privacidad"     },
                  { label: "Contacto",        href: "/contacto"       },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-500 hover:text-orange-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} ChambaPe. Todos los derechos
              reservados.
            </p>
            <p className="text-xs text-gray-600">Hecho con ❤️ en Lima, Perú</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
