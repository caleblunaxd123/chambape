"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

/* ─── Tipos ─────────────────────────────────────────────────── */
type Tipo = "cliente" | "profesional"

interface ConfettiPiece {
  id: number
  left: number
  color: string
  width: number
  height: number
  delay: number
  duration: number
  shape: "circle" | "rect" | "strip"
}

/* ─── Datos por rol ─────────────────────────────────────────── */
const CONTENT = {
  cliente: {
    emoji: "🎉",
    title: "¡Ya eres parte de ChambaPe!",
    subtitle: "Miles de técnicos verificados en Lima están listos para ayudarte ahora mismo.",
    badge: "Cuenta creada",
    badgeColor: "bg-blue-100 text-blue-700",
    steps: [
      { emoji: "📋", title: "Publica tu trabajo", desc: "Describe qué necesitas en 2 minutos, completamente gratis." },
      { emoji: "📩", title: "Recibe propuestas", desc: "Hasta 5 técnicos verificados te contactan con su precio." },
      { emoji: "✅", title: "Elige al mejor", desc: "Compara reseñas, precios y selecciona sin compromiso." },
    ],
    proof: "🏆 Más de 500 técnicos activos en Lima te están esperando",
    cta: "Ver mi panel",
    href: "/dashboard",
    ctaColor: "from-blue-500 to-indigo-600",
  },
  profesional: {
    emoji: "🔧",
    title: "¡Bienvenido al equipo!",
    subtitle: "Completa tu perfil en minutos y empieza a recibir solicitudes de clientes en tu zona.",
    badge: "Cuenta creada",
    badgeColor: "bg-orange-100 text-orange-700",
    steps: [
      { emoji: "📝", title: "Completa tu perfil", desc: "Cuéntanos tu especialidad y dónde trabajas." },
      { emoji: "🎯", title: "Aplica a trabajos", desc: "Sé el primero en llegar a clientes de tu zona." },
      { emoji: "💰", title: "Crece tu negocio", desc: "Sin comisión. Tú cobras directo al cliente." },
    ],
    proof: "📍 Hay solicitudes esperándote en tu zona ahora mismo",
    cta: "Completar mi perfil",
    href: "/registrarse/profesional",
    ctaColor: "from-orange-500 to-amber-500",
  },
}

const CONFETTI_COLORS = [
  "#f97316", "#fbbf24", "#34d399", "#60a5fa",
  "#a78bfa", "#f472b6", "#fb923c", "#4ade80",
  "#f43f5e", "#06b6d4",
]

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 105,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    width: 6 + Math.random() * 8,
    height: 4 + Math.random() * 12,
    delay: Math.random() * 4,
    duration: 2.5 + Math.random() * 3,
    shape: (["circle", "rect", "strip"] as const)[Math.floor(Math.random() * 3)],
  }))
}

/* ─── Componente confetti ───────────────────────────────────── */
function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setPieces(generateConfetti())
    // Desvanece el confetti después de 5.5s
    const t = setTimeout(() => setVisible(false), 5500)
    return () => clearTimeout(t)
  }, [])

  if (!visible || pieces.length === 0) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-50 transition-opacity duration-1000"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: `${p.shape === "strip" ? 3 : p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "strip" ? "2px" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Step card ────────────────────────────────────────────── */
function StepCard({ step, index, delay }: { step: { emoji: string; title: string; desc: string }; index: number; delay: number }) {
  return (
    <div
      className="flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl mb-3 shadow-sm">
        {step.emoji}
      </div>
      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-black text-orange-600 mb-2">
        {index + 1}
      </div>
      <p className="font-bold text-gray-900 text-sm mb-1 leading-tight">{step.title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
    </div>
  )
}

/* ─── Página principal ─────────────────────────────────────── */
export default function BienvenidaClient({ tipo }: { tipo: Tipo }) {
  const c = CONTENT[tipo]

  return (
    <>
      <Confetti />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* ── Encabezado ────────────────────── */}
          <div
            className="text-center mb-8 animate-fade-up"
            style={{ animationFillMode: "both" }}
          >
            {/* Badge */}
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-5 ${c.badgeColor}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {c.badge}
            </div>

            {/* Emoji animado */}
            <div
              className="text-6xl mb-4 animate-bounce-slow select-none"
              style={{ animationDelay: "200ms" }}
            >
              {c.emoji}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {c.title}
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
              {c.subtitle}
            </p>
          </div>

          {/* ── Pasos ─────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {c.steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} delay={300 + i * 100} />
            ))}
          </div>

          {/* ── Social proof ──────────────────── */}
          <div
            className="text-center mb-6 animate-fade-up"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-full px-4 py-2 inline-block shadow-sm">
              {c.proof}
            </p>
          </div>

          {/* ── CTA ───────────────────────────── */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "850ms", animationFillMode: "both" }}
          >
            <Link
              href={c.href}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${c.ctaColor} text-white font-bold text-base py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
            >
              {c.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* ── Footer minimal ────────────────── */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} ChambaPe · Lima, Perú
          </p>

        </div>
      </div>
    </>
  )
}
