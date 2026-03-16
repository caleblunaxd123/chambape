import { Logo } from "@/components/shared/Logo"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — branding (solo desktop) ──────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)" }}
      >
        {/* Patrón de puntos decorativo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Logo href="/" size="sm" variant="dark" />
        </div>

        {/* Contenido central */}
        <div className="relative z-10 space-y-8">
          {/* Tarjeta flotante de testimonio */}
          <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-black text-sm">
                MC
              </div>
              <div>
                <p className="text-white font-bold text-sm">María C.</p>
                <p className="text-orange-100 text-xs">Miraflores · Cliente</p>
              </div>
              <div className="ml-auto text-yellow-300 text-sm">★★★★★</div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              "En menos de una hora tenía 3 propuestas para arreglar mi cocina. ¡El gasfitero llegó al día siguiente!"
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { valor: "500+", label: "Expertos" },
              { valor: "2 min", label: "Para publicar" },
              { valor: "100%", label: "Gratis clientes" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white font-black text-2xl" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {stat.valor}
                </p>
                <p className="text-orange-100 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Headline */}
          <div>
            <h2
              className="text-white font-black text-3xl leading-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              El técnico que necesitas,<br />
              <span className="text-orange-200">al instante</span>
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Conectamos a limeños con expertos verificados del hogar.
            </p>
          </div>
        </div>

        {/* Footer izquierdo */}
        <div className="relative z-10">
          <p className="text-orange-200 text-xs">© {new Date().getFullYear()} ChambaPe · Lima, Perú</p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">

        {/* Header móvil (solo mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <Logo href="/" size="sm" />
          <Link href="/" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">
            ← Volver al inicio
          </Link>
        </header>

        {/* Formulario centrado */}
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>

        {/* Footer móvil */}
        <footer className="lg:hidden text-center py-4 text-xs text-gray-400">
          © {new Date().getFullYear()} ChambaPe · Lima, Perú
        </footer>
      </div>

    </div>
  )
}
