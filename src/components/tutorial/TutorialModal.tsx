"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Slides por rol ───────────────────────────────────────────────────────────

const SLIDES_CLIENTE = [
  {
    emoji: "👋",
    color: "from-blue-500 to-indigo-600",
    title: "¡Bienvenido a ChambaPe!",
    desc: "La forma más fácil de encontrar expertos verificados para cualquier trabajo en tu hogar en Lima.",
    tip: null,
    pasos: [
      { icon: "📋", label: "Publica tu solicitud" },
      { icon: "📩", label: "Recibe propuestas" },
      { icon: "✅", label: "Elige al mejor" },
      { icon: "⭐", label: "Deja tu reseña" },
    ],
  },
  {
    emoji: "📋",
    color: "from-orange-500 to-amber-500",
    title: "Publica tu solicitud",
    desc: "Describe qué trabajo necesitas, elige la categoría, el distrito y el presupuesto aproximado. Es completamente gratis.",
    tip: "💡 Cuanto más detallado seas, mejores propuestas recibirás.",
    pasos: null,
  },
  {
    emoji: "📩",
    color: "from-emerald-500 to-teal-600",
    title: "Recibe propuestas",
    desc: "Los expertos de tu zona ven tu solicitud y envían sus propuestas con presupuesto y tiempo estimado. Puedes recibir hasta 5 propuestas.",
    tip: "💡 Revisa el perfil, reseñas y trabajos anteriores de cada experto antes de decidir.",
    pasos: null,
  },
  {
    emoji: "✅",
    color: "from-violet-500 to-purple-600",
    title: "Elige al mejor",
    desc: "Acepta la propuesta que más te convenza. El experto recibirá una notificación y se pondrá en contacto contigo directamente.",
    tip: "💡 Las demás propuestas se rechazan automáticamente al aceptar una.",
    pasos: null,
  },
  {
    emoji: "⭐",
    color: "from-yellow-500 to-orange-500",
    title: "Califica al experto",
    desc: "Después de que termine el trabajo, deja una reseña honesta. Ayudas a la comunidad a elegir a los mejores profesionales.",
    tip: "💡 Tu reseña es muy importante — los expertos con mejores reseñas consiguen más trabajo.",
    pasos: null,
  },
]

const SLIDES_PROFESIONAL = [
  {
    emoji: "⚡",
    color: "from-orange-500 to-amber-500",
    title: "¡Bienvenido a ChambaPe!",
    desc: "La plataforma para encontrar clientes que necesitan tus servicios en Lima. Tú pones el precio, tú eliges a qué postular.",
    tip: null,
    pasos: [
      { icon: "🔍", label: "Ve las oportunidades" },
      { icon: "💳", label: "Aplica con créditos" },
      { icon: "🤝", label: "Consigue el trabajo" },
      { icon: "📈", label: "Crece tu reputación" },
    ],
  },
  {
    emoji: "🔍",
    color: "from-blue-500 to-indigo-600",
    title: "Feed de oportunidades",
    desc: "En 'Oportunidades' verás las solicitudes de clientes filtradas por tus categorías y distritos configurados en tu perfil.",
    tip: "💡 Completa tu perfil con más categorías y distritos para ver más oportunidades.",
    pasos: null,
  },
  {
    emoji: "💳",
    color: "from-emerald-500 to-teal-600",
    title: "Créditos para postular",
    desc: "Cada vez que postulas a una solicitud se descuentan créditos de tu saldo. Compra paquetes de créditos o suscríbete a un plan mensual.",
    tip: "💡 Empieza con los 25 créditos de bienvenida. Un plan mensual es más económico si postulas seguido.",
    pasos: null,
  },
  {
    emoji: "📝",
    color: "from-violet-500 to-purple-600",
    title: "Optimiza tu perfil",
    desc: "Un perfil completo con foto, descripción, categorías, distritos y fotos de trabajos anteriores recibe muchas más aceptaciones.",
    tip: "💡 Solicita la verificación para mostrar el sello ✓ verificado y generar más confianza.",
    pasos: null,
  },
  {
    emoji: "📊",
    color: "from-pink-500 to-rose-600",
    title: "Sigue tus aplicaciones",
    desc: "En 'Mis aplicaciones' puedes ver el estado de cada propuesta enviada: pendiente, aceptada o rechazada.",
    tip: "💡 Si un cliente acepta tu propuesta, te llega una notificación al instante para que lo contactes rápido.",
    pasos: null,
  },
]

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Rol = "CLIENT" | "PROFESSIONAL"

interface Props {
  rol: Rol
  userId: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TutorialModal({ rol, userId }: Props) {
  const storageKey = `chamb_tutorial_v1_${userId}`
  const slides = rol === "CLIENT" ? SLIDES_CLIENTE : SLIDES_PROFESIONAL

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)

  // Auto-abrir la primera vez
  useEffect(() => {
    const visto = localStorage.getItem(storageKey)
    if (!visto) {
      // Pequeño delay para que el dashboard cargue antes del modal
      const t = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [storageKey])

  function cerrar() {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
      setStep(0)
      localStorage.setItem(storageKey, "1")
    }, 200)
  }

  function siguiente() {
    if (step < slides.length - 1) setStep(step + 1)
    else cerrar()
  }

  function anterior() {
    if (step > 0) setStep(step - 1)
  }

  function abrirManual() {
    setStep(0)
    setOpen(true)
  }

  const slide = slides[step]
  const esPrimerPaso = step === 0
  const esUltimoPaso = step === slides.length - 1

  return (
    <>
      {/* ── Botón flotante de ayuda ── */}
      <button
        onClick={abrirManual}
        title="Ver tutorial"
        className="fixed bottom-36 right-4 z-40 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-300 hover:shadow-xl transition-all duration-200 sm:bottom-20"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* ── Modal overlay ── */}
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
            closing ? "opacity-0" : "opacity-100"
          )}
          onClick={(e) => { if (e.target === e.currentTarget) cerrar() }}
        >
          <div
            className={cn(
              "relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-200",
              closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}
          >
            {/* Header con gradiente */}
            <div className={cn("bg-gradient-to-br p-8 text-white relative", slide.color)}>
              <button
                onClick={cerrar}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Emoji grande */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl mb-4">
                {slide.emoji}
              </div>

              <h2 className="text-xl font-black leading-tight mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {slide.title}
              </h2>

              {/* Dots de progreso */}
              <div className="flex gap-1.5 mt-4">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      i === step
                        ? "w-5 h-2 bg-white"
                        : "w-2 h-2 bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {slide.desc}
              </p>

              {/* Pasos del primer slide */}
              {slide.pasos && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {slide.pasos.map((paso, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"
                    >
                      <span className="text-xl">{paso.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{paso.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tip */}
              {slide.tip && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-800 leading-relaxed">{slide.tip}</p>
                </div>
              )}

              {/* Paso X de Y */}
              <p className="text-xs text-gray-400 text-center">
                Paso {step + 1} de {slides.length}
              </p>
            </div>

            {/* Footer botones */}
            <div className="px-6 pb-6 flex gap-3">
              {!esPrimerPaso && (
                <button
                  onClick={anterior}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
              )}

              <button
                onClick={siguiente}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                style={{ background: "var(--brand-gradient)" }}
              >
                {esUltimoPaso ? (
                  "¡Entendido, empezar! 🚀"
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Skip */}
            {!esUltimoPaso && (
              <button
                onClick={cerrar}
                className="w-full pb-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Saltar tutorial
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
