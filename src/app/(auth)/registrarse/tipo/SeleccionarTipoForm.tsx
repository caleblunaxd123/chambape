"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Wrench, ArrowRight, CheckCircle2, Home, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Tipo = "CLIENT" | "PROFESSIONAL"

const OPTIONS = [
  {
    value: "CLIENT" as Tipo,
    icon: Home,
    emoji: "🏠",
    title: "Necesito un servicio",
    subtitle: "Soy cliente",
    desc: "Publica lo que necesitas y recibe presupuestos de profesionales verificados en minutos. Completamente gratis.",
    items: ["Publicar solicitudes gratis", "Hasta 5 propuestas por solicitud", "Profesionales verificados"],
    gradient: "from-blue-500 to-indigo-600",
    activeBg: "bg-blue-50 border-blue-500",
    activeText: "text-blue-700",
    activeChip: "bg-blue-500",
  },
  {
    value: "PROFESSIONAL" as Tipo,
    icon: Wrench,
    emoji: "🔧",
    title: "Soy profesional",
    subtitle: "Tengo un oficio",
    desc: "Encuentra clientes en tu zona, muestra tu trabajo y haz crecer tu negocio. Regístrate gratis hoy.",
    items: ["Solicitudes en tu zona", "Sin comisión por trabajo", "Perfil verificado"],
    gradient: "from-orange-500 to-amber-500",
    activeBg: "bg-orange-50 border-orange-500",
    activeText: "text-orange-700",
    activeChip: "bg-orange-500",
  },
]

export default function SeleccionarTipoForm() {
  const router = useRouter()
  // Solo necesitamos isLoaded — el servidor ya verificó que el usuario está autenticado.
  // No usamos isSignedIn para evitar race conditions con la sincronización de Clerk
  // justo después de la verificación OTP, que causaba blank page o redirect a login.
  const { isLoaded } = useAuth()
  const [selected, setSelected] = useState<Tipo | null>(null)
  const [loading, setLoading] = useState(false)

  // Mostrar spinner mientras Clerk hidrata el cliente
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Preparando tu cuenta...</p>
      </div>
    )
  }

  async function handleContinuar() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch("/api/usuarios/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      })
      if (!res.ok) throw new Error()
      if (selected === "PROFESSIONAL") {
        router.push("/registrarse/profesional")
      } else {
        router.push("/dashboard")
      }
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4" style={{ background: "var(--brand-gradient)" }}>
          <span className="text-white text-2xl">⚡</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          ¿Cómo usarás ChambaPe?
        </h1>
        <p className="text-gray-500 text-sm">
          Elige tu perfil para personalizar tu experiencia
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={cn(
                "relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:-translate-y-0.5",
                isSelected ? `${opt.activeBg} shadow-md` : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all", isSelected ? `bg-gradient-to-br ${opt.gradient} shadow-md` : "bg-gray-100")}>
                <span className="text-2xl">{opt.emoji}</span>
              </div>
              <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", isSelected ? opt.activeText : "text-gray-400")}>
                {opt.subtitle}
              </p>
              <h2 className={cn("font-black text-lg mb-2 leading-tight", isSelected ? "text-gray-900" : "text-gray-700")} style={{ fontFamily: "Outfit, sans-serif" }}>
                {opt.title}
              </h2>
              <p className={cn("text-xs leading-relaxed mb-4", isSelected ? "text-gray-600" : "text-gray-400")}>
                {opt.desc}
              </p>
              <div className="flex flex-col gap-1.5">
                {opt.items.map((item) => (
                  <span key={item} className={cn("text-xs flex items-center gap-1.5", isSelected ? "text-gray-700" : "text-gray-400")}>
                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white", isSelected ? opt.activeChip : "bg-gray-200")}>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                    {item}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleContinuar}
        disabled={!selected || loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 font-bold text-base py-3.5 rounded-2xl transition-all",
          selected ? "text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0" : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
        style={selected ? { background: "var(--brand-gradient)" } : {}}
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
        ) : (
          <>
            {selected === "PROFESSIONAL" ? "Continuar con mi perfil profesional" : selected === "CLIENT" ? "Ir a mi panel de cliente" : "Selecciona un perfil para continuar"}
            {selected && <ArrowRight className="w-5 h-5" />}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Puedes cambiar tu tipo de perfil más adelante desde ajustes
      </p>
    </div>
  )
}
