"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISSED_KEY = "chambape-pwa-dismissed"

export function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // No mostrar si ya fue descartado o si ya está instalado
    if (
      localStorage.getItem(DISMISSED_KEY) ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone
    ) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      // Mostrar con un pequeño delay para no interrumpir la carga inicial
      setTimeout(() => setVisible(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!visible || !prompt) return null

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      setVisible(false)
    }
    setPrompt(null)
  }

  function handleDismiss() {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, "1")
  }

  return (
    <div
      role="dialog"
      aria-label="Instalar ChambaPe"
      className="fixed bottom-20 inset-x-4 z-50 md:inset-x-auto md:right-5 md:left-auto md:w-80
                 bg-white rounded-2xl shadow-2xl border border-orange-100
                 animate-in slide-in-from-bottom-4 duration-300"
    >
      {/* Header degradé */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl px-4 pt-4 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">Instala ChambaPe</p>
            <p className="text-orange-100 text-xs mt-0.5">Acceso rápido · Sin App Store</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/70 hover:text-white transition-colors mt-0.5"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <ul className="space-y-1.5 mb-3">
          {[
            "Notificaciones cuando te elijan 🔔",
            "Funciona sin conexión 📶",
            "Acceso desde pantalla de inicio 🏠",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
                     text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Instalar gratis
        </button>
      </div>
    </div>
  )
}
