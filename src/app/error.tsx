"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // En producción podrías enviar esto a Sentry / Datadog
    console.error("[ChambaPe Error]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">

        {/* Icono */}
        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-red-400" />
        </div>

        <h1
          className="text-2xl font-black text-gray-900 mb-3"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Algo salió mal
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Ocurrió un error inesperado. Estamos trabajando para solucionarlo.
        </p>

        {/* Código de error (solo en dev) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-3 mb-6 text-left text-xs bg-gray-900 text-red-300 rounded-xl p-4 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm shadow-orange-200"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-all"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Si el problema persiste, escríbenos a{" "}
          <a href="mailto:soporte@chambape.pe" className="text-orange-500 hover:underline">
            soporte@chambape.pe
          </a>
        </p>
      </div>
    </div>
  )
}
