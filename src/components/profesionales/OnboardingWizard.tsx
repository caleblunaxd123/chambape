"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Step1DatosPersonales } from "./wizard/Step1DatosPersonales"
import { Step2Especialidades } from "./wizard/Step2Especialidades"
import { Step3Cobertura } from "./wizard/Step3Cobertura"
import { Step4Verificacion } from "./wizard/Step4Verificacion"
import { Step5Descripcion } from "./wizard/Step5Descripcion"
import { Step6Portfolio } from "./wizard/Step6Portfolio"

const PASOS = [
  { numero: 1, label: "Datos" },
  { numero: 2, label: "Especialidades" },
  { numero: 3, label: "Zona" },
  { numero: 4, label: "Verificación" },
  { numero: 5, label: "Perfil" },
  { numero: 6, label: "Portfolio" },
]

interface InitialData {
  step1?: { fullName: string; dni: string; phone: string }
  step2?: { selectedCategoryIds: string[] }
  step3?: { districts: string[] }
  step4?: { dniFrontUrl?: string; dniBackUrl?: string; selfieDniUrl?: string }
  step5?: { bio: string; avatarUrl: string }
  step6?: { portfolioImages: Array<{ url: string; caption?: string }> }
}

interface Props {
  currentStep: number
  categoryMap: Record<string, string>
  userName: string
  initialData: InitialData
}

export function OnboardingWizard({ currentStep: initialStep, categoryMap, userName, initialData }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(initialStep)
  const [loading, setLoading] = useState(false)
  const [completado, setCompletado] = useState(false)
  const [wizardData, setWizardData] = useState<InitialData>(initialData)

  async function saveStep(stepNumber: number, data: object) {
    setLoading(true)
    try {
      const res = await fetch("/api/profesionales/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepNumber, ...data }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? "Ocurrió un error. Intenta de nuevo.")
        return false
      }

      return true
    } catch {
      toast.error("Error de conexión. Revisa tu internet.")
      return false
    } finally {
      setLoading(false)
    }
  }

  async function handleNext(stepNumber: number, data: object) {
    const ok = await saveStep(stepNumber, data)
    if (!ok) return

    // Actualizar estado local con los nuevos datos
    setWizardData((prev) => ({
      ...prev,
      [`step${stepNumber}`]: data
    }))

    if (stepNumber < 6) {
      setStep(stepNumber + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      // Completó el onboarding
      setCompletado(true)
    }
  }

  // Pantalla de éxito al completar
  if (completado) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center w-full max-w-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro completado!</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Tu perfil está siendo revisado por el equipo de ChambaPe. Te avisaremos por email
          en un plazo de <strong>24 horas hábiles</strong> cuando tu cuenta esté verificada.
        </p>

        <div className="bg-orange-50 rounded-xl p-4 mb-6 text-sm text-orange-700 text-left space-y-2">
          <p className="font-semibold">Mientras esperas puedes:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Explorar las solicitudes disponibles en tu zona</li>
            <li>Completar tu perfil con más información</li>
            <li>Cargar tus primeros créditos a precio especial</li>
          </ul>
        </div>

        <button
          onClick={() => router.push("/profesional/dashboard")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-medium transition-colors"
        >
          Ir a mi panel profesional
        </button>
      </div>
    )
  }

  const titulo = [
    "Datos de contacto",
    "Tus especialidades",
    "Zona de cobertura",
    "Verificación de identidad",
    "Tu perfil profesional",
    "Fotos de tus trabajos",
  ][step - 1]

  const descripcion = [
    "Necesitamos tu DNI y celular para verificar tu identidad",
    "¿En qué tipo de servicios eres especialista?",
    "¿En qué distritos de Lima puedes trabajar?",
    "Sube fotos de tu DNI para verificar que eres tú",
    "Una buena descripción te ayuda a conseguir más clientes",
    "Muestra tu mejor trabajo (opcional, pero recomendado)",
  ][step - 1]

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden w-full border border-gray-100">
      {/* Header del wizard */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6" style={{ background: "var(--brand-gradient)" }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white rounded-full blur-[70px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white font-black text-xl tracking-wide" style={{ fontFamily: "Outfit, sans-serif" }}>Registro profesional</h1>
            <span className="text-orange-100 font-bold text-xs bg-white/20 px-3 py-1.5 rounded-full">
              Paso {step} de {PASOS.length}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-6 overflow-hidden shadow-inner">
            <div
              className="bg-white rounded-full h-2 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              style={{ width: `${(step / PASOS.length) * 100}%` }}
            />
          </div>

          {/* Indicadores de pasos */}
          <div className="flex justify-between">
            {PASOS.map((p) => {
              const isActive = p.numero === step
              const isPast = p.numero < step
              return (
                <div key={p.numero} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm",
                      isPast
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-white text-orange-600 shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110"
                        : "bg-white/20 text-white/60 border border-white/30"
                    )}
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {isPast ? "✓" : p.numero}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider hidden sm:block transition-colors duration-300",
                      isActive ? "text-white" : isPast ? "text-orange-100" : "text-white/40"
                    )}
                  >
                    {p.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{descripcion}</p>
        </div>

        {step === 1 && (
          <Step1DatosPersonales
            defaultValues={initialData.step1}
            onNext={(data) => handleNext(1, data)}
            loading={loading}
          />
        )}
        {step === 2 && (
          <Step2Especialidades
            categoryMap={categoryMap}
            defaultSelected={initialData.step2?.selectedCategoryIds}
            onNext={(data) => handleNext(2, data)}
            loading={loading}
          />
        )}
        {step === 3 && (
          <Step3Cobertura
            defaultSelected={initialData.step3?.districts}
            onNext={(data) => handleNext(3, data)}
            loading={loading}
          />
        )}
        {step === 4 && (
          <Step4Verificacion
            dniEsperado={wizardData.step1?.dni}
            defaultValues={wizardData.step4}
            onNext={(data) => handleNext(4, data)}
            loading={loading}
          />
        )}
        {step === 5 && (
          <Step5Descripcion
            defaultValues={initialData.step5}
            onNext={(data) => handleNext(5, data)}
            loading={loading}
          />
        )}
        {step === 6 && (
          <Step6Portfolio
            defaultImages={initialData.step6?.portfolioImages}
            onNext={(data) => handleNext(6, data)}
            loading={loading}
          />
        )}

        {/* Botón volver (pasos 2-6) */}
        {step > 1 && !loading && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            ← Volver al paso anterior
          </button>
        )}
      </div>
    </div>
  )
}
