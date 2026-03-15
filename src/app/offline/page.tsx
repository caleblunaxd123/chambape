// Página de fallback cuando el usuario está sin conexión y el SW no tiene caché
"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center px-6 text-center">
      {/* Icono */}
      <div className="w-28 h-28 bg-orange-100 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
        <WifiOff className="w-14 h-14 text-orange-400" />
      </div>

      {/* Texto */}
      <h1
        className="text-3xl font-black text-gray-900 mb-3"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        Sin conexión
      </h1>
      <p className="text-gray-500 text-base max-w-xs mb-8">
        Parece que no tienes internet en este momento. Revisa tu conexión Wi-Fi o datos móviles y vuelve a intentarlo.
      </p>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Ir al inicio
        </Link>
      </div>

      {/* Logo */}
      <div className="mt-16 flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-sm">C</span>
        </div>
        <span className="font-black text-gray-400 text-sm tracking-tight">ChambaPe</span>
      </div>
    </div>
  )
}
