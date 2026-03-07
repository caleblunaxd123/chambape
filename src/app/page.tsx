import Link from "next/link"
import { ArrowRight, CheckCircle2, Shield, Zap, Star } from "lucide-react"
import { CATEGORIAS } from "@/constants/categorias"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { HowItWorks } from "@/components/landing/HowItWorks"

// ─── Data ────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+", line1: "Profesionales", line2: "verificados" },
  { value: "2,000+", line1: "Servicios", line2: "completados" },
  { value: "47", line1: "Distritos", line2: "de Lima" },
  { value: "4.8 ★", line1: "Valoración", line2: "promedio" },
]

const BENEFITS = [
  {
    icon: "🛡️",
    title: "Profesionales verificados",
    desc: "Revisamos el DNI y antecedentes de cada profesional antes de que pueda atender solicitudes en la plataforma.",
  },
  {
    icon: "⚡",
    title: "Propuestas en minutos",
    desc: "Publica tu solicitud y recibe cotizaciones de profesionales de tu zona en cuestión de minutos, no días.",
  },
  {
    icon: "💸",
    title: "Sin costos ocultos",
    desc: "El cliente no paga comisiones. Coordinas directo con el profesional y pagas solo por el trabajo realizado.",
  },
]

const TESTIMONIOS = [
  {
    nombre: "María C.",
    distrito: "Miraflores",
    texto:
      "En menos de una hora ya tenía 3 propuestas para arreglar mi cocina. Al final pagué menos de lo esperado y el trabajo quedó perfecto.",
    servicio: "Gasfitería",
    rating: 5,
  },
  {
    nombre: "Rodrigo V.",
    distrito: "San Isidro",
    texto:
      "Como electricista, ChambaPe me ha conseguido más clientes en 2 meses de lo que conseguía en 6 meses por recomendación.",
    servicio: "Electricista",
    rating: 5,
  },
  {
    nombre: "Ana L.",
    distrito: "Surco",
    texto:
      "Muy fácil de usar. Describí lo que necesitaba, el pintor llegó puntual y el resultado fue excelente. ¡Lo recomiendo!",
    servicio: "Pintura",
    rating: 5,
  },
]

// ─── Page ────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-200 opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-amber-200 opacity-20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-0">
          {/* Left: copy */}
          <div className="flex-1 max-w-xl">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Más de 500 profesionales activos en Lima
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-4 tracking-tight">
              El técnico que{" "}
              <span className="text-orange-500 relative">
                necesitas
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 6 Q50 0 100 5 Q150 10 200 4"
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

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Gasfiteros, electricistas, pintores y más. Profesionales verificados
              en Lima listos para ayudarte. Recibe presupuestos gratis en minutos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/solicitudes/nueva"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-4 rounded-2xl transition-colors text-base shadow-lg shadow-orange-200 hover:shadow-orange-300"
              >
                Necesito un servicio
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/registrarse"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 font-bold px-7 py-4 rounded-2xl transition-colors text-base"
              >
                Soy profesional
              </Link>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-4 mt-7">
              {["Gratis para clientes", "Sin tarjeta de crédito", "Profesionales verificados"].map(
                (t) => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right: floating proposal cards */}
          <div className="hidden md:flex flex-col gap-3 flex-1 items-end relative">
            {/* Badge */}
            <div className="absolute -top-4 right-2 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              3 propuestas nuevas 🎉
            </div>

            {/* Card 1 */}
            <div className="w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-xl shrink-0">
                  👷
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Carlos M. — Gasfitero</p>
                  <p className="text-xs text-gray-400">Disponible hoy · Miraflores</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">5.0 (34 reseñas)</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-orange-700 font-medium leading-relaxed">
                  💬 "Puedo atenderte hoy por la tarde. Presupuesto estimado: S/.80 incluye materiales."
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-yellow-100 rounded-full flex items-center justify-center text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Juan R. — Electricista</p>
                  <p className="text-xs text-gray-400">Disponible mañana · San Isidro</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">4.9 (87)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="w-60 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm shrink-0">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-green-800">Trabajo completado</p>
                <p className="text-xs text-green-600">María C. dejó 5 ★ a Carlos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CATEGORÍAS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white" id="categorias">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              ¿Qué servicio necesitas?
            </h2>
            <p className="text-gray-500 text-base">
              Encuentra el profesional ideal para cualquier trabajo en tu hogar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/solicitudes/nueva?categoria=${cat.slug}`}
                className="group bg-white border border-gray-100 hover:border-orange-200 hover:bg-orange-50 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 transition-all duration-200 hover:shadow-md"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors leading-tight">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2 hidden sm:block">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/solicitudes/nueva"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors"
            >
              Ver todos los servicios
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CÓMO FUNCIONA
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50" id="como-funciona">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              ¿Cómo funciona ChambaPe?
            </h2>
            <p className="text-gray-500 text-base">Rápido, seguro y sin complicaciones</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* ════════════════════════════════════════
          ESTADÍSTICAS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-orange-500">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-sm text-orange-100 leading-snug">
                  {s.line1}
                  <br />
                  {s.line2}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BENEFICIOS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              ¿Por qué elegir ChambaPe?
            </h2>
            <p className="text-gray-500 text-base">
              La forma más fácil de encontrar profesionales de confianza en Lima
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-5">
                  {b.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIOS
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-gray-500 text-base">
              Miles de limeños ya encontraron su profesional en ChambaPe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIOS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {t.nombre[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {t.distrito} · {t.servicio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA — PROFESIONALES
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-950 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-orange-500 opacity-10 blur-3xl rounded-full" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/15 text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            🔧 Para profesionales
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
            ¿Tienes un oficio y buscas más clientes?
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            Llega a miles de limeños que buscan exactamente lo que tú ofreces.
            Regístrate gratis, verifica tu perfil y empieza a conseguir trabajo hoy.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/registrarse"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-base shadow-lg shadow-orange-500/20"
            >
              Registrarme como profesional
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[
              "Registro gratuito",
              "Perfil verificado",
              "Tú pones el precio",
              "Alertas en tu zona",
              "Sin exclusividad",
            ].map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
              >
                <CheckCircle2 className="w-3 h-3 text-orange-500 shrink-0" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="bg-gray-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-extrabold text-sm">C</span>
                </div>
                <span className="font-extrabold text-white text-lg tracking-tight">
                  Chamba<span className="text-orange-500">Pe</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                Conectamos a limeños con profesionales del hogar verificados y de confianza.
              </p>
              <p className="text-xs text-gray-600 mt-4 flex items-center gap-1">
                🇵🇪 Lima, Perú
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
                    <Link
                      href={l.href}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                    >
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
                  { label: "Paquetes de créditos", href: "/profesional/creditos" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
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
                  { label: "Iniciar sesión", href: "/iniciar-sesion" },
                  { label: "Términos de uso", href: "/terminos" },
                  { label: "Política de privacidad", href: "/privacidad" },
                  { label: "Contacto", href: "/contacto" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
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
