"use client"

import { useState } from "react"
import { Users, Briefcase } from "lucide-react"

const STEPS = {
  cliente: [
    {
      n: "1",
      icon: "📝",
      title: "Describe tu necesidad",
      desc: "Cuéntanos qué servicio necesitas, en qué distrito estás y cuándo lo quieres. ¡Solo toma 2 minutos!",
    },
    {
      n: "2",
      icon: "📩",
      title: "Recibe propuestas",
      desc: "Profesionales verificados de tu zona te envían sus cotizaciones. Compara perfiles y precios.",
    },
    {
      n: "3",
      icon: "✅",
      title: "Elige y coordina",
      desc: "Acepta la mejor propuesta y coordina directo con el profesional. Sin comisiones ocultas.",
    },
  ],
  profesional: [
    {
      n: "1",
      icon: "👤",
      title: "Crea tu perfil",
      desc: "Regístrate gratis, verifica tu identidad con tu DNI y muestra tu experiencia y portfolio.",
    },
    {
      n: "2",
      icon: "🔔",
      title: "Recibe alertas de trabajo",
      desc: "Te avisamos cuando llegan solicitudes en tu zona y especialidad. Aplica con créditos.",
    },
    {
      n: "3",
      icon: "🏆",
      title: "Consigue más clientes",
      desc: "El cliente ve tu propuesta, la acepta y te contacta directo. Tú pones tus precios.",
    },
  ],
} as const

type Tab = keyof typeof STEPS

export function HowItWorks() {
  const [tab, setTab] = useState<Tab>("cliente")
  const steps = STEPS[tab]

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1 gap-1 shadow-sm">
          {(["cliente", "profesional"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {t === "cliente" ? <Users className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
              Para {t === "cliente" ? "clientes" : "profesionales"}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center text-center">
            {/* Connector line between steps (desktop only) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-200 to-orange-100" />
            )}

            {/* Icon circle */}
            <div className="relative mb-5 z-10">
              <div className="w-16 h-16 bg-white border-2 border-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-3xl">{step.icon}</span>
              </div>
              {/* Step number badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                {step.n}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
