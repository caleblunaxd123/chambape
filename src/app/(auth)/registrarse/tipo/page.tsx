"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Wrench, User, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Tipo = "CLIENT" | "PROFESSIONAL"

export default function SeleccionarTipoPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Tipo | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">¿Cómo quieres usar ChambaPe?</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Elige tu perfil. Puedes cambiarlo después.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Opción: Cliente */}
          <button
            onClick={() => setSelected("CLIENT")}
            className={cn(
              "relative text-left rounded-xl border-2 p-5 transition-all",
              selected === "CLIENT"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {selected === "CLIENT" && (
              <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-orange-500" />
            )}
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Necesito un servicio</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Publica lo que necesitas y recibe presupuestos de profesionales verificados en minutos
            </p>
            <div className="mt-3 flex flex-col gap-1">
              {["Gratis publicar solicitudes", "Hasta 5 presupuestos", "Profesionales verificados"].map((item) => (
                <span key={item} className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="text-green-500">✓</span> {item}
                </span>
              ))}
            </div>
          </button>

          {/* Opción: Profesional */}
          <button
            onClick={() => setSelected("PROFESSIONAL")}
            className={cn(
              "relative text-left rounded-xl border-2 p-5 transition-all",
              selected === "PROFESSIONAL"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {selected === "PROFESSIONAL" && (
              <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-orange-500" />
            )}
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Soy profesional</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Encuentra clientes en tu zona, muestra tu trabajo y haz crecer tu negocio
            </p>
            <div className="mt-3 flex flex-col gap-1">
              {["Solicitudes en tu zona", "Sin comisión por trabajo", "Perfil verificado"].map((item) => (
                <span key={item} className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="text-green-500">✓</span> {item}
                </span>
              ))}
            </div>
          </button>
        </div>

        <Button
          onClick={handleContinuar}
          disabled={!selected || loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
        >
          {loading ? "Guardando..." : "Continuar"}
          {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
