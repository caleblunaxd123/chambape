import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/shared/Logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header minimal */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Logo href="/" size="sm" />
      </header>

      {/* Contenido centrado */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">

          {/* Número 404 grande */}
          <div className="relative mb-6">
            <p
              className="text-[120px] font-black leading-none text-gray-100 select-none"
              style={{ fontFamily: "Outfit, sans-serif" }}
              aria-hidden
            >
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">🔍</span>
            </div>
          </div>

          <h1
            className="text-2xl font-black text-gray-900 mb-3"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Página no encontrada
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            La página que buscas no existe o fue movida.
            Puede que el enlace esté desactualizado o hayas escrito mal la dirección.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm shadow-orange-200"
            >
              <Home className="w-4 h-4" />
              Ir al inicio
            </Link>
            <Link
              href="/profesionales"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-all"
            >
              <Search className="w-4 h-4" />
              Ver técnicos
            </Link>
          </div>

          {/* Link volver */}
          <button
            onClick={() => history.back()}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la página anterior
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} ChambaPe · Lima, Perú
      </footer>
    </div>
  )
}
